// EHPAD – Direction (Base PC) – Démo localStorage
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

const store = {
  get(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

// Navigation
function setTab(tab){
  $$('.sbtn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
}
$$('.sbtn').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
setTab('dashboard');

// Seed demo data
function seed(){
  if(store.get('dir_seeded', false)) return;
  store.set('dir_seeded', true);

  store.set('ehpad_swaps', [
    {date:'2026-01-18', my:'14:00–21:30', their:'07:00–14:00', coworker:'Collègue 1', msg:'Peux-tu échanger ?', status:'En attente'},
    {date:'2026-01-20', my:'07:00–14:00', their:'14:00–21:30', coworker:'Collègue 2', msg:'RDV le matin', status:'En attente'}
  ]);

  store.set('ehpad_absences', [
    {type:'Arrêt maladie', from:'2026-01-16', to:'2026-01-19', note:'Grippe', status:'Déclaré'},
    {type:'Indisponible', from:'2026-01-22', to:'2026-01-22', note:'RDV', status:'Déclaré'}
  ]);

  store.set('ehpad_overtime', [
    {date:'2026-01-05', min:30, note:'Transmission'},
    {date:'2026-01-10', min:15, note:'Retard'}
  ]);

  store.set('dir_agents', [
    {name:'Florian', role:'Agent de soins', unit:'Unité A', mail:'florian@ehpad.fr'},
    {name:'Collègue 1', role:'AS', unit:'Unité A', mail:'as1@ehpad.fr'},
    {name:'Collègue 2', role:'IDE', unit:'Unité B', mail:'ide2@ehpad.fr'}
  ]);

  store.set('dir_planning', []);

  store.set('dir_threads', [{id:'c1', name:'Annonces'}]);
  store.set('dir_msgs', {c1:[{me:true, text:'Bienvenue sur l’outil direction (démo).', ts:Date.now()}]});

  store.set('dir_settings', {healthVisibility:'no', note:''});
  store.set('dir_audit', [{ts:Date.now(), msg:'Initialisation des données (démo).'}]);
}
seed();

function fmt(ts){ return new Date(ts).toLocaleString(); }
function pushAudit(msg){
  const a = store.get('dir_audit', []);
  a.push({ts:Date.now(), msg});
  store.set('dir_audit', a);
  renderAudit();
}

// KPIs
function renderKPIs(){
  const swaps = store.get('ehpad_swaps', []).filter(s => s.status === 'En attente');
  const abs = store.get('ehpad_absences', []);
  const ot = store.get('ehpad_overtime', []);
  const otSum = ot.reduce((acc, x) => acc + Number(x.min || 0), 0);
  $('#kpiSwaps').textContent = swaps.length;
  $('#kpiAbs').textContent = abs.length;
  $('#kpiOT').textContent = `${otSum} min`;
}

// Dashboard alerts (demo)
function renderAlerts(){
  const root = $('#alerts'); if(!root) return;
  root.innerHTML = '';
  [
    {t:'Effectif tendu', s:'Unité A : manque 1 AS samedi.'},
    {t:'Échange en attente', s:'2 demandes à valider.'},
    {t:'Absence', s:'1 arrêt maladie déclaré cette semaine.'},
  ].forEach(x=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML=`<div class="top"><div>${x.t}</div><span class="badge">Info</span></div><div class="sub">${x.s}</div>`;
    root.appendChild(item);
  });
}

// Swaps queue
function renderSwapQueue(){
  const root = $('#swapQueue');
  const quick = $('#quickValidations');
  const swaps = store.get('ehpad_swaps', []);
  const pending = swaps.filter(s => s.status === 'En attente');

  if(root){
    root.innerHTML = '';
    if(pending.length === 0){
      root.innerHTML = '<div class="item"><div class="top">Rien en attente</div><div class="sub">Tout est à jour.</div></div>';
    } else {
      pending.forEach(s=>{
        const item=document.createElement('div');
        item.className='item';
        item.innerHTML = `
          <div class="top"><div>${s.date} • ${s.coworker}</div><span class="badge">${s.status}</span></div>
          <div class="sub">Moi: <b>${s.my}</b> ⇄ Collègue: <b>${s.their}</b> — ${s.msg || '—'}</div>
          <div class="actionsRow">
            <button class="smallbtn accept">Accepter</button>
            <button class="smallbtn reject">Refuser</button>
          </div>
        `;
        item.querySelector('.accept').addEventListener('click', ()=>{
          s.status = 'Accepté';
          store.set('ehpad_swaps', swaps);
          pushAudit(`Échange accepté (${s.date} • ${s.coworker})`);
          renderAll();
        });
        item.querySelector('.reject').addEventListener('click', ()=>{
          s.status = 'Refusé';
          store.set('ehpad_swaps', swaps);
          pushAudit(`Échange refusé (${s.date} • ${s.coworker})`);
          renderAll();
        });
        root.appendChild(item);
      });
    }
  }

  if(quick){
    // reset; will be filled by swaps then absences
    quick.innerHTML = '';
    pending.slice(0,2).forEach(s=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML = `<div class="top"><div>Échange • ${s.coworker}</div><span class="badge">En attente</span></div>
        <div class="sub">${s.date} — ${s.my} ⇄ ${s.their}</div>`;
      quick.appendChild(item);
    });
  }
}

// Absences queue + all
function renderAbsenceQueue(){
  const root = $('#absenceQueue');
  const all = $('#absenceAll');
  const quick = $('#quickValidations');
  const abs = store.get('ehpad_absences', []);
  const pending = abs.filter(a => a.status === 'Déclaré');

  if(root){
    root.innerHTML = '';
    if(pending.length === 0){
      root.innerHTML = '<div class="item"><div class="top">Aucune absence</div><div class="sub">—</div></div>';
    } else {
      pending.forEach(a=>{
        const item=document.createElement('div');
        item.className='item';
        item.innerHTML = `
          <div class="top"><div>${a.type}</div><span class="badge">${a.status}</span></div>
          <div class="sub">Du <b>${a.from}</b> au <b>${a.to}</b> — ${a.note || '—'}</div>
          <div class="actionsRow">
            <button class="smallbtn accept">Valider</button>
            <button class="smallbtn reject">Refuser</button>
          </div>
        `;
        item.querySelector('.accept').addEventListener('click', ()=>{
          a.status = 'Validé';
          store.set('ehpad_absences', abs);
          pushAudit(`Absence validée (${a.type} ${a.from}→${a.to})`);
          renderAll();
        });
        item.querySelector('.reject').addEventListener('click', ()=>{
          a.status = 'Refusé';
          store.set('ehpad_absences', abs);
          pushAudit(`Absence refusée (${a.type} ${a.from}→${a.to})`);
          renderAll();
        });
        root.appendChild(item);
      });
    }
  }

  if(all){
    all.innerHTML = '';
    if(abs.length === 0){
      all.innerHTML = '<div class="item"><div class="top">Aucune absence</div><div class="sub">—</div></div>';
    } else {
      abs.slice().reverse().forEach(a=>{
        const item=document.createElement('div');
        item.className='item';
        item.innerHTML = `<div class="top"><div>${a.type}</div><span class="badge">${a.status}</span></div>
          <div class="sub">Du <b>${a.from}</b> au <b>${a.to}</b> — ${a.note || '—'}</div>`;
        all.appendChild(item);
      });
    }
  }

  if(quick){
    pending.slice(0,2).forEach(a=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML = `<div class="top"><div>Absence • ${a.type}</div><span class="badge">À valider</span></div>
        <div class="sub">Du ${a.from} au ${a.to}</div>`;
      quick.appendChild(item);
    });
  }
}

// Planning edit list
function renderPlanning(){
  const list = $('#planningList'); if(!list) return;
  const rows = store.get('dir_planning', []);
  list.innerHTML = '';
  if(rows.length === 0){
    list.innerHTML = '<div class="item"><div class="top">Aucune modification</div><div class="sub">Ajoute une ligne à gauche.</div></div>';
    return;
  }
  rows.slice().reverse().forEach(r=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${r.date} • ${r.unit}</div><span class="badge">${r.shift}</span></div>
      <div class="sub">${r.agent} — ${r.note || '—'}</div>`;
    list.appendChild(item);
  });
}
$('#savePlanning')?.addEventListener('click', ()=>{
  const unit = $('#pUnit')?.value || 'Unité A';
  const date = $('#pDate')?.value || '';
  const agent = $('#pAgent')?.value || '';
  const shift = $('#pShift')?.value || '';
  const note = $('#pNote')?.value || '';
  if(!date || !agent){ $('#planningResult').textContent = 'Renseigne la date et l’agent.'; return; }
  const rows = store.get('dir_planning', []);
  rows.push({unit, date, agent, shift, note});
  store.set('dir_planning', rows);
  $('#planningResult').textContent = 'Enregistré (démo).';
  pushAudit(`Planning modifié (${unit} • ${date} • ${agent})`);
  renderPlanning();
});

// Agents
function renderAgents(){
  const list = $('#agentList'); if(!list) return;
  const agents = store.get('dir_agents', []);
  list.innerHTML = '';
  agents.forEach(a=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${a.name}</div><span class="badge">${a.unit}</span></div>
      <div class="sub">${a.role} — ${a.mail}</div>`;
    list.appendChild(item);
  });
}
$('#addAgent')?.addEventListener('click', ()=>{
  const name = $('#aName')?.value || '';
  const role = $('#aRole')?.value || '';
  const unit = $('#aUnit')?.value || '';
  const mail = $('#aMail')?.value || '';
  if(!name){ $('#agentResult').textContent = 'Renseigne un nom.'; return; }
  const agents = store.get('dir_agents', []);
  agents.push({name, role, unit, mail});
  store.set('dir_agents', agents);
  $('#agentResult').textContent = 'Ajouté (démo).';
  pushAudit(`Agent ajouté (${name})`);
  renderAgents();
});

// Messaging (direction)
let current = 'c1';
function renderThreads(){
  const root = $('#dirThreads'); if(!root) return;
  const threads = store.get('dir_threads', []);
  root.innerHTML = '';
  threads.forEach(t=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${t.name}</div><div>›</div></div><div class="sub">Clique pour ouvrir</div>`;
    item.addEventListener('click', ()=>{
      current = t.id;
      $('#dirChatTitle').textContent = t.name;
      renderChat();
    });
    root.appendChild(item);
  });
}
function renderChat(){
  const root = $('#dirChat'); if(!root) return;
  const all = store.get('dir_msgs', {});
  const msgs = all[current] || [];
  root.innerHTML = '';
  msgs.forEach(m=>{
    const b=document.createElement('div');
    b.className='bubble' + (m.me ? ' me' : '');
    b.textContent = m.text;
    root.appendChild(b);
  });
  root.scrollTop = root.scrollHeight;
}
$('#dirChatSend')?.addEventListener('click', ()=>{
  const input = $('#dirChatInput');
  const text = input?.value.trim();
  if(!text) return;
  const all = store.get('dir_msgs', {});
  all[current] = all[current] || [];
  all[current].push({me:true, text, ts:Date.now()});
  store.set('dir_msgs', all);
  input.value = '';
  pushAudit(`Annonce envoyée (${current})`);
  renderChat();
});
$('#newChannel')?.addEventListener('click', ()=>{
  const name = prompt('Nom du canal ?');
  if(!name) return;
  const threads = store.get('dir_threads', []);
  const id = 'c' + Math.random().toString(16).slice(2,8);
  threads.push({id, name});
  store.set('dir_threads', threads);
  const all = store.get('dir_msgs', {});
  all[id] = [];
  store.set('dir_msgs', all);
  pushAudit(`Canal créé (${name})`);
  renderThreads();
});

// Settings
function renderSettings(){
  const s = store.get('dir_settings', {healthVisibility:'no', note:''});
  $('#healthVisibility').value = s.healthVisibility || 'no';
  $('#settingsNote').value = s.note || '';
}
$('#saveSettings')?.addEventListener('click', ()=>{
  store.set('dir_settings', {
    healthVisibility: $('#healthVisibility')?.value || 'no',
    note: $('#settingsNote')?.value || ''
  });
  $('#settingsResult').textContent = 'Enregistré (démo).';
  pushAudit('Paramètres enregistrés');
});

// Audit
function renderAudit(){
  const root = $('#auditLog'); if(!root) return;
  const a = store.get('dir_audit', []);
  root.innerHTML = '';
  a.slice().reverse().slice(0, 14).forEach(x=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${x.msg}</div><div class="muted">${fmt(x.ts)}</div></div>`;
    root.appendChild(item);
  });
}

// Export CSV (demo)
function download(name, text){
  const blob = new Blob([text], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
$('#exportBtn')?.addEventListener('click', ()=>{
  const swaps = store.get('ehpad_swaps', []);
  const abs = store.get('ehpad_absences', []);
  const rows = [];
  rows.push('type,date,from,to,coworker,status,note');
  swaps.forEach(s=>rows.push(`swap,${s.date},,,${(s.coworker||'').replaceAll(',',' ')},${s.status},${(s.msg||'').replaceAll(',',' ')}`));
  abs.forEach(a=>rows.push(`absence,,${a.from},${a.to},,${a.status},${(a.note||'').replaceAll(',',' ')}`));
  download('ehpad_direction_export.csv', rows.join('\n'));
  pushAudit('Export CSV');
});

function renderAll(){
  renderKPIs();
  renderAlerts();
  renderSwapQueue();
  renderAbsenceQueue();
  renderAgents();
  renderPlanning();
  renderThreads();
  renderChat();
  renderSettings();
  renderAudit();
}
renderAll();

// Simple search behavior (demo): if query >=2, go to Agents
$('#q')?.addEventListener('input', (e)=>{
  const q = (e.target.value||'').toLowerCase().trim();
  if(q.length >= 2) setTab('agents');
});
