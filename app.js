const tabs=document.querySelectorAll('.navbtn')

tabs.forEach(btn=>{
btn.onclick=()=>{
tabs.forEach(b=>b.classList.remove('active'))
btn.classList.add('active')

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

const chip=document.createElement('div')
chip.className='chip'
chip.textContent=input.value

document.getElementById(type).appendChild(chip)

input.value=""
}

function saveHealth(){
const get=(id)=>[...document.getElementById(id).children].map(c=>c.textContent)

const data={
allergies:get('allergies'),
treatments:get('treatments'),
diseases:get('diseases')
}

localStorage.setItem("medical",JSON.stringify(data))
renderMedical()
}

function renderMedical(){
const data=JSON.parse(localStorage.getItem("medical")||"{}")

document.getElementById("medicalView").innerHTML=
"<h2>Données enregistrées</h2>"+
"<b>Allergies:</b> "+(data.allergies||[]).join(", ")+"<br><br>"+
"<b>Traitements:</b> "+(data.treatments||[]).join(", ")+"<br><br>"+
"<b>Maladies:</b> "+(data.diseases||[]).join(", ")
}

renderMedical()

const cal=document.getElementById("calendar")
if(cal){
for(let i=1;i<=30;i++){
const d=document.createElement("div")
d.className="day"
d.textContent=i
cal.appendChild(d)
}
}
