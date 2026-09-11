window.GreenWatt = window.GreenWatt || {};
(function(GW){
  GW.render = function(){
    const app=document.getElementById('app');
    const raw=(location.hash||'#/').slice(1); const parts=raw.split('/').filter(Boolean);
    let html='';
    if(parts[0]==='app'){
      const page=parts[1]||'overview';
      if(!GW.state.authenticated){ location.hash='#/login'; return; }
      html=(GW.appPages[page]||GW.appPages.overview)();
    } else if(parts[0]==='login') html=GW.authPages.login();
    else if(parts[0]==='register') html=GW.authPages.register();
    else if(parts[0]==='kyc') html=GW.authPages.kyc();
    else if(parts[0]==='how') html=GW.publicPages.how();
    else if(parts[0]==='solutions') html=GW.publicPages.solutions();
    else if(parts[0]==='pricing') html=GW.publicPages.pricing();
    else if(parts[0]==='contact') html=GW.publicPages.contact();
    else html=GW.publicPages.home();
    app.innerHTML=html; window.scrollTo(0,0); GW.bindPageEvents(); GW.bindChartInteractions();
  };
})(window.GreenWatt);
