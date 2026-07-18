(function () {
  "use strict";

  const backend = window.WGANG_BACKEND;
  if (!backend) {
    console.error("WGANG backend mangler.");
    return;
  }

  const TASK_GROUPS = [
    { icon:"🌾", name:"Innhøstingsoppgaver", tasks:["Hvete","Mais","Gulrot","Bønner","Sukkererter","Jordbær","Potet","Annen høsting"] },
    { icon:"🐄", name:"Dyreoppgaver", tasks:["Melk","Bacon","Egg","Ull","Geitemelk","Mate dyr"] },
    { icon:"🏭", name:"Produksjonsoppgaver", tasks:["Produksjonsoppgaver"] },
    { icon:"🚚", name:"Lastebiloppgaver", tasks:["Lastebiloppgaver"] },
    { icon:"🚢", name:"Båtoppgaver", tasks:["Båtoppgaver"] },
    { icon:"🚂", name:"Byoppgaver", tasks:["Besøkende","Spesifikke personer","Spesifikke hus"] },
    { icon:"🎣", name:"Fiskeoppgaver", tasks:["Fiskeoppgaver"] },
    { icon:"⛏️", name:"Gruveoppgaver", tasks:["Gruveoppgaver"] },
    { icon:"🤝", name:"Hjelpeoppgaver", tasks:["Hjelpeoppgaver"] },
    { icon:"🧺", name:"Kurvoppgaver", tasks:["Produkter","Dyr","Transportmidler","Annet"] }
  ];
  const TASK_TYPES = TASK_GROUPS.flatMap(group => group.tasks);
  const PREF_LABELS = { like:"Liker", can:"Kan ta", avoid:"Helst ikke", no:"Kan ikke" };
  const $ = id => document.getElementById(id);
  const $$ = selector => document.querySelectorAll(selector);
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  let state = { accounts:[], derby:{type:"Standard Derby",taskTotal:9,maxPoints:320,strategy:[]}, content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, currentUserId:null };
  let busy = false;

  const landing = $("landing");
  const portal = $("portal");
  const sidebar = $("sidebar");
  const portalMain = $("portalMain");
  const auth = $("authDialog");
  const passwordSetup = $("passwordSetupDialog");
  const editor = $("derbyEditor");
  const taskRange = $("taskRange");
  const announcementDialog = $("announcementDialog");
  const derbyPostDialog = $("derbyPostDialog");
  const tipDialog = $("tipDialog");
  let adminTipMode = false;

  function current() { return state.accounts.find(a => a.id === state.currentUserId) || null; }
  function isAdmin(user=current()) { return !!user && ["owner","admin"].includes(user.role); }
  function approved() { return state.accounts.filter(a => a.approved); }
  function roleLabel(role) { return {owner:"Eier",admin:"Administrator",member:"Medlem"}[role] || role; }
  function choiceLabel(choice) { return {joined:"Deltar",pause:"Tar pause",unsure:"Usikker",waiting:"Mangler svar"}[choice] || choice; }
  function showDialog(dialog) { if (dialog && typeof dialog.showModal === "function") dialog.showModal(); else if (dialog) dialog.setAttribute("open", ""); }
  function closeDialog(dialog) { if (dialog && typeof dialog.close === "function") dialog.close(); else if (dialog) dialog.removeAttribute("open"); }
  function setBusy(value) { busy = value; document.body.classList.toggle("is-busy", value); }
  function humanError(error, fallback="Noe gikk galt. Prøv igjen.") { return error && error.message ? error.message : fallback; }

  function setModeHint() {
    const hint = document.querySelector(".demo-hint");
    if (!hint) return;
    if (backend.mode === "supabase") {
      hint.innerHTML = "<strong>Velkommen til WGANG Portal</strong><br>Logg inn for å få tilgang til nabolagets medlemsportal.";
    } else {
      hint.innerHTML = "<strong>Oppsettmodus:</strong> Supabase er ikke koblet til ennå.<br>Demo admin: admin@wgang.no / WGANG2026";
    }
  }

  function openAuth(tab="login") { showDialog(auth); setAuthTab(tab); }
  function setAuthTab(tab) {
    $$('[data-auth-tab]').forEach(b => b.classList.toggle("active", b.dataset.authTab === tab));
    $("loginForm").classList.toggle("hidden", tab !== "login");
    $("registerForm").classList.toggle("hidden", tab !== "register");
    $("authTitle").textContent = tab === "login" ? "Logg inn" : "Søk om medlemskap";
    $("authIntro").textContent = tab === "login" ? "Bruk e-postadressen din for å åpne portalen." : "Bruk Hay Day-navnet ditt. En administrator godkjenner søknaden.";
  }

  function navigate(route, useHash=true) {
    if (route === "admin" && !isAdmin()) route = "dashboard";
    $$(".page").forEach(p => p.classList.toggle("active", p.dataset.page === route));
    $$('[data-route]').forEach(a => a.classList.toggle("active", a.dataset.route === route));
    sidebar.classList.remove("open");
    if (useHash) location.hash = route;
    portalMain.focus();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function openPortal() {
    const user = current();
    if (!user || !user.approved) { openAuth("login"); return; }
    landing.classList.add("hidden");
    portal.classList.remove("hidden");
    portal.setAttribute("aria-hidden", "false");
    document.body.classList.toggle("admin-mode", isAdmin(user));
    renderSession();
    const hash = location.hash.replace("#", "");
    navigate(hash && hash !== "landing" ? hash : "dashboard", false);
    window.scrollTo(0, 0);
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    try { await backend.signOut(); } catch (e) { console.warn(e); }
    state.currentUserId = null;
    portal.classList.add("hidden");
    portal.setAttribute("aria-hidden", "true");
    landing.classList.remove("hidden");
    document.body.classList.remove("admin-mode");
    sidebar.classList.remove("open");
    location.hash = "landing";
    window.scrollTo(0, 0);
    setBusy(false);
  }

  async function refreshState() {
    state = await backend.refresh();
    if (current() && current().approved) renderSession();
  }

  function topPreferences(account) {
    return TASK_TYPES.filter(t => ["like","can"].includes(account.preferences?.[t])).slice(0, 3);
  }

  function renderSession() {
    const user = current();
    if (!user) return;
    $("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
    $("profileName").textContent = user.name;
    $("profileRole").textContent = roleLabel(user.role);
    $("welcomeHeading").textContent = "Hei, " + user.name + " 👋";
    $("accountBadge").textContent = roleLabel(user.role).toUpperCase();
    $$(".choice-button").forEach(b => b.classList.toggle("selected", b.dataset.choice === user.choice));
    $("participationStatus").textContent = user.choice === "joined" ? "Du har bekreftet at du deltar." : user.choice === "pause" ? "Du tar pause i neste derby." : "Du er registrert som usikker.";
    $("myStatusMetric").textContent = choiceLabel(user.choice);
    renderDerbyConfig();
    renderMetrics();
    renderMembers();
    renderPreferences();
    renderContent();
    renderAdmin();
  }

  function renderMetrics() {
    const all = approved();
    const answered = all.filter(a => ["joined","pause","unsure"].includes(a.choice)).length;
    $("respondedMetric").textContent = answered + "/" + all.length;
  }

  function renderMembers() {
    const grid = $("memberGrid");
    if (!grid) return;
    const q = $("memberSearch").value.trim().toLowerCase();
    const filter = $("memberFilter").value;
    grid.innerHTML = approved()
      .filter(a => a.name.toLowerCase().includes(q) && (filter === "all" || a.choice === filter))
      .map(a => {
        const prefs = topPreferences(a);
        return `<article class="member-card"><div class="member-head"><div class="member-identity"><span class="avatar">${esc(a.name[0])}</span><div><h3>${esc(a.name)}</h3><span class="member-role">${roleLabel(a.role)}</span></div></div><span class="member-status status-${a.choice === "unsure" ? "waiting" : a.choice}">${choiceLabel(a.choice)}</span></div><div class="member-info"><div><span>Neste derby</span><strong>${choiceLabel(a.choice)}</strong></div><div><span>Tilgang</span><strong>Godkjent</strong></div></div>${prefs.length ? `<div class="tag-list">${prefs.map(t => `<span class="task-tag like">${esc(t)}</span>`).join("")}</div>` : `<p class="helper-text">Ingen oppgavepreferanser registrert ennå.</p>`}</article>`;
      }).join("") || `<p class="empty-state">Ingen medlemmer matcher søket.</p>`;
  }

  function renderPreferences() {
    const user = current();
    const list = $("preferenceList");
    if (!user || !list) return;
    list.innerHTML = TASK_GROUPS.map(group => `<section class="preference-group"><div class="preference-group-heading"><span>${group.icon}</span><div><h2>${esc(group.name)}</h2><p>Velg hva som passer deg best.</p></div></div>${group.tasks.map(task => `<div class="preference-row"><strong>${esc(task)}</strong><div class="preference-actions">${Object.entries(PREF_LABELS).map(([key,label]) => `<button type="button" data-pref-task="${esc(task)}" data-pref-value="${key}" class="${user.preferences?.[task] === key ? "selected" : ""}">${label}</button>`).join("")}</div></div>`).join("")}</section>`).join("");
    $$('[data-pref-task]').forEach(button => button.onclick = async () => {
      if (busy) return;
      const me = current();
      const task = button.dataset.prefTask;
      const next = me.preferences?.[task] === button.dataset.prefValue ? null : button.dataset.prefValue;
      setBusy(true);
      try {
        await backend.setPreference(me.id, task, next);
        if (!me.preferences) me.preferences = {};
        if (next) me.preferences[task] = next; else delete me.preferences[task];
        renderPreferences(); renderMembers(); renderAdminPreferences();
      } catch (e) { alert(humanError(e)); }
      setBusy(false);
    });
  }

  function preferenceStats() {
    const stats = {};
    TASK_TYPES.forEach(t => stats[t] = {like:0,can:0,avoid:0,no:0});
    approved().forEach(a => Object.entries(a.preferences || {}).forEach(([task,value]) => {
      if (stats[task] && stats[task][value] != null) stats[task][value]++;
    }));
    return stats;
  }

  function taskRecommendation(s) {
    const positive = s.like + s.can, negative = s.avoid + s.no;
    if (s.like >= 2) return {label:"La stå",cls:"recommend-keep"};
    if (positive === 0 && negative > 0) return {label:"Slett raskt",cls:"recommend-clear"};
    if (positive === 0 && negative === 0) return {label:"Ukjent",cls:"recommend-unknown"};
    if (positive >= negative) return {label:"Kan stå litt",cls:"recommend-watch"};
    return {label:"Vurder å slette",cls:"recommend-clear"};
  }

  function renderAdminPreferences() {
    if (!isAdmin()) return;
    const stats = preferenceStats();
    const rows = TASK_TYPES.map(t => ({t,s:stats[t],r:taskRecommendation(stats[t])}));
    $("adminPreferenceTable").innerHTML = rows.map(x => `<tr><td><strong>${esc(x.t)}</strong></td><td>${x.s.like}</td><td>${x.s.can}</td><td>${x.s.avoid}</td><td>${x.s.no}</td><td><span class="recommendation ${x.r.cls}">${x.r.label}</span></td></tr>`).join("");
    const most = rows.slice().sort((a,b) => (b.s.like*2+b.s.can)-(a.s.like*2+a.s.can)).slice(0,3);
    const clear = rows.slice().sort((a,b) => (b.s.no*2+b.s.avoid)-(a.s.no*2+a.s.avoid)).filter(x => x.s.no+x.s.avoid>0).slice(0,3);
    $("adminPreferenceSummary").innerHTML = `<article><span>WGANG liker best</span><strong>${most.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>Basert på medlemmenes valg</small></article><article><span>Aktuelle å rydde</span><strong>${clear.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>Bruk som støtte – 320 poeng gjelder fortsatt</small></article>`;
  }

  function formatDate(value) {
    if (!value) return "";
    try { return new Date(value).toLocaleString("nb-NO", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
    catch (_) { return ""; }
  }

  function postCard(item, options={}) {
    const category = item.category ? `<span class="content-category">${esc(item.category)}</span>` : "";
    const actions = options.admin ? `<div class="content-actions"><button class="table-action" data-delete-content="${item.id}">Slett</button></div>` : "";
    return `<article class="content-post">${category}<h3>${esc(item.title)}</h3><p>${esc(item.body).replace(/\n/g,"<br>")}</p><footer><span>${esc(item.authorName || "WGANG")}</span><time>${esc(formatDate(item.publishedAt || item.createdAt))}</time>${actions}</footer></article>`;
  }

  function renderContent() {
    const content = state.content || {announcements:[],derbyPosts:[],tips:[],pendingTips:[]};
    const announcementList = $("announcementList");
    const derbyPostList = $("derbyPostList");
    const tipsList = $("communityTipsList");
    if (announcementList) announcementList.innerHTML = content.announcements.length ? content.announcements.map(x=>postCard(x,{admin:isAdmin()})).join("") : `<p class="empty-state">Ingen kunngjøringer er publisert ennå.</p>`;
    if (derbyPostList) derbyPostList.innerHTML = content.derbyPosts.length ? content.derbyPosts.map(x=>postCard(x,{admin:isAdmin()})).join("") : `<p class="empty-state">Ingen innlegg i Derbyprat ennå. Bli den første som deler noe.</p>`;
    if (tipsList) tipsList.innerHTML = content.tips.length ? content.tips.map(x=>postCard(x,{admin:isAdmin()})).join("") : `<p class="empty-state">Ingen medlemstips er publisert ennå.</p>`;

    const latestNews = document.querySelector('[data-page="dashboard"] .dashboard-grid article:nth-child(2)');
    if (latestNews && content.announcements.length) {
      const a = content.announcements[0];
      latestNews.classList.remove("development-card");
      latestNews.innerHTML = `<div class="card-header"><div><p class="card-kicker">NABOLAGSNYTT</p><h2>${esc(a.title)}</h2></div></div><p>${esc(a.body)}</p><p class="helper-text">Publisert ${esc(formatDate(a.publishedAt))}</p><button class="text-button" data-route="discussions">Se alle kunngjøringer</button>`;
      latestNews.querySelector('[data-route="discussions"]').onclick = () => navigate("discussions");
    }

    if (isAdmin()) {
      const pending = $("pendingTips");
      if (pending) pending.innerHTML = content.pendingTips.length ? content.pendingTips.map(t => `<div class="approval-card"><div><strong>${esc(t.title)}</strong><span>${esc(t.category || "Tips")} · fra ${esc(t.authorName)}</span><p>${esc(t.body)}</p></div><div class="approval-actions"><button class="button button-primary" data-tip-approve="${t.id}">Godkjenn</button><button class="button button-secondary" data-tip-reject="${t.id}">Avslå</button></div></div>`).join("") : `<p class="empty-state">Ingen tips venter på gjennomgang.</p>`;
      $$('[data-tip-approve]').forEach(b => b.onclick = async () => {
        if (busy) return; setBusy(true);
        try { await backend.moderateContent(b.dataset.tipApprove,"published"); await refreshState(); } catch(e) { alert(humanError(e)); }
        setBusy(false);
      });
      $$('[data-tip-reject]').forEach(b => b.onclick = async () => {
        if (busy) return; setBusy(true);
        try { await backend.moderateContent(b.dataset.tipReject,"rejected"); await refreshState(); } catch(e) { alert(humanError(e)); }
        setBusy(false);
      });
    }

    $$('[data-delete-content]').forEach(b => b.onclick = async () => {
      if (!isAdmin() || !confirm("Slette dette innholdet?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteContent(b.dataset.deleteContent); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
  }

  function renderAdmin() {
    if (!isAdmin()) return;
    const pending = state.accounts.filter(a => a.status === "pending");
    const all = approved();
    $("pendingMembers").innerHTML = pending.length ? pending.map(a => `<div class="approval-item"><div><strong>${esc(a.name)}</strong><small>${esc(a.email)}</small></div><div class="approval-actions"><button class="button button-primary button-small" data-approve="${a.id}">Godkjenn</button><button class="button button-small button-danger" data-reject="${a.id}">Avslå</button></div></div>`).join("") : `<p class="empty-state">Ingen søknader venter på godkjenning.</p>`;
    $("accountAdminTable").innerHTML = all.map(a => `<tr><td><strong>${esc(a.name)}</strong></td><td>${esc(a.email)}</td><td><select class="role-select" data-role-id="${a.id}" ${a.role === "owner" && a.id === current().id ? "disabled" : ""}><option value="member" ${a.role === "member" ? "selected" : ""}>Medlem</option><option value="admin" ${a.role === "admin" ? "selected" : ""}>Administrator</option><option value="owner" ${a.role === "owner" ? "selected" : ""}>Eier</option></select></td><td>${choiceLabel(a.choice)}</td><td>${a.id === current().id ? `<span class="logout-note">Din konto</span>` : `<button class="table-action" data-remove="${a.id}">Fjern</button>`}</td></tr>`).join("");
    const counts = {joined:0,pause:0,unsure:0,waiting:0};
    all.forEach(a => counts[a.choice] = (counts[a.choice] || 0) + 1);
    $("adminStatusGrid").innerHTML = [["Deltar",counts.joined],["Tar pause",counts.pause],["Usikker",counts.unsure],["Mangler svar",counts.waiting]].map(x => `<article><span>${x[0]}</span><strong>${x[1]}</strong><small>medlemmer</small></article>`).join("");
    $("adminResponseBadge").textContent = (all.length - counts.waiting) + " av " + all.length + " svar";
    renderAdminPreferences();

    $$('[data-approve]').forEach(b => b.onclick = async () => {
      if (busy) return; setBusy(true);
      try { await backend.approve(b.dataset.approve); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    $$('[data-reject]').forEach(b => b.onclick = async () => {
      if (busy) return; setBusy(true);
      try { await backend.setMemberStatus(b.dataset.reject,"rejected"); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    $$('[data-remove]').forEach(b => b.onclick = async () => {
      if (!confirm("Fjerne medlemmet fra portalen? Kontoen deaktiveres, men historikk beholdes.")) return;
      if (busy) return; setBusy(true);
      try { await backend.setMemberStatus(b.dataset.remove,"removed"); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    $$('[data-role-id]').forEach(select => select.onchange = async () => {
      if (busy) return; setBusy(true);
      try { await backend.setRole(select.dataset.roleId, select.value); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
  }

  function progress() {
    const done = +taskRange.value, total = +taskRange.max, percent = total ? done/total*100 : 0;
    $("tasksDone").textContent = done; $("tasksTotal").textContent = total;
    $("dashboardTasksDone").textContent = done; $("dashboardTasksTotal").textContent = total;
    $("derbyProgress").style.width = percent + "%"; $("dashboardProgress").style.width = percent + "%";
  }

  function renderDerbyConfig() {
    const d = state.derby;
    $("derbyType").textContent = d.type; $("dashboardDerbyType").textContent = d.type;
    $("derbyTaskTotalLabel").textContent = d.taskTotal; $("derbyMaxPoints").textContent = d.maxPoints;
    $("derbyStrategy").innerHTML = d.strategy.map(x => `<li>${esc(x)}</li>`).join("");
    taskRange.max = d.taskTotal;
    if (+taskRange.value > d.taskTotal) taskRange.value = d.taskTotal;
    $("editDerbyType").value = d.type; $("editTaskTotal").value = d.taskTotal; $("editMaxPoints").value = d.maxPoints; $("editStrategy").value = d.strategy.join("\n");
    progress();
  }

  async function init() {
    setModeHint();
    try {
      state = await backend.bootstrap();
      const intent = typeof backend.getAuthIntent === "function" ? await backend.getAuthIntent() : {type:"",hasSession:false};
      if (intent.hasSession && ["invite","recovery"].includes(intent.type)) {
        $("passwordSetupTitle").textContent = intent.type === "recovery" ? "Velg nytt passord" : "Opprett passord";
        $("passwordSetupIntro").textContent = intent.type === "recovery" ? "Velg et nytt passord for WGANG Portal." : "Invitasjonen er godkjent. Velg passordet du vil bruke når du logger inn.";
        closeDialog(auth);
        showDialog(passwordSetup);
        return;
      }
      if (state.currentUserId && current() && current().approved) openPortal();
      else if (state.currentUserId && current() && !current().approved) {
        await backend.signOut();
        state.currentUserId = null;
      }
    } catch (e) {
      console.error(e);
      const msg = $("loginMessage");
      if (msg) msg.textContent = "Kunne ikke koble til WGANG-databasen. Kontroller Supabase-oppsettet.";
    }
  }

  $("openPortalTop").onclick = () => openAuth("login");
  $("openPortalHero").onclick = () => openAuth("login");
  $("openPortalRule").onclick = () => openAuth("login");
  $("joinDemoButton").onclick = () => openAuth("register");
  $("closeAuth").onclick = () => closeDialog(auth);
  $("closePortal").onclick = logout;
  $$('[data-auth-tab]').forEach(b => b.onclick = () => setAuthTab(b.dataset.authTab));

  $("forgotPassword").onclick = async () => {
    if (busy) return;
    let email = $("loginEmail").value.trim().toLowerCase();
    if (!email) email = (window.prompt("Skriv inn e-postadressen du bruker til WGANG Portal:") || "").trim().toLowerCase();
    if (!email) return;
    const msg = $("loginMessage"); msg.classList.remove("success"); msg.textContent = "";
    setBusy(true);
    try {
      await backend.requestPasswordReset(email);
      msg.textContent = "Vi har sendt deg en e-post. Åpne lenken der for å velge nytt passord.";
      msg.classList.add("success");
    } catch (error) { msg.textContent = humanError(error, "Kunne ikke sende e-post for nytt passord."); }
    setBusy(false);
  };

  $("passwordSetupForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    const msg = $("passwordSetupMessage"); msg.classList.remove("success"); msg.textContent = "";
    const password = $("newPassword").value;
    const confirm = $("confirmPassword").value;
    if (password.length < 8) { msg.textContent = "Passordet må være minst 8 tegn."; return; }
    if (password !== confirm) { msg.textContent = "Passordene er ikke like."; return; }
    setBusy(true);
    try {
      await backend.updatePassword(password);
      await backend.signOut();
      closeDialog(passwordSetup);
      $("passwordSetupForm").reset();
      openAuth("login");
      const loginMsg = $("loginMessage");
      loginMsg.textContent = "Passordet er lagret. Du kan nå logge inn.";
      loginMsg.classList.add("success");
    } catch (error) { msg.textContent = humanError(error, "Kunne ikke lagre passordet."); }
    setBusy(false);
  };

  $("loginForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    const msg = $("loginMessage"); msg.classList.remove("success"); msg.textContent = "";
    setBusy(true);
    try {
      state = await backend.signIn($("loginEmail").value.trim().toLowerCase(), $("loginPassword").value);
      closeDialog(auth); openPortal();
    } catch (error) { msg.textContent = humanError(error, "Kunne ikke logge inn."); }
    setBusy(false);
  };

  $("registerForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    const msg = $("registerMessage"); msg.classList.remove("success"); msg.textContent = "";
    setBusy(true);
    try {
      const result = await backend.signUp($("registerName").value.trim(), $("registerEmail").value.trim().toLowerCase(), $("registerPassword").value);
      msg.textContent = result.needsEmailConfirmation ? "Søknaden er opprettet. Bekreft e-postadressen din først. Deretter må en administrator godkjenne medlemskapet." : "Søknaden er sendt. En administrator må godkjenne deg før innlogging.";
      msg.classList.add("success"); e.target.reset();
      if (backend.mode === "local") await refreshState();
    } catch (error) { msg.textContent = humanError(error, "Kunne ikke sende søknaden."); }
    setBusy(false);
  };

  $$('[data-route]').forEach(a => a.addEventListener("click", e => { e.preventDefault(); if (portal.classList.contains("hidden")) { openPortal(); return; } navigate(a.dataset.route); }));
  $("menuToggle").onclick = () => sidebar.classList.toggle("open");
  $("roleSwitch").onclick = () => navigate("admin");
  $("memberSearch").oninput = renderMembers;
  $("memberFilter").onchange = renderMembers;

  $$(".choice-button").forEach(button => button.onclick = async () => {
    if (busy || !current()) return;
    const user = current(), choice = button.dataset.choice;
    setBusy(true);
    try { await backend.setParticipation(user.id, choice); user.choice = choice; renderSession(); } catch(e) { alert(humanError(e)); }
    setBusy(false);
  });

  taskRange.oninput = progress;
  $("finishDerby").onclick = () => { taskRange.value = taskRange.max; progress(); $("derbyStatus").value = "Ferdig"; $("finishStatus").textContent = "Ferdig registrert " + new Date().toLocaleString("nb-NO") + "."; };
  $("openDerbyEditor").onclick = () => showDialog(editor);
  $("closeDerbyEditor").onclick = () => closeDialog(editor);
  $("saveDerby").onclick = async () => {
    if (busy) return;
    const derby = {
      type: $("editDerbyType").value.trim() || "Ukjent derby",
      taskTotal: Math.max(1, +$("editTaskTotal").value || 9),
      maxPoints: Math.max(1, +$("editMaxPoints").value || 320),
      strategy: $("editStrategy").value.split("\n").map(x => x.trim()).filter(Boolean)
    };
    setBusy(true);
    try { await backend.saveDerby(derby); state.derby = derby; renderDerbyConfig(); closeDialog(editor); } catch(e) { alert(humanError(e)); }
    setBusy(false);
  };

  $$('[data-close-dialog]').forEach(button => button.onclick = () => closeDialog($(button.dataset.closeDialog)));
  if ($("openAnnouncementForm")) $("openAnnouncementForm").onclick = () => { $("announcementForm").reset(); $("announcementMessage").textContent=""; showDialog(announcementDialog); };
  if ($("openDerbyPostForm")) $("openDerbyPostForm").onclick = () => { $("derbyPostForm").reset(); $("derbyPostMessage").textContent=""; showDialog(derbyPostDialog); };
  if ($("openTipForm")) $("openTipForm").onclick = () => { adminTipMode=false; $("tipForm").reset(); $("tipDialogTitle").textContent="Send inn tips"; $("tipSubmitButton").textContent="Send til godkjenning"; $("tipMessage").textContent=""; showDialog(tipDialog); };
  if ($("openAdminTipForm")) $("openAdminTipForm").onclick = () => { adminTipMode=true; $("tipForm").reset(); $("tipDialogTitle").textContent="Publiser tips"; $("tipSubmitButton").textContent="Publiser tips"; $("tipMessage").textContent=""; showDialog(tipDialog); };

  if ($("announcementForm")) $("announcementForm").onsubmit = async e => {
    e.preventDefault(); if (busy || !isAdmin()) return;
    setBusy(true);
    try { await backend.createContent("announcement", $("announcementTitle").value.trim(), $("announcementBody").value.trim(), "", true); closeDialog(announcementDialog); e.target.reset(); await refreshState(); }
    catch(err) { $("announcementMessage").textContent=humanError(err); }
    setBusy(false);
  };

  if ($("derbyPostForm")) $("derbyPostForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    setBusy(true);
    try { await backend.createContent("derby", $("derbyPostTitle").value.trim(), $("derbyPostBody").value.trim(), "", true); closeDialog(derbyPostDialog); e.target.reset(); await refreshState(); }
    catch(err) { $("derbyPostMessage").textContent=humanError(err); }
    setBusy(false);
  };

  if ($("tipForm")) $("tipForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    setBusy(true);
    try {
      await backend.createContent("tip", $("tipTitle").value.trim(), $("tipBody").value.trim(), $("tipCategory").value, adminTipMode && isAdmin());
      closeDialog(tipDialog); e.target.reset(); await refreshState();
      if (!adminTipMode) alert("Takk! Tipset er sendt til admin for gjennomgang.");
    } catch(err) { $("tipMessage").textContent=humanError(err); }
    setBusy(false);
  };

  backend.onAuthChange((newState, event) => {
    state = newState;
    if (!state.currentUserId) {
      portal.classList.add("hidden"); landing.classList.remove("hidden");
    }
    if (event === "PASSWORD_RECOVERY") {
      closeDialog(auth);
      showDialog(passwordSetup);
    }
  });

  renderDerbyConfig(); progress(); init();

  // PWA installasjon
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const button = $("installAppButton");
    if (button) button.classList.remove("hidden");
  });
  const installButton = $("installAppButton");
  if (installButton) installButton.onclick = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
  };
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.error));
  }
})();
