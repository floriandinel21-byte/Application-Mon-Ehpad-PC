(function(){
  const buttons=document.querySelectorAll('.sidebar button');
  const panels=document.querySelectorAll('.panel');
  const title=document.getElementById('pageTitle');
  const titles={planning:'Planning',echanges:'Échanges',messagerie:'Messagerie',disponibilites:'Disponibilités',heures:'Heures supplémentaires',profil:'Profil & Santé',direction:'Direction',contact:'Contact'};
  buttons.forEach(b=>{
    b.addEventListener('click',()=>{
      buttons.forEach(x=>x.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      b.classList.add('active');
      document.querySelector('[data-panel="'+b.dataset.tab+'"]').classList.add('active');
      title.textContent=titles[b.dataset.tab]||'EHPAD';
    });
  });
})();