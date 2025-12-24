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

  // Calendar (like mobile)
  const cal=document.getElementById('calendar');
  const monthTitle=document.getElementById('monthTitle');
  if(cal){
    const now=new Date();
    const y=now.getFullYear();
    const m=now.getMonth();
    monthTitle.textContent=now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    const days=new Date(y,m+1,0).getDate();
    for(let d=1;d<=days;d++){
      const el=document.createElement('div');
      el.className='day';
      if(d===now.getDate()) el.classList.add('today');
      el.textContent=d;
      cal.appendChild(el);
    }
  }
})();