
(function(){
  const title = document.getElementById("pageTitle");
  const buttons = Array.from(document.querySelectorAll(".sidebar button[data-tab]"));
  const panels = Array.from(document.querySelectorAll(".panel[data-panel]"));

  function setActive(tab){
    buttons.forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
    if(title){
      const map = {planning:"Planning", echanges:"Échanges", messagerie:"Messagerie", direction:"Direction", profil:"Profil"};
      title.textContent = map[tab] || "EHPAD";
    }
  }

  buttons.forEach(b => {
    b.addEventListener("click", () => setActive(b.dataset.tab));
  });

  // default
  setActive("planning");

  // Demo save
  const saveBtn = document.getElementById("saveBtn");
  if(saveBtn){
    saveBtn.addEventListener("click", () => {
      const status = document.getElementById("status")?.value || "";
      const date = document.getElementById("date")?.value || "";
      const note = document.getElementById("note")?.value || "";
      const res = document.getElementById("result");
      if(res) res.textContent = `${status} le ${date}${note ? " ("+note+")" : ""}`;
    });
  }
})();
