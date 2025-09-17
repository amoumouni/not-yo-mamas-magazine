window.NYMM = window.NYMM || {};
(function(){
  const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
  const themeToggle = document.getElementById('themeToggle');
  const lsKey = 'nymm_theme';
  const setTheme = (t)=>{ document.body.classList.toggle('light', t==='light'); localStorage.setItem(lsKey, t); };
  setTheme(localStorage.getItem(lsKey) || 'dark');
  themeToggle && themeToggle.addEventListener('click', ()=>{
    const cur = document.body.classList.contains('light') ? 'light' : 'dark';
    setTheme(cur==='light' ? 'dark' : 'light');
  });
  const audio = document.getElementById('ambience');
  const audioToggle = document.getElementById('audioToggle');
  let audioOn = false;
  const updateAudio = ()=>{ if(!audio) return; audio.muted = !audioOn; if (audioOn) audio.play().catch(()=>{}); else audio.pause(); audioToggle && (audioToggle.textContent = audioOn ? '🔈' : '🔊'); };
  audioToggle && audioToggle.addEventListener('click', ()=>{ audioOn = !audioOn; updateAudio(); });
  updateAudio();
  document.querySelectorAll('.strip').forEach(strip=>{
    strip.addEventListener('wheel', (e)=>{
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { strip.scrollLeft += e.deltaY; e.preventDefault(); }
    }, {passive:false});
  });
  window.NYMM.subscribe = (form)=>{
    const data = Object.fromEntries(new FormData(form).entries());
    alert(`Subscribed: ${data.email}`);
    form.reset();
  };
  if (window.Swup) new Swup({animateHistoryBrowsing:true});
})();