window.GreenWatt = window.GreenWatt || {};
(function (GW) {
  function scalePoints(values, w, h, pad, minOverride, maxOverride) {
    const vals = values.filter(v=>v!=null);
    const min = minOverride ?? Math.min(...vals);
    const max = maxOverride ?? Math.max(...vals);
    const x = (i) => pad.l + i * (w-pad.l-pad.r)/(values.length-1);
    const y = (v) => pad.t + (max-v) * (h-pad.t-pad.b)/(max-min || 1);
    return {min,max,x,y, pts: values.map((v,i)=>v==null?null:[x(i),y(v)])};
  }
  const path = pts => pts.filter(Boolean).map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  GW.priceChart = function(id, compact=false) {
    const data=GW.data.blocks, w=compact?640:960, h=compact?245:330, pad={l:45,r:14,t:20,b:30};
    const med=data.map(d=>d.median), low=data.map(d=>d.lower), up=data.map(d=>d.upper), actual=data.map(d=>d.actual);
    const all=[...low,...up], min=Math.floor(Math.min(...all)-.2), max=Math.ceil(Math.max(...all)+.2);
    const S=scalePoints(med,w,h,pad,min,max), L=scalePoints(low,w,h,pad,min,max), U=scalePoints(up,w,h,pad,min,max), A=scalePoints(actual,w,h,pad,min,max);
    const band=`${path(U.pts)} ${L.pts.filter(Boolean).reverse().map(p=>`L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`;
    const yTicks=[min,(min+max)/2,max];
    const xTicks=[0,24,48,72,95];
    return `<div class="chart-wrap" id="${id}"><svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Electricity price forecast chart">
      ${yTicks.map(v=>`<line class="chart-grid" x1="${pad.l}" x2="${w-pad.r}" y1="${S.y(v)}" y2="${S.y(v)}"/><text class="chart-axis-label" x="2" y="${S.y(v)+4}">₹${v.toFixed(1)}</text>`).join('')}
      ${xTicks.map(i=>`<text class="chart-axis-label" x="${S.x(i)-11}" y="${h-8}">${data[i].time}</text>`).join('')}
      <path class="confidence-band" d="${band}"/><path class="chart-line" d="${path(S.pts)}"/>
      ${compact?'':`<path class="chart-line-actual" d="${path(A.pts)}"/>`}
      <rect data-chart-hit="price" x="${pad.l}" y="${pad.t}" width="${w-pad.l-pad.r}" height="${h-pad.t-pad.b}" fill="transparent" />
      </svg><div class="chart-tooltip"></div></div>`;
  };

  GW.lineChart = function(id, values, labels, unit='₹ lakh', area=true) {
    const w=760,h=250,pad={l:42,r:12,t:18,b:28}; const S=scalePoints(values,w,h,pad);
    const baseY=h-pad.b; const areaPath=`${path(S.pts)} L${S.pts.at(-1)[0]},${baseY} L${S.pts[0][0]},${baseY} Z`;
    const ticks=[0,Math.floor((values.length-1)/2),values.length-1];
    return `<div class="chart-wrap" id="${id}"><svg class="chart-svg" viewBox="0 0 ${w} ${h}">
      ${[S.min,(S.min+S.max)/2,S.max].map(v=>`<line class="chart-grid" x1="${pad.l}" x2="${w-pad.r}" y1="${S.y(v)}" y2="${S.y(v)}"/><text class="chart-axis-label" x="1" y="${S.y(v)+4}">${Math.round(v)}</text>`).join('')}
      ${area?`<path class="chart-area" d="${areaPath}"/>`:''}<path class="chart-line" d="${path(S.pts)}"/>
      ${ticks.map(i=>`<text class="chart-axis-label" x="${S.x(i)-7}" y="${h-8}">${labels[i]}</text>`).join('')}
      </svg></div>`;
  };

  GW.barChart = function(values, labels) {
    const max=Math.max(...values), w=760,h=250,p={l:34,r:10,t:18,b:30}; const chartW=w-p.l-p.r, bw=chartW/values.length*.58, gap=chartW/values.length;
    return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}">${[0,.5,1].map(t=>{const y=p.t+(h-p.t-p.b)*(1-t);return `<line class="chart-grid" x1="${p.l}" x2="${w-p.r}" y1="${y}" y2="${y}"/>`;}).join('')}
      ${values.map((v,i)=>{const bh=(h-p.t-p.b)*v/max, x=p.l+i*gap+(gap-bw)/2,y=h-p.b-bh; return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="#2c7a54" opacity="${.62+i/values.length*.28}"/>${i%2===0?`<text class="chart-axis-label" x="${x}" y="${h-10}">${labels[i]}</text>`:''}`}).join('')}</svg>`;
  };

  GW.bindChartInteractions = function(){
    document.querySelectorAll('[data-chart-hit="price"]').forEach(hit=>{
      hit.addEventListener('mousemove', e=>{
        const svg=e.currentTarget.ownerSVGElement, box=svg.getBoundingClientRect(), x=(e.clientX-box.left)/box.width*svg.viewBox.baseVal.width;
        const padL=45, usable=svg.viewBox.baseVal.width-padL-14; let i=Math.round((x-padL)/usable*95); i=Math.max(0,Math.min(95,i));
        const d=GW.data.blocks[i], wrap=svg.closest('.chart-wrap'), tip=wrap.querySelector('.chart-tooltip');
        tip.innerHTML=`<strong>${d.time}</strong><br>Predicted: ₹${d.median.toFixed(2)}/unit<br><span class="muted">Range ₹${d.lower.toFixed(2)}–₹${d.upper.toFixed(2)}</span><br>Renewable: ${d.renewable}% · Demand: ${d.demand} MWh`;
        tip.style.display='block'; tip.style.left=Math.min(e.offsetX+12, wrap.clientWidth-190)+'px'; tip.style.top=Math.max(8,e.offsetY-78)+'px';
      });
      hit.addEventListener('mouseleave', e=>{ e.currentTarget.ownerSVGElement.closest('.chart-wrap').querySelector('.chart-tooltip').style.display='none'; });
    });
  };
})(window.GreenWatt);
