(() => {
  'use strict';
  const config = window.SCENTEVA_CONFIG || {};
  const items = [
    {item_id:'timeless',item_name:'Timeless 50 ml',price:169000,item_brand:'SCENTEVA',item_category:'Extrait de Parfum'},
    {item_id:'ethereal',item_name:'Ethereal 50 ml',price:169000,item_brand:'SCENTEVA',item_category:'Extrait de Parfum'},
    {item_id:'flower-bath',item_name:'Flower Bath 50 ml',price:169000,item_brand:'SCENTEVA',item_category:'Extrait de Parfum'}
  ];
  const id = config.ga4MeasurementId || '';
  const valid = /^G-[A-Z0-9]+$/.test(id);
  const key = 'scenteva-analytics-consent';
  let choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  let enabled = false;
  let catalogVisible = false;
  let listSent = false;
  const current = items.find(item => item.item_id === document.body.dataset.product);
  const consent = document.getElementById('consent');
  function track(name, params = {}) {
    if (!enabled) return;
    window.gtag('event', name, {...params, ...(config.debugAnalytics ? {debug_mode:true} : {})});
  }
  function sendList() {
    if (enabled && catalogVisible && !listSent) {
      track('view_item_list',{item_list_id:'everyday_collection',item_list_name:'Everyday Collection',items});
      listSent = true;
    }
  }
  function enable() {
    if (!valid || enabled) return;
    enabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    // A full HTML page load generates exactly one automatic page_view.
    window.gtag('config',id,{send_page_view:true,...(config.debugAnalytics ? {debug_mode:true} : {})});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
    if (current) track('view_item',{currency:'IDR',value:169000,items:[current]});
    sendList();
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(key,value); } catch (_) {}
    consent.hidden = true;
    if (value === 'granted') enable();
    else if (enabled) {
      window['ga-disable-' + id] = true;
      enabled = false;
      location.reload();
    }
  }
  document.getElementById('consent-yes').addEventListener('click',()=>choose('granted'));
  document.getElementById('consent-no').addEventListener('click',()=>choose('denied'));
  document.getElementById('privacy-settings').addEventListener('click',()=>{consent.hidden=false;document.getElementById('consent-no').focus();});
  if (valid && choice === 'granted') enable();
  else if (valid && choice !== 'denied') consent.hidden = false;
  document.getElementById('year').textContent = new Date().getFullYear();
  const page = document.body.dataset.page;
  document.querySelector(`[data-nav="${page === 'product' ? 'shop' : page}"]`)?.setAttribute('aria-current','page');
  if (page === 'home') document.querySelector('[data-nav="shop"]').setAttribute('href','#catalog');
  const catalog = document.getElementById('catalog');
  if (catalog) {
    const observer = new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){catalogVisible=true;sendList();observer.disconnect();}
    },{threshold:0.1});
    observer.observe(catalog);
  }
  document.querySelectorAll('[data-select]').forEach(link=>link.addEventListener('click',()=>{
    track('select_item',{item_list_id:'everyday_collection',item_list_name:'Everyday Collection',items:[items.find(item=>item.item_id===link.dataset.select)],transport_type:'beacon'});
  }));
  document.querySelectorAll('[data-order]').forEach(link=>link.addEventListener('click',()=>{
    track('whatsapp_order_click',{item_id:link.dataset.order,item_name:current?.item_name,contact_channel:'whatsapp',transport_type:'beacon'});
  }));
  document.querySelectorAll('[data-contact]').forEach(link=>link.addEventListener('click',()=>{
    track('contact_click',{contact_channel:link.dataset.contact,transport_type:'beacon'});
  }));
  document.querySelector('[data-hero]')?.addEventListener('click',()=>track('shop_now_click',{placement:'home_hero'}));
  document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open) track('product_detail_expand',{item_id:current?.item_id,section_name:detail.querySelector('summary').textContent});
  }));
})();
