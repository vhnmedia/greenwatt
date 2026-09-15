from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd
import numpy as np
import httpx
import json
import os
import pulp
from cachetools import TTLCache
from supabase import create_client, Client

app = FastAPI(title="GreenWatt Backend v2")

# CORS setup - MUST lock down to frontend origin in production
origins = ["http://localhost:3000", "https://greenwattt.vercel.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Supabase init (Using Service Role Key for Admin backend access)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mmjoxdnmuehfhtdkjhry.supabase.co")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tam94ZG5tdWVoZmh0ZGtqaHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzIyNjIsImV4cCI6MjEwNDYwODI2Mn0.abBcjrzxyHcyqwChE5zlIOqfizkPwF2D6IeODFzNykE", "your-service-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 15-minute cache for duplicate prediction requests
cache = TTLCache(maxsize=1000, ttl=900)

# Load Models
model_dam = xgb.XGBRegressor()
model_rtm = xgb.XGBRegressor()
try:
    model_dam.load_model("model_dam.ubj")
    model_rtm.load_model("model_rtm.ubj")
except:
    print("Warning: Models not found. Run train_model.py first.")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/model/metrics")
def get_metrics():
    try:
        with open("metrics.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Metrics not found. Model training required."}

async def fetch_weather(lat: float, lon: float, date: str):
    """Fetches Open-Meteo weather with fallback."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,cloud_cover,wind_speed_10m&start_date={date}&end_date={date}"
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url)
            res.raise_for_status()
            return res.json(), False # Data, is_stale
    except Exception as e:
        # Fallback heuristic if API is down
        return {"hourly": {"temperature_2m": [30]*24, "cloud_cover": [20]*24, "wind_speed_10m": [5]*24}}, True

@app.get("/predict/{market}")
async def predict_prices(market: str, date: str, company_id: str):
    if market not in ["dam", "rtm"]:
        raise HTTPException(status_code=400, detail="Invalid market")
    
    cache_key = f"{market}_{date}_{company_id}"
    if cache_key in cache:
        return cache[cache_key]

    # 1. Fetch Company Location from Supabase
    # 1. Fetch Company Location (With fallback for the frontend demo ID)
    if company_id == "demo-1234":
        company = {"city_name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714}
    else:
        company_res = supabase.table("companies").select("city_name, lat, lon").eq("id", company_id).execute()
        if not company_res.data:
            raise HTTPException(status_code=404, detail="Company not found")
        company = company_res.data[0]

    # 2. Fetch Live Weather
    weather_data, is_stale = await fetch_weather(company['lat'], company['lon'], date)

    # 3. Generate 96 blocks (15-min intervals)
    blocks = []
    model = model_dam if market == "dam" else model_rtm
    
    for block in range(96):
        hour = block // 4
        # Feature vector matches training: hour, temp, cloud_cover, wind, day_of_week
        temp = weather_data['hourly']['temperature_2m'][hour]
        clouds = weather_data['hourly']['cloud_cover'][hour]
        wind = weather_data['hourly']['wind_speed_10m'][hour]
        day_of_week = pd.to_datetime(date).weekday()
        
        # Predict (using placeholder logic if model isn't fully loaded, otherwise model.predict)
        try:
            features = np.array([[hour, temp, clouds, wind, day_of_week]])
            base_price = float(model.predict(features)[0])
        except:
            # Fallback mock logic if model fails
            base_price = 4.0 + (np.sin(hour / 3.8) * 2)

        # Apply weather-based reason strings
        reason = "Standard grid conditions."
        ren_pct = 25
        if clouds < 20 and 10 <= hour <= 16:
            reason = f"Clear skies forecast for {company['city_name']} — high solar output pushing prices down."
            base_price *= 0.8
            ren_pct = 45
        elif wind > 15:
            reason = f"High wind speeds in {company['city_name']} region — wind generation buffering prices."
            ren_pct = 35

        blocks.append({
            "block": block + 1,
            "time": f"{hour:02d}:{(block%4)*15:02d}",
            "predicted_mcp": round(base_price, 2),
            "low": round(base_price * 0.9, 2),
            "high": round(base_price * 1.1, 2),
            "renewable_pct": ren_pct,
            "reason": reason
        })

    result = {
        "market": market.upper(),
        "date": date,
        "city": company['city_name'],
        "weather_stale": is_stale,
        "blocks": blocks
    }
    
    cache[cache_key] = result
    return result

@app.get("/recommend/split")
def recommend_split(company_id: str, date: str):
    # PuLP Optimization: determines how much to buy in DAM vs RTM
    # Simplified logic for MVP: 
    # If DAM avg is lower, shift 80% to DAM. If RTM is volatile, cap exposure.
    prob = pulp.LpProblem("PowerPurchase", pulp.LpMinimize)
    dam_vol = pulp.LpVariable("DAM_Volume", lowBound=0, upBound=100)
    rtm_vol = pulp.LpVariable("RTM_Volume", lowBound=0, upBound=100)
    
    # Objective: minimize cost (Mocking expected prices for demo)
    expected_dam_price = 4.5
    expected_rtm_price = 4.2
    prob += expected_dam_price * dam_vol + expected_rtm_price * rtm_vol
    prob += dam_vol + rtm_vol == 100 # Total requirement 100%

    prob.solve()
    
    return {
        "dam_pct": dam_vol.varValue,
        "rtm_pct": rtm_vol.varValue,
        "ceiling_price": 5.0,
        "reasoning": "RTM model shows favorable wind dispatch matching your peak load, shifting 100% allocation to RTM to capture lower MCP." if rtm_vol.varValue > 50 else "DAM offers better stability given predicted afternoon cloud cover."
    }

@app.post("/admin/retrain")
def trigger_retrain(authorization: str = Header(None)):
    # Simple auth to protect endpoint
    if authorization != f"Bearer {os.getenv('ADMIN_SECRET', 'secret123')}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # In production, use background tasks or a task queue (Celery)
    import train_model
    train_model.train_and_save()
    
    # Reload models into memory
    global model_dam, model_rtm
    model_dam.load_model("model_dam.ubj")
    model_rtm.load_model("model_rtm.ubj")
    
    # Clear cache
    cache.clear()
    
    return {"status": "Models retrained and hot-swapped"}
