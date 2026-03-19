const tabs=document.querySelectorAll('.navbtn')

tabs.forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'))
document.getElementById(btn.dataset.tab).classList.add('active')
}
})

function addItem(type){

let input
if(type==='allergies')input=document.getElementById('allergyInput')
if(type==='treatments')input=document.getElementById('treatInput')
if(type==='diseases')input=document.getElementById('diseaseInput')

if(!input.value)return

const li=document.createElement('li')
li.textContent=input.value
document.getElementById(type).appendChild(li)

input.value=""
}

function saveHealth(){

const allergies=[...document.querySelectorAll('#allergies li')].map(li=>li.textContent)
const treatments=[...document.querySelectorAll('#treatments li')].map(li=>li.textContent)
const diseases=[...document.querySelectorAll('#diseases li')].map(li=>li.textContent)

const data={allergies,treatments,diseases}

localStorage.setItem("medical",JSON.stringify(data))

showMedical()
}

function showMedical(){

const data=JSON.parse(localStorage.getItem("medical")||"{}")

let html="<h2>Profil santé enregistré</h2>"

html+="<b>Allergies:</b><br>"+(data.allergies||[]).join(", ")+"<br><br>"
html+="<b>Traitements:</b><br>"+(data.treatments||[]).join(", ")+"<br><br>"
html+="<b>Maladies:</b><br>"+(data.diseases||[]).join(", ")

document.getElementById("medicalView").innerHTML=html
}

showMedical()

const calendar=document.getElementById("calendar")
if(calendar){
for(let i=1;i<=30;i++){
const d=document.createElement("div")
d.className="day"
d.textContent=i
calendar.appendChild(d)
}
}
