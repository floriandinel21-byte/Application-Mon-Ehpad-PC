// EHPAD – Base PC (imparfaite mais utilisable)
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

const store = {
  get(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch{ return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

function setTab(tab){
  $$('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
}
$$('.navbtn').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
setTab('planning');

(function buildCalendar(){
  const cal = $('#calendar');
  if(!cal) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const days = new Date(y, m+1, 0).getDate();
  for(let d=1; d<=days; d++){
    const el = document.createElement('div');
    el.className = 'day' + (d===now.getDate() ? ' today' : '');
    el.textContent = d;
    cal.appendChild(el);
  }
})();

const swapKey = 'ehpad_swaps';
function renderSwaps(){
  const list = $('#swapList');
  const dir = $('#dirSwaps');
  const swaps = store.get(swapKey, []);
  const render = (root) => {
    if(!root) return;
    root.innerHTML = '';
    if(swaps.length === 0){
      root.innerHTML = '<div class="item"><div class="top">Aucune demande</div><div class="sub">Crée une demande à gauche.</div></div>';
      return;
    }
    swaps.slice().reverse().forEach(s => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="top"><div>${s.date} • ${s.coworker || 'Collègue'}</div><div>${s.status}</div></div>
        <div class="sub">Moi: <b>${s.my}</b> ⇄ Collègue: <b>${s.their}</b> — ${s.msg ? s.msg : '—'}</div>`;
      root.appendChild(item);
    });
  };
  render(list); render(dir);
}
$('#sendSwap')?.addEventListener('click', () => {
  const date = $('#swapDate')?.value || '';
  const my = $('#myShift')?.value || '';
  const their = $('#theirShift')?.value || '';
  const coworker = $('#coworker')?.value || '';
  const msg = $('#swapMsg')?.value || '';
  if(!date){ $('#swapResult').textContent = 'Choisis une date.'; return; }
  const swaps = store.get(swapKey, []);
  swaps.push({date, my, their, coworker, msg, status:'En attente'});
  store.set(swapKey, swaps);
  $('#swapResult').textContent = 'Demande envoyée (démo).';
  renderSwaps();
});
renderSwaps();

const absKey = 'ehpad_absences';
function renderAbsences(){
  const list = $('#absenceList');
  const dir = $('#dirAbsences');
  const abs = store.get(absKey, []);
  const render = (root) => {
    if(!root) return;
    root.innerHTML='';
    if(abs.length === 0){
      root.innerHTML = '<div class="item"><div class="top">Aucune absence</div><div class="sub">Déclare une indisponibilité ou un arrêt.</div></div>';
      return;
    }
    abs.slice().reverse().forEach(a => {
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML = `<div class="top"><div>${a.type}</div><div>${a.status}</div></div>
        <div class="sub">Du <b>${a.from}</b> au <b>${a.to}</b> — ${a.note || '—'}</div>`;
      root.appendChild(item);
    });
  };
  render(list); render(dir);
}
$('#saveAbsence')?.addEventListener('click', () => {
  const type = $('#absenceType')?.value || 'Indisponible';
  const from = $('#fromDate')?.value || '';
  const to = $('#toDate')?.value || '';
  const note = $('#absenceNote')?.value || '';
  if(!from || !to){ $('#absenceResult').textContent = 'Renseigne Du et Au.'; return; }
  const abs = store.get(absKey, []);
  abs.push({type, from, to, note, status:'Déclaré'});
  store.set(absKey, abs);
  $('#absenceResult').textContent = 'Enregistré (démo).';
  renderAbsences();
});
renderAbsences();

const otKey='ehpad_overtime';
function renderOT(){
  const list = $('#otList');
  const ot = store.get(otKey, []);
  if(!list) return;
  list.innerHTML='';
  if(ot.length===0){
    list.innerHTML = '<div class="item"><div class="top">Aucune déclaration</div><div class="sub">Ajoute des minutes supplémentaires.</div></div>';
    return;
  }
  ot.slice().reverse().forEach(o=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${o.date}</div><div>${o.min} min</div></div><div class="sub">${o.note||'—'}</div>`;
    list.appendChild(item);
  });
}
$('#saveOT')?.addEventListener('click', ()=>{
  const date = $('#otDate')?.value || '';
  const min = Number($('#otMinutes')?.value || 0);
  const note = $('#otNote')?.value || '';
  if(!date || !min){ $('#otResult').textContent='Renseigne une date et des minutes.'; return; }
  const ot = store.get(otKey, []);
  ot.push({date, min, note});
  store.set(otKey, ot);
  $('#otResult').textContent='Enregistré (démo).';
  renderOT();
});
renderOT();

function saveProfile(){
  const p = {name:$('#pName')?.value||'', unit:$('#pUnit')?.value||'', role:$('#pRole')?.value||''};
  store.set('ehpad_profile', p);
  $('#profileResult').textContent='Profil enregistré (démo).';
}
function saveHealth(){
  const h = {allergies:$('#hAllergies')?.value||'', treatments:$('#hTreatments')?.value||'', weight:$('#hWeight')?.value||'', height:$('#hHeight')?.value||''};
  store.set('ehpad_health', h);
  $('#healthResult').textContent='Santé enregistrée (démo).';
}
$('#saveProfile')?.addEventListener('click', saveProfile);
$('#saveHealth')?.addEventListener('click', saveHealth);

(function loadProfile(){
  const p = store.get('ehpad_profile', null);
  if(p){
    if($('#pName')) $('#pName').value = p.name||'';
    if($('#pUnit')) $('#pUnit').value = p.unit||'';
    if($('#pRole')) $('#pRole').value = p.role||'';
  }
  const h = store.get('ehpad_health', null);
  if(h){
    if($('#hAllergies')) $('#hAllergies').value = h.allergies||'';
    if($('#hTreatments')) $('#hTreatments').value = h.treatments||'';
    if($('#hWeight')) $('#hWeight').value = h.weight||'';
    if($('#hHeight')) $('#hHeight').value = h.height||'';
  }
})();

const msgKey='ehpad_msgs';
function seed(){
  const threads = store.get('ehpad_threads', null);
  if(threads) return;
  store.set('ehpad_threads', [{id:'t1', name:'Équipe Unité A'}]);
  store.set(msgKey, {t1:[{me:false, text:'Bonjour, dispo pour un échange ?', ts:Date.now()-60000}]});
}
seed();

let currentThread = 't1';
function renderThreads(){
  const root = $('#threads');
  const threads = store.get('ehpad_threads', []);
  if(!root) return;
  root.innerHTML='';
  threads.forEach(t=>{
    const item=document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="top"><div>${t.name}</div><div>›</div></div><div class="sub">Clique pour ouvrir</div>`;
    item.addEventListener('click', ()=>{
      currentThread=t.id;
      $('#chatTitle').textContent = t.name;
      renderChat();
    });
    root.appendChild(item);
  });
}
function renderChat(){
  const root = $('#chat');
  const all = store.get(msgKey, {});
  const msgs = all[currentThread] || [];
  if(!root) return;
  root.innerHTML='';
  msgs.forEach(m=>{
    const b=document.createElement('div');
    b.className='bubble' + (m.me?' me':'');
    b.textContent = m.text;
    root.appendChild(b);
  });
  root.scrollTop = root.scrollHeight;
}
$('#chatSend')?.addEventListener('click', ()=>{
  const input = $('#chatInput');
  const text = input?.value.trim();
  if(!text) return;
  const all = store.get(msgKey, {});
  all[currentThread] = all[currentThread] || [];
  all[currentThread].push({me:true, text, ts:Date.now()});
  store.set(msgKey, all);
  input.value='';
  renderChat();
});
$('#newThread')?.addEventListener('click', ()=>{
  const name = prompt('Nom de la conversation ?');
  if(!name) return;
  const threads = store.get('ehpad_threads', []);
  const id = 't' + Math.random().toString(16).slice(2,8);
  threads.push({id, name});
  store.set('ehpad_threads', threads);
  const all = store.get(msgKey, {});
  all[id] = [];
  store.set(msgKey, all);
  renderThreads();
});
renderThreads();
renderChat();


/* ----- Fiche médicale ----- */
const medicalKey = 'ehpad_medical';
function renderMedical(){
  const data = store.get(medicalKey, null);
  const prev = $('#medicalPreview');
  if(!prev) return;

  prev.innerHTML = '';
  if(!data){
    prev.innerHTML = `
      <div><span>Statut</span><strong>Non renseignée</strong></div>
      <div><span>Conseil</span><strong>Remplis la fiche à gauche</strong></div>
    `;
    return;
  }

  const rows = [
    ['Groupe sanguin', data.blood],
    ['Allergies', data.allergies],
    ['Traitements', data.meds],
    ['Antécédents', data.history],
    ['Médecin', data.doctor],
    ['Urgence', data.emergency],
    ['Note', data.note],
  ];

  rows.forEach(([k,v])=>{
    const el = document.createElement('div');
    el.innerHTML = `<span>${k}</span><strong>${(v && String(v).trim()) ? String(v) : '—'}</strong>`;
    prev.appendChild(el);
  });

  if($('#mBlood')) $('#mBlood').value = data.blood || '';
  if($('#mAllergies')) $('#mAllergies').value = data.allergies || '';
  if($('#mMeds')) $('#mMeds').value = data.meds || '';
  if($('#mHistory')) $('#mHistory').value = data.history || '';
  if($('#mDoctor')) $('#mDoctor').value = data.doctor || '';
  if($('#mEmergency')) $('#mEmergency').value = data.emergency || '';
  if($('#mNote')) $('#mNote').value = data.note || '';
}

$('#saveMedical')?.addEventListener('click', ()=>{
  const data = {
    blood: $('#mBlood')?.value || '',
    allergies: $('#mAllergies')?.value || '',
    meds: $('#mMeds')?.value || '',
    history: $('#mHistory')?.value || '',
    doctor: $('#mDoctor')?.value || '',
    emergency: $('#mEmergency')?.value || '',
    note: $('#mNote')?.value || '',
    updatedAt: Date.now()
  };
  store.set(medicalKey, data);
  if($('#medicalResult')) $('#medicalResult').textContent = 'Fiche enregistrée (démo).';
  renderMedical();
});

$('#clearMedical')?.addEventListener('click', ()=>{
  localStorage.removeItem(medicalKey);
  if($('#medicalResult')) $('#medicalResult').textContent = 'Fiche effacée.';
  ['#mBlood','#mAllergies','#mMeds','#mHistory','#mDoctor','#mEmergency','#mNote'].forEach(sel=>{
    const el = $(sel);
    if(el) el.value = '';
  });
  renderMedical();
});

renderMedical();


/* ===== Allergies & Traitements – recherche (démo) =====
   NOTE : impossible de lister "toutes" les allergies et "tous" les traitements existants.
   Ici : une base de suggestions courantes + ajout personnalisé.
*/
const ALLERGY_OPTIONS = [
  "Arachide","Fruits à coque (noix, amande, noisette)","Lait (protéines de lait)","Œuf","Poisson","Crustacés","Mollusques",
  "Soja","Blé / gluten","Sésame","Moutarde","Céleri","Sulfites","Latex","Pollen (graminées)","Acariens","Poils d'animaux",
  "Moisissures","Venin d'abeille","Venin de guêpe","Pénicilline","Amoxicilline","Céphalosporines","Aspirine / AINS",
  "Iode / produits de contraste","Nickel","Parfum","Kiwi","Fraise","Tomate","Banane","Ananas"
];

const TREATMENT_OPTIONS = [
  "Paracétamol","Ibuprofène (AINS)","Aspirine (AAS)","Amoxicilline","Amoxicilline / ac. clavulanique","Azithromycine",
  "Ciprofloxacine","Metformine","Insuline","Atorvastatine","Simvastatine","Oméprazole (IPP)","Pantoprazole (IPP)",
  "Lévothyroxine","Salbutamol (Ventoline)","Budesonide (corticoïde inhalé)","Prednisone","Dexaméthasone","Ramipril (IEC)",
  "Amlodipine","Bisoprolol","Furosémide","Sertraline","Escitalopram","Diazépam","Lorazépam","Warfarine","Apixaban",
  "Rivaroxaban","Clopidogrel","Tramadol","Morphine","Vitamine D","Fer (supplément)","Magnésium"
];

function normalize(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); }

function makePicker({inputId, listId, chipsId, storageField, options}){
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const chips = document.getElementById(chipsId);
  if(!input || !list || !chips) return null;

  function getHealth(){ return store.get('ehpad_health', {}) || {}; }
  function setHealth(h){ store.set('ehpad_health', h); }

  function getSelected(){
    const h = getHealth();
    return Array.isArray(h[storageField]) ? h[storageField] : [];
  }
  function setSelected(arr){
    const h = getHealth();
    h[storageField] = arr;
    setHealth(h);
  }

  function syncLegacy(){
    const h = getHealth();
    const arr = Array.isArray(h[storageField]) ? h[storageField] : [];
    if(storageField === 'allergies'){
      const legacy = document.getElementById('hAllergies');
      if(legacy) legacy.value = arr.join(', ');
    }
    if(storageField === 'treatments'){
      const legacy = document.getElementById('hTreatments');
      if(legacy) legacy.value = arr.join(', ');
    }
  }

  function renderChips(){
    const selected = getSelected();
    chips.innerHTML = '';
    selected.forEach((val, idx)=>{
      const tag = document.createElement('span');
      tag.className = 'chipTag';
      tag.innerHTML = `<span>${val}</span><button title="Retirer">×</button>`;
      tag.querySelector('button').addEventListener('click', ()=>{
        const s = getSelected();
        s.splice(idx, 1);
        setSelected(s);
        renderChips();
        syncLegacy();
      });
      chips.appendChild(tag);
    });
  }

  function renderList(query){
    const q = normalize(query);
    const selected = new Set(getSelected().map(x=>normalize(x)));
    const results = options
      .filter(x => q.length > 0 && normalize(x).includes(q))
      .filter(x => !selected.has(normalize(x)))
      .slice(0, 25);

    list.innerHTML = '';
    if(results.length === 0){ list.classList.remove('show'); return; }
    results.forEach(val=>{
      const it = document.createElement('div');
      it.className = 'pickerItem';
      it.textContent = val;
      it.addEventListener('click', ()=>{
        const s = getSelected();
        s.push(val);
        setSelected(s);
        input.value = '';
        list.classList.remove('show');
        renderChips();
        syncLegacy();
      });
      list.appendChild(it);
    });
    list.classList.add('show');
  }

  function addCustom(text){
    const val = (text||'').trim();
    if(!val) return;
    const s = getSelected();
    const exists = new Set(s.map(x=>normalize(x))).has(normalize(val));
    if(exists) return;
    s.push(val);
    setSelected(s);
    input.value = '';
    list.classList.remove('show');
    renderChips();
    syncLegacy();
  }

  input.addEventListener('input', ()=> renderList(input.value));
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){ e.preventDefault(); addCustom(input.value); }
    else if(e.key === 'Escape'){ list.classList.remove('show'); }
  });
  document.addEventListener('click', (e)=>{
    if(!list.contains(e.target) && e.target !== input){ list.classList.remove('show'); }
  });

  renderChips();
  syncLegacy();
  return {renderChips, syncLegacy};
}

// Init (profil & santé)
makePicker({inputId:'allergySearch', listId:'allergyList', chipsId:'allergyChips', storageField:'allergies', options: ALLERGY_OPTIONS});
makePicker({inputId:'treatmentSearch', listId:'treatmentList', chipsId:'treatmentChips', storageField:'treatments', options: TREATMENT_OPTIONS});


/* ===== Maladies / Pathologies – recherche (démo) =====
   NOTE : impossible de lister "toutes" les maladies existantes.
   Ici : une base de suggestions courantes + ajout personnalisé.
*/
const DISEASE_OPTIONS = [
  "Hypertension artérielle",
  "Diabète de type 2",
  "Asthme",
  "BPCO (bronchopneumopathie chronique obstructive)",
  "Insuffisance cardiaque",
  "Fibrillation auriculaire",
  "Coronaropathie",
  "AVC (antécédent)",
  "Epilepsie",
  "Migraine",
  "Dépression",
  "Anxiété",
  "Trouble bipolaire",
  "Maladie d'Alzheimer",
  "Maladie de Parkinson",
  "Hypothyroïdie",
  "Hyperthyroïdie",
  "Insuffisance rénale chronique",
  "Reflux gastro-œsophagien (RGO)",
  "Ulcère gastroduodénal",
  "Maladie cœliaque",
  "Syndrome de l'intestin irritable",
  "Polyarthrite rhumatoïde",
  "Arthrose",
  "Ostéoporose",
  "Goutte",
  "Cancer (antécédent)",
  "Anémie",
  "Apnée du sommeil",
  "Hépatite (antécédent)",
  "VIH",
  "Tuberculose (antécédent)",
  "Troubles de la coagulation",
  "Trouble du rythme cardiaque",
  "Allergie saisonnière (rhume des foins)"
];

// Init picker maladies (profil & santé)
try{
  makePicker({
    inputId:'diseaseSearch',
    listId:'diseaseList',
    chipsId:'diseaseChips',
    storageField:'diseases',
    options: DISEASE_OPTIONS
  });
}catch(e){
  // ignore if profil panel doesn't include the picker
}


/* ===== Profil & Santé -> Fiche médicale (verrouillage lecture seule) ===== */
const lockedHealthKey = 'ehpad_locked_health_snapshot';

function getArrayField(obj, key){
  const v = obj?.[key];
  if(Array.isArray(v)) return v;
  if(typeof v === 'string' && v.trim()) return v.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}

function lockProfileHealthToMedical(){
  const profile = store.get('ehpad_profile', {}) || {};
  const health = store.get('ehpad_health', {}) || {};

  const snapshot = {
    fullName: profile.name || profile.fullName || '',
    role: profile.role || '',
    unit: profile.unit || '',
    allergies: getArrayField(health, 'allergies'),
    treatments: getArrayField(health, 'treatments'),
    diseases: getArrayField(health, 'diseases'),
    weight: health.weight || '',
    height: health.height || '',
    updatedAt: Date.now()
  };

  store.set(lockedHealthKey, snapshot);
  const hr = document.getElementById('healthResult');
  if(hr) hr.textContent = 'Profil & Santé verrouillé dans la Fiche médicale.';
  renderLockedHealth();
}

function renderLockedHealth(){
  const root = document.getElementById('lockedHealthPreview');
  if(!root) return;

  const s = store.get(lockedHealthKey, null);
  root.innerHTML = '';

  if(!s){
    root.innerHTML = `
      <div><span>Statut</span><strong>Non verrouillé</strong></div>
      <div><span>Action</span><strong>Profil & Santé → “Verrouiller…”</strong></div>
    `;
    return;
  }

  const rows = [
    ['Nom', s.fullName || '—'],
    ['Rôle', s.role || '—'],
    ['Unité', s.unit || '—'],
    ['Allergies', (s.allergies?.length ? s.allergies.join(', ') : '—')],
    ['Traitements', (s.treatments?.length ? s.treatments.join(', ') : '—')],
    ['Maladies', (s.diseases?.length ? s.diseases.join(', ') : '—')],
    ['Poids', s.weight ? `${s.weight} kg` : '—'],
    ['Taille', s.height ? `${s.height} cm` : '—'],
    ['Dernière mise à jour', new Date(s.updatedAt).toLocaleString()]
  ];

  rows.forEach(([k,v])=>{
    const el = document.createElement('div');
    el.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
    root.appendChild(el);
  });
}

document.getElementById('saveProfileHealthToMedical')?.addEventListener('click', ()=>{
  lockProfileHealthToMedical();
});

document.getElementById('clearLockedHealth')?.addEventListener('click', ()=>{
  localStorage.removeItem(lockedHealthKey);
  const hr = document.getElementById('healthResult');
  if(hr) hr.textContent = 'Verrouillage supprimé.';
  renderLockedHealth();
});

renderLockedHealth();
