(function () {
  "use strict";

  const backend = window.WGANG_BACKEND;
  if (!backend) {
    console.error("WGANG backend mangler.");
    return;
  }

  const TASK_GROUPS = [
    { icon:"🌾", name:"Innhøstingsoppgaver", tasks:["Hvete","Mais","Gulrot","Bønner","Sukkererter","Jordbær","Potet","Tomat","Annen høsting"] },
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

  const LANG_KEY = "wgangLanguage";
  let currentLanguage = localStorage.getItem(LANG_KEY) || "no";
  const I18N_EN = {
    "Oversikt":"Overview","Derby":"Derby","Medlemmer":"Members","Oppgaver":"Tasks","Diskusjoner":"Discussions","Wiki":"Wiki","Admin":"Admin",
    "Logg inn":"Log in","Søk medlemskap":"Apply for membership","Logg ut":"Log out","Adminvisning":"Admin","Til behandling":"To review","Derbyadministrasjon":"Derby administration","Medlemssøknader":"Membership applications","Oppslagstavla":"Task board","Medlemmer og roller":"Members and roles",
    "Her er det viktigste for neste derby.":"Here is the most important information for the next derby.",
    "NESTE DERBY":"NEXT DERBY","Deltar":"Participating","Tar pause":"Taking a break","Usikker":"Unsure","Mangler svar":"No response",
    "Din status":"Your status","Svarfrist":"Response deadline","Har svart":"Responded","Neste derby":"Next derby",
    "Åpne derby-senter":"Open Derby Center","Under utvikling":"Under development","Medlem":"Member","Ass. leder":"Assistant leader","Administrator":"Administrator","Eier":"Owner",
    "Derby-senter":"Derby Center","Planlegg deltakelsen og følg fremdriften.":"Plan your participation and follow progress.",
    "Medlemsoversikt":"Member overview","Finn naboene dine og se derby-status.":"Find your neighbors and see their Derby status.",
    "Oppgavepreferanser":"Task preferences","Velg hva som passer deg best.":"Choose what suits you best.",
    "KUNNGJØRINGER":"ANNOUNCEMENTS","Viktige beskjeder":"Important messages","DERBYPRAT":"DERBY TALK",
    "Send inn tips":"Submit a tip","Medlemmenes tips":"Members' tips","Dette er bare starten":"This is just the beginning",
    "Administrasjon":"Administration","Godkjenn medlemmer og få oversikt over neste derby.":"Approve members and get an overview of the next Derby.",
    "KREVER HANDLING":"ACTION REQUIRED","Adminvarsler":"Admin alerts","Publiser neste derby":"Publish next Derby",
    "Deltakelsesoversikt":"Participation overview","Medlemssøknader":"Membership applications",
    "Hva passer WGANG best?":"What suits WGANG best?","Hvem foretrekker hva?":"Who prefers what?",
    "Tips som venter på gjennomgang":"Tips awaiting review","Roller og tilgang":"Roles and access",
    "Godkjenn":"Approve","Avslå":"Reject","Fjern":"Remove","Din konto":"Your account",
    "Liker":"Like","Kan ta":"Can do","Helst ikke":"Prefer not","Kan ikke":"Cannot do",
    "Ingen data":"No data","Ingen preferanser registrert ennå.":"No task preferences registered yet.",
    "Ingen medlemmer matcher søket.":"No members match the search.",
    "Profil":"Profile","Rediger profil":"Edit profile","Lagre profil":"Save profile","Om meg":"About me",
    "Kjønn":"Gender","Aldersgruppe":"Age group","Land / sted":"Country / place",
    "Hvor lenge har du spilt Hay Day?":"How long have you played Hay Day?","Hva liker du best i spillet?":"What do you like most about the game?",
    "Frivillig å fylle ut.":"Optional to fill in.","Ingen profilinformasjon er delt ennå.":"No profile information has been shared yet.",
    "Norsk":"Norwegian","Engelsk":"English",
    "SAMTALER":"CONVERSATIONS","Viktige beskjeder og derbyprat samlet på ett sted.":"Important messages and Derby talk in one place.",
    "Prat om ukens derby":"Talk about this week's Derby","Del strategi, spørsmål og koordinering med nabolaget.":"Share strategy, questions and coordination with the Neighborhood.",
    "Nytt innlegg":"New post","Ny kunngjøring":"New announcement","Publiser kunngjøring":"Publish announcement","Publiser innlegg":"Publish post",
    "KUNNSKAP":"KNOWLEDGE","WGANG Tips & triks":"WGANG Tips & Tricks","Det vi allerede vet fungerer godt – samlet på ett sted og bygget videre sammen med nabolaget.":"What we already know works well – gathered in one place and developed together with the Neighborhood.",
    "WGANGS GRUNNSTRATEGI":"WGANG'S CORE STRATEGY","320 poeng – og en tavle som holdes i bevegelse":"320 points – and a task board that keeps moving",
    "LEDELSE":"LEADERSHIP","Lederprat":"Leadership Chat","Et lukket rom for Ass. leder, Administrator og Eier.":"A private space for Assistant Leaders, Administrators and the Owner.",
    "STRATEGIROM":"STRATEGY ROOM","Planlegg derbyet sammen":"Plan the Derby together","Meldingene her er kun synlige for WGANG-ledelsen.":"Messages here are visible only to WGANG leadership.",
    "Ny melding":"New message","Send melding":"Send message","Skriv en melding til ledelsen …":"Write a message to the leadership …",
    "Starter tirsdag kl. 10:00":"Starts Tuesday at 10:00","Mandag kl. 23:00":"Monday at 23:00","Svar gjerne innen mandag kl. 23:00.":"Please respond by Monday at 23:00.",
    "Jeg deltar":"I'm participating","Jeg gjør mitt beste":"I'll do my best","Jeg tar pause":"I'm taking a break","Ikke med denne uken":"Not participating this week","Jeg er usikker":"I'm unsure","Avklarer før fristen":"I'll decide before the deadline",
    "Velg status for uken":"Choose your status for the week","Velg status for neste derby.":"Choose your status for the next Derby.",
    "Regler":"Rules","WGANG-strategi":"WGANG strategy","Oppgaver":"Tasks","Maks poeng":"Max points","Status":"Status",
    "Publiser kun dette derbyet":"Publish this Derby only","Lagre som standard":"Save as default","Velg grunnmal":"Choose template","Velg derbytype":"Choose Derby type",
    "Navn på derby":"Derby name","Start":"Start","Slutt":"End","Ordinære oppgaver":"Regular tasks","Ekstraoppgaver":"Extra tasks","Maks poeng per oppgave":"Max points per task","Daglig oppgavegrense":"Daily task limit","Kort beskrivelse":"Short description"
    ,"OVERSIKT":"OVERVIEW","OPPGAVER":"TASKS","MEDLEMMER":"MEMBERS","ADMINISTRASJON":"ADMINISTRATION",
    "Fortell laget hvilke oppgaver som passer deg best.":"Tell the team which tasks suit you best.",
    "Innhøstingsoppgaver":"Harvesting Tasks","Hvete":"Wheat","Mais":"Corn","Gulrot":"Carrot","Bønner":"Soybeans","Sukkererter":"Sugarcane","Jordbær":"Strawberries","Potet":"Potatoes","Tomat":"Tomatoes","Annen høsting":"Other harvesting",
    "Dyreoppgaver":"Animal Tasks","Melk":"Milk","Bacon":"Bacon","Egg":"Eggs","Ull":"Wool","Geitemelk":"Goat Milk","Mate dyr":"Feed Animals",
    "Produksjonsoppgaver":"Production Tasks","Lastebiloppgaver":"Truck Tasks","Båtoppgaver":"Boat Tasks","Byoppgaver":"Town Tasks",
    "Besøkende":"Visitors","Spesifikke personer":"Specific Visitors","Spesifikke hus":"Specific Buildings",
    "Fiskeoppgaver":"Fishing Tasks","Gruveoppgaver":"Mining Tasks","Hjelpeoppgaver":"Help Tasks","Kurvoppgaver":"Basket Tasks",
    "Produkter":"Products","Dyr":"Animals","Transportmidler":"Vehicles","Annet":"Other",
    "Personlig derbyoversikt":"Personal Derby Overview","Din derbyoversikt":"Your Derby Overview",
    "Kan endres frem til fristen.":"Can be changed until the deadline.",
    "Godkjente medlemmer":"Approved members","Ingen svar ennå":"No responses yet",
    "Neste derby er ikke publisert ennå.":"The next Derby has not been published yet.",
    "Ingen kunngjøringer ennå.":"No announcements yet.","Ingen innlegg ennå.":"No posts yet.",
    "Lederprat":"Leadership Chat","Lukket chat for Ass. leder, Admin og Eier.":"Private chat for Assistant Leaders, Admins and the Owner.",
    "Skriv en melding":"Write a message","Send melding":"Send message","Ingen meldinger ennå.":"No messages yet.",
    "Slett melding":"Delete message","Rediger melding":"Edit message",
    "Påmeldt":"Participating","Pause":"Taking a break","Venter":"Waiting","Ikke svart":"No response",
    "Pågående derby":"Current Derby","Forrige derby":"Previous Derby","Publisert":"Published","Aktiv":"Active","Avsluttet":"Completed","Kladd":"Draft",
    "Sist oppdatert av":"Last updated by","Ikke registrert":"Not registered",
    "Oppgaver vi bør beholde":"Tasks we should keep","Populære – ikke slett":"Popular – do not delete","Kan beholdes":"Can be kept","Lav interesse":"Low interest",
    "Søk":"Search","Alle":"All","Velg medlem":"Choose member","Velg oppgave":"Choose task","Velg preferanse":"Choose preference",
    "Ingen tips ennå.":"No tips yet.","Venter på godkjenning":"Awaiting approval","Godkjent":"Approved",
    "Velkommen til WGANG Portal":"Welcome to WGANG Portal","Logg inn for å få tilgang til nabolagets medlemsportal.":"Log in to access the Neighborhood member portal.",
    "Varsler":"Notifications","NYTT SIDEN SIST":"NEW SINCE LAST VISIT","Du har nye varsler":"You have new notifications","Varslingsinnstillinger":"Notification settings","Nye kunngjøringer":"New announcements","Nye innlegg i Derbyprat":"New Derby Talk posts","Nye innlegg i Lederprat":"New Leadership Chat messages","Nye medlemssøknader":"New membership applications","Tips som venter på behandling":"Tips awaiting review","Nytt derby publisert":"New Derby published","Påminnelse før svarfrist":"Reminder before response deadline","Lagre varslingsinnstillinger":"Save notification settings"

  };
  const DYNAMIC_EN = {
    "Standard Derby":"Standard Derby","Bingo Derby":"Bingo Derby","Styrke Derby":"Power Derby","Blomsterderby":"Blossom Derby","Harepusderby":"Bunny Derby","Chill Derby":"Chill Derby","Chill Harepus Derby":"Chill Bunny Derby","Mystery Derby":"Mystery Derby",
    "WGANG har som mål å ta oppgaver med 320 poeng.":"WGANG aims to take 320-point tasks.",
    "Admin rydder bort oppgaver nabolaget sjelden ønsker, slik at oppgavetavla holdes i bevegelse.":"Admins remove tasks the Neighborhood rarely wants so the task board keeps moving.",
    "Medlemmenes oppgavepreferanser brukes for å vurdere hvilke oppgaver som bør få stå.":"Members' task preferences are used to decide which tasks should remain on the board.",
    "Alle som melder seg på og skal delta, skal fullføre 5 oppgaver hver dag.":"Everyone who signs up to participate must complete 5 tasks every day.",
    "Det kan gjennomføres 5 ordinære oppgaver per dag.":"You can complete 5 regular tasks per day.",
    "Det kan kjøpes 1 ekstra oppgave per dag.":"You can buy 1 extra task per day.",
    "Hver fullførte oppgave gir 50 poeng.":"Each completed task gives 50 points.",
    "Chill Derby kombineres med Harepus Derby.":"Chill Derby is combined with Bunny Derby.",
    "Klargjør oppgaver på forhånd slik at du kan gjennomføre dem mens harepusen er aktiv. Harepusoppgavene vises som rosa oppgaver.":"Prepare tasks in advance so you can complete them while the Bunny is active. Bunny tasks are shown as pink tasks."
    ,"Innhøstingsoppgaver":"Harvesting Tasks","Hvete":"Wheat","Mais":"Corn","Gulrot":"Carrot","Bønner":"Soybeans","Sukkererter":"Sugarcane","Jordbær":"Strawberries","Potet":"Potatoes","Tomat":"Tomatoes","Annen høsting":"Other harvesting",
    "Dyreoppgaver":"Animal Tasks","Melk":"Milk","Bacon":"Bacon","Egg":"Eggs","Ull":"Wool","Geitemelk":"Goat Milk","Mate dyr":"Feed Animals",
    "Produksjonsoppgaver":"Production Tasks","Lastebiloppgaver":"Truck Tasks","Båtoppgaver":"Boat Tasks","Byoppgaver":"Town Tasks","Besøkende":"Visitors","Spesifikke personer":"Specific Visitors","Spesifikke hus":"Specific Buildings",
    "Fiskeoppgaver":"Fishing Tasks","Gruveoppgaver":"Mining Tasks","Hjelpeoppgaver":"Help Tasks","Kurvoppgaver":"Basket Tasks","Produkter":"Products","Dyr":"Animals","Transportmidler":"Vehicles","Annet":"Other"

  };
  function tText(value) {
    if (currentLanguage !== "en") return value;
    const text = String(value ?? "");
    if (DYNAMIC_EN[text]) return DYNAMIC_EN[text];
    if (I18N_EN[text]) return I18N_EN[text];
    return text
      .replace(/Neste derby:/g,"Next Derby:")
      .replace(/Starter tirsdag kl\. 10:00/g,"Starts Tuesday at 10:00")
      .replace(/Svar gjerne innen mandag kl\. 23:00/g,"Please respond by Monday at 23:00")
      .replace(/oppgaver per dag/g,"tasks per day")
      .replace(/ekstraoppgave/g,"extra task")
      .replace(/poeng per oppgave/g,"points per task");
  }

  const originalText = new WeakMap();
  function translateUi(root=document) {
    const english = currentLanguage === "en";
    document.documentElement.lang = english ? "en" : "no";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const raw = originalText.has(node) ? originalText.get(node) : node.nodeValue;
      if (!originalText.has(node)) originalText.set(node, raw);
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (english) { const translated = tText(trimmed); if (translated !== trimmed) node.nodeValue = raw.replace(trimmed, translated); }
      else if (!english) node.nodeValue = raw;
    });
  }

  let state = { accounts:[], derby:{type:"Standard Derby",taskTotal:9,maxPoints:320,strategy:[]}, content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],next:null}, notifications:{preferences:null,readState:null}, currentUserId:null };
  let busy = false;

  const landing = $("landing");
  const portal = $("portal");
  const sidebar = $("sidebar");
  function closeMenu() {
    if (sidebar) sidebar.classList.remove("open");
  }
  const portalMain = $("portalMain");
  const auth = $("authDialog");
  const passwordSetup = $("passwordSetupDialog");
  const editor = $("derbyEditor");
  const taskRange = $("taskRange");
  const announcementDialog = $("announcementDialog");
  const derbyPostDialog = $("derbyPostDialog");
  const tipDialog = $("tipDialog");
  const memberProfileDialog = $("memberProfileDialog");
  let adminTipMode = false;
  let openProfileUserId = null;

  function current() { return state.accounts.find(a => a.id === state.currentUserId) || null; }
  function isAdmin(user=current()) { return !!user && ["owner","admin"].includes(user.role); }
  function isOwner(user=current()) { return !!user && user.role === "owner"; }
  function isLeadership(user=current()) { return !!user && ["owner","admin","assistant_leader"].includes(user.role); }
  function approved() { return state.accounts.filter(a => a.approved); }
  function roleLabel(role) { return {owner:"Eier",admin:"Administrator",assistant_leader:"Ass. leder",member:"Medlem"}[role] || role; }
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
    if ((route === "admin" || route === "leadership") && !isLeadership()) route = "dashboard";
    if (route === "admin") { showAdminModule(isAdmin() ? "actions" : "board", useHash); return; }
    $$(".page").forEach(p => p.classList.toggle("active", p.dataset.page === route));
    $$('[data-route]').forEach(a => a.classList.toggle("active", a.dataset.route === route));
    sidebar.classList.remove("open");
    if (useHash) location.hash = route;
    portalMain.focus();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  const ADMIN_MODULE_META = {
    actions: ["Til behandling", "Varsler, tips og andre saker som venter på gjennomgang."],
    derby: ["Derbyadministrasjon", "Velg, kontroller og publiser neste derby."],
    applications: ["Medlemssøknader", "Godkjenn eller avslå nye medlemsforespørsler."],
    board: ["Oppslagstavla", "Se lagets oppgavepreferanser og planlegg hvilke oppgaver som bør beholdes."],
    roles: ["Medlemmer og roller", "Administrer medlemmer, roller og tilgang."]
  };

  function showAdminModule(name, useHash=true) {
    if (!isLeadership()) { navigate("dashboard"); return; }
    if (!isAdmin() && name !== "board") { navigate("dashboard"); return; }
    $$(".page").forEach(p => p.classList.toggle("active", p.dataset.page === "admin"));
    document.querySelectorAll(".admin-module").forEach(el => el.classList.toggle("admin-module-active", el.dataset.adminModule === name));
    const meta = ADMIN_MODULE_META[name] || ["Admin", ""];
    if ($("adminPageTitle")) $("adminPageTitle").textContent = meta[0];
    if ($("adminPageDescription")) $("adminPageDescription").textContent = meta[1];
    $$(".side-nav a").forEach(a => a.classList.remove("active"));
    document.querySelectorAll("[data-admin-route]").forEach(a => a.classList.toggle("active", a.dataset.adminRoute === name));
    if (useHash) history.replaceState(null, "", "#admin-" + name);
    closeMenu();
    translateUi(document);
  }

  function openPortal() {
    const user = current();
    if (!user || !user.approved) { openAuth("login"); return; }
    landing.classList.add("hidden");
    portal.classList.remove("hidden");
    portal.setAttribute("aria-hidden", "false");
    document.body.classList.toggle("admin-mode", isAdmin(user));
    document.body.classList.toggle("leadership-mode", isLeadership(user));
    document.body.classList.toggle("owner-mode", isOwner(user));
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
    document.body.classList.remove("leadership-mode");
    document.body.classList.remove("owner-mode");
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

  const NOTIFICATION_DEFAULTS = {
    in_app_announcements:true,in_app_derby_chat:true,in_app_leadership_chat:true,
    in_app_membership_requests:true,in_app_pending_tips:true,in_app_derby_published:true,
    in_app_derby_deadline_reminders:true,email_enabled:false
  };
  function notificationPrefs() { return Object.assign({}, NOTIFICATION_DEFAULTS, state.notifications?.preferences || {}); }
  function notificationRead() { return state.notifications?.readState || {}; }
  function newerThan(value, seen) { return value && new Date(value).getTime() > new Date(seen || "1970-01-01").getTime(); }
  function buildNotifications() {
    const prefs=notificationPrefs(), read=notificationRead(), items=[];
    const anns=state.content?.announcements||[], posts=state.content?.derbyPosts||[], msgs=state.leadershipMessages||[];
    const latestAnn=anns[0]; if(prefs.in_app_announcements && latestAnn && newerThan(latestAnn.publishedAt||latestAnn.createdAt,read.announcements_seen_at)) items.push({category:"announcements",title:"Ny kunngjøring",text:latestAnn.title||"Ny beskjed fra WGANG",route:"discussions",time:latestAnn.publishedAt||latestAnn.createdAt});
    const latestPost=posts[0]; if(prefs.in_app_derby_chat && latestPost && newerThan(latestPost.publishedAt||latestPost.createdAt,read.derby_chat_seen_at)) items.push({category:"derby_chat",title:"Nytt innlegg i Derbyprat",text:latestPost.title||latestPost.body||"",route:"discussions",time:latestPost.publishedAt||latestPost.createdAt});
    const latestMsg=msgs[msgs.length-1]; if(isLeadership() && prefs.in_app_leadership_chat && latestMsg && newerThan(latestMsg.createdAt,read.leadership_chat_seen_at) && latestMsg.userId!==current()?.id) items.push({category:"leadership_chat",title:"Nytt i Lederprat",text:`Fra ${latestMsg.authorName}`,route:"leadership",time:latestMsg.createdAt});
    if(isAdmin() && prefs.in_app_membership_requests) { const pending=state.accounts.filter(a=>a.status==="pending"); if(pending.length && newerThan(Math.max(...pending.map(x=>new Date(x.createdAt||Date.now()).getTime())),read.membership_requests_seen_at)) items.push({category:"membership_requests",title:"Nye medlemssøknader",text:`${pending.length} venter på behandling`,admin:"applications"}); }
    if(isAdmin() && prefs.in_app_pending_tips) { const tips=state.content?.pendingTips||[]; const latest=tips[0]; if(latest && newerThan(latest.createdAt,read.pending_tips_seen_at)) items.push({category:"pending_tips",title:"Tips venter på behandling",text:`${tips.length} tips venter`,admin:"actions",time:latest.createdAt}); }
    const next=state.derbyManagement?.next; if(prefs.in_app_derby_published && next?.published_at && newerThan(next.published_at,read.derby_published_seen_at)) items.push({category:"derby_published",title:"Nytt derby publisert",text:next.name||"Neste derby er klart",route:"derby",time:next.published_at});
    return items.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0));
  }
  async function openNotification(item) {
    try { await backend.markNotificationSeen(item.category); if(!state.notifications) state.notifications={}; if(!state.notifications.readState) state.notifications.readState={}; const map={announcements:"announcements_seen_at",derby_chat:"derby_chat_seen_at",leadership_chat:"leadership_chat_seen_at",membership_requests:"membership_requests_seen_at",pending_tips:"pending_tips_seen_at",derby_published:"derby_published_seen_at",derby_deadline:"derby_deadline_seen_at"}; state.notifications.readState[map[item.category]]=new Date().toISOString(); } catch(e){ console.warn(e); }
    $("memberProfileDialog")?.close();
    if(item.admin) showAdminModule(item.admin); else navigate(item.route||"dashboard");
    renderNotifications();
  }
  function renderNotifications() {
    const items=buildNotifications(), badge=$("globalNotificationBadge"), card=$("whatsNewCard");
    if(badge){badge.textContent=items.length;badge.classList.toggle("hidden",!items.length);}
    if($("whatsNewCount")) $("whatsNewCount").textContent=items.length;
    if(card) card.classList.toggle("hidden",!items.length);
    const menuBadge=$("profileMenuNotificationBadge"); if(menuBadge){menuBadge.textContent=items.length;menuBadge.classList.toggle("hidden",!items.length);}
    const renderList=(target)=>{ if(!target)return; target.innerHTML=items.length?items.map((x,i)=>`<button class="notification-item" data-notification-index="${i}"><strong>${esc(tText(x.title))}</strong><span>${esc(x.text)}</span></button>`).join(""):`<p class="empty-state">${currentLanguage==="en"?"No new notifications.":"Ingen nye varsler."}</p>`; target.querySelectorAll("[data-notification-index]").forEach(b=>b.onclick=()=>openNotification(items[+b.dataset.notificationIndex])); };
    renderList($("profileNotificationList")); renderList($("whatsNewList"));
  }
  function renderNotificationSettings() {
    const p=notificationPrefs(), set=(id,key)=>{const el=$(id);if(el)el.checked=!!p[key];};
    set("notifyAnnouncements","in_app_announcements");set("notifyDerbyChat","in_app_derby_chat");set("notifyLeadershipChat","in_app_leadership_chat");set("notifyMembershipRequests","in_app_membership_requests");set("notifyPendingTips","in_app_pending_tips");set("notifyDerbyPublished","in_app_derby_published");set("notifyDerbyDeadline","in_app_derby_deadline_reminders");set("emailNotificationsEnabled","email_enabled");
  }

  function renderSession() {
    if (!isLeadership()) {
      document.body.classList.remove("leadership-mode", "admin-mode");
      $("adminSubnav")?.classList.add("hidden");
      $("adminNavToggle")?.setAttribute("aria-expanded", "false");
    }

    const user = current();
    if (!user) return;
    user.name = String(user.name || "").toUpperCase();
    $("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
    $("profileName").textContent = user.name;
    $("profileRole").textContent = roleLabel(user.role);
    $("welcomeHeading").textContent = "Hei, " + user.name + " 👋";
    $("accountBadge").textContent = roleLabel(user.role).toUpperCase();
    $$(".choice-button").forEach(b => b.classList.toggle("selected", b.dataset.choice === user.choice));
    $("participationStatus").textContent = user.choice === "joined" ? "Du har bekreftet at du deltar." : user.choice === "pause" ? "Du tar pause i neste derby." : user.choice === "unsure" ? "Du er registrert som usikker." : "Du har ikke svart på deltakelse ennå.";
    $("myStatusMetric").textContent = choiceLabel(user.choice);
    renderDerbyConfig();
    renderMetrics();
    renderMembers();
    renderPreferences();
    renderContent();
    renderLeadershipChat();
    renderAdmin();
    if (isLeadership()) renderAdminPreferences();
    renderDerbyManagement();
    renderNotifications();
    renderNotificationSettings();
    translateUi(portal);
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
        return `<article class="member-card member-card-clickable" data-profile-id="${a.id}" tabindex="0" role="button" aria-label="Åpne profil for ${esc(a.name)}"><div class="member-head"><div class="member-identity"><span class="avatar">${esc(a.name[0])}</span><div><h3>${esc(a.name)}</h3><span class="member-role">${roleLabel(a.role)}</span></div></div><span class="member-status status-${a.choice === "unsure" ? "waiting" : a.choice}">${choiceLabel(a.choice)}</span></div><div class="member-info"><div><span>Neste derby</span><strong>${choiceLabel(a.choice)}</strong></div><div><span>Tilgang</span><strong>Godkjent</strong></div></div>${prefs.length ? `<div class="tag-list">${prefs.map(t => `<span class="task-tag like">${esc(t)}</span>`).join("")}</div>` : `<p class="helper-text">Ingen oppgavepreferanser registrert ennå.</p>`}<span class="profile-open-hint">Se profil →</span></article>`;
      }).join("") || `<p class="empty-state">Ingen medlemmer matcher søket.</p>`;
    $$('[data-profile-id]').forEach(card => {
      card.onclick = () => openMemberProfile(card.dataset.profileId);
      card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMemberProfile(card.dataset.profileId); } };
    });
    translateUi(grid);
  }

  function openMemberProfile(userId) {
    const account = state.accounts.find(a => String(a.id) === String(userId));
    if (!account || !memberProfileDialog) return;
    openProfileUserId = account.id;
    const editable = current() && String(current().id) === String(account.id);
    $("memberProfileName").textContent = String(account.name || "").toUpperCase();
    $("memberProfileRole").textContent = roleLabel(account.role);
    $("memberProfileBio").textContent = account.bio || "Ingen profilinformasjon er delt ennå.";
    const details = [];
    if (account.gender) details.push(["Kjønn", account.gender]);
    if (account.ageGroup) details.push(["Aldersgruppe", account.ageGroup]);
    if (account.countryPlace) details.push(["Land / sted", account.countryPlace]);
    if (account.hayDaySince) details.push(["Hvor lenge har du spilt Hay Day?", account.hayDaySince]);
    if (account.favoriteGameAspect) details.push(["Hva liker du best i spillet?", account.favoriteGameAspect]);
    $("memberProfileDetails").innerHTML = details.length ? details.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("") : `<p class="helper-text">Frivillig å fylle ut.</p>`;
    $("profileEditSection").classList.toggle("hidden", !editable);
    if (editable) {
      $("profileBioInput").value = account.bio || "";
      $("profileGenderInput").value = account.gender || "";
      $("profileAgeInput").value = account.ageGroup || "";
      $("profileCountryInput").value = account.countryPlace || "";
      $("profileSinceInput").value = account.hayDaySince || "";
      $("profileFavoriteInput").value = account.favoriteGameAspect || "";
    }
    showDialog(memberProfileDialog);
    translateUi(memberProfileDialog);
  }

  function renderPreferences() {
    const user = current();
    const list = $("preferenceList");
    if (!user || !list) return;
    list.innerHTML = TASK_GROUPS.map(group => `<section class="preference-group"><div class="preference-group-heading"><span>${group.icon}</span><div><h2>${esc(tText(group.name))}</h2><p>Velg hva som passer deg best.</p></div></div>${group.tasks.map(task => `<div class="preference-row"><strong>${esc(tText(task))}</strong><div class="preference-actions">${Object.entries(PREF_LABELS).map(([key,label]) => `<button type="button" data-pref-task="${esc(tText(task))}" data-pref-value="${key}" class="${user.preferences?.[task] === key ? "selected" : ""}">${label}</button>`).join("")}</div></div>`).join("")}</section>`).join("");
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
    $("adminPreferenceSummary").innerHTML = `<article><span>WGANG liker best</span><strong>${most.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>Basert på medlemmenes valg</small></article><article><span>Aktuelle å rydde</span><strong>${clear.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>Bruk som støtte – poengkrav følger derbytypen</small></article>`;
    const memberBox = $("adminPreferenceMembers");
    if (memberBox) {
      memberBox.className = "preference-member-grid";
      memberBox.innerHTML = approved().map(a => {
        const likes = TASK_TYPES.filter(t => a.preferences?.[t] === "like");
        const can = TASK_TYPES.filter(t => a.preferences?.[t] === "can");
        return `<article class="preference-member-card"><h4>${esc(a.name)}</h4><p><strong>❤️ Liker:</strong> ${likes.map(esc).join(", ") || "Ikke registrert"}</p><p><strong>👍 Kan ta:</strong> ${can.map(esc).join(", ") || "Ikke registrert"}</p></article>`;
      }).join("") || `<p class="empty-state">Ingen preferanser registrert ennå.</p>`;
    }
  }

  function formatDate(value) {
    if (!value) return "";
    try { return new Date(value).toLocaleString("nb-NO", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
    catch (_) { return ""; }
  }

  function nextDerbyDates() {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    let add = (2 - day + 7) % 7;
    if (add === 0 && (start.getHours() > 10 || (start.getHours() === 10 && start.getMinutes() > 0))) add = 7;
    start.setDate(start.getDate() + add);
    start.setHours(10,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+6); end.setHours(10,0,0,0);
    const deadline = new Date(start); deadline.setDate(deadline.getDate()-1); deadline.setHours(23,0,0,0);
    return {start,end,deadline};
  }

  function toLocalInput(date) {
    const z = n => String(n).padStart(2,"0");
    return `${date.getFullYear()}-${z(date.getMonth()+1)}-${z(date.getDate())}T${z(date.getHours())}:${z(date.getMinutes())}`;
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

  function renderLeadershipChat() {
    const list = $("leadershipMessageList");
    if (!list) return;
    if (!isLeadership()) { list.innerHTML = ""; return; }
    const messages = state.leadershipMessages || [];
    list.innerHTML = messages.length ? messages.map(m => {
      const own = m.userId === current()?.id;
      const canDelete = own || isOwner();
      return `<article class="leadership-message ${own ? "own" : ""}"><div class="leadership-message-head"><strong>${esc(m.authorName)}</strong><small>${esc(formatDate(m.createdAt))}</small></div><p>${esc(m.message)}</p>${canDelete ? `<div class="leadership-message-tools"><button class="text-button" data-leadership-delete="${m.id}">Slett</button></div>` : ""}</article>`;
    }).join("") : `<p class="empty-state">Ingen meldinger ennå. Start planleggingen her.</p>`;
    translateUi(list);
    $$('[data-leadership-delete]').forEach(button => button.onclick = async () => {
      if (!confirm(currentLanguage === "en" ? "Delete this message?" : "Slette denne meldingen?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteLeadershipMessage(button.dataset.leadershipDelete); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
  }

  function renderAdmin() {
    if (!isAdmin()) return;
    const pending = state.accounts.filter(a => a.status === "pending");
    const all = approved();
    $("pendingMembers").innerHTML = pending.length ? pending.map(a => `<div class="approval-item"><div><strong>${esc(a.name)}</strong><small>Hay Day-navn</small></div><div class="approval-actions"><button class="button button-primary button-small" data-approve="${a.id}">Godkjenn</button><button class="button button-small button-danger" data-reject="${a.id}">Avslå</button></div></div>`).join("") : `<p class="empty-state">Ingen søknader venter på godkjenning.</p>`;
    $("accountAdminTable").innerHTML = all.map(a => {
      const lockedOwner = a.role === "owner" && !isOwner();
      const ownOwner = a.role === "owner" && a.id === current().id;
      const ownerOption = isOwner() ? `<option value="owner" ${a.role === "owner" ? "selected" : ""}>Eier</option>` : (a.role === "owner" ? `<option value="owner" selected>Eier</option>` : "");
      return `<tr><td><strong>${esc(a.name)}</strong></td><td><select class="role-select" data-role-id="${a.id}" ${ownOwner || lockedOwner ? "disabled" : ""}><option value="member" ${a.role === "member" ? "selected" : ""}>Medlem</option><option value="assistant_leader" ${a.role === "assistant_leader" ? "selected" : ""}>Ass. leder</option><option value="admin" ${a.role === "admin" ? "selected" : ""}>Administrator</option>${ownerOption}</select></td><td>${choiceLabel(a.choice)}</td><td>${a.id === current().id ? `<span class="logout-note">Din konto</span>` : `<button class="table-action" data-remove="${a.id}">Fjern</button>`}</td></tr>`;
    }).join("");
    const counts = {joined:0,pause:0,unsure:0,waiting:0};
    all.forEach(a => counts[a.choice] = (counts[a.choice] || 0) + 1);
    $("adminStatusGrid").innerHTML = [["Deltar",counts.joined],["Tar pause",counts.pause],["Usikker",counts.unsure],["Mangler svar",counts.waiting]].map(x => `<article><span>${x[0]}</span><strong>${x[1]}</strong><small>medlemmer</small></article>`).join("");
    $("adminResponseBadge").textContent = (all.length - counts.waiting) + " av " + all.length + " svar";
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
    const next = state.derbyManagement?.next;
    const d = next ? {
      type: next.name,
      taskTotal: next.task_total || state.derby.taskTotal || 9,
      maxPoints: next.max_points || state.derby.maxPoints || 320,
      strategy: Array.isArray(next.strategy) ? next.strategy : [],
      startAt: next.start_at,
      signupDeadline: next.signup_deadline,
      dailyTaskLimit: next.daily_task_limit,
      extraTasks: next.extra_tasks,
      description: next.description,
      rules: Array.isArray(next.rules) ? next.rules : []
    } : state.derby;
    $("derbyType").textContent = d.type; $("dashboardDerbyType").textContent = d.type;
    const metricNext = $("dashboardNextDerbyName"); if (metricNext) metricNext.textContent = d.type.replace(" Derby","");
    const deadlineText = $("dashboardDeadline"); if (deadlineText) deadlineText.textContent = "Mandag kl. 23:00";
    const startText = $("nextDerbyStart"); if (startText) startText.textContent = d.startAt ? `Starter ${formatDate(d.startAt)}` : "Starter tirsdag kl. 10:00";
    $("derbyTaskTotalLabel").textContent = d.taskTotal || "–"; $("derbyMaxPoints").textContent = d.maxPoints || "–";
    $("derbyStrategy").innerHTML = (d.strategy || []).map(x => `<li>${esc(x)}</li>`).join("") || `<li>Strategi publiseres av admin før derbyet starter.</li>`;
    const info = $("nextDerbyInfo");
    if (info) {
      const rules = (d.rules || []).map(x=>`<li>${esc(x)}</li>`).join("");
      info.innerHTML = `${d.description ? `<p>${esc(d.description)}</p>` : ""}${d.dailyTaskLimit ? `<p><strong>Daglig kvote:</strong> ${d.dailyTaskLimit} oppgaver${d.extraTasks ? ` + ${d.extraTasks} ekstra` : ""}</p>` : ""}${rules ? `<ul class="strategy-list">${rules}</ul>` : ""}`;
    }
    taskRange.max = d.taskTotal || 9;
    if (+taskRange.value > taskRange.max) taskRange.value = taskRange.max;
    progress();
  }

  function renderDerbyManagement() {
    if (!isAdmin()) return;
    const dm = state.derbyManagement || {templates:[],events:[],next:null};
    const select = $("derbyTemplateSelect");
    if (select) {
      const currentValue = select.value;
      select.innerHTML = `<option value="">Velg derbytype</option>` + dm.templates.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
      if (currentValue) select.value = currentValue;
    }
    const templateAudit = $("templateAudit");
    if (templateAudit && select && select.value) {
      const t = dm.templates.find(x => String(x.id) === String(select.value));
      if (t && t.updated_at) {
        const updater = state.accounts.find(a => String(a.id) === String(t.updated_by));
        templateAudit.textContent = `Sist oppdatert${updater ? ` av ${updater.name}` : ""}: ${new Date(t.updated_at).toLocaleString("nb-NO")}`;
      } else templateAudit.textContent = "";
    }
    const nextBox = $("publishedDerbySummary");
    if (nextBox) nextBox.innerHTML = dm.next ? `<strong>${esc(dm.next.name)}</strong><span>${dm.next.start_at ? `Starter ${esc(formatDate(dm.next.start_at))}` : "Publisert"}</span>` : `<span>Ingen neste derby er publisert ennå.</span>`;
    renderAdminActions();
  }

  function renderAdminActions() {
    if (!isAdmin()) return;
    const pendingMembers = state.accounts.filter(a=>a.status==="pending").length;
    const pendingTips = state.content?.pendingTips?.length || 0;
    const total = pendingMembers + pendingTips;
    const badge = $("notificationBadge"); if (badge) { badge.textContent = total; badge.classList.toggle("hidden", total===0); }
    const list = $("adminActionList");
    if (list) list.innerHTML = total ? `${pendingMembers ? `<button class="action-item" data-action-route="admin"><strong>${pendingMembers}</strong><span>medlemsforespørsel${pendingMembers===1?"":"er"} venter</span></button>`:""}${pendingTips ? `<button class="action-item" data-action-route="admin"><strong>${pendingTips}</strong><span>tips venter på godkjenning</span></button>`:""}` : `<p class="empty-state">Ingen saker krever handling akkurat nå.</p>`;
    $$("[data-action-route]").forEach(b=>b.onclick=()=>{ showAdminModule("actions"); });
  }

  async function init() {
    setModeHint();
    translateUi(document);
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
      const result = await backend.signUp($("registerName").value.trim().toUpperCase(), $("registerEmail").value.trim().toLowerCase(), $("registerPassword").value);
      msg.textContent = result.needsEmailConfirmation ? "Søknaden er opprettet. Bekreft e-postadressen din først. Deretter må en administrator godkjenne medlemskapet." : "Søknaden er sendt. En administrator må godkjenne deg før innlogging.";
      msg.classList.add("success"); e.target.reset();
      if (backend.mode === "local") await refreshState();
    } catch (error) { msg.textContent = humanError(error, "Kunne ikke sende søknaden."); }
    setBusy(false);
  };

  $$('[data-route]').forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    if (portal.classList.contains("hidden")) {
      openPortal();
      closeMenu();
      return;
    }
    navigate(a.dataset.route);
    closeMenu();
  }));
  $("menuToggle").onclick = () => sidebar.classList.toggle("open");
  if ($("adminNavToggle")) $("adminNavToggle").onclick = () => {
    const sub = $("adminSubnav");
    if (!sub) return;
    sub.classList.toggle("hidden");
    $("adminNavToggle").setAttribute("aria-expanded", sub.classList.contains("hidden") ? "false" : "true");
  };
  document.querySelectorAll("[data-admin-route]").forEach(a => a.onclick = e => {
    e.preventDefault();
    showAdminModule(a.dataset.adminRoute);
    closeMenu();
  });
  $("profileChip").onclick = () => {
    if (!current()) return;
    openMemberProfile(current().id);
    setTimeout(() => {
      if (typeof showProfileHubSection === "function") showProfileHubSection("menu");
      if ($("profileHubName")) $("profileHubName").textContent = current()?.gameName || "PROFIL";
    }, 0);
  };
  function refreshLanguageButton() {
    const flag = $("languageFlag");
    if (flag) flag.textContent = currentLanguage === "en" ? "🇬🇧" : "🇳🇴";
  }
  refreshLanguageButton();
  if ($("languageButton")) $("languageButton").onclick = e => {
    e.stopPropagation();
    const dd = $("languageDropdown");
    if (!dd) return;
    dd.classList.toggle("hidden");
    $("languageButton").setAttribute("aria-expanded", dd.classList.contains("hidden") ? "false" : "true");
  };
  document.querySelectorAll("[data-language-choice]").forEach(btn => btn.onclick = () => {
    currentLanguage = btn.dataset.languageChoice;
    localStorage.setItem(LANG_KEY, currentLanguage);
    refreshLanguageButton();
    $("languageDropdown")?.classList.add("hidden");
    translateUi(document);
    if (!portal.classList.contains("hidden")) renderSession();
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#languageMenu")) $("languageDropdown")?.classList.add("hidden");
  });
  if ($("saveNotificationSettings")) $("saveNotificationSettings").onclick=async()=>{
    const payload={
      in_app_announcements:!!$("notifyAnnouncements")?.checked,
      in_app_derby_chat:!!$("notifyDerbyChat")?.checked,
      in_app_leadership_chat:!!$("notifyLeadershipChat")?.checked,
      in_app_membership_requests:!!$("notifyMembershipRequests")?.checked,
      in_app_pending_tips:!!$("notifyPendingTips")?.checked,
      in_app_derby_published:!!$("notifyDerbyPublished")?.checked,
      in_app_derby_deadline_reminders:!!$("notifyDerbyDeadline")?.checked,
      email_enabled:!!$("emailNotificationsEnabled")?.checked
    };
    try{const saved=await backend.saveNotificationPreferences(payload);state.notifications=state.notifications||{};state.notifications.preferences=saved;$("notificationSettingsStatus").textContent=currentLanguage==="en"?"Notification settings saved.":"Varslingsinnstillingene er lagret.";renderNotifications();}catch(e){$("notificationSettingsStatus").textContent=humanError(e);}
  };
  function showProfileHubSection(section="menu") {
    ["profileHubMenu","profileHubNotifications","profileHubSettings","profileHubProfile","profileHubAccount"].forEach(id=>$(id)?.classList.add("hidden"));
    const map={menu:"profileHubMenu",notifications:"profileHubNotifications",settings:"profileHubSettings",profile:"profileHubProfile",account:"profileHubAccount"};
    $(map[section]||map.menu)?.classList.remove("hidden");
    if(section==="settings"){
      const settings=$("notificationSettings"), mount=$("profileHubSettingsMount");
      if(mount && !$("profileLanguageSetting")){
        const wrap=document.createElement("div"); wrap.id="profileLanguageSetting"; wrap.className="profile-language-setting";
        wrap.innerHTML=`<h4>Språk</h4><div class="profile-language-buttons"><button type="button" data-set-lang="no">🇳🇴 Norsk</button><button type="button" data-set-lang="en">🇬🇧 English</button></div>`;
        mount.appendChild(wrap); wrap.querySelectorAll("[data-set-lang]").forEach(b=>b.onclick=()=>setLanguage(b.dataset.setLang));
      }
      if(settings&&mount&&!mount.contains(settings)) mount.appendChild(settings);
      renderNotificationSettings();
    }
    if(section==="account"){if($("accountGameName"))$("accountGameName").textContent=current()?.gameName||"–";if($("accountRole"))$("accountRole").textContent=roleLabel(current()?.role);}
    if(section==="notifications") renderNotifications();
  }
  document.querySelectorAll("[data-profile-section]").forEach(btn=>btn.onclick=()=>showProfileHubSection(btn.dataset.profileSection));
  document.querySelectorAll(".profile-hub-back").forEach(btn=>btn.onclick=()=>showProfileHubSection("menu"));
  if($("closeProfileHub")) $("closeProfileHub").onclick=()=>$("memberProfileDialog")?.close();
  if($("profileHubLogout")) $("profileHubLogout").onclick=async()=>{await backend.logout();location.reload();};
  if ($("closeMemberProfile")) $("closeMemberProfile").onclick = () => closeDialog(memberProfileDialog);
  if ($("memberProfileForm")) $("memberProfileForm").onsubmit = async e => {
    e.preventDefault();
    if (busy || !current()) return;
    setBusy(true);
    const me = current();
    const payload = {
      id: me.id,
      bio: $("profileBioInput").value.trim(),
      gender: $("profileGenderInput").value,
      ageGroup: $("profileAgeInput").value,
      countryPlace: $("profileCountryInput").value.trim(),
      hayDaySince: $("profileSinceInput").value.trim(),
      favoriteGameAspect: $("profileFavoriteInput").value.trim()
    };
    try {
      await backend.updatePublicProfile(payload);
      Object.assign(me, payload);
      $("profileSaveMessage").textContent = "Profilen er lagret.";
      $("profileSaveMessage").classList.add("success");
      await refreshState();
      openMemberProfile(me.id);
    } catch(e) {
      $("profileSaveMessage").textContent = humanError(e, "Kunne ikke lagre profilen.");
    }
    setBusy(false);
  };
  if ($("leadershipMessageForm")) $("leadershipMessageForm").onsubmit = async e => {
    e.preventDefault();
    if (busy || !isLeadership()) return;
    const input = $("leadershipMessageInput");
    const status = $("leadershipMessageStatus");
    const message = input.value.trim();
    if (!message) return;
    setBusy(true);
    try {
      await backend.sendLeadershipMessage(message);
      input.value = "";
      status.textContent = currentLanguage === "en" ? "Message sent." : "Meldingen er sendt.";
      status.classList.add("success");
      await refreshState();
    } catch(e) { status.textContent = humanError(e, currentLanguage === "en" ? "Could not send message." : "Kunne ikke sende meldingen."); }
    setBusy(false);
  };

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
  function openDerbyEditorDialog() {
    const dates = nextDerbyDates();
    $("derbyStartAt").value = toLocalInput(dates.start);
    $("derbyEndAt").value = toLocalInput(dates.end);
    $("derbySignupDeadline").value = toLocalInput(dates.deadline);
    renderDerbyManagement();
    showDialog(editor);
  }
  $("openDerbyEditor").onclick = openDerbyEditorDialog;
  if ($("openDerbyPublisher")) $("openDerbyPublisher").onclick = openDerbyEditorDialog;
  $("closeDerbyEditor").onclick = () => closeDialog(editor);
  if ($("derbyTemplateSelect")) $("derbyTemplateSelect").onchange = () => {
    const t = state.derbyManagement?.templates?.find(x=>String(x.id) === $("derbyTemplateSelect").value);
    if (!t) return;
    $("editDerbyType").value = t.name || "";
    $("editTaskTotal").value = t.default_task_total || "";
    $("editExtraTasks").value = t.default_extra_tasks ?? 0;
    $("editMaxPoints").value = t.default_max_points || "";
    $("editDailyTaskLimit").value = t.daily_task_limit || "";
    $("editDerbyDescription").value = t.description || "";
    $("editRules").value = (t.rules || []).join("\n");
    $("editStrategy").value = (t.strategy || []).join("\n");
    const audit = $("templateAudit");
    if (audit) {
      const updater = state.accounts.find(a => String(a.id) === String(t.updated_by));
      audit.textContent = t.updated_at ? `Sist oppdatert${updater ? ` av ${updater.name}` : ""}: ${new Date(t.updated_at).toLocaleString("nb-NO")}` : "";
    }
  };

  function derbyEditorPayload() {
    const templateId = $("derbyTemplateSelect").value || null;
    return {
      template_id: templateId ? Number(templateId) : null,
      name: $("editDerbyType").value.trim() || "Ukjent derby",
      start_at: $("derbyStartAt").value ? new Date($("derbyStartAt").value).toISOString() : null,
      end_at: $("derbyEndAt").value ? new Date($("derbyEndAt").value).toISOString() : null,
      signup_deadline: $("derbySignupDeadline").value ? new Date($("derbySignupDeadline").value).toISOString() : null,
      task_total: $("editTaskTotal").value ? Number($("editTaskTotal").value) : null,
      extra_tasks: Number($("editExtraTasks").value || 0),
      max_points: $("editMaxPoints").value ? Number($("editMaxPoints").value) : null,
      daily_task_limit: $("editDailyTaskLimit").value ? Number($("editDailyTaskLimit").value) : null,
      description: $("editDerbyDescription").value.trim() || null,
      rules: $("editRules").value.split("\n").map(x=>x.trim()).filter(Boolean),
      strategy: $("editStrategy").value.split("\n").map(x=>x.trim()).filter(Boolean)
    };
  }

  $("saveDerby").onclick = async () => {
    if (busy) return;
    const event = derbyEditorPayload();
    setBusy(true);
    try { await backend.publishDerbyEvent(event); await refreshState(); closeDialog(editor); } catch(e) { alert(humanError(e)); }
    setBusy(false);
  };

  if ($("saveDerbyTemplate")) $("saveDerbyTemplate").onclick = async () => {
    if (busy || !isOwner()) return;
    const event = derbyEditorPayload();
    if (!event.template_id) { alert("Velg en grunnmal først."); return; }
    if (!confirm("Lagre disse opplysningene som ny standard for denne derbytypen?")) return;
    setBusy(true);
    try {
      await backend.updateDerbyTemplate({
        id:event.template_id, name:event.name, description:event.description,
        taskTotal:event.task_total, extraTasks:event.extra_tasks, maxPoints:event.max_points,
        dailyTaskLimit:event.daily_task_limit, rules:event.rules, strategy:event.strategy
      });
      await refreshState();
      alert("Grunnmalen er oppdatert. Endringene brukes neste gang derbytypen velges.");
    } catch(e) { alert(humanError(e)); }
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
