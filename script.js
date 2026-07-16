
const members = [
  {name:"SANDER", role:"Ass. leder", roleKey:"coleader", level:76, status:"joined", statusText:"Deltar", done:6, total:9, likes:["Melk","Bacon","Hjelp"], dislikes:["Båt"]},
  {name:"H", role:"Ass. leder", roleKey:"coleader", level:98, status:"finished", statusText:"Ferdig", done:9, total:9, likes:["Produksjon","By"], dislikes:["Fisk"]},
  {name:"SILSTA20", role:"Medlem", roleKey:"member", level:60, status:"pause", statusText:"Tar pause", done:0, total:9, likes:["Båt","Hjelp"], dislikes:["Gruve"]},
  {name:"HANNE", role:"Medlem", roleKey:"member", level:29, status:"joined", statusText:"Deltar", done:4, total:9, likes:["Mate dyr","Hjelp"], dislikes:["Lastebil"]},
  {name:"ROOSTER", role:"Leder", roleKey:"leader", level:112, status:"finished", statusText:"Ferdig", done:9, total:9, likes:["By","Gruve"], dislikes:["Båt"]},
  {name:"BACON", role:"Medlem", roleKey:"member", level:71, status:"joined", statusText:"Deltar", done:7, total:9, likes:["Bacon","Melk"], dislikes:["Fisk"]},
  {name:"SOLSIKKE", role:"Medlem", roleKey:"member", level:54, status:"waiting", statusText:"Mangler svar", done:0, total:9, likes:["Høsting"], dislikes:["Produksjon"]},
  {name:"FARMGIRL", role:"Medlem", roleKey:"member", level:84, status:"pause", statusText:"Tar pause", done:0, total:9, likes:["Fisk","Båt"], dislikes:["Gruve"]}
];

const grid = document.getElementById("memberGrid");
const empty = document.getElementById("emptyState");
const search = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const roleFilter = document.getElementById("roleFilter");
const dialog = document.getElementById("memberDialog");

function render() {
  const q = search.value.trim().toLowerCase();
  const status = statusFilter.value;
  const role = roleFilter.value;

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(q) &&
    (status === "all" || m.status === status) &&
    (role === "all" || m.roleKey === role)
  );

  grid.innerHTML = filtered.map((m, i) => {
    const pct = m.total ? Math.round((m.done/m.total)*100) : 0;
    return `
      <article class="member-card">
        <div class="member-head">
          <div class="identity">
            <span class="avatar">${m.name[0]}</span>
            <div><h3>${m.name}</h3><span class="role">${m.role} · nivå ${m.level}</span></div>
          </div>
          <span class="status ${m.status}">${m.statusText}</span>
        </div>

        <div class="member-meta">
          <div><span>Oppgaver</span><strong>${m.done} av ${m.total}</strong></div>
          <div><span>Minimumskrav</span><strong>${m.done >= Math.ceil(m.total*.9) ? "Oppfylt" : "Ikke ennå"}</strong></div>
        </div>

        <div class="progress-label"><span>Derbyfremdrift</span><strong>${pct} %</strong></div>
        <div class="track"><span style="width:${pct}%"></span></div>

        <div class="tags">
          ${m.likes.map(x => `<span class="tag like">+ ${x}</span>`).join("")}
          ${m.dislikes.map(x => `<span class="tag dislike">− ${x}</span>`).join("")}
        </div>

        <div class="card-actions">
          <button class="view-button" onclick="openMember('${m.name}')">Se profil</button>
          <button class="admin-button" onclick="alert('Adminhandling for ${m.name} kommer i neste versjon.')">Administrer</button>
        </div>
      </article>`;
  }).join("");

  empty.hidden = filtered.length !== 0;
}

window.openMember = function(name) {
  const m = members.find(x => x.name === name);
  document.getElementById("dialogName").textContent = m.name;
  document.getElementById("dialogContent").innerHTML = `
    <section class="profile-section">
      <h3>Medlemsinformasjon</h3>
      <p>${m.role}, gårdsnivå ${m.level}. Alle data er knyttet til spillnavnet ${m.name}.</p>
    </section>
    <section class="profile-section">
      <h3>Derby</h3>
      <p>Status: ${m.statusText}. Fremdrift: ${m.done} av ${m.total} oppgaver.</p>
    </section>
    <section class="profile-section">
      <h3>Foretrekker</h3>
      <div class="tags">${m.likes.map(x => `<span class="tag like">${x}</span>`).join("")}</div>
    </section>
    <section class="profile-section">
      <h3>Ønsker helst ikke</h3>
      <div class="tags">${m.dislikes.map(x => `<span class="tag dislike">${x}</span>`).join("")}</div>
    </section>`;
  dialog.showModal();
};

document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

[search, statusFilter, roleFilter].forEach(el => el.addEventListener("input", render));

document.getElementById("modeButton").addEventListener("click", e => {
  document.body.classList.toggle("admin-mode");
  e.currentTarget.textContent = document.body.classList.contains("admin-mode")
    ? "Vis som medlem"
    : "Vis som admin";
});

render();
