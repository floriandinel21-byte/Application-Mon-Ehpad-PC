function show(id){
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'))
document.getElementById(id).classList.add('active')
}

function addPlanning(){
const agent=document.getElementById('agent').value
const date=document.getElementById('date').value
const shift=document.getElementById('shift').value

const data=JSON.parse(localStorage.getItem('planning')||'[]')
data.push({agent,date,shift})
localStorage.setItem('planning',JSON.stringify(data))
renderPlanning()
}

function renderPlanning(){
const data=JSON.parse(localStorage.getItem('planning')||'[]')
const ul=document.getElementById('planningList')
ul.innerHTML=""
data.forEach(d=>{
const li=document.createElement('li')
li.textContent=d.agent+" - "+d.date+" - "+d.shift
ul.appendChild(li)
})
}

function addDemande(){
const nom=document.getElementById('nomDemande').value
const type=document.getElementById('typeDemande').value
const d1=document.getElementById('dateDebut').value
const d2=document.getElementById('dateFin').value

const data=JSON.parse(localStorage.getItem('demandes')||'[]')
data.push({nom,type,d1,d2})
localStorage.setItem('demandes',JSON.stringify(data))
renderDemandes()
}

function renderDemandes(){
const data=JSON.parse(localStorage.getItem('demandes')||'[]')
const ul=document.getElementById('demandeList')
ul.innerHTML=""
data.forEach(d=>{
const li=document.createElement('li')
li.textContent=d.nom+" - "+d.type+" du "+d.d1+" au "+d.d2
ul.appendChild(li)
})
}

function addHealth(){
const input=document.getElementById('search')
const div=document.createElement('div')
div.textContent=input.value
document.getElementById('healthList').appendChild(div)
input.value=""
}

function saveHealth(){
const data=[...document.getElementById('healthList').children].map(d=>d.textContent)
localStorage.setItem('fiche',JSON.stringify(data))
renderFiche()
}

function renderFiche(){
const data=JSON.parse(localStorage.getItem('fiche')||'[]')
document.getElementById('ficheData').innerHTML=data.join("<br>")
}

renderPlanning()
renderDemandes()
renderFiche()
