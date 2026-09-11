window.GreenWatt = window.GreenWatt || {};
(function (GW) {
  const state = {
    authenticated: localStorage.getItem('gw_auth') === '1',
    registerStep: 1,
    kycDocs: {},
    optimizer: { demand: 800, ceiling: 4.5, risk: 'Moderate', renewable: 'High' },
    sidebarOpen: false
  };
  GW.state = state;

  GW.formatINR = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  GW.formatNum = (n, digits=0) => new Intl.NumberFormat('en-IN', { maximumFractionDigits:digits }).format(n);
  GW.go = (route) => { location.hash = route; };
  GW.escape = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  GW.toast = (message) => {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div'); el.className='toast'; el.textContent=message; root.appendChild(el);
    setTimeout(()=>el.remove(), 3200);
  };
  GW.openModal = (title, body) => {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-modal-close="1"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><strong>${title}</strong><button class="icon-btn" data-modal-close="1">×</button></div><div class="modal-body">${body}</div></div></div>`;
  };
  GW.closeModal = () => { document.getElementById('modal-root').innerHTML=''; };
  GW.downloadCSV = (rows, filename='greenwatt-export.csv') => {
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
  };
  GW.slugTitle = (route) => ({
    overview:'Overview', forecast:'Market Forecast', renewable:'Weather & Renewable', load:'Load Forecast', procurement:'Procurement Planner', optimizer:'Optimizer', market:'Live Market', trades:'Trade History', reports:'Savings & Reports', performance:'Forecast Performance', profile:'Company Profile', kyc:'KYC & Verification', settings:'Settings'
  }[route] || 'GreenWatt');
})(window.GreenWatt);
