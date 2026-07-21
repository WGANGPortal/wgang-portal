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
  const STATIC_EN_EXTRA = {
    "Automatisk oppgavefremdrift, poeng og scoreboard er ikke koblet til reelle derbydata ennå. Dette bygges senere på grunnlag av hvordan WGANG faktisk bruker portalen.":"Automatic task progress, points and the scoreboard are not connected to live Derby data yet. This will be developed based on how WGANG actually uses the portal.",
    "oppgaver fullført":"tasks completed","I gang":"In progress","Ferdig":"Completed","Marker som ferdig":"Mark as completed",
    "DELTAR DU?":"ARE YOU PARTICIPATING?","STRATEGI":"STRATEGY","ADMINOVERSIKT":"ADMIN OVERVIEW","Status per medlem":"Status by member","Deltakelse":"Participation",
    "Viktige beskjeder og derbyprat samlet på ett sted.":"Important announcements and Derby Talk gathered in one place.",
    "Prat om ukens derby":"Talk about this week's Derby","Del strategi, spørsmål og koordinering med nabolaget.":"Share strategy, questions and coordination with the Neighborhood.",
    "Et lukket rom for lederne.":"A private space for the leadership team.","Planlegg derbyet sammen":"Plan the Derby together","Meldingene her er kun synlige for WGANG-ledelsen.":"Messages here are visible only to the WGANG leadership team.",
    "Vokser med WGANG":"Growing with WGANG","320 poeng – og en tavle som holdes i bevegelse":"320 points – and a task board that keeps moving",
    "I Standard Derby er hovedregelen enkel: Vi tar oppgaver med 320 poeng. Admin rydder bort oppgaver som få eller ingen ønsker, slik at nye og bedre oppgaver får plass på tavla. Oppgavepreferansene hjelper admin å se hvilke 320-oppgaver som passer nabolaget best.":"In Standard Derby, the main rule is simple: we take 320-point tasks. Admins remove tasks that few or no one wants, making room for new and better tasks on the board. Members' task preferences help admins see which 320-point tasks suit the Neighborhood best.",
    "HØSTING":"HARVESTING","Forbered før du tar oppgaven":"Prepare before taking the task","Plant avlinger med lang veksttid på forhånd når du forventer en høsteoppgave. Da kan mye være klart til innhøsting idet du tar oppgaven.":"Plant long-growing crops in advance when you expect a harvesting task. That way, much of the crop can be ready to harvest as soon as you take the task.",
    "PRODUKSJON":"PRODUCTION","La varene vente ferdige":"Leave finished products ready","Produser aktuelle varer før du tar oppgaven, og la dem ligge ferdige i maskinene når det er mulig. Ta oppgaven først når du er klar til å samle inn.":"Produce the relevant items before taking the task, and leave them finished in the machines whenever possible. Take the task only when you are ready to collect them.",
    "BYEN":"TOWN","Bruk Town Hall strategisk":"Use the Town Hall strategically","La ferdig betjente besøkende stå klare uten å samle dem inn. Når du har nok besøkende klare, tar du derbyoppgaven og samler dem inn for å få en rask start – eller fullføre oppgaven raskt.":"Leave fully served visitors ready without collecting them. Once you have enough visitors prepared, take the Derby task and collect them for a fast start – or to complete the task quickly.",
    "OPPGAVETAVLA":"TASK BOARD","Preferanser gjør tavla bedre":"Preferences improve the task board","Marker hvilke oppgavetyper du liker, kan ta, helst unngår eller ikke kan ta. Jo bedre admin kjenner laget, desto enklere er det å vite hvilke 320-oppgaver som bør få stå.":"Mark which task types you like, can do, prefer to avoid or cannot do. The better admins know the team, the easier it is to decide which 320-point tasks should stay on the board.",
    "SAMARBEID":"TEAMWORK","Gi beskjed når du klargjør en oppgave":"Let the team know when you are preparing for a task","Skal du forberede deg på en bestemt derbyoppgave, gi beskjed i chatten i spillet. Da unngår vi at flere klargjør seg til den samme oppgaven, og at oppgaven blir tatt eller forsvinner før du er klar. God kommunikasjon og samarbeid gjør at vi fordeler oppgavene bedre og utnytter potensialet vårt best mulig.":"When preparing for a specific Derby task, let the team know in the in-game chat. This prevents several players from preparing for the same task and reduces the risk of the task being taken or disappearing before you are ready. Good communication and teamwork help us distribute tasks better and make the most of our potential.",
    "FRA NABOLAGET":"FROM THE NEIGHBORHOOD","Send inn egne tips. Admin gjennomgår dem før de publiseres.":"Submit your own tips. An admin reviews them before they are published.",
    "WGANG SOM APP":"WGANG AS AN APP","Legg portalen på hjemskjermen":"Add the portal to your Home Screen","Da åpnes WGANG Portal mer som en egen app på telefonen din.":"WGANG Portal will then open more like a dedicated app on your phone.",
    "Installer WGANG Portal":"Install WGANG Portal","iPhone / iPad":"iPhone / iPad","Åpne portalen i Safari → trykk Del-knappen → velg «Legg til på Hjem-skjerm» → trykk Legg til.":"Open the portal in Safari → tap the Share button → choose “Add to Home Screen” → tap Add.",
    "Åpne portalen i Chrome. Velg «Installer app» eller «Legg til på startskjermen» når valget vises.":"Open the portal in Chrome. Choose “Install app” or “Add to Home screen” when the option appears.",
    "BYGGES SAMMEN":"BUILT TOGETHER","Her kommer det flere tips, strategier og erfaringer etter hvert. WGANG Tips & triks skal utvikles ut fra nabolagets egne tilbakemeldinger og det medlemmene opplever fungerer best i praksis.":"More tips, strategies and experiences will be added over time. WGANG Tips & Tricks will grow from the Neighborhood's own feedback and what members find works best in practice."
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
    if (STATIC_EN_EXTRA[text]) return STATIC_EN_EXTRA[text];
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

  let state = { accounts:[], derby:{type:"Standard Derby",taskTotal:9,maxPoints:320,strategy:[]}, content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],next:null}, notifications:{preferences:null,readState:null}, social:{likes:[],comments:[],translations:[],activityNotifications:[]}, currentUserId:null };
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
  function isOwner(user=current()) { return !!user && user.role === "owner"; }

  const PERMISSION_DEFINITIONS = [
    {group:"Medlemmer",key:"members.view",label:"Se medlemsliste",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Medlemmer",key:"members.approve",label:"Godkjenne medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.reject",label:"Avslå medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.change_role",label:"Endre rolle på medlem",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.remove",label:"Fjerne/deaktivere medlem",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Derby",key:"derby.view",label:"Se derby",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Derby",key:"derby.plan",label:"Delta i derbyplanlegging",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Derby",key:"derby.board.update",label:"Oppdatere dagens oppgavetavle",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Derby",key:"derby.board.publish",label:"Publisere oppgavetavle",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Derby",key:"derby.task_library.edit",label:"Legge til/redigere oppgavemaler",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Derby",key:"derby.settings.publish",label:"Publisere neste derby",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Chat",key:"chat.community.view",label:"Se vanlig chat/Derbyprat",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Chat",key:"chat.community.post",label:"Skrive i vanlig chat/Derbyprat",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Chat",key:"chat.leadership.view",label:"Se Lederprat",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Chat",key:"chat.leadership.post",label:"Skrive i Lederprat",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Chat",key:"chat.moderate",label:"Slette andres innlegg",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Innlegg / godkjenning",key:"content.pending.view",label:"Se innlegg/tips som venter",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Innlegg / godkjenning",key:"content.approve",label:"Godkjenne innlegg/tips",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Innlegg / godkjenning",key:"content.reject",label:"Avvise innlegg/tips",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Varslinger",key:"notifications.admin.membership",label:"Motta varsel om medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Varslinger",key:"notifications.admin.pending_content",label:"Motta varsel om innlegg til godkjenning",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Varslinger",key:"notifications.leadership_chat",label:"Motta Lederprat-varsler",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Varslinger",key:"notifications.important_derby",label:"Motta viktige derbyvarsler",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},

    {group:"Roller og rettigheter",key:"permissions.view",label:"Se rettighetsoppsett",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Roller og rettigheter",key:"permissions.edit",label:"Endre rettigheter",defaults:{owner:1,admin:0,assistant_leader:0,member:0}},

    {group:"Historikk",key:"history.view",label:"Se derby-/medlemshistorikk",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Historikk",key:"history.permission_audit",label:"Se logg over rettighetsendringer",defaults:{owner:1,admin:1,assistant_leader:0,member:0}}
  ];

  function rolePermissionOverride(role,key){
    const rows=state.permissions?.rolePermissions||[];
    const row=rows.find(x=>x.role===role&&x.permission_key===key);
    return row ? !!row.enabled : null;
  }
  function hasPermission(key,user=current()){
    if(!user)return false;
    if(user.role==="owner")return true; // systemkritiske Eier-rettigheter er låst
    const override=rolePermissionOverride(user.role,key);
    if(override!==null)return override;
    const def=PERMISSION_DEFINITIONS.find(x=>x.key===key);
    return !!def?.defaults?.[user.role];
  }
  function isAdmin(user=current()) { return !!user && (user.role==="owner" || (user.role==="admin" && hasPermission("permissions.view",user))); }
  function isLeadership(user=current()) { return !!user && hasPermission("chat.leadership.view",user); }
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
    if (route==="leadership" && !hasPermission("chat.leadership.view")) route="dashboard";
    if (route==="admin" && !hasPermission("permissions.view") && !hasPermission("derby.board.update")) route="dashboard";
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
    const modulePermission={actions:"content.pending.view",applications:"members.approve",roles:"permissions.view",derby:"derby.board.update",board:"derby.board.update"}[name];
    if(modulePermission && !hasPermission(modulePermission)){navigate("dashboard");return;}
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
    const latestMsg=msgs[msgs.length-1]; if(hasPermission("notifications.leadership_chat") && prefs.in_app_leadership_chat && latestMsg && newerThan(latestMsg.createdAt,read.leadership_chat_seen_at) && latestMsg.userId!==current()?.id) items.push({category:"leadership_chat",title:"Nytt i Lederprat",text:`Fra ${latestMsg.authorName}`,route:"leadership",time:latestMsg.createdAt});
    if(hasPermission("notifications.admin.membership") && hasPermission("members.approve") && prefs.in_app_membership_requests) { const pending=state.accounts.filter(a=>a.status==="pending"); if(pending.length && newerThan(Math.max(...pending.map(x=>new Date(x.createdAt||Date.now()).getTime())),read.membership_requests_seen_at)) items.push({category:"membership_requests",title:"Nye medlemssøknader",text:`${pending.length} venter på behandling`,admin:"applications",count:pending.length}); }
    if(hasPermission("notifications.admin.pending_content") && hasPermission("content.pending.view") && prefs.in_app_pending_tips) { const tips=state.content?.pendingTips||[]; const latest=tips[0]; if(latest && newerThan(latest.createdAt,read.pending_tips_seen_at)) items.push({category:"pending_tips",title:"Tips venter på behandling",text:`${tips.length} tips venter`,admin:"actions",time:latest.createdAt,count:tips.length}); }
    const activity=(socialData().activityNotifications||[]).filter(x=>!x.read_at);
    activity.forEach(n=>{
      const actor=state.accounts.find(a=>String(a.id)===String(n.actor_id));
      items.push({category:"social_activity",activityId:n.id,title:n.activity_type==="comment"?"Ny kommentar":"Ny likerklikk",text:`${actor?.name||"Et medlem"} ${n.activity_type==="comment"?"kommenterte":"likte"} innlegget ditt`,route:n.target_type==="leadership"?"leadership":"discussions",time:n.created_at});
    });
    const next=state.derbyManagement?.next; if(hasPermission("notifications.important_derby") && prefs.in_app_derby_published && next?.published_at && newerThan(next.published_at,read.derby_published_seen_at)) items.push({category:"derby_published",title:"Nytt derby publisert",text:next.name||"Neste derby er klart",route:"derby",time:next.published_at});
    return items.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0));
  }
  async function openNotification(item) {
    try { if(item.category==="social_activity"&&item.activityId){await backend.markActivityNotificationRead(item.activityId);} else {await backend.markNotificationSeen(item.category);} if(!state.notifications) state.notifications={}; if(!state.notifications.readState) state.notifications.readState={}; const map={announcements:"announcements_seen_at",derby_chat:"derby_chat_seen_at",leadership_chat:"leadership_chat_seen_at",membership_requests:"membership_requests_seen_at",pending_tips:"pending_tips_seen_at",derby_published:"derby_published_seen_at",derby_deadline:"derby_deadline_seen_at"}; if(map[item.category]) state.notifications.readState[map[item.category]]=new Date().toISOString(); } catch(e){ console.warn(e); }
    $("memberProfileDialog")?.close();
    if(item.admin) showAdminModule(item.admin); else navigate(item.route||"dashboard");
    renderNotifications();
  }
  function renderNotifications() {
    const items=buildNotifications(), badge=$("globalNotificationBadge"), card=$("whatsNewCard");
    const notificationCount=items.reduce((sum,x)=>sum+(x.count||1),0);
    if(badge){badge.textContent=notificationCount;badge.classList.toggle("hidden",!notificationCount);}
    if($("whatsNewCount")) $("whatsNewCount").textContent=notificationCount;
    if(card) card.classList.toggle("hidden",!items.length);
    const menuBadge=$("profileMenuNotificationBadge"); if(menuBadge){menuBadge.textContent=notificationCount;menuBadge.classList.toggle("hidden",!notificationCount);}
    const renderList=(target)=>{ if(!target)return; target.innerHTML=items.length?items.map((x,i)=>`<button class="notification-item" data-notification-index="${i}"><strong>${esc(tText(x.title))}</strong><span>${esc(x.text)}</span></button>`).join(""):`<p class="empty-state">${currentLanguage==="en"?"No new notifications.":"Ingen nye varsler."}</p>`; target.querySelectorAll("[data-notification-index]").forEach(b=>b.onclick=()=>openNotification(items[+b.dataset.notificationIndex])); };
    renderList($("profileNotificationList")); renderList($("whatsNewList"));
  }
  function renderNotificationSettings() {
    const p=notificationPrefs(), set=(id,key)=>{const el=$(id);if(el)el.checked=!!p[key];};
    set("notifyAnnouncements","in_app_announcements");set("notifyDerbyChat","in_app_derby_chat");set("notifyLeadershipChat","in_app_leadership_chat");set("notifyMembershipRequests","in_app_membership_requests");set("notifyPendingTips","in_app_pending_tips");
    const derbyImportant=$("notifyImportantDerby"); if(derbyImportant)derbyImportant.checked=!!(p.in_app_derby_published||p.in_app_derby_deadline_reminders);
    set("emailNotificationsEnabled","email_enabled");
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
    loadBunny();
    translateUi(portal);
    queueVisibleTranslations();
  }

  const BUNNY_DEFAULT_TASKS = [
    {id:1,category:"Bybyggeoppgave",name:"Gjester i Matbutikk",amount:2,icon:"🏪",description:"Ta imot 2 byggjester i Matbutikk",task_deadline:"21:52:00"},
    {id:2,category:"Produksjon",name:"Kake med røde bær",amount:3,icon:"🎂",task_deadline:"21:52:00"},{id:3,category:"Innhøsting",name:"Soyabønner",amount:47,icon:"🫛",task_deadline:"21:52:00"},
    {id:4,category:"Besøkende i byen",name:"Innbygger",amount:1,icon:"🧑‍🌾",task_deadline:"21:52:00"},{id:5,category:"Innhøsting",name:"Gulrøtter",amount:53,icon:"🥕",task_deadline:"21:53:00"},
    {id:6,category:"Dyreoppgave",name:"Bacon",amount:11,icon:"🥓",task_deadline:"21:53:00"},{id:7,category:"Produksjon",name:"Gulrotkake",amount:3,icon:"🍰",task_deadline:"21:53:00"},
    {id:8,category:"Produksjon",name:"Eplejuice",amount:2,icon:"🧃",task_deadline:"21:53:00"},{id:9,category:"Dyreoppgave",name:"Egg",amount:16,icon:"🥚",task_deadline:"21:54:00"},
    {id:10,category:"Produksjon",name:"Frutti di Mare-pizza",amount:5,icon:"🍕",task_deadline:"21:54:00"},{id:11,category:"Innhøsting",name:"Gresskar",amount:38,icon:"🎃",task_deadline:"21:55:00"},{id:12,category:"Innhøsting",name:"Hvete",amount:77,icon:"🌾",task_deadline:"21:54:00"}
  ];
  let bunnyData={library:[],board:null,boardTasks:[],statuses:[]};
  function bunnyHeat(n){
    if(n===0)return 0;
    if(n<=2)return 1;
    if(n<=4)return 2;
    if(n<=6)return 3;
    if(n<=8)return 4;
    return 5;
  }
  function bunnyPopularity(n){
    if(n===0)return "Ingen interesse";
    if(n<=2)return "Lav interesse";
    if(n<=4)return "Noe interesse";
    if(n<=6)return "Populær";
    if(n<=8)return "Svært populær";
    return "Høy konkurranse";
  }
  function bunnyOsloParts(){
    const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Oslo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
    const o={};parts.forEach(p=>{if(p.type!=="literal")o[p.type]=p.value;});
    return {y:+o.year,mo:+o.month,d:+o.day,h:+o.hour,mi:+o.minute,s:+o.second};
  }
  function bunnyDeadlineInfo(){
    const p=bunnyOsloParts();
    const now=Date.UTC(p.y,p.mo-1,p.d,p.h,p.mi,p.s);
    let deadline=Date.UTC(p.y,p.mo-1,p.d,9,59,0);
    if(p.h>=10)deadline+=86400000;
    const ms=deadline-now,total=Math.max(0,Math.floor(ms/60000));
    return {ms,text:ms<=0?"Tidsfrist utløpt":`${Math.floor(total/60)} t ${String(total%60).padStart(2,"0")} min igjen`};
  }
  function bunnyIsStale(){if(!bunnyData.board?.published_at)return true;const now=new Date(),cut=new Date(now);cut.setHours(10,0,0,0);if(now<cut)cut.setDate(cut.getDate()-1);return new Date(bunnyData.board.published_at)<cut;}
  async function loadBunny(){try{bunnyData=await backend.getBunnyData();if(!bunnyData.library?.length && backend.mode==="local"){bunnyData.library=BUNNY_DEFAULT_TASKS;bunnyData.board={id:1,published_at:new Date().toISOString(),active:true};bunnyData.boardTasks=BUNNY_DEFAULT_TASKS.map(x=>({task_id:x.id}));localStorage.setItem("wgang_bunny_v018",JSON.stringify(bunnyData));}}catch(e){console.warn("Chill Bunny data unavailable",e);bunnyData={library:[],board:null,boardTasks:[],statuses:[]};}renderBunny();}
  function renderBunny(){
    const grid=$("bunnyTaskGrid");if(!grid)return;const ids=new Set((bunnyData.boardTasks||[]).map(x=>String(x.task_id)));const tasks=(bunnyData.library||[]).filter(t=>ids.has(String(t.id)));const uid=current()?.id;
    const mine=(bunnyData.statuses||[]).filter(x=>String(x.user_id)===String(uid));const ready=mine.filter(x=>x.status==="ready");
    $("bunnyReadyCount").textContent=`${ready.length} / 5`;$("bunnyPlanCount").textContent=`${ready.length} klare`;$("bunnyBoardMeta").textContent=`${tasks.length} tilgjengelige oppgaver`;
    const notice=$("bunnyBoardNotice");const dl=bunnyDeadlineInfo();
    if(!bunnyData.board){notice.className="bunny-board-notice stale";notice.textContent="⚠️ Dagens oppgavetavle er ikke publisert ennå.";}
    else if(bunnyIsStale()){notice.className="bunny-board-notice stale";notice.textContent="⚠️ Oppgavene i spillet er byttet kl. 10:00. Tavlen i portalen er ikke bekreftet oppdatert ennå.";}
    else{notice.className="bunny-board-notice";notice.innerHTML=`✓ Tavlen er oppdatert ${new Date(bunnyData.board.published_at).toLocaleString("nb-NO",{hour:"2-digit",minute:"2-digit"})}. <strong>Må være utført innen 09:59</strong> · ⏱ ${esc(dl.text)}`;}
    grid.innerHTML=tasks.length?tasks.map(t=>{const sts=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(t.id)&&["ready","preparing"].includes(x.status));const n=sts.length;const my=mine.find(x=>String(x.task_id)===String(t.id))?.status||"";const descriptions={"Gjester i Matbutikk":"Ta imot 2 gjester i Matbutikk","Kake med røde bær":"Produser 3 × Kake med røde bær","Soyabønner":"Høst inn fra 47 soyabønneåkrer","Innbygger":"Betjen 1 × Innbygger","Gulrøtter":"Høst inn fra 53 gulrotåkrer","Bacon":"Samle 11 bacon","Gulrotkake":"Produser og samle inn 3 × Gulrotkake","Eplejuice":"Produser og samle inn 2 × Eplejuice","Egg":"Samle 16 egg","Frutti di Mare-pizza":"Produser og samle inn 5 × Frutti di Mare-pizza","Gresskar":"Høst inn fra 38 gresskaråkrer","Hvete":"Høst inn fra hveteåkrer: 77"};const images={"Gjester i Matbutikk":"01-gjester-i-matbutikk.png","Kake med røde bær":"02-kake-med-rode-baer.png","Soyabønner":"03-soyabonner.png","Innbygger":"04-innbygger.png","Gulrøtter":"05-gulrotter.png","Bacon":"06-bacon.png","Gulrotkake":"07-gulrotkake.png","Eplejuice":"08-eplejuice.png","Egg":"09-egg.png","Frutti di Mare-pizza":"10-frutti-di-mare-pizza.png","Gresskar":"11-gresskar.png","Hvete":"12-hvete.png"};const desc=descriptions[t.name]||t.description||"";const img=images[t.name];return `<article class="bunny-task-card bunny-game-card"><div class="bunny-task-main"><div class="bunny-task-type">${esc(t.category)}</div><div class="bunny-task-visual">${img?`<img class="bunny-task-image" src="${img}" alt="${esc(t.name)}">`:`<div class="bunny-task-icon">${esc(t.icon||"🐰")}</div>`}<div class="amount">× ${t.amount}</div></div><h3>${esc(t.name)}</h3>${desc?`<p class="bunny-task-description">${esc(desc)}</p>`:""}</div><div class="bunny-popularity"><div><strong>${n} valgt</strong><small>${bunnyPopularity(n)}</small></div><span class="heat heat-${bunnyHeat(n)}">${n}</span></div><div class="bunny-actions"><button class="bunny-ready ${my==="ready"?"selected":""}" data-bunny-status="ready" data-task-id="${t.id}">✓ Jeg har den klar</button><button class="bunny-prep ${my==="preparing"?"selected":""}" data-bunny-status="preparing" data-task-id="${t.id}">○ Jeg klargjør den</button><button class="bunny-skip" data-bunny-status="skip" data-task-id="${t.id}">× Ikke aktuell</button></div></article>`}).join(""):`<p class="empty-state">Ingen aktiv Chill Bunny-tavle er publisert.</p>`;
    grid.querySelectorAll("[data-bunny-status]").forEach(b=>b.onclick=async()=>{if(!bunnyData.board)return;try{await backend.setBunnyStatus(bunnyData.board.id,b.dataset.taskId,b.dataset.bunnyStatus);await loadBunny();}catch(e){alert(humanError(e));}});
    const plan=$("bunnyMyPlan");plan.innerHTML=ready.length?ready.sort((a,b)=>{const ca=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(a.task_id)&&["ready","preparing"].includes(x.status)).length,cb=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(b.task_id)&&["ready","preparing"].includes(x.status)).length;return cb-ca}).map(x=>{const t=(bunnyData.library||[]).find(z=>String(z.id)===String(x.task_id));return t?`<span class="bunny-plan-chip">${esc(t.icon)} ${esc(t.name)} ×${t.amount}</span>`:""}).join(""):`<span class="helper-text">Ingen oppgaver markert som klare ennå.</span>`;
    renderBunnyAdmin();
  }
  function bunnyNorm(v){
    return String(v||"").trim().toLocaleLowerCase("nb-NO");
  }
  function renderBunnyAdmin(){
    const box=$("bunnyAdminBoard");
    if(!box||!isLeadership())return;

    const library=(bunnyData.library||[]).filter(t=>t.active!==false);
    const active=new Set((bunnyData.boardTasks||[]).map(x=>String(x.task_id)));

    // Build category choices directly from what is actually stored in Supabase.
    const categories=[...new Set(library.map(t=>String(t.category||"").trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,"nb"));

    if(!library.length){
      box.innerHTML=`<div class="bunny-admin-actions"><strong>0 valgt</strong></div>
        <div class="bunny-library-warning">
          <strong>⚠️ Oppgavebiblioteket kan ikke leses</strong>
          <p>Ingen oppgavemaler ble hentet fra Supabase. Kontroller lesetilgangen (RLS) til bunny_task_library.</p>
        </div>`;
      return;
    }

    box.innerHTML=`<div class="bunny-admin-actions">
        <strong><span id="bunnyAdminSelected">${active.size}</span> valgt</strong>
        <button class="button button-primary" id="publishBunnyBoard">Publiser valgt tavle</button>
      </div>

      <div class="bunny-admin-library">
        ${library.map(t=>`<div class="bunny-admin-choice-wrap">
          <button class="bunny-admin-choice ${active.has(String(t.id))?"selected":""}" data-bunny-pick="${t.id}">
            <span>${esc(t.icon||"🐰")}</span>
            <strong>${esc(t.name)} ×${t.amount}</strong>
            <small>${esc(t.category)}</small>
          </button>
          <button class="bunny-edit-card" data-bunny-edit="${t.id}" title="Rediger oppgavekort">✎</button>
        </div>`).join("")}
      </div>

      <div>
        <h3>Legg til nytt oppgavekort</h3>
        <p class="helper-text">Velg en kjent oppgavemal. Oppgavenavnene hentes direkte fra oppgavebiblioteket.</p>

        <div class="bunny-new-task">
          <select id="newBunnyCategory">
            ${categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("")}
          </select>

          <select id="newBunnyName"></select>

          <input id="newBunnyAmount" type="number" min="1" placeholder="Antall">

          <button class="button button-secondary" id="addBunnyTask">Legg til</button>
          <button class="button button-ghost" id="addBunnyTemplate">+ Nytt oppgavenavn</button>
        </div>

        <p class="helper-text bunny-name-status" id="bunnyNameStatus"></p>
      </div>`;

    box.querySelectorAll("[data-bunny-pick]").forEach(b=>{
      b.onclick=()=>{
        b.classList.toggle("selected");
        $("bunnyAdminSelected").textContent=box.querySelectorAll("[data-bunny-pick].selected").length;
      };
    });

    box.querySelectorAll("[data-bunny-edit]").forEach(b=>b.onclick=async(e)=>{
      e.preventDefault();
      e.stopPropagation();
      const t=library.find(x=>String(x.id)===String(b.dataset.bunnyEdit));
      if(!t)return;
      const name=prompt("Oppgavenavn:",t.name);
      if(name===null)return;
      const amount=prompt("Antall:",t.amount);
      if(amount===null)return;
      if(!name.trim()||!Number(amount))return alert("Kontroller oppgavenavn og antall.");
      try{
        await backend.updateBunnyTask(t.id,{name:name.trim(),amount:Number(amount)});
        await loadBunny();
      }catch(err){
        alert(humanError(err));
      }
    });

    const cat=$("newBunnyCategory");
    const names=$("newBunnyName");
    const status=$("bunnyNameStatus");

    const fillNames=()=>{
      const selected=bunnyNorm(cat?.value);
      const rows=library
        .filter(t=>bunnyNorm(t.category)===selected)
        .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"nb"));

      if(!rows.length){
        names.innerHTML='<option value="">Ingen oppgavemaler i denne kategorien</option>';
        names.disabled=true;
        if(status)status.textContent="Ingen oppgavemaler funnet for valgt kategori.";
        return;
      }

      names.disabled=false;
      names.innerHTML=rows.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
      if(status)status.textContent=`${rows.length} oppgavemal${rows.length===1?"":"er"} tilgjengelig.`;
    };

    if(cat){
      cat.onchange=fillNames;
      fillNames();
    }

    $("publishBunnyBoard").onclick=async()=>{
      const ids=[...box.querySelectorAll("[data-bunny-pick].selected")].map(x=>x.dataset.bunnyPick);
      if(ids.length!==12)return alert(`Dagens Chill Bunny-tavle skal ha 12 oppgaver. Du har valgt ${ids.length}.`);
      try{
        await backend.publishBunnyBoard(ids);
        await loadBunny();
        alert("Dagens Chill Bunny-tavle er publisert.");
      }catch(e){
        alert(humanError(e));
      }
    };

    $("addBunnyTask").onclick=async()=>{
      const template=library.find(t=>String(t.id)===String(names.value));
      const amount=Number($("newBunnyAmount").value);
      if(!template)return alert("Velg et oppgavenavn.");
      if(!amount||amount<1)return alert("Legg inn antall.");

      const duplicate=library.some(t=>
        bunnyNorm(t.category)===bunnyNorm(template.category) &&
        bunnyNorm(t.name)===bunnyNorm(template.name) &&
        Number(t.amount)===amount
      );
      if(duplicate)return alert("Dette oppgavekortet finnes allerede i biblioteket.");

      try{
        await backend.addBunnyTask({
          category:String(template.category||"").trim(),
          name:String(template.name||"").trim(),
          amount,
          icon:template.icon||"🐰",
          description:template.description||template.name,
          template_key:template.template_key||null,
          image_key:template.image_key||null,
          active:true
        });
        await loadBunny();
      }catch(e){
        alert(humanError(e));
      }
    };

    $("addBunnyTemplate").onclick=async()=>{
      const category=prompt("Oppgavetype/kategori:",cat?.value||"");
      if(category===null||!category.trim())return;

      const name=prompt("Nytt oppgavenavn:");
      if(name===null||!name.trim())return;

      const icon=prompt("Midlertidig ikon. Vi kan erstatte det med eget WGANG-bilde/design senere:","🐰");
      if(icon===null)return;

      try{
        await backend.addBunnyTask({
          category:category.trim(),
          name:name.trim(),
          amount:1,
          icon:icon.trim()||"🐰",
          description:name.trim(),
          active:true
        });
        await loadBunny();
        alert("Ny oppgavemal er lagret i biblioteket.");
      }catch(e){
        alert(humanError(e));
      }
    };
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
    const spokenLanguages=[...(account.languages||[])].map(x=>x==="no"?"Norsk":x==="en"?"Engelsk":x);
    if(account.otherLanguages) spokenLanguages.push(...String(account.otherLanguages).split(",").map(x=>x.trim()).filter(Boolean));
    if(spokenLanguages.length) details.push(["Språk", [...new Set(spokenLanguages)].join(", ")]);
    $("memberProfileDetails").innerHTML = details.length ? details.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("") : `<p class="helper-text">Frivillig å fylle ut.</p>`;
    $("profileEditSection").classList.toggle("hidden", !editable);
    if (editable) {
      $("profileBioInput").value = account.bio || "";
      $("profileGenderInput").value = account.gender || "";
      $("profileAgeInput").value = account.ageGroup || "";
      $("profileCountryInput").value = account.countryPlace || "";
      $("profileSinceInput").value = account.hayDaySince || "";
      $("profileFavoriteInput").value = account.favoriteGameAspect || "";
      if($("profileLanguageNo")) $("profileLanguageNo").checked=(account.languages||[]).includes("no");
      if($("profileLanguageEn")) $("profileLanguageEn").checked=(account.languages||[]).includes("en");
      if($("profileLanguageOther")) $("profileLanguageOther").checked=!!account.otherLanguages;
      if($("profileOtherLanguagesInput")) $("profileOtherLanguagesInput").value=account.otherLanguages||"";
      $("profileOtherLanguagesWrap")?.classList.toggle("hidden",!account.otherLanguages);
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

  const translationRequests = new Set();
  function socialData() { return state.social || {likes:[],comments:[],translations:[],activityNotifications:[]}; }
  function targetLikes(type,id) { return socialData().likes.filter(x=>x.target_type===type && String(x.target_id)===String(id)); }
  function targetComments(type,id) { return socialData().comments.filter(x=>x.target_type===type && String(x.target_id)===String(id)); }
  function translationFor(type,id) { return socialData().translations.find(x=>x.target_type===type && String(x.target_id)===String(id) && x.language==="en") || null; }
  function translatedContent(type,item) {
    const original={title:item.title||"",body:item.body||item.message||""};
    if(currentLanguage!=="en") return {...original,translated:false};
    const tr=translationFor(type,item.id);
    return tr ? {title:tr.title||original.title,body:tr.body||original.body,translated:true} : {...original,translated:false};
  }
  function socialBlock(type,item) {
    const likes=targetLikes(type,item.id), comments=targetComments(type,item.id);
    const liked=likes.some(x=>String(x.user_id)===String(current()?.id));
    const commentsHtml=comments.map(cm=>{
      const author=state.accounts.find(a=>String(a.id)===String(cm.user_id));
      const tr=currentLanguage==="en"?translationFor("comment",cm.id):null;
      const canDelete=String(cm.user_id)===String(current()?.id) || (type==="community"&&isAdmin()) || (type==="leadership"&&isOwner());
      return `<div class="social-comment"><div class="social-comment-head"><strong>${esc(author?.name||"WGANG")}</strong><small>${esc(formatDate(cm.created_at))}</small></div><p>${esc(tr?.body||cm.body)}</p>${canDelete?`<button class="text-button" data-delete-comment="${cm.id}">${currentLanguage==="en"?"Delete":"Slett"}</button>`:""}</div>`;
    }).join("");
    return `<div class="social-bar"><button class="social-like ${liked?"active":""}" data-like-type="${type}" data-like-id="${item.id}" data-liked="${liked}">👍🏼 <span>${likes.length}</span></button><button class="social-comment-toggle" data-comment-toggle="${type}:${item.id}">💬 <span>${comments.length}</span></button></div><div class="social-comments hidden" data-comments-for="${type}:${item.id}"><div class="social-comment-list">${commentsHtml||`<p class="empty-state">${currentLanguage==="en"?"No comments yet.":"Ingen kommentarer ennå."}</p>`}</div><form class="social-comment-form" data-comment-form="${type}:${item.id}"><input maxlength="2000" placeholder="${currentLanguage==="en"?"Write a comment…":"Skriv en kommentar…"}" required><button class="button button-primary button-small" type="submit">${currentLanguage==="en"?"Post":"Publiser"}</button></form></div>`;
  }
  function bindSocialActions(root=document) {
    root.querySelectorAll("[data-like-type]").forEach(btn=>btn.onclick=async()=>{
      try { await backend.toggleLike(btn.dataset.likeType,btn.dataset.likeId,btn.dataset.liked==="true"); await refreshState(); } catch(e) { alert(humanError(e)); }
    });
    root.querySelectorAll("[data-comment-toggle]").forEach(btn=>btn.onclick=()=>root.querySelector(`[data-comments-for="${btn.dataset.commentToggle}"]`)?.classList.toggle("hidden"));
    root.querySelectorAll("[data-comment-form]").forEach(form=>form.onsubmit=async e=>{
      e.preventDefault(); const [type,id]=form.dataset.commentForm.split(":"); const input=form.querySelector("input"); if(!input.value.trim()) return;
      try { await backend.addComment(type,id,input.value.trim()); input.value=""; await refreshState(); } catch(err) { alert(humanError(err)); }
    });
    root.querySelectorAll("[data-delete-comment]").forEach(btn=>btn.onclick=async()=>{
      if(!confirm(currentLanguage==="en"?"Delete this comment?":"Slette denne kommentaren?")) return;
      try { await backend.deleteComment(btn.dataset.deleteComment); await refreshState(); } catch(err) { alert(humanError(err)); }
    });
  }
  async function ensureEnglishTranslation(type,item) {
    if(currentLanguage!=="en" || !item?.id || translationFor(type,item.id)) return;
    const key=`${type}:${item.id}`; if(translationRequests.has(key)) return;
    translationRequests.add(key);
    try { await backend.requestTranslation(type,item.id,item.title||"",item.body||item.message||""); await refreshState(); }
    catch(e) { console.warn("Translation unavailable",e); }
    finally { translationRequests.delete(key); }
  }
  function queueVisibleTranslations() {
    if(currentLanguage!=="en") return;
    const content=state.content||{};
    [...(content.announcements||[]),...(content.derbyPosts||[]),...(content.tips||[])].forEach(x=>ensureEnglishTranslation("community",x));
    if(isLeadership()) (state.leadershipMessages||[]).forEach(x=>ensureEnglishTranslation("leadership",x));
    (socialData().comments||[]).forEach(x=>ensureEnglishTranslation("comment",x));
  }

  function postCard(item, options={}) {
    const category = item.category ? `<span class="content-category">${esc(tText(item.category))}</span>` : "";
    const actions = options.admin ? `<div class="content-actions"><button class="table-action" data-delete-content="${item.id}">${currentLanguage==="en"?"Delete":"Slett"}</button></div>` : "";
    const view=translatedContent("community",item);
    return `<article class="content-post"><h3>${esc(view.title)}</h3>${category}<p>${esc(view.body).replace(/\n/g,"<br>")}</p><footer><span>${esc(item.authorName || "WGANG")}</span><time>${esc(formatDate(item.publishedAt || item.createdAt))}</time>${actions}</footer>${socialBlock("community",item)}</article>`;
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
      if (!isAdmin() || !confirm(currentLanguage==="en"?"Delete this content?":"Slette dette innholdet?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteContent(b.dataset.deleteContent); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    bindSocialActions(document);
  }

  function renderLeadershipChat() {
    const list = $("leadershipMessageList");
    if (!list) return;
    if (!hasPermission("chat.leadership.view")) { list.innerHTML = ""; return; }
    const messages = state.leadershipMessages || [];
    const readRow=(state.chatReadState||[]).find(x=>x.channel==="leadership");
    const lastReadAt=readRow?.last_read_at||"1970-01-01";
    const firstUnreadIndex=messages.findIndex(m=>m.userId!==current()?.id && newerThan(m.createdAt,lastReadAt));
    list.innerHTML = messages.length ? messages.map((m,i) => {
      const own = m.userId === current()?.id;
      const canDelete = own || hasPermission("chat.moderate");
      const view=translatedContent("leadership",m); const unreadMark=i===firstUnreadIndex?`<div class="chat-unread-divider" id="leadershipUnreadStart">Nye innlegg</div>`:""; return `${unreadMark}<article class="leadership-message ${own ? "own" : ""}"><div class="leadership-message-head"><strong>${esc(m.authorName)}</strong><small>${esc(formatDate(m.createdAt))}</small></div><p>${esc(view.body)}</p>${canDelete ? `<div class="leadership-message-tools"><button class="text-button" data-leadership-delete="${m.id}">${currentLanguage==="en"?"Delete":"Slett"}</button></div>` : ""}${socialBlock("leadership",m)}</article>`;
    }).join("") : `<p class="empty-state">Ingen meldinger ennå. Start planleggingen her.</p>`;
    if(firstUnreadIndex>=0){
      const newerCount=messages.length-firstUnreadIndex;
      if(newerCount>1){
        const jump=document.createElement("button");jump.type="button";jump.className="chat-newer-indicator";jump.textContent=`↓ ${newerCount-1} nyere innlegg`;jump.onclick=()=>list.lastElementChild?.scrollIntoView({behavior:"smooth",block:"end"});list.appendChild(jump);
      }
      setTimeout(()=>document.getElementById("leadershipUnreadStart")?.scrollIntoView({behavior:"smooth",block:"center"}),120);
      const latest=messages[messages.length-1];
      setTimeout(async()=>{try{await backend.markChatRead("leadership",latest?.id,latest?.createdAt||new Date().toISOString());state.chatReadState=state.chatReadState||[];const r=state.chatReadState.find(x=>x.channel==="leadership");if(r){r.last_read_at=latest?.createdAt;r.last_message_id=latest?.id;}else state.chatReadState.push({channel:"leadership",last_read_at:latest?.createdAt,last_message_id:latest?.id});renderNotifications();}catch(e){console.warn(e);}},1500);
    }
    translateUi(list);
    $$('[data-leadership-delete]').forEach(button => button.onclick = async () => {
      if (!confirm(currentLanguage === "en" ? "Delete this message?" : "Slette denne meldingen?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteLeadershipMessage(button.dataset.leadershipDelete); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    bindSocialActions(list);
  }

  function renderAdmin() {
    if (!hasPermission("members.view") && !hasPermission("members.approve") && !hasPermission("permissions.view")) return;
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
      if(!hasPermission("members.approve"))return alert("Du har ikke rettighet til å godkjenne medlemmer.");
      if (busy) return; setBusy(true);
      try { await backend.approve(b.dataset.approve); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    $$('[data-reject]').forEach(b => b.onclick = async () => {
      if(!hasPermission("members.reject"))return alert("Du har ikke rettighet til å avslå medlemsforespørsler.");
      if (busy) return; setBusy(true);
      try { await backend.setMemberStatus(b.dataset.reject,"rejected"); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    $$('[data-remove]').forEach(b => b.onclick = async () => {
      if(!hasPermission("members.remove"))return alert("Du har ikke rettighet til å fjerne medlemmer.");
      if (!confirm("Fjerne medlemmet fra portalen? Kontoen deaktiveres, men historikk beholdes.")) return;
      if (busy) return; setBusy(true);
      try { await backend.setMemberStatus(b.dataset.remove,"removed"); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    renderPermissionMatrix();
    $$('[data-role-id]').forEach(select => select.onchange = async () => {
      if(!hasPermission("members.change_role"))return alert("Du har ikke rettighet til å endre roller.");
      if (busy) return; setBusy(true);
      try { await backend.setRole(select.dataset.roleId, select.value); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
  }


  let permissionEditMode=false;
  function renderPermissionMatrix(){
    const body=$("permissionMatrixBody"), audit=$("permissionAudit");
    if(!body)return;
    if(!hasPermission("permissions.view")){body.innerHTML="";return;}
    let currentGroup="";
    body.innerHTML=PERMISSION_DEFINITIONS.map(p=>{
      const groupRow=p.group!==currentGroup ? (currentGroup=p.group,`<tr class="permission-group-row"><th colspan="5">${esc(p.group)}</th></tr>`) : "";
      const cell=(role)=>{
        const enabled=role==="owner"?true:hasPermission(p.key,{role});
        if(role==="owner")return `<td><span class="permission-lock">✓ 🔒</span></td>`;
        if(permissionEditMode&&isOwner()){
          return `<td><label class="permission-switch"><input type="checkbox" data-permission-role="${role}" data-permission-key="${p.key}" ${enabled?"checked":""}><span>${enabled?"✓":"–"}</span></label></td>`;
        }
        return `<td><strong class="${enabled?"permission-yes":"permission-no"}">${enabled?"✓":"–"}</strong></td>`;
      };
      return groupRow+`<tr><td>${esc(p.label)}</td>${cell("owner")}${cell("admin")}${cell("assistant_leader")}${cell("member")}</tr>`;
    }).join("");

    body.querySelectorAll("[data-permission-key]").forEach(input=>input.onchange=async()=>{
      if(!isOwner())return;
      try{
        await backend.saveRolePermission(input.dataset.permissionRole,input.dataset.permissionKey,input.checked);
        await refreshState();
        permissionEditMode=true;
        renderPermissionMatrix();
      }catch(e){alert(humanError(e));input.checked=!input.checked;}
    });

    if(audit){
      const rows=state.permissions?.audit||[];
      audit.innerHTML=hasPermission("history.permission_audit")&&rows.length
        ? `<h3>Siste rettighetsendringer</h3>${rows.slice(0,10).map(r=>{
            const actor=state.accounts.find(a=>String(a.id)===String(r.changed_by));
            const def=PERMISSION_DEFINITIONS.find(x=>x.key===r.permission_key);
            return `<div class="permission-audit-row"><strong>${esc(roleLabel(r.role))}: ${esc(def?.label||r.permission_key)}</strong><span>${r.old_value===null?"Standard":(r.old_value?"På":"Av")} → ${r.new_value?"På":"Av"} · ${esc(actor?.name||"Eier")} · ${esc(formatDate(r.changed_at))}</span></div>`;
          }).join("")}`
        : "";
    }
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
    const pendingMembers = hasPermission("members.approve") ? state.accounts.filter(a=>a.status==="pending").length : 0;
    const pendingTips = hasPermission("content.pending.view") ? (state.content?.pendingTips?.length || 0) : 0;
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
  if ($("closePortal")) $("closePortal").onclick = logout;
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
      in_app_derby_published:!!$("notifyImportantDerby")?.checked,
      in_app_derby_deadline_reminders:!!$("notifyImportantDerby")?.checked,
      email_enabled:!!$("emailNotificationsEnabled")?.checked
    };
    try{
      const saved=await backend.saveNotificationPreferences(payload);
      state.notifications=state.notifications||{};
      state.notifications.preferences=saved;
      $("notificationSettingsStatus").textContent=currentLanguage==="en"?"Notification settings saved.":"Varslingsinnstillingene er lagret.";
      renderNotifications();
    }catch(e){
      $("notificationSettingsStatus").textContent=humanError(e);
    }finally{
      setBusy(false);
      document.body.classList.remove("modal-open");
    }
  };
  function accountGameNameValue(user){
    return user?.gameName || user?.game_name || user?.displayName || user?.display_name || user?.name || (user?.role==="owner" ? "TJENTA" : "–");
  }
  function accountEmailValue(user){
    return user?.email || user?.authEmail || user?.auth_email || backend?.session?.user?.email || backend?.user?.email || "–";
  }
  function accountMemberSinceValue(user){
    const raw=user?.approvedAt || user?.approved_at || user?.memberSince || user?.member_since || user?.createdAt || user?.created_at;
    if(!raw) return "–";
    const d=new Date(raw); if(Number.isNaN(d.getTime())) return "–";
    return new Intl.DateTimeFormat(currentLanguage==="en"?"en-GB":"nb-NO",{day:"numeric",month:"long",year:"numeric"}).format(d);
  }
  function showProfileHubSection(section="menu") {
    ["profileHubMenu","profileHubNotifications","profileHubSettings","profileHubProfile","profileHubAccount"].forEach(id=>{
      const el=$(id);
      if(el){ el.classList.add("hidden"); el.setAttribute("aria-hidden","true"); }
    });
    const map={menu:"profileHubMenu",notifications:"profileHubNotifications",settings:"profileHubSettings",profile:"profileHubProfile",account:"profileHubAccount"};
    const active=$(map[section]||map.menu);
    if(active){ active.classList.remove("hidden"); active.setAttribute("aria-hidden","false"); }
    if(section==="settings"){
      const settings=$("notificationSettings"), mount=$("profileHubSettingsMount");
      if(settings&&mount&&!mount.contains(settings)) mount.appendChild(settings);
      renderNotificationSettings();
    }
    if(section==="account"){
      const u=current();
      if($("accountGameName")) $("accountGameName").textContent=accountGameNameValue(u);
      if($("accountEmail")) $("accountEmail").textContent=accountEmailValue(u);
      if($("accountRole")) $("accountRole").textContent=roleLabel(u?.role);
      if($("accountMemberSince")) $("accountMemberSince").textContent=accountMemberSinceValue(u);
    }
    if(section==="notifications") renderNotifications();
  }
  document.querySelectorAll("[data-profile-section]").forEach(btn=>btn.onclick=()=>showProfileHubSection(btn.dataset.profileSection));
  document.querySelectorAll(".profile-hub-back").forEach(btn=>btn.onclick=()=>showProfileHubSection("menu"));
  if($("closeProfileHub")) $("closeProfileHub").onclick=()=>$("memberProfileDialog")?.close();
  if($("profileHubLogout")) $("profileHubLogout").onclick=async()=>{
    $("memberProfileDialog")?.close();
    await logout();
  };
  if($("profileLanguageOther")) $("profileLanguageOther").onchange=()=>$("profileOtherLanguagesWrap")?.classList.toggle("hidden",!$("profileLanguageOther").checked);
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
      favoriteGameAspect: $("profileFavoriteInput").value.trim(),
      languages:[$("profileLanguageNo")?.checked?"no":null,$("profileLanguageEn")?.checked?"en":null].filter(Boolean),
      otherLanguages:$("profileLanguageOther")?.checked ? $("profileOtherLanguagesInput")?.value.trim()||"" : ""
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


/* v0.18.0.11 Chill Bunny planner */
function wgangInitBunnyPlanner(){
  if(document.getElementById("wgangBunnyPlanner")) return;
  const headings=[...document.querySelectorAll("h1,h2,h3,h4")];
  const mine=headings.find(h=>(h.textContent||"").trim().toLowerCase().includes("mine klargjorte oppgaver"));
  if(!mine)return;

  const panel=document.createElement("section");
  panel.id="wgangBunnyPlanner";
  panel.className="bunny-planner-panel";
  panel.innerHTML=`
    <div class="bunny-planner-head">
      <div><span class="bunny-planner-kicker">🐰 Harepusstatus</span><h3>Chill Bunny</h3></div>
      <strong>30 / 90</strong>
    </div>
    <div class="bunny-rounds">
      <div class="bunny-round done"><strong>Harepus 1</strong><span>30 / 30 ✓</span></div>
      <div class="bunny-round"><strong>Harepus 2</strong><span>0 / 30</span></div>
      <div class="bunny-round"><strong>Harepus 3</strong><span>0 / 30</span></div>
    </div>
    <div class="bunny-advice bunny-advice-go">
      <strong>✓ Første harepus er fanget</strong>
      <span>Har du daglige oppgaver igjen, kan du gjøre dem når det passer. Du trenger ikke vente på harepustid nå.</span>
    </div>
    <div class="bunny-next-attendance">
      <strong>Kan du delta på neste harepus?</strong>
      <div class="bunny-attendance-buttons">
        <button type="button" data-bunny-attendance="yes">🟢 Ja</button>
        <button type="button" data-bunny-attendance="maybe">🟡 Usikker</button>
        <button type="button" data-bunny-attendance="no">🔴 Kan ikke</button>
      </div>
      <small>Registrer om du kan delta, slik at nabolaget ser om det trengs ekstra innsats.</small>
    </div>
    <button type="button" class="button button-secondary bunny-done-today" id="bunnyDoneToday">✓ Jeg er ferdig for i dag</button>`;
  mine.parentNode.insertBefore(panel,mine);

  // Derby day follows 10:00–09:59 Europe/Oslo.
  const now=new Date();
  const oslo=new Date(now.toLocaleString("en-US",{timeZone:"Europe/Oslo"}));
  if(oslo.getHours()<10) oslo.setDate(oslo.getDate()-1);
  const day=`${oslo.getFullYear()}-${String(oslo.getMonth()+1).padStart(2,"0")}-${String(oslo.getDate()).padStart(2,"0")}`;

  const doneKey=`wgang-bunny-done-${day}`, doneBtn=document.getElementById("bunnyDoneToday");
  function paintDone(){
    const done=localStorage.getItem(doneKey)==="1";
    doneBtn.classList.toggle("is-done",done);
    doneBtn.textContent=done?"✓ Ferdig for i dag – trykk for å angre":"✓ Jeg er ferdig for i dag";
  }
  doneBtn.onclick=()=>{localStorage.setItem(doneKey,localStorage.getItem(doneKey)==="1"?"0":"1");paintDone();};
  paintDone();

  const attKey="wgang-bunny-next-attendance";
  const btns=[...panel.querySelectorAll("[data-bunny-attendance]")];
  function paintAtt(){const v=localStorage.getItem(attKey)||"";btns.forEach(b=>b.classList.toggle("selected",b.dataset.bunnyAttendance===v));}
  btns.forEach(b=>b.onclick=()=>{localStorage.setItem(attKey,b.dataset.bunnyAttendance);paintAtt();});
  paintAtt();
}
document.addEventListener("click",()=>setTimeout(wgangInitBunnyPlanner,50));
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(wgangInitBunnyPlanner,100));
else setTimeout(wgangInitBunnyPlanner,100);

document.addEventListener("click",e=>{
  const btn=e.target.closest?.("#togglePermissionEdit");
  if(!btn)return;
  if(!isOwner())return;
  permissionEditMode=!permissionEditMode;
  btn.textContent=permissionEditMode?"Ferdig":"Rediger rettigheter";
  renderPermissionMatrix();
});
