window.GreenWatt = window.GreenWatt || {};
(function(GW){
  function simulationModal(){
    GW.openModal('Run historical simulation',`<p>Select a historical demo day to replay forecast → procurement plan → simulated trades → final cost → savings.</p><div class="field"><label>Simulation date</label><input class="input" id="sim-date" type="date" value="2026-09-09" max="2026-09-09"></div><div class="notice warn" style="margin-top:15px"><span class="notice-dot"></span><div>No live market transaction will be executed.</div></div><div class="form-actions"><button class="btn btn-secondary" data-modal-close="1">Cancel</button><button class="btn btn-primary" data-simulate-now>Run Simulation</button></div>`);
  }
  function notificationModal(){
    GW.openModal('Notifications',`<div class="notice" style="margin-bottom:10px"><span class="notice-dot"></span><div><strong>Workspace notifications</strong><br><span class="small">Planning, market and verification updates for ABC Manufacturing.</span></div></div>${GW.data.notifications.map(n=>`<div class="metric-row"><div><strong>${n.title}</strong><div class="small">${n.time}</div></div><span>›</span></div>`).join('')}`);
    document.querySelectorAll('.notification-badge').forEach(el=>el.remove());
  }
  function companyModal(){
    GW.openModal('Company account',`<div class="metric-row"><span>Company</span><strong>ABC Manufacturing Pvt. Ltd.</strong></div><div class="metric-row"><span>Mode</span><span class="tag demo">Demo</span></div><div class="form-actions"><button class="btn btn-secondary" data-go-profile>Company Profile</button><button class="btn btn-danger" data-logout>Sign out</button></div>`);
  }
  function commandModal(){
    const commands=[
      ['overview','Overview',"Portfolio summary and tomorrow's outlook",'/app/overview'],
      ['forecast','Market Forecast','DAM P10 / P50 / P90 price outlook','/app/forecast'],
      ['procurement','Procurement Planner',"Review and approve tomorrow's plan",'/app/procurement'],
      ['optimizer','Optimizer','Test risk, ceiling and renewable constraints','/app/optimizer'],
      ['market','Live Market','Upcoming RTM sessions and actions','/app/market'],
      ['trades','Trade History','Review simulated execution history','/app/trades'],
      ['reports','Savings & Reports','Savings, renewable share and exports','/app/reports'],
      ['profile','Company Profile','Company and electricity information','/app/profile']
    ];
    const I=GW.components.icon;
    GW.openModal('Search GreenWatt',`<div class="command-search">${I('search',17)}<input class="input" id="command-search-input" autocomplete="off" placeholder="Search pages, planning and reports…"></div><div class="command-results" id="command-results">${commands.map((c,i)=>`<button class="command-result" data-command-route="${c[3]}" data-command-text="${(c[1]+' '+c[2]).toLowerCase()}"><span class="command-icon">${I(c[0],15)}</span><span class="command-result-copy"><strong>${c[1]}</strong><span>${c[2]}</span></span><kbd>${i+1}</kbd></button>`).join('')}</div>`);
    document.querySelector('.modal-backdrop')?.classList.add('command-modal');
    const input=document.getElementById('command-search-input');
    input?.focus();
    input?.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();document.querySelectorAll('[data-command-text]').forEach(row=>row.style.display=!q||row.dataset.commandText.includes(q)?'flex':'none');});
  }
  function docsModal(){
    GW.openModal('Manage Documents',`<p class="small">Prototype upload manager. Files stay in your browser session.</p>${['GST certificate','Company registration certificate','Electricity bill','Authorized representative ID'].map((d,i)=>`<div class="upload-row"><div><strong>${d}</strong><div class="small">${i<3?'Verified':'In review'}</div></div><label class="btn btn-secondary btn-sm">Replace<input type="file" data-doc-replace hidden></label></div>`).join('')}`);
    document.querySelectorAll('[data-doc-replace]').forEach(input=>input.onchange=()=>{if(input.files?.[0])GW.toast(`${input.files[0].name} selected for this demo session.`);});
  }
  function optimizerSubmit(form){
    const fd=new FormData(form), demand=+fd.get('demand'), ceiling=+fd.get('ceiling'), risk=fd.get('risk'), renewable=fd.get('renewable');
    let dam= risk==='Conservative'?72 : risk==='Aggressive'?55 :65;
    if(renewable==='High') dam+=3; if(ceiling<4.2) dam-=8; dam=Math.max(40,Math.min(80,dam)); const rtm=100-dam;
    const avgPrice=4.0 + (4.5-ceiling)*.12 + (risk==='Aggressive'?.05:risk==='Conservative'?.09:0);
    const expected=Math.round(demand*1000*avgPrice), baseline=Math.round(demand*1000*5), savings=baseline-expected;
    GW.state.optimizer={demand,ceiling,risk,renewable};
    document.getElementById('opt-dam').textContent=dam+'%'; document.getElementById('opt-rtm').textContent=rtm+'%';
    const bars=document.querySelector('.allocation'); bars.style.gridTemplateColumns=`${dam}fr ${rtm}fr`;
    document.getElementById('opt-metrics').innerHTML=GW.components.metricList([['Expected cost',GW.formatINR(expected)],['Expected renewable share',renewable==='High'?'65%':renewable==='Medium'?'57%':'49%'],['Expected risk',risk],['Expected savings',GW.formatINR(savings)]]);
    GW.toast('Optimization recalculated from your constraints.');
  }
  function pdfReport(){
    const D=GW.data;
    const html=`<!doctype html><html><head><title>GreenWatt Electricity Report</title><style>body{font:14px Arial;color:#17231d;padding:34px}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border-bottom:1px solid #ddd;padding:10px;text-align:left}.note{background:#f5f5f2;padding:12px;margin:18px 0} @media print{button{display:none}}</style></head><body><h1>GreenWatt — Electricity Procurement Report</h1><p><strong>${D.company.name}</strong><br>Reporting period: September 2026<br>Demo / simulated report</p><div class="note">Trades and performance values in this prototype are simulated. Use your browser's Print dialog and choose “Save as PDF”.</div><table><tr><th>Metric</th><th>Value</th></tr><tr><td>Total electricity consumed</td><td>24,180 MWh</td></tr><tr><td>DAM volume</td><td>15,717 MWh</td></tr><tr><td>RTM volume</td><td>6,529 MWh</td></tr><tr><td>DISCOM fallback</td><td>1,934 MWh</td></tr><tr><td>Average market price</td><td>₹4.02/unit</td></tr><tr><td>DISCOM benchmark</td><td>₹5.00/unit</td></tr><tr><td>Total savings</td><td>₹82.0L</td></tr><tr><td>Renewable share</td><td>62%</td></tr><tr><td>Estimated CO₂ avoided</td><td>10,494 tonnes</td></tr></table><h3>Methodology</h3><p>Savings = DISCOM benchmark cost − simulated procurement cost. Renewable share = renewable electricity / total electricity. CO₂ avoided uses the configured demo methodology (0.7 kg CO₂/unit fossil electricity; 0 for renewable).</p><button onclick="window.print()">Print / Save as PDF</button><script>setTimeout(()=>window.print(),350)<\/script></body></html>`;
    const w=window.open('','_blank'); w.document.open(); w.document.write(html); w.document.close();
  }
  function applyTradeFilters(){
    const market=document.getElementById('trade-market')?.value||'All', status=document.getElementById('trade-status')?.value||'All';
    document.querySelectorAll('#trades-table tbody tr').forEach(tr=> tr.style.display=((market==='All'||tr.dataset.market===market)&&(status==='All'||tr.dataset.status===status))?'':'none');
  }
  function countdown(){
    const el=[...document.querySelectorAll('.kpi-value')].find(x=>/^00:\d\d:\d\d$/.test(x.textContent)); if(!el) return;
    let total=14*60+32; clearInterval(GW._countdown); GW._countdown=setInterval(()=>{ total--; if(total<0) total=15*60; const m=Math.floor(total/60),s=total%60; el.textContent=`00:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; },1000);
  }

  GW.bindPageEvents=function(){
    countdown();
    document.querySelectorAll('[data-view-demo]').forEach(el=>el.onclick=()=>{localStorage.setItem('gw_auth','1');GW.state.authenticated=true;GW.go('/app/overview');});
    document.querySelectorAll('[data-run-simulation]').forEach(el=>el.onclick=simulationModal);
    document.querySelectorAll('[data-notifications]').forEach(el=>el.onclick=notificationModal);
    document.querySelectorAll('[data-company-menu]').forEach(el=>el.onclick=companyModal);
    document.querySelectorAll('[data-command-palette]').forEach(el=>el.onclick=commandModal);
    document.querySelectorAll('[data-quick-route]').forEach(el=>el.onclick=()=>GW.go(el.dataset.quickRoute));
    document.querySelectorAll('[data-sidebar-toggle]').forEach(el=>el.onclick=()=>{document.getElementById('sidebar')?.classList.toggle('open')});
    document.querySelectorAll('[data-modal-close]').forEach(el=>el.onclick=e=>{ if(e.target.dataset.modalClose) GW.closeModal(); });
    document.querySelectorAll('[data-go-procurement]').forEach(el=>el.onclick=()=>GW.go('/app/procurement'));
    document.querySelectorAll('[data-go-profile]').forEach(el=>el.onclick=()=>{GW.closeModal();GW.go('/app/profile')});
    document.querySelectorAll('[data-logout]').forEach(el=>el.onclick=()=>{localStorage.removeItem('gw_auth');GW.state.authenticated=false;GW.closeModal();GW.go('/login');GW.toast('Signed out.');});
    document.querySelectorAll('[data-manage-docs]').forEach(el=>el.onclick=docsModal);
    document.querySelectorAll('[data-edit-profile]').forEach(el=>el.onclick=()=>GW.openModal('Edit Profile',`<form id="profile-edit-form"><div class="field"><label>Contact person</label><input class="input" value="Aarav Mehta"></div><div class="field" style="margin-top:12px"><label>Phone</label><input class="input" value="+91 98765 43210"></div><div class="form-actions"><button class="btn btn-primary" data-save-profile type="button">Save changes</button></div></form>`));
    document.querySelectorAll('[data-approve-plan]').forEach(el=>el.onclick=()=>{el.textContent='Plan Approved';el.disabled=true;GW.toast('Procurement plan approved in Simulation Mode.');});
    document.querySelectorAll('[data-market-action]').forEach(el=>el.onclick=()=>GW.toast(`${el.dataset.marketAction} action recorded for the simulated RTM session.`));
    document.querySelectorAll('[data-export-trades]').forEach(el=>el.onclick=()=>GW.downloadCSV([['Date','Time','Market','Quantity','Price','Status','Savings','Renewable %'],...GW.data.trades],'greenwatt-trades.csv'));
    document.querySelectorAll('[data-export-forecast]').forEach(el=>el.onclick=()=>GW.downloadCSV([['Time','Lower','Median','Upper','Renewable %','Demand MWh'],...GW.data.blocks.map(d=>[d.time,d.lower,d.median,d.upper,d.renewable,d.demand])],'greenwatt-dam-forecast.csv'));
    document.querySelectorAll('[data-pdf-report]').forEach(el=>el.onclick=pdfReport);
    document.querySelectorAll('[data-run-eligibility]').forEach(el=>el.onclick=()=>{const target=document.getElementById('eligibility-result'); if(target) target.innerHTML='<div class="notice warn"><span class="notice-dot"></span><div><strong>Eligibility Requires Review</strong><br>State rules, consumer category and current regulations require manual verification.</div></div>'; else GW.openModal('Eligibility result','<div class="notice warn"><span class="notice-dot"></span><div><strong>Eligibility Requires Review.</strong><br>State-specific rules and current regulations require manual confirmation.</div></div>');});
    document.querySelectorAll('[data-reg-prev]').forEach(el=>el.onclick=()=>{GW.state.registerStep=Math.max(1,GW.state.registerStep-1);GW.render();});
    document.querySelectorAll('[data-upload-doc]').forEach(inp=>inp.onchange=()=>{const st=document.getElementById('upload-status-'+inp.dataset.uploadDoc);if(st&&inp.files[0]){st.textContent=inp.files[0].name+' · Ready';GW.state.kycDocs[inp.dataset.uploadDoc]=inp.files[0].name;}});
    const login=document.getElementById('login-form'); if(login) login.onsubmit=e=>{e.preventDefault();const pw=new FormData(login).get('password');if(String(pw).length<6)return;localStorage.setItem('gw_auth','1');GW.state.authenticated=true;GW.toast('Welcome to GreenWatt Demo.');GW.go('/app/overview');};
    const reg=document.getElementById('register-form'); if(reg) reg.onsubmit=e=>{e.preventDefault();if(GW.state.registerStep<5){GW.state.registerStep++;GW.render();}};
    const contact=document.getElementById('contact-form'); if(contact) contact.onsubmit=e=>{e.preventDefault();contact.reset();GW.toast('Enquiry captured in this demo.');};
    const optimizer=document.getElementById('optimizer-form'); if(optimizer) optimizer.onsubmit=e=>{e.preventDefault();optimizerSubmit(optimizer);};
    const settings=document.getElementById('settings-form'); if(settings) settings.onsubmit=e=>{e.preventDefault();GW.toast('Settings saved for this demo session.');};
    document.getElementById('trade-market')?.addEventListener('change',applyTradeFilters); document.getElementById('trade-status')?.addEventListener('change',applyTradeFilters);
    document.querySelectorAll('[data-forgot-password]').forEach(el=>el.onclick=()=>GW.openModal('Reset password','<p>Enter your business email and we’ll simulate sending a password-reset link.</p><div class="field"><label>Business email</label><input class="input" value="demo@greenwatt.in"></div><div class="form-actions"><button class="btn btn-primary" data-reset-send>Send reset link</button></div>'));
    document.querySelectorAll('[data-mobile-public-menu]').forEach(el=>el.onclick=()=>GW.openModal('Navigation','<div class="metric-list"><a class="metric-row" href="#/how"><span>How it works</span><strong>›</strong></a><a class="metric-row" href="#/solutions"><span>Solutions</span><strong>›</strong></a><a class="metric-row" href="#/pricing"><span>Pricing</span><strong>›</strong></a><a class="metric-row" href="#/contact"><span>Contact</span><strong>›</strong></a><a class="metric-row" href="#/login"><span>Sign in</span><strong>›</strong></a></div>'));

    document.getElementById('modal-root').onclick=e=>{
      if(e.target.classList.contains('modal-backdrop')||e.target.dataset.modalClose) GW.closeModal();
      if(e.target.matches('[data-simulate-now]')){e.target.textContent='Simulation complete';e.target.disabled=true;GW.toast('Historical simulation completed: forecast → plan → trades → savings.');setTimeout(GW.closeModal,800);}
      if(e.target.matches('[data-save-profile]')){GW.toast('Profile changes saved for this demo session.');GW.closeModal();}
      if(e.target.matches('[data-reset-send]')){GW.toast('Demo reset link sent.');GW.closeModal();}
      const profile=e.target.closest('[data-go-profile]'); if(profile){GW.closeModal();GW.go('/app/profile');}
      const logout=e.target.closest('[data-logout]'); if(logout){localStorage.removeItem('gw_auth');GW.state.authenticated=false;GW.closeModal();GW.go('/login');GW.toast('Signed out.');}
      const command=e.target.closest('[data-command-route]'); if(command){GW.closeModal();GW.go(command.dataset.commandRoute);}
    };
  };
  window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&GW.state.authenticated){e.preventDefault();commandModal();}if(e.key==='Escape')GW.closeModal();});
  window.addEventListener('hashchange',GW.render); window.addEventListener('DOMContentLoaded',GW.render);
})(window.GreenWatt);
