window.GreenWatt = window.GreenWatt || {};
(function (GW) {
  const blockCount = 96;
  const blocks = Array.from({ length: blockCount }, (_, i) => {
    const minutes = i * 15;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const daylight = Math.max(0, Math.sin(((h + m/60) - 6.2) / 12.2 * Math.PI));
    const evening = Math.exp(-Math.pow((h + m/60 - 19.2)/2.4, 2));
    const morning = Math.exp(-Math.pow((h + m/60 - 9.4)/2.8, 2));
    const renewable = Math.round(22 + daylight * 61 - evening * 6);
    const demand = +(34 + morning*33 + daylight*29 + evening*46).toFixed(1);
    const median = +(5.55 + evening*2.0 + morning*.7 - daylight*2.05 + Math.sin(i*.37)*.09).toFixed(2);
    const spread = +(0.32 + evening*.28 + (1-daylight)*.1).toFixed(2);
    const lower = +(median-spread).toFixed(2);
    const upper = +(median+spread).toFixed(2);
    const actual = i < 46 ? +(median + Math.sin(i*.61)*.12 - .04).toFixed(2) : null;
    return { i, time, median, lower, upper, actual, renewable, demand };
  });

  const totalDemand = 800;
  const damShare = 65;
  const rtmShare = 35;
  const damMWh = totalDemand * damShare / 100;
  const rtmMWh = totalDemand * rtmShare / 100;
  const estimatedCost = 3200000;
  const discomCost = 4000000;

  GW.data = {
    company: {
      name: 'ABC Manufacturing Pvt. Ltd.', short: 'ABC Manufacturing', gstin: '24AABCA1234F1Z5',
      state: 'Gujarat', city: 'Ahmedabad', discom: 'Torrent Power', businessType: 'Manufacturing',
      buildingType: 'Factory', sanctionedLoad: '5.0 MW', contractedDemand: '4.4 MW',
      monthlyConsumption: '24,000 MWh', monthlyBill: '₹12.1 Cr', dailyDemand: totalDemand,
      contact: 'Aarav Mehta', phone: '+91 98765 43210', address: 'Sanand Industrial Estate, Ahmedabad, Gujarat'
    },
    procurement: {
      totalDemand, damShare, rtmShare, damMWh, rtmMWh, estimatedCost, discomCost,
      savings: discomCost-estimatedCost, renewableShare: 62, risk: 'Moderate', ceiling: 4.50,
      avgPrice: estimatedCost/(totalDemand*1000), discomPrice: discomCost/(totalDemand*1000)
    },
    today: { cost: 3080000, savings: 742000, renewable: 58, co2: 324600 },
    weather: { temp: 36, wind: 14, solar: 820, condition: 'Clear / high solar potential' },
    blocks,
    monthlySavings: [52,56,61,59,65,68,71,73,76,78,80,82],
    dailySavings: Array.from({length:30},(_,i)=> 18 + Math.round(7*Math.sin(i*.55)+i*.22)),
    training: { priceMape: 12.8, direction:84.2, loadMape:8.6, lastTraining:'24 Aug 2026', samples:'1.42M blocks', validation:'May–Aug 2026' },
    notifications: [
      {title:"Tomorrow's procurement plan is ready.", time:'8 min ago'},
      {title:'DAM recommendation updated.', time:'42 min ago'},
      {title:'Monthly savings report is available.', time:'Yesterday'}
    ],
    trades: [
      ['09 Sep 2026','10:00','DAM','86.0 MWh','₹3.81','Accepted','₹82,400','74%'],
      ['09 Sep 2026','14:15','RTM','28.0 MWh','₹3.96','Cleared','₹21,700','70%'],
      ['09 Sep 2026','19:00','RTM','18.0 MWh','₹6.28','Skipped','₹0','24%'],
      ['08 Sep 2026','11:30','DAM','91.0 MWh','₹3.68','Accepted','₹91,600','81%'],
      ['08 Sep 2026','20:00','DISCOM','11.5 MWh','₹5.00','Fallback','₹0','20%'],
      ['07 Sep 2026','13:15','DAM','88.0 MWh','₹3.59','Accepted','₹96,300','79%']
    ]
  };
})(window.GreenWatt);
