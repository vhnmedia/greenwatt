window.GreenWatt = window.GreenWatt || {};
(function (GW) {
  const icon = (name, size=18) => {
    const paths = {
      overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      forecast:'<path d="M3 18l4.2-5.1 3.7 2.8 5-7.1L21 4"/><path d="M18 4h3v3"/>',
      renewable:'<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
      load:'<path d="M3 16c2.2 0 2.2-8 4.5-8s2.3 10 4.6 10 2.3-13 4.6-13S19 14 21 14"/>',
      procurement:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      optimizer:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M8.5 12h7M12 8.5v7"/>',
      market:'<circle cx="12" cy="12" r="8"/><path d="M7 14l3-3 2 2 5-5"/>',
      trades:'<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
      reports:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
      performance:'<path d="M4 18V6M4 18h16"/><path d="M7 14l3-3 3 2 5-6"/>',
      profile:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.9-4 3.3-6 7-6s6.1 2 7 6"/>',
      kyc:'<path d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"/><path d="M8.7 12l2 2 4.6-5"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06L3.8 16.94l.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.4v-4h.1A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.66 3.8l.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.4h4v.1A1.7 1.7 0 0 0 15 4.2a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1z"/>',
      search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
      bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
      arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
      play:'<path d="M8 5l11 7-11 7z"/>',
      lightning:'<path d="M13 2L5 14h6l-1 8 9-13h-6z"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
      leaf:'<path d="M20 4C12 4 6 7.5 6 13c0 3.5 2.5 6 6 6 6 0 8-8 8-15z"/><path d="M4 21c2-5 6-8 12-11"/>'
    };
    return `<svg class="gw-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||'<circle cx="12" cy="12" r="2"/>'}</svg>`;
  };

  GW.components = {};
  GW.components.icon = icon;
  GW.components.brand = () => `<a href="#/" class="brand"><span class="brand-mark"></span><span class="brand-name">GreenWatt</span></a>`;
  GW.components.publicHeader = () => `<header class="public-header"><div class="container public-nav">${GW.components.brand()}<nav class="nav-links"><a href="#/how">How it works</a><a href="#/solutions">Solutions</a><a href="#/pricing">Pricing</a><a href="#/contact">Contact</a></nav><div class="nav-actions"><a class="btn btn-ghost desktop-only" href="#/login">Sign in</a><a class="btn btn-primary" href="#/register">Get started</a><button class="icon-btn mobile-menu-btn" data-mobile-public-menu aria-label="Open menu">${icon('menu')}</button></div></div></header>`;
  GW.components.publicShell = content => `<div class="public-shell">${GW.components.publicHeader()}${content}<footer class="section-sm"><div class="container"><div class="feature-line"><div>${GW.components.brand()}</div><div><p>Electricity procurement intelligence for commercial India. Demo data is simulated and does not represent live exchange execution.</p><div class="small">© 2026 GreenWatt · Built for decision support, planning and simulation.</div></div></div></div></footer></div>`;

  const groups = [
    ['Workspace', [['overview','Overview'],['procurement','Procurement Planner'],['market','Live Market'],['trades','Trade History']]],
    ['Intelligence', [['forecast','Market Forecast'],['renewable','Weather & Renewable'],['load','Load Forecast'],['optimizer','Optimizer'],['performance','Forecast Performance']]],
    ['Reporting', [['reports','Savings & Reports']]],
    ['Company', [['profile','Company Profile'],['kyc','KYC & Verification'],['settings','Settings']]]
  ];

  GW.components.sidebar = active => `<aside class="sidebar ${GW.state.sidebarOpen?'open':''}" id="sidebar">
    <div class="sidebar-brand-row"><a href="#/app/overview" class="brand"><span class="brand-mark"></span><span class="brand-name">GreenWatt</span></a><button class="sidebar-close mobile-menu-btn" data-sidebar-toggle aria-label="Close menu">×</button></div>
    <div class="workspace-context"><div class="workspace-avatar">AM</div><div><strong>ABC Manufacturing</strong><span>Gujarat · Commercial</span></div></div>
    <div class="demo-pill"><span><i class="live-dot"></i> Simulation workspace</span><span>DEMO</span></div>
    <nav class="sidebar-nav">${groups.map(([label,items])=>`<div class="sidebar-group"><div class="sidebar-label">${label}</div>${items.map(([r,label])=>`<a class="sidebar-link ${active===r?'active':''}" href="#/app/${r}"><span class="sidebar-icon">${icon(r,17)}</span><span>${label}</span>${active===r?'<i class="active-rail"></i>':''}</a>`).join('')}</div>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="sidebar-market-card"><div class="sidebar-market-head"><span>Market status</span><span class="market-live"><i></i> Open</span></div><strong>RTM · Next session</strong><div class="sidebar-market-meta"><span>₹4.18/unit</span><span>14m</span></div></div><button class="btn btn-sidebar btn-block btn-sm" data-run-simulation>${icon('play',15)} Run Simulation</button></div>
  </aside><button class="sidebar-overlay" data-sidebar-toggle aria-label="Close navigation"></button>`;

  GW.components.topbar = active => `<div class="app-topbar">
    <div class="topbar-left"><button class="icon-btn mobile-menu-btn" data-sidebar-toggle aria-label="Open menu">${icon('menu')}</button><div class="topbar-crumb"><span>GreenWatt</span><b>/</b><strong>${GW.slugTitle(active)}</strong></div></div>
    <div class="topbar-actions">
      <button class="command-trigger desktop-command" data-command-palette>${icon('search',16)}<span>Search workspace</span><kbd>⌘ K</kbd></button>
      <button class="icon-btn notification-btn" data-notifications title="Notifications" aria-label="Notifications">${icon('bell')}<span class="notification-badge">3</span></button>
      <button class="company-switcher" data-company-menu><span class="company-avatar">AM</span><span class="company-copy"><strong>ABC Manufacturing</strong><small>Admin workspace</small></span><span class="company-chevron">⌄</span></button>
    </div>
  </div>`;

  GW.components.mobileNav = active => `<nav class="mobile-bottom-nav"><a class="${active==='overview'?'active':''}" href="#/app/overview">${icon('overview',18)}<span>Overview</span></a><a class="${active==='forecast'?'active':''}" href="#/app/forecast">${icon('forecast',18)}<span>Forecast</span></a><a class="${active==='procurement'?'active':''}" href="#/app/procurement">${icon('procurement',18)}<span>Plan</span></a><a class="${active==='market'?'active':''}" href="#/app/market">${icon('market',18)}<span>Market</span></a><a class="${active==='reports'?'active':''}" href="#/app/reports">${icon('reports',18)}<span>Reports</span></a></nav>`;
  GW.components.appShell = (active,content) => `<div class="app-shell enhanced-app">${GW.components.sidebar(active)}<main class="app-main">${GW.components.topbar(active)}<div class="app-content">${content}</div>${GW.components.mobileNav(active)}</main></div>`;
  GW.components.pageHead = (title, desc, action='') => `<div class="page-head"><div><div class="page-eyebrow">Workspace</div><h1>${title}</h1><p class="muted">${desc}</p></div>${action?`<div class="page-actions">${action}</div>`:''}</div>`;
  GW.components.kpi = (label,value,change='',cls='') => {
    const map = {"Today's electricity cost":'lightning','Savings vs DISCOM':'reports','Renewable share':'leaf','CO₂ avoided':'renewable','Temperature':'renewable','Wind speed':'market','Solar irradiance':'renewable','Renewable availability':'leaf'};
    return `<div class="panel kpi enhanced-kpi"><div class="kpi-top"><div class="kpi-label">${label}</div><span class="kpi-icon">${icon(map[label]||'performance',17)}</span></div><div class="kpi-value ${cls}">${value}</div>${change?`<div class="kpi-change">${change}</div>`:''}</div>`;
  };
  GW.components.metricList = rows => `<div class="metric-list">${rows.map(r=>`<div class="metric-row"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join('')}</div>`;
})(window.GreenWatt);
