/* v0.18.0.61 – Power Derby-oppgaver */
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
  const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };

  const LANG_KEY = "wgangLanguage";
  let currentLanguage = localStorage.getItem(LANG_KEY) || "no";
  const I18N_EN = {
    "Oversikt":"Overview","Derby":"Derby","Medlemmer":"Members","Oppgaver":"Tasks","Diskusjoner":"Discussions","Wiki":"Wiki","Admin":"Admin",
    "Logg inn":"Log in","Søk medlemskap":"Apply for membership","Logg ut":"Log out","Adminvisning":"Admin","Til behandling":"To review","Derbyadministrasjon":"Derby administration","Medlemssøknader":"Membership applications","Oppslagstavla":"Task board","Medlemmer og roller":"Members and roles",
    "Her er det viktigste for neste derby.":"Here is the most important information for the next derby.",
    "NESTE DERBY":"NEXT DERBY","Deltar":"Participating","Tar pause":"Taking a break","Usikker":"Unsure","Mangler svar":"No response",
    "Din status":"Your status","Svarfrist":"Response deadline","Har svart":"Responded","Neste derby":"Next derby",
    "Åpne derby-senter":"Open Derby Center","Under utvikling":"Under development","Medlem":"Member","Senior":"Senior","Ass. leder":"Assistant leader","Administrator":"Administrator","Eier":"Owner",
    "Derby-senter":"Derby Center","Planlegg deltakelsen og følg fremdriften.":"Plan your participation and follow progress.",
    "Medlemsoversikt":"Member overview","Finn naboene dine og se derby-status.":"Find your neighbors and see their Derby status.",
    "Oppgavepreferanser":"Task preferences","Velg hva som passer deg best.":"Choose what suits you best.",
    "NORMAL DERBY":"NORMAL DERBY","POWER DERBY":"POWER DERBY",
    "Oppgavepreferansene hjelper lederne å velge hva som bør beholdes eller slettes.":"Task preferences help leaders decide what should remain on or be removed from the board.",
    "Marker hvilke oppgaver som passer deg. Lederne bruker oversikten til å vurdere hva som bør beholdes eller slettes fra tavla.":"Mark which tasks suit you. Leaders use the overview to decide what should remain on or be removed from the board.",
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
    "Aldersgruppe":"Age group","Land":"Country","Personvern":"Privacy","Bruksregler":"Rules","Personvern og data":"Privacy and data",
    "Hvor lenge har du spilt Hay Day?":"How long have you played Hay Day?","Hva liker du best i spillet?":"What do you like most about the game?",
    "Frivillig å fylle ut.":"Optional to fill in.","Ingen profilinformasjon er delt ennå.":"No profile information has been shared yet.",
    "Norsk":"Norwegian","Engelsk":"English",
    "SAMTALER":"CONVERSATIONS","Viktige beskjeder og derbyprat samlet på ett sted.":"Important messages and Derby talk in one place.",
    "Prat om ukens derby":"Talk about this week's Derby","Del strategi, spørsmål og koordinering med nabolaget.":"Share strategy, questions and coordination with the Neighborhood.",
    "Nytt innlegg":"New post","Ny kunngjøring":"New announcement","Publiser kunngjøring":"Publish announcement","Publiser innlegg":"Publish post",
    "KUNNSKAP":"KNOWLEDGE","WGANG Tips & triks":"WGANG Tips & Tricks","Det vi allerede vet fungerer godt – samlet på ett sted og bygget videre sammen med nabolaget.":"What we already know works well – gathered in one place and developed together with the Neighborhood.",
    "WGANGS GRUNNSTRATEGI":"WGANG'S CORE STRATEGY","320 poeng – og en tavle som holdes i bevegelse":"320 points – and a task board that keeps moving",
    "LEDELSE":"LEADERSHIP","Lederprat":"Leadership Chat","Et lukket rom for Ass. leder, Senior, Administrator og Eier.":"A private space for Assistant Leaders, Seniors, Administrators and the Owner.",
    "STRATEGIROM":"STRATEGY ROOM","Planlegg derbyet sammen":"Plan the Derby together","Meldingene her er kun synlige for WGANG-ledelsen.":"Messages here are visible only to WGANG leadership.",
    "Ny melding":"New message","Send melding":"Send message","Skriv en melding til ledelsen …":"Write a message to the leadership …",
    "Starter tirsdag kl. 10:00":"Starts Tuesday at 10:00","Mandag kl. 23:00":"Monday at 23:00","Svar gjerne innen mandag kl. 23:00.":"Please respond by Monday at 23:00.",
    "Jeg deltar":"I'm participating","Jeg gjør mitt beste":"I'll do my best","Krever regelbekreftelse":"Rule confirmation required","Jeg tar pause":"I'm taking a break","Ikke med denne uken":"Not participating this week","Jeg er usikker":"I'm unsure","Avklarer før fristen":"I'll decide before the deadline",
    "Velg status for uken":"Choose your status for the week","Velg status for neste derby.":"Choose your status for the next Derby.",
    "Før du velger «Jeg deltar»":"Before choosing ‘I'm participating’","Deltakelse er frivillig. Når du melder deg på, bekrefter du reglene før svaret lagres.":"Participation is voluntary. When you sign up, you confirm the rules before your response is saved.","på hver oppgave":"on every task","minimum av mulig makspoeng":"minimum of the maximum possible score","0 tapte oppgaver":"0 lost tasks","ingen sletting eller tidsutløp":"no deletion or expiry",
    "BEKREFT DELTAKELSE":"CONFIRM PARTICIPATION","Du melder deg på neste derby":"You are signing up for the next Derby","Les hvert punkt før du bekrefter.":"Read each item before confirming.","Mål 100 %":"Goal 100%","Minimum 80 %":"Minimum 80%","Dette bekrefter du:":"You confirm the following:","Jeg velger bare oppgaver med derbyets makspoeng.":"I only choose tasks worth the Derby's maximum points.","Jeg kontrollerer oppgavens tidsfrist før jeg velger den, og fullfører oppgaven innen fristen.":"I check the task's time limit before choosing it and complete the task before it expires.","Jeg sletter eller avbryter ikke en oppgave etter at jeg har valgt den, og lar den ikke gå ut på tid.":"I do not delete or abandon a task after choosing it, and I do not let it expire.","Jeg kjenner WGANGs mål og minimumskrav for dette derbyet.":"I understand WGANG's goal and minimum requirement for this Derby.","En slettet, avbrutt eller utløpt oppgave gir 0 poeng og bruker én av oppgavene du har tilgjengelig.":"A deleted, abandoned or expired task gives 0 points and uses one of your available tasks.","Avbryt":"Cancel","Bekreft at jeg deltar":"Confirm my participation",
    "Regler":"Rules","WGANG-strategi":"WGANG strategy","Oppgaver":"Tasks","Maks poeng":"Max points","Status":"Status",
    "Publiser kun dette derbyet":"Publish this Derby only","Lagre som standard":"Save as default","Velg grunnmal":"Choose template","Velg derbytype":"Choose Derby type",
    "Navn på derby":"Derby name","Start":"Start","Slutt":"End","Ordinære oppgaver":"Regular tasks","Ekstraoppgaver":"Extra tasks","Maks poeng per oppgave":"Max points per task","Daglig oppgavegrense":"Daily task limit","Kort beskrivelse":"Short description",
    "VÅR DERBYREGEL":"OUR DERBY RULE","Når du deltar, gjør du ditt beste.":"When you participate, you do your best.","Minimumskravet er 80 % av mulig makspoeng. Målet er at alle henter 100 %.":"The minimum requirement is 80% of the maximum possible score. Our goal is for everyone to reach 100%.",
    "DITT MÅL I DETTE DERBYET":"YOUR GOAL IN THIS DERBY","Maksimalt mulig resultat":"Maximum possible result","Inkluderte oppgaver":"Included tasks","Maks per oppgave":"Maximum per task","Maks uten ekstra":"Maximum without extra","Maks med ekstra":"Maximum with extra","Målet er 100 %. WGANGs minimum er 80 % av mulig makspoeng.":"The goal is 100%. WGANG's minimum is 80% of the maximum possible score.",
    "VIKTIG FØR DU VELGER OPPGAVE":"IMPORTANT BEFORE CHOOSING A TASK","Kontroller oppgaven og tidsfristen":"Check the task and its time limit","Velg bare oppgaver du kan fullføre innen oppgavens egen tidsfrist.":"Only choose tasks you can complete within the task's own time limit.","Ikke la en valgt oppgave gå ut på tid.":"Do not let a selected task expire.","Ikke slett eller avbryt en oppgave etter at den er valgt.":"Do not delete or abandon a task after selecting it.","Gi beskjed til en leder så tidlig som mulig dersom det oppstår problemer.":"Tell a leader as early as possible if a problem occurs.","En tapt oppgave gir 0 poeng og bruker én av oppgavene du har tilgjengelig.":"A lost task gives 0 points and uses one of your available tasks."
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
    "Lederprat":"Leadership Chat","Lukket chat for Ass. leder, Senior, Admin og Eier.":"Private chat for Assistant Leaders, Seniors, Admins and the Owner.",
    "Skriv en melding":"Write a message","Send melding":"Send message","Ingen meldinger ennå.":"No messages yet.",
    "Slett melding":"Delete message","Rediger melding":"Edit message",
    "Påmeldt":"Participating","Pause":"Taking a break","Venter":"Waiting","Ikke svart":"No response",
    "Pågående derby":"Current Derby","Forrige derby":"Previous Derby","Publisert":"Published","Aktiv":"Active","Avsluttet":"Completed","Kladd":"Draft",
    "Sist oppdatert av":"Last updated by","Ikke registrert":"Not registered",
    "Oppgaver vi bør beholde":"Tasks we should keep","Populære – ikke slett":"Popular – do not delete","Kan beholdes":"Can be kept","Lav interesse":"Low interest",
    "Søk":"Search","Alle":"All","Velg medlem":"Choose member","Velg oppgave":"Choose task","Velg preferanse":"Choose preference",
    "Ingen tips ennå.":"No tips yet.","Venter på godkjenning":"Awaiting approval","Godkjent":"Approved",
    "Velkommen til WGANG Portal":"Welcome to WGANG Portal","Logg inn for å få tilgang til nabolagets medlemsportal.":"Log in to access the Neighborhood member portal.",
    "Varsler":"Notifications","NYTT SIDEN SIST":"NEW SINCE LAST VISIT","Du har nye varsler":"You have new notifications","Varslingsinnstillinger":"Notification settings","Nye kunngjøringer":"New announcements","Nye innlegg i Derbyprat":"New Derby Talk posts","Nye innlegg i Lederprat":"New Leadership Chat messages","Nye medlemssøknader":"New membership applications","Tips som venter på behandling":"Tips awaiting review","Nytt derby publisert":"New Derby published","Påminnelse før svarfrist":"Reminder before response deadline","Lagre varslingsinnstillinger":"Save notification settings",
    "Derbyhistorikk":"Derby history","DERBYHISTORIKK":"DERBY HISTORY","Resultater over tid":"Results over time","Se lagets derbyarkiv, dine egne resultater og utviklingen over flere derby.":"View the team's Derby archive, your own results and development across multiple Derbies.",
    "Mine derby":"My Derbies","registrerte resultater":"registered results","Mitt gjennomsnitt":"My average","ekstra begrenset til 100 %":"extra capped at 100%","resultater":"results","Under 80 %":"Below 80%",
    "DERBYARKIV":"DERBY ARCHIVE","WGANGs sluttresultater":"WGANG final results","Alle godkjente medlemmer kan se derbytype, dato, liga, plassering, totalpoeng og antall deltakere.":"All approved members can view Derby type, date, league, placement, total points and participant count.",
    "MIN HISTORIKK":"MY HISTORY","Mine derbyresultater":"My Derby results","Poengprosenten beregnes mot ordinært makspoeng. Ekstraoppgaver vises separat.":"The score percentage is calculated against the regular maximum. Extra tasks are shown separately.",
    "LEDEROVERSIKT":"LEADERSHIP OVERVIEW","Gjennomsnitt og utvikling":"Average and development","Gjennomsnitt begrenses til 100 %, slik at ekstraoppgaver ikke løfter resultatet kunstig.":"The average is capped at 100%, so extra tasks do not artificially raise the result.",
    "Snitt":"Average","Ikke fullført":"Incomplete","Utvikling":"Development","SLUTTRESULTAT":"FINAL RESULT","Registrer derbyresultat":"Register Derby result","Bruk sluttbildet fra Hay Day. Resultatet lagres samlet, og senere korreksjoner krever begrunnelse.":"Use the final screen from Hay Day. The result is saved as one transaction, and later corrections require a reason.","Registrer eller korriger":"Register or correct",
    "Registrer sluttresultat":"Register final result","Velg det avsluttede derbyet og registrer opplysningene nøyaktig slik de vises i sluttbildet.":"Choose the completed Derby and enter the details exactly as shown on the final screen.","Avsluttet derby":"Completed Derby","Liga":"League","Plassering":"Placement","Lagets totalpoeng":"Team total points","Tapte / slettede oppgaver totalt":"Total lost / deleted tasks","Merknad":"Note","valgfritt":"optional","Relevant forklaring til sluttresultatet":"Relevant explanation for the final result","RESULTAT PER MEDLEM":"RESULT BY MEMBER","Bekreftede deltakere":"Confirmed participants","Begrunnelse for korreksjon":"Reason for correction","obligatorisk og lagres i endringsloggen":"required and saved in the change log","Lagre hele resultatet":"Save complete result"

  };
  const STATIC_EN_EXTRA = {
    "Automatisk livefremdrift under derbyet kommer senere. Sluttresultater og utvikling over tid finner du nå i Derbyhistorikk.":"Automatic live progress during the Derby will be added later. Final results and development over time are now available in Derby History.",
    "Automatisk livefremdrift og scoreboard er ikke koblet til reelle data ennå. Kontrollerte sluttresultater og personlig historikk er tilgjengelig i Derbyhistorikk.":"Automatic live progress and the scoreboard are not connected to real data yet. Verified final results and personal history are available in Derby History.",
    "Publiser neste derby og registrer kontrollerte sluttresultater.":"Publish the next Derby and register verified final results.",
    "Automatisk oppgavefremdrift, poeng og scoreboard er ikke koblet til reelle derbydata ennå. Dette bygges senere på grunnlag av hvordan WGANG faktisk bruker portalen.":"Automatic task progress, points and the scoreboard are not connected to live Derby data yet. This will be developed based on how WGANG actually uses the portal.",
    "oppgaver fullført":"tasks completed","I gang":"In progress","Ferdig":"Completed","Marker som ferdig":"Mark as completed",
    "DELTAR DU?":"ARE YOU PARTICIPATING?","STRATEGI":"STRATEGY","ADMINOVERSIKT":"ADMIN OVERVIEW","Status per medlem":"Status by member","Deltakelse":"Participation",
    "Viktige beskjeder og derbyprat samlet på ett sted.":"Important announcements and Derby Talk gathered in one place.",
    "Prat om ukens derby":"Talk about this week's Derby","Del strategi, spørsmål og koordinering med nabolaget.":"Share strategy, questions and coordination with the Neighborhood.",
    "Et lukket rom for lederne.":"A private space for the leadership team.","Planlegg derbyet sammen":"Plan the Derby together","Meldingene her er kun synlige for WGANG-ledelsen.":"Messages here are visible only to the WGANG leadership team.",
    "Vokser med WGANG":"Growing with WGANG","320 poeng – og en tavle som holdes i bevegelse":"320 points – and a task board that keeps moving",
    "I Normal Derby er hovedregelen enkel: Vi tar oppgaver med 320 poeng. Admin rydder bort oppgaver som få eller ingen ønsker, slik at nye og bedre oppgaver får plass på tavla. Oppgavepreferansene hjelper admin å se hvilke 320-oppgaver som passer nabolaget best.":"In Normal Derby, the main rule is simple: we take 320-point tasks. Admins remove tasks that few or no one wants, making room for new and better tasks on the board. Members' task preferences help admins see which 320-point tasks suit the Neighborhood best.",
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
    "Standard Derby":"Normal Derby","Normal Derby":"Normal Derby","Bingo Derby":"Bingo Derby","Styrke Derby":"Power Derby","Blomsterderby":"Blossom Derby","Harepusderby":"Bunny Derby","Chill Derby":"Chill Derby","Chill Harepus Derby":"Chill Bunny Derby","Mystery Derby":"Mystery Derby",
    "WGANG har som mål å ta oppgaver med 320 poeng.":"WGANG aims to take 320-point tasks.",
    "Admin rydder bort oppgaver nabolaget sjelden ønsker, slik at oppgavetavla holdes i bevegelse.":"Admins remove tasks the Neighborhood rarely wants so the task board keeps moving.",
    "Medlemmenes oppgavepreferanser brukes for å vurdere hvilke oppgaver som bør få stå.":"Members' task preferences are used to decide which tasks should remain on the board.",
    "Alle som melder seg på og skal delta, skal fullføre 5 oppgaver hver dag.":"Everyone who signs up to participate must complete 5 tasks every day.",
    "Det kan gjennomføres 5 ordinære oppgaver per dag.":"You can complete 5 regular tasks per day.",
    "Det kan kjøpes 1 ekstra oppgave per dag.":"You can buy 1 extra task per day.",
    "Hver fullførte oppgave gir 50 poeng.":"Each completed task gives 50 points.",
    "Chill Derby kombineres med Harepus Derby.":"Chill Derby is combined with Bunny Derby.",
    "Klargjør oppgaver på forhånd slik at du kan gjennomføre dem mens harepusen er aktiv. Harepusoppgavene vises som rosa oppgaver.":"Prepare tasks in advance so you can complete them while the Bunny is active. Bunny tasks are shown as pink tasks.",
    "Power Derby har enklere oppgavekrav enn et vanlig derby, men samme maksimale poeng per oppgave. I Champions League har hvert medlem 18 inkluderte oppgaver.":"Power Derby tasks have easier requirements than regular Derby tasks, but the same maximum points per task. In the Champions League, each member has 18 included tasks.",
    "Kontroller alltid oppgavens egen tidsfrist før du velger den.":"Always check the task's own time limit before selecting it.",
    "En valgt oppgave skal fullføres og skal ikke slettes eller avbrytes.":"A selected task must be completed and must not be deleted or abandoned.",
    "En oppgave som går ut på tid gir ingen poeng og bruker én tilgjengelig oppgave.":"A task that expires gives no points and uses one available task.",
    "WGANGs minimum er 80 prosent av mulig makspoeng. Målet er 100 prosent.":"WGANG's minimum is 80% of the maximum possible score. The goal is 100%.",
    "Prioriter oppgaver med 320 poeng.":"Prioritize 320-point tasks.",
    "Utnytt de reduserte oppgavekravene til å fullføre tidlig og sikkert.":"Use the reduced task requirements to finish early and safely.",
    "Ha produksjon, by, båt, gruveverktøy og hjelpeoppgaver forberedt.":"Prepare production, town, boat, mining-tool and help tasks.",
    "Gi beskjed tidlig dersom en valgt oppgave står i fare for ikke å bli fullført.":"Let the team know early if a selected task may not be completed.",
    "Strategi publiseres av admin før derbyet starter.":"The strategy will be published by an admin before the Derby starts."
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

  let state = { accounts:[], derby:{type:"Normal Derby",taskTotal:9,maxPoints:320,strategy:[]}, content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],participations:[],next:null}, derbyHistory:{archives:[],results:[],changeLog:[]}, legalAcceptance:null, notifications:{preferences:null,readState:null}, social:{likes:[],comments:[],translations:[],activityNotifications:[]}, currentUserId:null };
  let busy = false;

  const landing = $("landing");
  const portal = $("portal");
  const sidebar = $("sidebar");
  function closeMenu() {
    if (sidebar) sidebar.classList.remove("open");
  }
  const portalMain = $("portalMain");
  const auth = $("authDialog");
  const legalAcceptanceDialog = $("legalAcceptanceDialog");
  const passwordSetup = $("passwordSetupDialog");
  const editor = $("derbyEditor");
  const derbyParticipationDialog = $("derbyParticipationDialog");
  const derbyResultDialog = $("derbyResultDialog");
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
    {group:"Medlemmer",key:"members.view",label:"Se administrativ medlemsoversikt",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.approve",label:"Godkjenne medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.reject",label:"Avslå medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.change_role",label:"Endre rolle på medlem",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Medlemmer",key:"members.remove",label:"Fjerne/deaktivere medlem",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Derby",key:"derby.view",label:"Se derby",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Derby",key:"derby.plan",label:"Delta i derbyplanlegging",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},
    {group:"Derby",key:"derby.preferences.view",label:"Se aktiv oppgavepreferansestatistikk",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
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
    {group:"Innlegg / godkjenning",key:"content.approve",label:"Godkjenne og publisere innlegg/tips",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Innlegg / godkjenning",key:"content.reject",label:"Avvise innlegg/tips",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},

    {group:"Varslinger",key:"notifications.admin.membership",label:"Motta varsel om medlemsforespørsel",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Varslinger",key:"notifications.admin.pending_content",label:"Motta varsel om innlegg til godkjenning",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Varslinger",key:"notifications.leadership_chat",label:"Motta Lederprat-varsler",defaults:{owner:1,admin:1,assistant_leader:1,member:0}},
    {group:"Varslinger",key:"notifications.important_derby",label:"Motta viktige derbyvarsler",defaults:{owner:1,admin:1,assistant_leader:1,member:1}},

    {group:"Roller og rettigheter",key:"permissions.view",label:"Se rettighetsoppsett",defaults:{owner:1,admin:1,assistant_leader:0,member:0}},
    {group:"Roller og rettigheter",key:"permissions.edit",label:"Endre rettigheter",ownerOnly:true,defaults:{owner:1,admin:0,assistant_leader:0,member:0}},

    {group:"Historikk",key:"history.permission_audit",label:"Se logg over rettighetsendringer",defaults:{owner:1,admin:1,assistant_leader:0,member:0}}
  ];

  const EDITABLE_PERMISSION_ROLES = ["admin","assistant_leader","senior","member"];
  function defaultPermissionValue(def,role){
    const defaultRole=role==="senior"?"assistant_leader":role;
    return !!def?.defaults?.[defaultRole];
  }
  function rolePermissionOverride(role,key){
    const rows=state.permissions?.rolePermissions||[];
    const row=rows.find(x=>x.role===role&&x.permission_key===key);
    return row ? !!row.enabled : null;
  }
  function hasPermission(key,user=current()){
    if(!user)return false;
    if(user.role==="owner")return true; // systemkritiske Eier-rettigheter er låst
    const def=PERMISSION_DEFINITIONS.find(x=>x.key===key);
    if(def?.ownerOnly)return false;
    const override=rolePermissionOverride(user.role,key);
    if(override!==null)return override;
    return defaultPermissionValue(def,user.role);
  }
  function canManageDerbyResults(user=current()) {
    return !!user
      && (user.role === "owner" || user.role === "admin")
      && hasPermission("derby.settings.publish", user);
  }
  function canViewDerbyLeadership(user=current()) {
    return !!user
      && ["owner","admin","assistant_leader","senior"].includes(user.role)
      && (
        hasPermission("derby.preferences.view", user)
        || hasPermission("derby.settings.publish", user)
      );
  }
  const ADMIN_MODULE_PERMISSIONS = {
    actions:["content.pending.view","members.approve","members.reject"],
    derby:["derby.board.update","derby.board.publish","derby.task_library.edit","derby.settings.publish"],
    applications:["members.approve","members.reject"],
    board:["derby.preferences.view"],
    roles:["members.view","members.change_role","members.remove","permissions.view"]
  };
  function hasAnyPermission(keys,user=current()){ return (keys||[]).some(key=>hasPermission(key,user)); }
  function canAccessAdminModule(name,user=current()){ return !!user && hasAnyPermission(ADMIN_MODULE_PERMISSIONS[name]||[],user); }
  function canAccessAdmin(user=current()){ return !!user && Object.keys(ADMIN_MODULE_PERMISSIONS).some(name=>canAccessAdminModule(name,user)); }
  function firstAccessibleAdminModule(user=current()){ return ["actions","derby","applications","board","roles"].find(name=>canAccessAdminModule(name,user)) || null; }
  const ROUTE_PERMISSIONS = {
    derby:"derby.view",
    history:"derby.view",
    preferences:"derby.plan",
    discussions:"chat.community.view",
    leadership:"chat.leadership.view"
  };
  function canAccessRoute(route,user=current()){
    if(route==="admin" || String(route||"").startsWith("admin-"))return canAccessAdmin(user);
    const key=ROUTE_PERMISSIONS[route];
    return key ? hasPermission(key,user) : true;
  }
  function applyPermissionVisibility(){
    document.querySelectorAll("[data-permission-any]").forEach(el=>{
      const keys=(el.dataset.permissionAny||"").split(",").map(x=>x.trim()).filter(Boolean);
      el.classList.toggle("hidden",!hasAnyPermission(keys));
    });
    document.querySelectorAll("[data-permission-all]").forEach(el=>{
      const keys=(el.dataset.permissionAll||"").split(",").map(x=>x.trim()).filter(Boolean);
      el.classList.toggle("hidden",!keys.every(key=>hasPermission(key)));
    });
    document.querySelectorAll("[data-result-manager-only]").forEach(el=>{
      el.classList.toggle("hidden",!canManageDerbyResults());
    });
    document.querySelectorAll("[data-result-leadership-only]").forEach(el=>{
      el.classList.toggle("hidden",!canViewDerbyLeadership());
    });
    const group=document.querySelector(".admin-nav-group");
    if(group) group.classList.toggle("hidden",!canAccessAdmin());
  }
  function applyAccessModeClasses(user=current()){
    document.body.classList.toggle("leadership-mode",hasPermission("chat.leadership.view",user));
    document.body.classList.toggle("admin-access-mode",canAccessAdmin(user));
    document.body.classList.toggle("owner-mode",isOwner(user));
  }
  function approved() { return state.accounts.filter(a => a.approved); }
  function roleLabel(role) { return {owner:"Eier",admin:"Administrator",assistant_leader:"Ass. leder",senior:"Senior",member:"Medlem"}[role] || role; }
  function choiceLabel(choice) { return {joined:"Deltar",pause:"Tar pause",unsure:"Usikker",waiting:"Mangler svar"}[choice] || choice; }
  function showDialog(dialog) { if (dialog && typeof dialog.showModal === "function") dialog.showModal(); else if (dialog) dialog.setAttribute("open", ""); }
  function closeDialog(dialog) { if (dialog && typeof dialog.close === "function") dialog.close(); else if (dialog) dialog.removeAttribute("open"); }
  function setBusy(value) { busy = value; document.body.classList.toggle("is-busy", value); }
  function humanError(error, fallback="Noe gikk galt. Prøv igjen.") { return error && error.message ? error.message : fallback; }

  function setModeHint() {
    const hint = document.querySelector(".auth-hint");
    if (!hint) return;
    if (backend.mode === "supabase") {
      hint.innerHTML = "<strong>Velkommen til WGANG Portal</strong><br>Logg inn for å få tilgang til nabolagets medlemsportal.";
    } else {
      hint.innerHTML = "<strong>Portalen er midlertidig utilgjengelig.</strong><br>Innlogging kan ikke brukes før tilkoblingen til medlemsdatabasen er gjenopprettet.";
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
    if(!canAccessRoute(route))route="dashboard";
    if(String(route||"").startsWith("admin-")){
      showAdminModule(String(route).slice(6),useHash);
      return;
    }
    if (route === "admin") { const first=firstAccessibleAdminModule(); if(first) showAdminModule(first,useHash); else navigate("dashboard",useHash); return; }
    $$(".page").forEach(p => p.classList.toggle("active", p.dataset.page === route));
    $$('[data-route]').forEach(a => a.classList.toggle("active", a.dataset.route === route));
    sidebar.classList.remove("open");
    if (useHash) location.hash = route;
    portalMain.focus();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  const ADMIN_MODULE_META = {
    actions: ["Til behandling", "Varsler, tips og andre saker som venter på gjennomgang."],
    derby: ["Derbyadministrasjon", "Publiser neste derby og registrer kontrollerte sluttresultater."],
    applications: ["Medlemssøknader", "Godkjenn eller avslå nye medlemsforespørsler."],
    board: ["Oppslagstavla", "Se lagets oppgavepreferanser og planlegg hvilke oppgaver som bør beholdes."],
    roles: ["Medlemmer og roller", "Administrer medlemmer, roller og tilgang."]
  };

  function showAdminModule(name, useHash=true) {
    if(!canAccessAdminModule(name)){ const fallback=firstAccessibleAdminModule(); if(fallback && fallback!==name){showAdminModule(fallback,useHash);} else {navigate("dashboard",useHash);} return;}
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

  function legalAcceptanceRequired() {
    return typeof backend.legalAcceptanceRequired === "function" && backend.legalAcceptanceRequired(state);
  }

  function showLegalAcceptanceDialog() {
    closeDialog(auth);
    if (legalAcceptanceDialog && !legalAcceptanceDialog.open) showDialog(legalAcceptanceDialog);
    document.body.classList.add("modal-open");
  }

  function openPortal() {
    const user = current();
    if (!user || !user.approved) { openAuth("login"); return; }
    if (legalAcceptanceRequired()) { showLegalAcceptanceDialog(); return; }
    landing.classList.add("hidden");
    portal.classList.remove("hidden");
    portal.setAttribute("aria-hidden", "false");
    applyPermissionVisibility();
    applyAccessModeClasses(user);
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
    document.body.classList.remove("admin-mode","leadership-mode","admin-access-mode","owner-mode");
    closeDialog(legalAcceptanceDialog);
    document.body.classList.remove("modal-open");
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
    in_app_derby_deadline_reminders:true,in_app_social_activity:true,email_enabled:false
  };
  function notificationPrefs() { return Object.assign({}, NOTIFICATION_DEFAULTS, state.notifications?.preferences || {}); }
  function notificationRead() { return state.notifications?.readState || {}; }
  function newerThan(value, seen) { return value && new Date(value).getTime() > new Date(seen || "1970-01-01").getTime(); }
  let pendingNotificationFocus=null;

  function focusNotificationTargetOnce(){
    const target=pendingNotificationFocus;
    if(!target) return false;

    const escId=value=>{
      const raw=String(value);
      return window.CSS?.escape ? CSS.escape(raw) : raw.replace(/["\\]/g,"\\$&");
    };

    const selectors=[];
    if(target.commentId){
      selectors.push(`[data-comment-id="${escId(target.commentId)}"]`);
    }
    if(target.entryId){
      selectors.push(
        `[data-post-id="${escId(target.entryId)}"]`,
        `[data-message-id="${escId(target.entryId)}"]`
      );
    }

    let el=null;
    for(const selector of selectors){
      try{ el=document.querySelector(selector); }catch(_){}
      if(el) break;
    }
    if(!el) return false;

    pendingNotificationFocus=null;

    // If the target is a comment, open its comment area before positioning.
    const comments=el.closest("[data-comments-for]");
    if(comments) comments.classList.remove("hidden");

    el.scrollIntoView({behavior:"smooth",block:"center"});
    el.classList.add("notification-focus-target");
    setTimeout(()=>el.classList.remove("notification-focus-target"),2200);
    return true;
  }

  function openNotificationTarget(route,entryId,commentId){
    pendingNotificationFocus={entryId:entryId||null,commentId:commentId||null};
    navigate(route||"dashboard");
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(!focusNotificationTargetOnce()){
        // One fallback after rendering only. No repeating auto-scroll.
        setTimeout(()=>focusNotificationTargetOnce(),220);
      }
    }));
  }

  function consumeNotificationFocusFromUrl(){
    try{
      const q=new URLSearchParams(location.search);
      const entryId=q.get("focusEntry");
      const commentId=q.get("focusComment");
      if(!entryId&&!commentId) return;
      const route=(location.hash||"#dashboard").replace(/^#/,"").split(/[/?]/)[0]||"dashboard";
      openNotificationTarget(route,entryId,commentId);
      q.delete("focusEntry"); q.delete("focusComment");
      const clean=location.pathname+(q.toString()?`?${q.toString()}`:"")+location.hash;
      history.replaceState(null,"",clean);
    }catch(e){console.warn(e);}
  }

  function buildNotifications() {
    const prefs=notificationPrefs(), read=notificationRead(), items=[];
    const anns=state.content?.announcements||[], posts=state.content?.derbyPosts||[], msgs=state.leadershipMessages||[];
    const latestAnn=anns[0]; if(prefs.in_app_announcements && latestAnn && newerThan(latestAnn.publishedAt||latestAnn.createdAt,read.announcements_seen_at)) items.push({group:"common",category:"announcements",title:"Ny kunngjøring",text:latestAnn.title||"Ny beskjed fra WGANG",route:"discussions",time:latestAnn.publishedAt||latestAnn.createdAt});
    // Varsle på nyeste uleste aktivitet fra andre – innlegg ELLER kommentar.
    // Dette påvirker kun varslingsdeteksjon; eksisterende engangs-fokus/scrollfix beholdes urørt.
    const activityTime=x=>x?.createdAt||x?.created_at||x?.publishedAt||x?.published_at;
    const activityUser=x=>x?.userId||x?.user_id||x?.authorId||x?.author_id;
    const activityText=x=>x?.text||x?.body||x?.comment||x?.title||"";
    const commentsOf=x=>x?.comments||x?.replies||[];

    const newestUnreadActivity=(entries,seenAt)=>{
      const found=[];
      (entries||[]).forEach(entry=>{
        const et=activityTime(entry);
        if(et && String(activityUser(entry)||"")!==String(current()?.id||"") && newerThan(et,seenAt))
          found.push({kind:"post",time:et,text:activityText(entry),entryId:entry.id});
        commentsOf(entry).forEach(comment=>{
          const ct=activityTime(comment);
          if(ct && String(activityUser(comment)||"")!==String(current()?.id||"") && newerThan(ct,seenAt))
            found.push({kind:"comment",time:ct,text:activityText(comment),entryId:entry.id,commentId:comment.id});
        });
      });
      return found.sort((a,b)=>new Date(b.time)-new Date(a.time))[0]||null;
    };

    const latestPost=newestUnreadActivity(posts,read.derby_chat_seen_at);
    if(hasPermission("chat.community.view") && prefs.in_app_derby_chat && latestPost) items.push({
      group:"common",category:"derby_chat",
      title:latestPost.kind==="comment"?"Ny kommentar i Derbyprat":"Nytt innlegg i Derbyprat",
      text:latestPost.text||"",route:"discussions",time:latestPost.time,
      focusEntryId:latestPost.entryId,focusCommentId:latestPost.commentId||null
    });

    const latestMsg=newestUnreadActivity(msgs,read.leadership_chat_seen_at);
    if(hasPermission("chat.leadership.view") && hasPermission("notifications.leadership_chat") && prefs.in_app_leadership_chat && latestMsg) items.push({
      group:"leadership",category:"leadership_chat",
      title:latestMsg.kind==="comment"?"Ny kommentar i Lederprat":"Nytt i Lederprat",
      text:latestMsg.text||"",route:"leadership",time:latestMsg.time,
      focusEntryId:latestMsg.entryId,focusCommentId:latestMsg.commentId||null
    });
    if(hasPermission("notifications.admin.membership") && hasAnyPermission(["members.approve","members.reject"]) && prefs.in_app_membership_requests) { const pending=state.accounts.filter(a=>a.status==="pending"); if(pending.length && newerThan(Math.max(...pending.map(x=>new Date(x.createdAt||Date.now()).getTime())),read.membership_requests_seen_at)) items.push({group:"leadership",category:"membership_requests",title:"Nye medlemssøknader",text:`${pending.length} venter på behandling`,admin:"applications",count:pending.length}); }
    if(hasPermission("notifications.admin.pending_content") && hasPermission("content.pending.view") && prefs.in_app_pending_tips) { const tips=state.content?.pendingTips||[]; const latest=tips[0]; if(latest && newerThan(latest.createdAt,read.pending_tips_seen_at)) items.push({group:"leadership",category:"pending_tips",title:"Tips venter på behandling",text:`${tips.length} tips venter`,admin:"actions",time:latest.createdAt,count:tips.length}); }
    if(prefs.in_app_social_activity){
      const activity=(socialData().activityNotifications||[]).filter(x=>!x.read_at);
      activity.filter(n=>n.target_type==="leadership" ? hasPermission("chat.leadership.view") : hasPermission("chat.community.view")).forEach(n=>{
        const actor=state.accounts.find(a=>String(a.id)===String(n.actor_id));
        const matchingComment=n.activity_type==="comment"
          ? (socialData().comments||[]).filter(c=>String(c.target_type)===String(n.target_type)&&String(c.target_id)===String(n.target_id)&&String(c.user_id)===String(n.actor_id)).sort((x,y)=>Math.abs(new Date(x.created_at)-new Date(n.created_at))-Math.abs(new Date(y.created_at)-new Date(n.created_at)))[0]
          : null;
        items.push({group:"personal",category:"social_activity",activityId:n.id,title:n.activity_type==="comment"?"Ny kommentar":"Ny likerklikk",text:`${actor?.name||"Et medlem"} ${n.activity_type==="comment"?"kommenterte":"likte"} innlegget ditt`,route:n.target_type==="leadership"?"leadership":"discussions",time:n.created_at,focusEntryId:n.target_id||null,focusCommentId:matchingComment?.id||null});
      });
    }

    const next=state.derbyManagement?.next;
    if(hasPermission("derby.view") && hasPermission("notifications.important_derby") && prefs.in_app_derby_published && next?.published_at && newerThan(next.published_at,read.derby_published_seen_at)){
      items.push({group:"common",category:"derby_published",title:"Nytt derby publisert",text:next.name||"Neste derby er klart",route:"derby",time:next.published_at});
    }

    // Personlig påminnelse: varsle bare medlemmet som selv mangler svar,
    // fra 24 timer før påmeldingsfristen og frem til fristen.
    if(hasPermission("derby.plan") && prefs.in_app_derby_deadline_reminders && next?.signup_deadline){
      const deadline=new Date(next.signup_deadline);
      const reminderAt=new Date(deadline.getTime()-24*60*60*1000);
      const now=Date.now();
      const choice=String(current()?.choice||"waiting");
      const missingChoice=!["joined","pause","unsure"].includes(choice);
      if(
        missingChoice &&
        now>=reminderAt.getTime() &&
        now<deadline.getTime() &&
        newerThan(reminderAt.toISOString(),read.derby_deadline_seen_at)
      ){
        const deadlineText=new Intl.DateTimeFormat("nb-NO",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(deadline);
        items.push({
          group:"personal",
          category:"derby_deadline",
          title:"Du mangler derby-svar",
          text:`Bekreft deltakelse eller pause før ${deadlineText}.`,
          route:"derby",
          time:reminderAt.toISOString()
        });
      }
    }

    return items.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0));
  }
  async function openNotification(item) {
    try { if(item.category==="social_activity"&&item.activityId){await backend.markActivityNotificationRead(item.activityId);} else {await backend.markNotificationSeen(item.category);} if(!state.notifications) state.notifications={}; if(!state.notifications.readState) state.notifications.readState={}; const map={announcements:"announcements_seen_at",derby_chat:"derby_chat_seen_at",leadership_chat:"leadership_chat_seen_at",membership_requests:"membership_requests_seen_at",pending_tips:"pending_tips_seen_at",derby_published:"derby_published_seen_at",derby_deadline:"derby_deadline_seen_at"}; if(map[item.category]) state.notifications.readState[map[item.category]]=new Date().toISOString(); } catch(e){ console.warn(e); }
    $("memberProfileDialog")?.close();
    if(item.admin) showAdminModule(item.admin);
    else if(item.focusEntryId||item.focusCommentId) openNotificationTarget(item.route||"dashboard",item.focusEntryId,item.focusCommentId);
    else navigate(item.route||"dashboard");
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

  // v0.18.0.39 – Web Push foundation.
  // Offentlig VAPID-nøkkel fylles inn når sikker sender/Edge Function opprettes.
  const WGANG_VAPID_PUBLIC_KEY = "";

  function isStandalonePWA(){
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  function pushPlatform(){
    const ua=navigator.userAgent||"";
    if(/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if(/Android/i.test(ua)) return "android";
    return "web";
  }

  function urlBase64ToUint8Array(base64String){
    const padding="=".repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
    const raw=atob(base64);
    return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));
  }

  async function currentPushSubscription(){
    if(!("serviceWorker" in navigator)) return null;
    const reg=await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  async function renderPushNotificationSettings(){
    const status=$("pushNotificationStatus");
    const enable=$("enablePushNotifications");
    const disable=$("disablePushNotifications");
    if(!status||!enable||!disable) return;

    const supported=("serviceWorker" in navigator)&&("PushManager" in window)&&("Notification" in window);
    if(!supported){
      status.textContent="Denne nettleseren støtter ikke Web Push.";
      enable.disabled=true;
      disable.classList.add("hidden");
      return;
    }

    const platform=pushPlatform();
    if(platform==="ios"&&!isStandalonePWA()){
      status.textContent="På iPhone må WGANG Portal først legges til på Hjem-skjermen og åpnes derfra.";
      enable.disabled=true;
      disable.classList.add("hidden");
      return;
    }

    const sub=await currentPushSubscription();
    if(sub){
      status.textContent="Push-varsler er aktivert på denne enheten.";
      enable.classList.add("hidden");
      disable.classList.remove("hidden");
    }else{
      status.textContent=Notification.permission==="denied"
        ?"Varsler er blokkert i enhetens/nettleserens innstillinger."
        :"Push-varsler er ikke aktivert på denne enheten.";
      enable.classList.remove("hidden");
      disable.classList.add("hidden");
      enable.disabled=Notification.permission==="denied";
    }
  }

  async function enablePushNotifications(){
    try{
      if(!WGANG_VAPID_PUBLIC_KEY){
        alert("Push-fundamentet er installert. Offentlig VAPID-nøkkel må legges inn før abonnement kan aktiveres.");
        return;
      }
      const permission=await Notification.requestPermission();
      if(permission!=="granted"){
        await renderPushNotificationSettings();
        return;
      }
      const reg=await navigator.serviceWorker.ready;
      const sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(WGANG_VAPID_PUBLIC_KEY)
      });
      await backend.savePushSubscription(sub,pushPlatform());
      await renderPushNotificationSettings();
    }catch(e){
      console.error(e);
      alert("Kunne ikke aktivere push-varsler.");
    }
  }

  async function disablePushNotifications(){
    try{
      const sub=await currentPushSubscription();
      if(sub){
        await backend.removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      await renderPushNotificationSettings();
    }catch(e){
      console.error(e);
      alert("Kunne ikke deaktivere push-varsler.");
    }
  }

  function renderNotificationSettings() {
    setTimeout(()=>renderPushNotificationSettings().catch(console.warn),0);
    const p=notificationPrefs(), set=(id,key)=>{const el=$(id);if(el)el.checked=!!p[key];};
    set("notifyAnnouncements","in_app_announcements");
    set("notifyDerbyChat","in_app_derby_chat");
    set("notifyLeadershipChat","in_app_leadership_chat");
    set("notifyMembershipRequests","in_app_membership_requests");
    set("notifyPendingTips","in_app_pending_tips");
    set("notifyImportantDerby","in_app_derby_published");
    set("notifyPersonalDerbyReminder","in_app_derby_deadline_reminders");
    set("notifySocialActivity","in_app_social_activity");
    set("emailNotificationsEnabled","email_enabled");
  }

  function renderSession() {
    const user = current();
    if (!user) return;
    applyAccessModeClasses(user);
    applyPermissionVisibility();
    if (!canAccessAdmin(user)) {
      $("adminSubnav")?.classList.add("hidden");
      $("adminNavToggle")?.setAttribute("aria-expanded", "false");
    }
    user.name = String(user.name || "").toUpperCase();
    $("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
    $("profileName").textContent = user.name;
    $("profileRole").textContent = roleLabel(user.role);
    $("welcomeHeading").textContent = "Hei, " + user.name + " 👋";
    $("accountBadge").textContent = roleLabel(user.role).toUpperCase();
    $$(".choice-button").forEach(b => b.classList.toggle("selected", b.dataset.choice === user.choice));
    $("participationStatus").textContent = user.participationNeedsConfirmation
      ? (currentLanguage === "en" ? "Your previous participation response is missing a valid rule confirmation. Choose ‘I'm participating’ and confirm the rules." : "Det tidligere deltakelsessvaret mangler gyldig regelbekreftelse. Velg «Jeg deltar» og bekreft reglene.")
      : user.choice === "joined" ? (currentLanguage === "en" ? "You have confirmed both your participation and the Derby rules." : "Du har bekreftet at du deltar og at derbyreglene er lest.")
      : user.choice === "pause" ? (currentLanguage === "en" ? "You are taking a break from the next Derby." : "Du tar pause i neste derby.")
      : user.choice === "unsure" ? (currentLanguage === "en" ? "You are registered as unsure." : "Du er registrert som usikker.")
      : (currentLanguage === "en" ? "You have not responded about participation yet." : "Du har ikke svart på deltakelse ennå.");
    $("myStatusMetric").textContent = choiceLabel(user.choice);
    renderDerbyConfig();
    renderNormalDerbyCompletion();
    renderMetrics();
    renderMembers();
    renderPreferences();
    renderContent();
    renderLeadershipChat();
    renderDerbyHistory();
    renderResultManagement();
    renderAdmin();
    if (hasPermission("derby.preferences.view")) renderAdminPreferences();
    renderDerbyManagement();
    renderNotifications();
    renderNotificationSettings();
    loadBunny();
    translateUi(portal);
    queueVisibleTranslations();
    setTimeout(consumeNotificationFocusFromUrl,120);
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
  function bunnyPopularity(n){if(n===0)return "Ingen interesse";if(n<=5)return "Lav interesse";if(n<=10)return "Noe interesse";if(n<=15)return "Populær";if(n<=20)return "Svært populær";if(n<=25)return "Høy interesse";return "Veldig høy interesse";}
  function bunnyInterestPct(n){return Math.max(0,Math.min(100,(Math.min(30,n)/30)*100));}
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
  const BUNNY_PNG_IMAGE_KEYS=new Set(["rustikk-bukett", "dame", "danser", "ris", "popkorn-med-smor", "genser", "bygjester-kafe", "bjornebaer-muffins", "olivenolje", "sukkerror"]);
  function bunnyTaskImageUrl(task){
    if(!task?.image_key) return "";
    const key=String(task.image_key).replace(/_/g,"-");
    if(BUNNY_PNG_IMAGE_KEYS.has(key)){
      return `task-${key}.png${key==="sukkerror"?"?v=2":""}`;
    }
    return `task-${key}.webp`;
  }
  function renderBunny(){
    const grid=$("bunnyTaskGrid");if(!grid)return;const ids=new Set((bunnyData.boardTasks||[]).map(x=>String(x.task_id)));const tasks=(bunnyData.library||[]).filter(t=>ids.has(String(t.id)));const uid=current()?.id;
    const mine=(bunnyData.statuses||[]).filter(x=>String(x.user_id)===String(uid));const planned=mine.filter(x=>["ready","preparing"].includes(x.status));const event=state.derbyManagement?.next,cycle=bunnyPlannerCycle(event);
    $("bunnyReadyCount").textContent=`${planned.length} valgt`;$("bunnyPlanCount").textContent=`${planned.length} valgt`;$("bunnyBoardMeta").textContent=`${tasks.length} tilgjengelige oppgaver`;
    const notice=$("bunnyBoardNotice"),dl=bunnyDeadlineInfo();if(!bunnyData.board){notice.className="bunny-board-notice stale";notice.textContent="⚠️ Dagens oppgavetavle er ikke publisert ennå.";}else if(bunnyIsStale()){notice.className="bunny-board-notice stale";notice.textContent="⚠️ Oppgavene i spillet er byttet kl. 10:00. Tavlen i portalen er ikke bekreftet oppdatert ennå.";}else{notice.className="bunny-board-notice";notice.innerHTML=`✓ Tavlen er oppdatert ${new Date(bunnyData.board.published_at).toLocaleString("nb-NO",{hour:"2-digit",minute:"2-digit"})}. <strong>Må være utført innen 09:59</strong> · ⏱ ${esc(dl.text)}${cycle?` · Valgene gjelder til ${cycle.end.toLocaleTimeString("nb-NO",{hour:"2-digit",minute:"2-digit"})}`:""}`;}
    const images={"Gjester i Matbutikk":"01-gjester-i-matbutikk.png","Kake med røde bær":"02-kake-med-rode-baer.png","Soyabønner":"03-soyabonner.png","Innbygger":"04-innbygger.png","Gulrøtter":"05-gulrotter.png","Bacon":"18-bacon.png","Gulrotkake":"07-gulrotkake.png","Eplejuice":"19-eplejuice.png","Egg":"09-egg.png","Frutti di Mare-pizza":"10-frutti-di-mare-pizza.png","Gresskar":"11-gresskar.png","Hvete":"12-hvete.png","Cowboy":"13-cowboy.png","Blå ullue":"14-bla-ullue.png","Kino":"15-kino.png","Bomullsskjorte":"16-bomullsskjorte.png","Sesam-is":"17-sesam-is.png","Mat dyr":"20-mat-dyr.png","Sesamkrokan":"21-sesamkrokan.png","Sushirull":"22-sushirull.png","Salat":"23-salat.png","Tofupølse":"24-tofupolse.png","Bomull":"25-bomull.png","Stekte tomater":"26-stekte-tomater.png","Gresskarpai":"27-gresskarpai.png","Stormester":"28-stormester.png","Bringebærmuffins":"29-bringebaermuffins.png"};
    grid.innerHTML=tasks.length?tasks.map(t=>{const sts=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(t.id)&&["ready","preparing"].includes(x.status));const n=sts.length,my=mine.find(x=>String(x.task_id)===String(t.id))?.status||"";const img=bunnyTaskImageUrl(t)||images[t.name];const desc=String(t.description||t.name||"").replace(/\d+\s*[×x]?\s*/g,"").trim();const pct=bunnyInterestPct(n),disabled=cycle?"":"disabled";return `<article class="bunny-task-card bunny-designer-card"><div class="bunny-task-type">${esc(t.category)}</div><div class="bunny-task-content"><div class="bunny-task-art">${img?`<img class="bunny-task-image" src="./${img}" alt="${esc(t.name)}" data-fallback-icon="${esc(t.icon||"🐰")}">`:`<div class="bunny-task-icon">${esc(t.icon||"🐰")}</div>`}<span class="bunny-task-amount">× ${t.amount}</span></div><div class="bunny-task-copy"><h3>${esc(t.name)}</h3><p>${esc(desc)}</p></div></div><div class="bunny-interest"><div class="bunny-interest-head"><strong>${n} valgt</strong><span>${bunnyPopularity(n)}</span></div><div class="bunny-interest-scale" style="--interest:${pct}%"><span class="bunny-interest-marker"></span></div><div class="bunny-interest-labels"><span>0</span><span>10</span><span>20</span><span>30</span></div></div><div class="bunny-actions bunny-actions-two"><button class="bunny-prep ${["ready","preparing"].includes(my)?"selected":""}" data-bunny-status="preparing" data-task-id="${t.id}" ${disabled}>✓ Jeg klargjør den</button><button class="bunny-skip ${my==="skip"?"selected":""}" data-bunny-status="skip" data-task-id="${t.id}" ${disabled}>× Ikke aktuelt for meg</button></div></article>`;}).join(""):`<p class="empty-state">Ingen aktiv Chill Bunny-tavle er publisert.</p>`;
    grid.querySelectorAll(".bunny-task-image").forEach(img=>img.addEventListener("error",()=>{const fallback=document.createElement("div");fallback.className="bunny-task-icon";fallback.textContent=img.dataset.fallbackIcon||"🐰";img.replaceWith(fallback);},{once:true}));
    grid.querySelectorAll("[data-bunny-status]").forEach(b=>b.onclick=async()=>{if(!bunnyData.board||!cycle)return;const old=mine.find(x=>String(x.task_id)===String(b.dataset.taskId));try{if(old?.status===b.dataset.bunnyStatus||(b.dataset.bunnyStatus==="preparing"&&old?.status==="ready"))await backend.clearBunnyStatus(bunnyData.board.id,b.dataset.taskId);else await backend.setBunnyStatus(bunnyData.board.id,b.dataset.taskId,b.dataset.bunnyStatus,cycle.key,cycle.eventId,cycle.round,cycle.start.toISOString(),cycle.end.toISOString());await loadBunny();}catch(e){alert(humanError(e));}});
    const plan=$("bunnyMyPlan");plan.innerHTML=planned.length?planned.sort((a,b)=>{const ca=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(a.task_id)&&["ready","preparing"].includes(x.status)).length,cb=(bunnyData.statuses||[]).filter(x=>String(x.task_id)===String(b.task_id)&&["ready","preparing"].includes(x.status)).length;return cb-ca;}).map(x=>{const t=(bunnyData.library||[]).find(z=>String(z.id)===String(x.task_id));return t?`<span class="bunny-plan-chip">${esc(t.name)} ×${t.amount}</span>`:"";}).join(""):`<span class="helper-text">Ingen oppgaver valgt til neste harepus ennå.</span>`;renderBunnyAdmin();
  }

  function bunnyNorm(v){
    return String(v||"").trim().toLocaleLowerCase("nb-NO");
  }
  let bunnyEditTask=null;
  function bunnyTaskImageFile(t){return bunnyTaskImageUrl(t)||null;}
  function openBunnyTaskEditor(t){
    bunnyEditTask=t;setText("bunnyEditTaskId",t.id);$("bunnyEditTaskId").value=t.id;$("bunnyEditName").value=t.name||"";$("bunnyEditCategory").value=t.category||"";$("bunnyEditDescription").value=String(t.description||t.name||"").replace(/\b\d+\s*[×x]?\s*/g,"").trim();$("bunnyEditAmount").value=t.amount||1;const file=bunnyTaskImageFile(t);$("bunnyEditorPreview").innerHTML=file?`<img src="./${file}" alt="${esc(t.name)}"><span>× ${Number(t.amount)||1}</span>`:`<div class="bunny-task-icon">${esc(t.icon||"🐰")}</div>`;$("bunnyTaskEditorStatus").textContent="";$("bunnyTaskEditorDialog")?.showModal();
  }
  function updateBunnyEditorPreview(){if(!bunnyEditTask)return;const s=$("bunnyEditorPreview")?.querySelector("span");if(s)s.textContent=`× ${Number($("bunnyEditAmount").value)||1}`;}

  function renderBunnyAdmin(){
    const box=$("bunnyAdminBoard");
    if(!box)return;
    const canUpdate=hasPermission("derby.board.update");
    const canPublish=hasPermission("derby.board.publish");
    const canEditLibrary=hasPermission("derby.task_library.edit");
    if(!canUpdate&&!canPublish&&!canEditLibrary){box.innerHTML="";return;}

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
        ${canPublish?`<button class="button button-primary" id="publishBunnyBoard">Publiser valgt tavle</button>`:""}
      </div>

      <div class="bunny-admin-library">
        ${library.map(t=>`<div class="bunny-admin-choice-wrap">
          <button class="bunny-admin-choice ${active.has(String(t.id))?"selected":""}" data-bunny-pick="${t.id}" ${canUpdate?"":"disabled"}>
            <span class="bunny-admin-thumb">${(()=>{const f=bunnyTaskImageUrl(t)||({"Gjester i Matbutikk":"task-gjester-i-matbutikk.webp","Kake med røde bær":"task-kake-med-rode-baer.webp","Soyabønner":"task-soyabonner.webp","Innbygger":"task-innbygger.webp","Gulrøtter":"task-gulrotter.webp","Bacon":"task-bacon.webp","Gulrotkake":"task-gulrotkake.webp","Eplejuice":"task-eplejuice.webp","Egg":"task-egg.webp","Frutti di Mare-pizza":"task-frutti-di-mare-pizza.webp","Gresskar":"task-gresskar.webp","Hvete":"task-hvete.webp","Cowboy":"task-cowboy.webp","Blå ullue":"task-bla-ullue.webp","Kino":"task-kino.webp","Bomullsskjorte":"task-bomullsskjorte.webp","Sesam-is":"task-sesam-is.webp","Mat dyr":"task-mat-dyr.webp","Sesamkrokan":"task-sesamkrokan.webp","Sushirull":"task-sushirull.webp","Salat":"task-salat.webp","Tofupølse":"task-tofupolse.webp","Bomull":"task-bomull.webp","Stekte tomater":"task-stekte-tomater.webp","Gresskarpai":"task-gresskarpai.webp","Stormester":"task-stormester.webp","Bringebærmuffins":"task-bringebaermuffins.webp"})[t.name];return f?`<img src="./${f}" alt="">`:esc(t.icon||"🐰");})()}</span>
            <strong>${esc(t.name)} <b>×${t.amount}</b></strong>
            <small>${esc(t.category)}</small>
          </button>
          ${canEditLibrary?`<button class="bunny-edit-card" data-bunny-edit="${t.id}" title="Rediger oppgavekort">✎</button>`:""}
        </div>`).join("")}
      </div>

      ${canEditLibrary?`<div>
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
      </div>`:""}`;

    box.querySelectorAll("[data-bunny-pick]").forEach(b=>{
      b.onclick=()=>{
        if(!hasPermission("derby.board.update"))return;
        b.classList.toggle("selected");
        $("bunnyAdminSelected").textContent=box.querySelectorAll("[data-bunny-pick].selected").length;
      };
    });

    box.querySelectorAll("[data-bunny-edit]").forEach(b=>b.onclick=(e)=>{
      e.preventDefault();e.stopPropagation();if(!hasPermission("derby.task_library.edit"))return;const t=library.find(x=>String(x.id)===String(b.dataset.bunnyEdit));if(!t)return;openBunnyTaskEditor(t);
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

    const publishBunnyBoard=$("publishBunnyBoard");
    if(publishBunnyBoard)publishBunnyBoard.onclick=async()=>{
      if(!hasPermission("derby.board.publish"))return alert("Du har ikke rettighet til å publisere oppgavetavla.");
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

    const addBunnyTask=$("addBunnyTask");
    if(addBunnyTask)addBunnyTask.onclick=async()=>{
      if(!hasPermission("derby.task_library.edit"))return alert("Du har ikke rettighet til å endre oppgavebiblioteket.");
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

    const addBunnyTemplate=$("addBunnyTemplate");
    if(addBunnyTemplate)addBunnyTemplate.onclick=async()=>{
      if(!hasPermission("derby.task_library.edit"))return alert("Du har ikke rettighet til å endre oppgavebiblioteket.");
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
    const allowedAgeGroups = new Set(["Under 18","18–29","30–44","45–59","60+"]);
    if (allowedAgeGroups.has(account.ageGroup)) details.push(["Aldersgruppe", account.ageGroup]);
    if (account.countryPlace) details.push(["Land", account.countryPlace]);
    if (account.hayDaySince) details.push(["Hvor lenge har du spilt Hay Day?", account.hayDaySince]);
    if (account.favoriteGameAspect) details.push(["Hva liker du best i spillet?", account.favoriteGameAspect]);
    const spokenLanguages=[...(account.languages||[])].map(x=>x==="no"?"Norsk":x==="en"?"Engelsk":x);
    if(account.otherLanguages) spokenLanguages.push(...String(account.otherLanguages).split(",").map(x=>x.trim()).filter(Boolean));
    if(spokenLanguages.length) details.push(["Språk", [...new Set(spokenLanguages)].join(", ")]);
    $("memberProfileDetails").innerHTML = details.length ? details.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("") : `<p class="helper-text">Frivillig å fylle ut.</p>`;
    $("profileEditSection").classList.toggle("hidden", !editable);
    if (editable) {
      $("profileBioInput").value = account.bio || "";
      $("profileAgeInput").value = allowedAgeGroups.has(account.ageGroup) ? account.ageGroup : "";
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
      if (busy || !hasPermission("derby.plan")) return;
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

  function preferenceDerbyScope(nameOverride) {
    const name=String(nameOverride ?? state.derbyManagement?.next?.name ?? state.derby?.type ?? "");
    if (/power|styrke/i.test(name)) return {label:"Power Derby",eyebrow:"POWER DERBY"};
    if (/normal|standard/i.test(name)) return {label:"Normal Derby",eyebrow:"NORMAL DERBY"};
    return null;
  }

  function adminPreferenceAccounts() {
    const members=approved();
    return preferenceDerbyScope() ? members.filter(a=>a.choice==="joined" && !a.derbyCompleted) : members;
  }

  function preferenceStats() {
    const stats = {};
    TASK_TYPES.forEach(t => stats[t] = {like:0,can:0,avoid:0,no:0});
    adminPreferenceAccounts().forEach(a => Object.entries(a.preferences || {}).forEach(([task,value]) => {
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
    if (!hasPermission("derby.preferences.view")) return;
    const scopedMembers=adminPreferenceAccounts();
    const derbyScope=preferenceDerbyScope();
    const participantScope=!!derbyScope;
    const stats = preferenceStats();
    const rows = TASK_TYPES.map(t => ({t,s:stats[t],r:taskRecommendation(stats[t])}));
    const scopeText=$("adminPreferenceScope");
    if(scopeText) scopeText.textContent=participantScope
      ? (currentLanguage === "en"
        ? `Showing ${scopedMembers.length} participating member${scopedMembers.length===1?"":"s"} who still have tasks remaining in this ${derbyScope.label}.`
        : `Viser ${scopedMembers.length===1?"det ene medlemmet":`de ${scopedMembers.length} medlemmene`} som deltar og fortsatt har oppgaver igjen i ${derbyScope.label}.`)
      : (currentLanguage === "en" ? "Showing approved members according to the current setup for this Derby type." : "Viser godkjente medlemmer etter gjeldende oppsett for denne derbytypen.");
    $("adminPreferenceTable").innerHTML = rows.map(x => `<tr><td><strong>${esc(x.t)}</strong></td><td>${x.s.like}</td><td>${x.s.can}</td><td>${x.s.avoid}</td><td>${x.s.no}</td><td><span class="recommendation ${x.r.cls}">${x.r.label}</span></td></tr>`).join("");
    const most = rows.slice().sort((a,b) => (b.s.like*2+b.s.can)-(a.s.like*2+a.s.can)).slice(0,3);
    const clear = rows.slice().sort((a,b) => (b.s.no*2+b.s.avoid)-(a.s.no*2+a.s.avoid)).filter(x => x.s.no+x.s.avoid>0).slice(0,3);
    $("adminPreferenceSummary").innerHTML = `<article><span>WGANG liker best</span><strong>${most.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>${participantScope?`Basert på ${scopedMembers.length} påmeldte derbydeltakere`:"Basert på medlemmenes valg"}</small></article><article><span>Aktuelle å rydde</span><strong>${clear.map(x=>esc(x.t)).join(", ") || "Ingen data"}</strong><small>Bruk som støtte – poengkrav følger derbytypen</small></article>`;
    const memberBox = $("adminPreferenceMembers");
    if (memberBox) {
      memberBox.className = "preference-member-grid";
      memberBox.innerHTML = scopedMembers.map(a => {
        const likes = TASK_TYPES.filter(t => a.preferences?.[t] === "like");
        const can = TASK_TYPES.filter(t => a.preferences?.[t] === "can");
        return `<article class="preference-member-card"><h4>${esc(a.name)}</h4><p><strong>❤️ Liker:</strong> ${likes.map(esc).join(", ") || "Ikke registrert"}</p><p><strong>👍 Kan ta:</strong> ${can.map(esc).join(", ") || "Ikke registrert"}</p></article>`;
      }).join("") || `<p class="empty-state">${participantScope?"Ingen deltakere med oppgaver igjen er med i statistikken akkurat nå.":"Ingen preferanser registrert ennå."}</p>`;
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

  function derbyHistoryData() {
    return state.derbyHistory || {archives:[],results:[],changeLog:[]};
  }

  function historyNumber(value) {
    return new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "nb-NO").format(Number(value) || 0);
  }

  function historyPercent(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "nb-NO", {minimumFractionDigits:number % 1 ? 2 : 0,maximumFractionDigits:2}).format(number) + " %";
  }

  function historyDate(value) {
    if (!value) return "–";
    try {
      return new Intl.DateTimeFormat(currentLanguage === "en" ? "en-GB" : "nb-NO", {day:"2-digit",month:"short",year:"numeric"}).format(new Date(value));
    } catch (_) { return "–"; }
  }

  function incompleteTaskCount(result) {
    return Math.max(0, Number(result?.tasks_used || 0) - Number(result?.tasks_completed || 0));
  }

  function resultStatusModel(result) {
    const percent = Number(result?.result_percent || 0);
    const incomplete = incompleteTaskCount(result);
    const extra = Number(result?.extra_tasks || 0);
    let tone = "below", label = currentLanguage === "en" ? "Below 80%" : "Under 80 %";
    if (percent >= 100) {
      tone = "perfect";
      label = percent > 100 ? (currentLanguage === "en" ? "100% + extra" : "100 % + ekstra") : "100 %";
    } else if (percent >= 80) {
      tone = "minimum";
      label = historyPercent(percent);
    }
    return {percent,incomplete,extra,tone,label};
  }

  function archiveResults(archiveId) {
    return (derbyHistoryData().results || []).filter(row => String(row.archive_id) === String(archiveId));
  }

  function renderDerbyHistory() {
    const history = derbyHistoryData();
    const archives = history.archives || [];
    const allResults = history.results || [];
    const canViewLeadership = canViewDerbyLeadership();
    const canManage = canManageDerbyResults();
    const archiveList = $("derbyArchiveList");
    if (archiveList) {
      archiveList.innerHTML = archives.length ? archives.map(archive => {
        const rows = archiveResults(archive.id);
        const memberTotal = rows.reduce((sum,row)=>sum+Number(row.points_earned||0),0);
        const difference = Number(archive.neighborhood_points || 0) - memberTotal;
        const changeCount = (history.changeLog || []).filter(item=>String(item.archive_id)===String(archive.id)&&item.action==="corrected").length;
        const totalNote = canViewLeadership && rows.length
          ? `<small class="archive-control ${difference===0?"match":"mismatch"}">${difference===0?(currentLanguage==="en"?"Member total matches":"Medlemssummen stemmer"):`${currentLanguage==="en"?"Difference":"Avvik"}: ${historyNumber(difference)} ${currentLanguage==="en"?"points":"poeng"}`}</small>`
          : "";
        return `<article class="derby-archive-card">
          <div class="derby-archive-heading"><div><span>${historyDate(archive.started_at || archive.ended_at)}</span><h3>${esc(tText(archive.derby_name || archive.derby_type || "Derby"))}</h3></div><strong>${archive.placement ? `#${historyNumber(archive.placement)}` : "–"}</strong></div>
          <div class="derby-archive-facts"><span><small>${currentLanguage==="en"?"League":"Liga"}</small><b>${esc(archive.league || "–")}</b></span><span><small>${currentLanguage==="en"?"Team points":"Lagpoeng"}</small><b>${historyNumber(archive.neighborhood_points)}</b></span><span><small>${currentLanguage==="en"?"Participants":"Deltakere"}</small><b>${historyNumber(archive.participant_count)}</b></span><span><small>${currentLanguage==="en"?"Lost tasks":"Tapte oppgaver"}</small><b>${historyNumber(archive.trashed_tasks)}</b></span></div>
          <footer>${totalNote}${changeCount?`<small>${changeCount} ${currentLanguage==="en"?"logged correction(s)":"loggført(e) korreksjon(er)"}</small>`:""}${canManage?`<button type="button" class="table-action" data-correct-result="${archive.event_id}">${currentLanguage==="en"?"Correct":"Korriger"}</button>`:""}</footer>
        </article>`;
      }).join("") : `<p class="empty-state">${currentLanguage==="en"?"No Derby results have been registered yet.":"Ingen derbyresultater er registrert ennå."}</p>`;
    }

    const myHistory = $("myDerbyHistory");
    const ownRows = allResults.filter(row=>String(row.user_id)===String(current()?.id)).sort((a,b)=>{
      const aa=archives.find(x=>String(x.id)===String(a.archive_id));
      const bb=archives.find(x=>String(x.id)===String(b.archive_id));
      return new Date(bb?.started_at||0)-new Date(aa?.started_at||0);
    });
    if (myHistory) {
      myHistory.innerHTML = ownRows.length ? ownRows.map(row=>{
        const archive=archives.find(item=>String(item.id)===String(row.archive_id))||{};
        const status=resultStatusModel(row);
        return `<article class="member-history-card history-tone-${status.tone}">
          <div><span>${historyDate(archive.started_at || archive.ended_at)}</span><h3>${esc(tText(archive.derby_name || "Derby"))}</h3><small>${esc(archive.league || "")}${archive.placement?` · #${archive.placement}`:""}</small></div>
          <div class="member-history-score"><strong>${historyNumber(row.points_earned)} / ${historyNumber(row.possible_points)}</strong><span class="history-status history-status-${status.tone}">${status.label}</span></div>
          <div class="member-history-details"><span>${historyNumber(row.tasks_completed)} / ${historyNumber(row.tasks_used)} ${currentLanguage==="en"?"tasks completed":"oppgaver fullført"}</span>${status.extra?`<b>${currentLanguage==="en"?"Extra task used":"Ekstraoppgave brukt"}</b>`:""}${status.incomplete?`<b class="history-warning">${status.incomplete} ${currentLanguage==="en"?"task(s) not completed":"oppgave(r) ikke fullført"}</b>`:`<b class="history-complete">${currentLanguage==="en"?"All available tasks completed":"Alle tilgjengelige oppgaver fullført"}</b>`}</div>
        </article>`;
      }).join("") : `<p class="empty-state">${currentLanguage==="en"?"Your personal Derby history will appear here after the first result is registered.":"Din personlige derbyhistorikk vises her etter at første resultat er registrert."}</p>`;
    }

    const myAverage = ownRows.length ? ownRows.reduce((sum,row)=>sum+Math.min(100,Number(row.result_percent||0)),0)/ownRows.length : 0;
    setText("myHistoryDerbies",historyNumber(ownRows.length));
    setText("myHistoryAverage",ownRows.length?historyPercent(myAverage):"–");
    setText("myHistoryPerfect",historyNumber(ownRows.filter(row=>Number(row.result_percent||0)>=100).length));
    setText("myHistoryBelow",historyNumber(ownRows.filter(row=>Number(row.result_percent||0)<80).length));

    if (canViewLeadership) {
      const groups = new Map();
      allResults.forEach(row=>{
        const key=String(row.user_id || row.display_name_snapshot);
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(row);
      });
      const leaders=[...groups.values()].map(rows=>{
        rows.sort((a,b)=>{
          const aa=archives.find(x=>String(x.id)===String(a.archive_id));
          const bb=archives.find(x=>String(x.id)===String(b.archive_id));
          return new Date(bb?.started_at||0)-new Date(aa?.started_at||0);
        });
        const capped=rows.map(row=>Math.min(100,Number(row.result_percent||0)));
        return {
          name:rows[0]?.display_name_snapshot||"WGANG-medlem",count:rows.length,
          average:capped.reduce((a,b)=>a+b,0)/Math.max(1,capped.length),
          perfect:rows.filter(row=>Number(row.result_percent||0)>=100).length,
          below:rows.filter(row=>Number(row.result_percent||0)<80).length,
          incomplete:rows.reduce((sum,row)=>sum+incompleteTaskCount(row),0),
          trend:rows.length>1?capped[0]-capped[1]:null
        };
      }).sort((a,b)=>b.average-a.average||a.name.localeCompare(b.name,"nb"));
      const cappedAll=allResults.map(row=>Math.min(100,Number(row.result_percent||0)));
      const teamAverage=cappedAll.length?cappedAll.reduce((a,b)=>a+b,0)/cappedAll.length:0;
      const leaderMetrics=$("leaderHistoryMetrics");
      if(leaderMetrics)leaderMetrics.innerHTML=`<article><span>${currentLanguage==="en"?"Average":"Gjennomsnitt"}</span><strong>${cappedAll.length?historyPercent(teamAverage):"–"}</strong><small>${currentLanguage==="en"?"extra capped at 100%":"ekstra begrenset til 100 %"}</small></article><article><span>100 %</span><strong>${historyNumber(allResults.filter(row=>Number(row.result_percent||0)>=100).length)}</strong><small>${currentLanguage==="en"?"results":"resultater"}</small></article><article><span>${currentLanguage==="en"?"Below 80%":"Under 80 %"}</span><strong>${historyNumber(allResults.filter(row=>Number(row.result_percent||0)<80).length)}</strong><small>${currentLanguage==="en"?"results":"resultater"}</small></article><article><span>${currentLanguage==="en"?"Incomplete":"Ikke fullført"}</span><strong>${historyNumber(allResults.reduce((sum,row)=>sum+incompleteTaskCount(row),0))}</strong><small>${currentLanguage==="en"?"tasks":"oppgaver"}</small></article>`;
      const leaderTable=$("leaderHistoryTable");
      if(leaderTable)leaderTable.innerHTML=leaders.length?leaders.map(item=>{
        const trend=item.trend===null?"–":`${item.trend>0?"↑":item.trend<0?"↓":"→"} ${item.trend===0?"":historyPercent(Math.abs(item.trend))}`.trim();
        return `<tr><td><strong>${esc(item.name)}</strong></td><td>${item.count}</td><td>${historyPercent(item.average)}</td><td>${item.perfect}</td><td>${item.below}</td><td>${item.incomplete}</td><td><span class="history-trend ${item.trend>0?"up":item.trend<0?"down":"flat"}">${trend}</span></td></tr>`;
      }).join(""):`<tr><td colspan="7" class="empty-state">${currentLanguage==="en"?"No member results registered.":"Ingen medlemsresultater er registrert."}</td></tr>`;
    }
    $$('[data-correct-result]').forEach(button=>button.onclick=()=>openDerbyResultEditor(button.dataset.correctResult));
  }

  function resultEligibleEvents() {
    const now=Date.now();
    return (state.derbyManagement?.events || []).filter(event=>event.status==="completed" || (event.end_at && new Date(event.end_at).getTime()<=now));
  }

  function resultParticipants(eventId) {
    const event=(state.derbyManagement?.events || []).find(item=>String(item.id)===String(eventId));
    const rows=(state.derbyManagement?.participations || []).filter(row=>
      String(row.event_id)===String(eventId)
      && row.choice==="joined"
      && !!row.rules_acknowledged_at
      && row.rules_acknowledgement_version==="WGANG-DERBY-RULES-v1"
      && Number(row.acknowledged_max_points)===Number(event?.max_points)
    );
    return rows.map(row=>({row,account:state.accounts.find(a=>String(a.id)===String(row.user_id))})).sort((a,b)=>String(a.account?.name||"").localeCompare(String(b.account?.name||""),"nb"));
  }

  function renderResultManagement() {
    const box=$("resultRegistrationSummary"), button=$("openDerbyResultButton");
    if(!box||!button||!canManageDerbyResults())return;
    const eligible=resultEligibleEvents(), archives=derbyHistoryData().archives||[];
    const missing=eligible.filter(event=>!archives.some(archive=>String(archive.event_id)===String(event.id)));
    box.innerHTML=`<span><strong>${historyNumber(archives.length)}</strong><small>${currentLanguage==="en"?"registered results":"registrerte resultater"}</small></span><span><strong>${historyNumber(missing.length)}</strong><small>${currentLanguage==="en"?"completed Derbies missing results":"avsluttede derby mangler resultat"}</small></span>`;
    button.disabled=!eligible.length;
  }

  function openDerbyResultEditor(eventId=null) {
    if(!canManageDerbyResults())return;
    const events=resultEligibleEvents();
    if(!events.length){alert(currentLanguage==="en"?"No completed Derby is ready for result registration.":"Ingen avsluttede derby er klare for resultatregistrering ennå.");return;}
    const select=$("resultEventSelect");
    select.innerHTML=events.map(event=>{
      const archived=(derbyHistoryData().archives||[]).some(item=>String(item.event_id)===String(event.id));
      return `<option value="${event.id}">${esc(tText(event.name))} · ${historyDate(event.start_at)}${archived?` · ${currentLanguage==="en"?"registered":"registrert"}`:""}</option>`;
    }).join("");
    const firstMissing=events.find(event=>!(derbyHistoryData().archives||[]).some(item=>String(item.event_id)===String(event.id)));
    select.value=String(eventId || firstMissing?.id || events[0].id);
    populateDerbyResultEditor();
    showDialog(derbyResultDialog);
  }

  function populateDerbyResultEditor() {
    const event=(state.derbyManagement?.events||[]).find(item=>String(item.id)===String($("resultEventSelect")?.value));
    if(!event)return;
    const archive=(derbyHistoryData().archives||[]).find(item=>String(item.event_id)===String(event.id));
    const previous=archive?archiveResults(archive.id):[];
    const participants=resultParticipants(event.id);
    const previousParticipantIds=previous.map(item=>String(item.user_id||"")).sort();
    const currentParticipantIds=participants.map(item=>String(item.row.user_id||"")).sort();
    const participantBasisChanged=!!archive&&(
      previousParticipantIds.length!==currentParticipantIds.length
      || previousParticipantIds.some((id,index)=>!id||id!==currentParticipantIds[index])
    );
    setText("resultDialogTitle",archive?(currentLanguage==="en"?"Correct final result":"Korriger sluttresultat"):(currentLanguage==="en"?"Register final result":"Registrer sluttresultat"));
    $("resultLeague").value=archive?.league||"";
    $("resultPlacement").value=archive?.placement??"";
    $("resultNeighborhoodPoints").value=archive?.neighborhood_points??"";
    $("resultTrashedTasks").value=archive?.trashed_tasks??0;
    $("resultNotes").value=archive?.notes||"";
    const correctionWrap=$("resultCorrectionWrap"), correction=$("resultCorrectionReason");
    correctionWrap.classList.toggle("hidden",!archive);
    correction.required=!!archive; correction.value="";
    const memberBox=$("resultMemberRows");
    memberBox.innerHTML=participants.length?participants.map(({row,account})=>{
      const old=previous.find(item=>String(item.user_id)===String(row.user_id));
      const included=Number(event.task_total||0), maxExtra=Number(event.extra_tasks||0), points=Number(event.max_points||0);
      const extra=Number(old?.extra_tasks||0);
      const options=Array.from({length:maxExtra+1},(_,i)=>`<option value="${i}" ${i===extra?"selected":""}>${i}</option>`).join("");
      return `<article class="result-member-editor" data-result-user="${row.user_id}" data-included="${included}" data-points="${points}">
        <div class="result-member-heading"><div><strong>${esc(account?.name||old?.display_name_snapshot||"WGANG-medlem")}</strong><small>${historyNumber(included)} × ${historyNumber(points)} = ${historyNumber(included*points)} ${currentLanguage==="en"?"ordinary maximum":"ordinært maksimum"}</small></div><span class="result-member-preview">${currentLanguage==="en"?"Enter result":"Fyll inn resultat"}</span></div>
        <div class="result-member-fields"><label>${currentLanguage==="en"?"Extra tasks used":"Ekstraoppgaver brukt"}<select data-result-extra>${options}</select></label><label>${currentLanguage==="en"?"Completed tasks":"Fullførte oppgaver"}<input data-result-completed type="number" min="0" max="${included+extra}" value="${old?old.tasks_completed:""}" required></label><label>${currentLanguage==="en"?"Earned points":"Oppnådde poeng"}<input data-result-points type="number" min="0" value="${old?old.points_earned:""}" required></label></div>
        <p class="result-available-tasks"></p>
      </article>`;
    }).join(""):`<p class="empty-state">${currentLanguage==="en"?"No members confirmed participation for this Derby.":"Ingen medlemmer har bekreftet deltakelse i dette derbyet."}</p>`;
    const resultStatus=$("derbyResultStatus");
    if(resultStatus){
      resultStatus.classList.remove("success");
      resultStatus.textContent=participantBasisChanged
        ? (currentLanguage==="en"?"The participant list has changed since the result was registered. The history is locked and has not been changed.":"Deltakerlisten har endret seg etter registreringen. Historikken er låst og er ikke endret.")
        : "";
    }
    $("saveDerbyResult").disabled=!participants.length||participantBasisChanged;
    memberBox.querySelectorAll("input,select").forEach(input=>input.addEventListener("input",updateResultEditorCalculations));
    updateResultEditorCalculations();
  }

  function updateResultEditorCalculations() {
    let sum=0, complete=true;
    $$(".result-member-editor").forEach(card=>{
      const included=Number(card.dataset.included||0), pointsPerTask=Number(card.dataset.points||0);
      const extra=Number(card.querySelector("[data-result-extra]")?.value||0), available=included+extra;
      const completedInput=card.querySelector("[data-result-completed]"), pointsInput=card.querySelector("[data-result-points]");
      completedInput.max=String(available);
      const completed=completedInput.value===""?null:Number(completedInput.value), points=pointsInput.value===""?null:Number(pointsInput.value);
      pointsInput.max=String(Math.max(0,(completed||0)*pointsPerTask));
      if(points===null||completed===null)complete=false; else sum+=points;
      const possible=included*pointsPerTask, percent=possible&&points!==null?points*100/possible:0, incomplete=completed===null?0:Math.max(0,available-completed);
      const preview=card.querySelector(".result-member-preview");
      preview.textContent=points===null||completed===null?(currentLanguage==="en"?"Enter result":"Fyll inn resultat"):(percent>100?(currentLanguage==="en"?"100% + extra":"100 % + ekstra"):historyPercent(percent));
      preview.className=`result-member-preview ${points!==null&&percent>=100?"perfect":points!==null&&percent>=80?"minimum":points!==null?"below":""}`;
      card.querySelector(".result-available-tasks").textContent=`${currentLanguage==="en"?"Available":"Tilgjengelig"}: ${available} ${currentLanguage==="en"?"tasks":"oppgaver"}${incomplete?` · ${incomplete} ${currentLanguage==="en"?"not completed":"ikke fullført"}`:""}`;
    });
    setText("resultMemberPointSum",complete?historyNumber(sum):"–");
    const teamRaw=$("resultNeighborhoodPoints")?.value, difference=teamRaw===""?null:Number(teamRaw)-sum;
    const status=$("resultPointDifference");
    if(status){
      status.className="result-point-difference";
      if(!complete||difference===null)status.textContent=currentLanguage==="en"?"Enter every member result and the team total.":"Fyll inn alle medlemsresultater og lagets totalpoeng.";
      else if(difference===0){status.classList.add("match");status.textContent=currentLanguage==="en"?"The member total matches the team total.":"Medlemssummen stemmer med lagets totalpoeng.";}
      else {status.classList.add("mismatch");status.textContent=`${currentLanguage==="en"?"Difference":"Avvik"}: ${historyNumber(difference)} ${currentLanguage==="en"?"points":"poeng"}. ${currentLanguage==="en"?"Check the final screen before saving.":"Kontroller sluttbildet før du lagrer."}`;}
    }
  }

  function derbyResultPayload() {
    const event=(state.derbyManagement?.events||[]).find(item=>String(item.id)===String($("resultEventSelect")?.value));
    if(!event)throw new Error("Fant ikke derbyet.");
    const results=[...$$('.result-member-editor')].map(card=>{
      const included=Number(card.dataset.included||0), pointsPerTask=Number(card.dataset.points||0), extra=Number(card.querySelector("[data-result-extra]").value||0);
      const available=included+extra, completed=Number(card.querySelector("[data-result-completed]").value), points=Number(card.querySelector("[data-result-points]").value);
      if(!Number.isInteger(completed)||completed<0||completed>available)throw new Error(`Ugyldig antall fullførte oppgaver for ${card.querySelector("strong")?.textContent||"medlem"}.`);
      if(!Number.isInteger(points)||points<0||points>completed*pointsPerTask)throw new Error(`Ugyldig poengsum for ${card.querySelector("strong")?.textContent||"medlem"}.`);
      return {user_id:card.dataset.resultUser,extra_tasks_used:extra,tasks_completed:completed,points_earned:points};
    });
    return {eventId:event.id,league:$("resultLeague").value.trim(),placement:Number($("resultPlacement").value),neighborhoodPoints:Number($("resultNeighborhoodPoints").value),trashedTasks:Number($("resultTrashedTasks").value||0),notes:$("resultNotes").value.trim(),correctionReason:$("resultCorrectionReason").value.trim(),results};
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
    const canPost=type==="leadership" ? hasPermission("chat.leadership.post") : hasPermission("chat.community.post");
    const commentsHtml=comments.map(cm=>{
      const author=state.accounts.find(a=>String(a.id)===String(cm.user_id));
      const tr=currentLanguage==="en"?translationFor("comment",cm.id):null;
      const canDelete=String(cm.user_id)===String(current()?.id) || hasPermission("chat.moderate");
      return `<div class="social-comment" data-comment-id="${cm.id}"><div class="social-comment-head"><strong>${esc(author?.name||"WGANG")}</strong><small>${esc(formatDate(cm.created_at))}</small></div><p>${esc(tr?.body||cm.body)}</p>${canDelete?`<button class="text-button" data-delete-comment="${cm.id}">${currentLanguage==="en"?"Delete":"Slett"}</button>`:""}</div>`;
    }).join("");
    const commentForm=canPost?`<form class="social-comment-form" data-comment-form="${type}:${item.id}"><input maxlength="2000" placeholder="${currentLanguage==="en"?"Write a comment…":"Skriv en kommentar…"}" required><button class="button button-primary button-small" type="submit">${currentLanguage==="en"?"Post":"Publiser"}</button></form>`:"";
    return `<div class="social-bar"><button class="social-like ${liked?"active":""}" data-like-type="${type}" data-like-id="${item.id}" data-liked="${liked}" ${canPost?"":"disabled"}>👍🏼 <span>${likes.length}</span></button><button class="social-comment-toggle" data-comment-toggle="${type}:${item.id}">💬 <span>${comments.length}</span></button></div><div class="social-comments hidden" data-comments-for="${type}:${item.id}"><div class="social-comment-list">${commentsHtml||`<p class="empty-state">${currentLanguage==="en"?"No comments yet.":"Ingen kommentarer ennå."}</p>`}</div>${commentForm}</div>`;
  }
  function bindSocialActions(root=document) {
    root.querySelectorAll("[data-like-type]").forEach(btn=>btn.onclick=async()=>{
      const canReact=btn.dataset.likeType==="leadership" ? hasPermission("chat.leadership.post") : hasPermission("chat.community.post");
      if(!canReact)return;
      try { await backend.toggleLike(btn.dataset.likeType,btn.dataset.likeId,btn.dataset.liked==="true"); await refreshState(); } catch(e) { alert(humanError(e)); }
    });
    root.querySelectorAll("[data-comment-toggle]").forEach(btn=>btn.onclick=()=>root.querySelector(`[data-comments-for="${btn.dataset.commentToggle}"]`)?.classList.toggle("hidden"));
    root.querySelectorAll("[data-comment-form]").forEach(form=>form.onsubmit=async e=>{
      e.preventDefault(); const [type,id]=form.dataset.commentForm.split(":"); const input=form.querySelector("input"); if(!input.value.trim()) return;
      const canPost=type==="leadership" ? hasPermission("chat.leadership.post") : hasPermission("chat.community.post");
      if(!canPost)return;
      try { await backend.addComment(type,id,input.value.trim()); input.value=""; await refreshState(); } catch(err) { alert(humanError(err)); }
    });
    root.querySelectorAll("[data-delete-comment]").forEach(btn=>btn.onclick=async()=>{
      const comment=socialData().comments.find(x=>String(x.id)===String(btn.dataset.deleteComment));
      if(String(comment?.user_id)!==String(current()?.id) && !hasPermission("chat.moderate"))return;
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
    if(hasPermission("chat.leadership.view")) (state.leadershipMessages||[]).forEach(x=>ensureEnglishTranslation("leadership",x));
    (socialData().comments||[]).filter(x=>x.target_type!=="leadership" || hasPermission("chat.leadership.view")).forEach(x=>ensureEnglishTranslation("comment",x));
  }

  function postCard(item, options={}) {
    const category = item.category ? `<span class="content-category">${esc(tText(item.category))}</span>` : "";
    const actions = options.canModerate ? `<div class="content-actions"><button class="table-action" data-delete-content="${item.id}">${currentLanguage==="en"?"Delete":"Slett"}</button></div>` : "";
    const view=translatedContent("community",item);
    return `<article class="content-post" data-post-id="${item.id}"><h3>${esc(view.title)}</h3>${category}<p>${esc(view.body).replace(/\n/g,"<br>")}</p><footer><span>${esc(item.authorName || "WGANG")}</span><time>${esc(formatDate(item.publishedAt || item.createdAt))}</time>${actions}</footer>${socialBlock("community",item)}</article>`;
  }

  function renderContent() {
    const content = state.content || {announcements:[],derbyPosts:[],tips:[],pendingTips:[]};
    const announcementList = $("announcementList");
    const derbyPostList = $("derbyPostList");
    const tipsList = $("communityTipsList");
    const canModerate=hasPermission("chat.moderate");
    if (announcementList) announcementList.innerHTML = content.announcements.length ? content.announcements.map(x=>postCard(x,{canModerate})).join("") : `<p class="empty-state">Ingen kunngjøringer er publisert ennå.</p>`;
    if (derbyPostList) {
      const posts=content.derbyPosts||[];
      const seenAt=state.notificationReadState?.derby_chat_seen_at||"1970-01-01";
      const chronological=[...posts].sort((a,b)=>new Date(a.publishedAt||a.createdAt)-new Date(b.publishedAt||b.createdAt));
      const firstUnread=chronological.findIndex(x=>newerThan(x.publishedAt||x.createdAt,seenAt));
      derbyPostList.innerHTML=chronological.length?chronological.map((x,i)=>`${i===firstUnread?`<div class="chat-unread-divider" id="derbyChatUnreadStart">Nye innlegg</div>`:""}${postCard(x,{canModerate})}`).join(""):`<p class="empty-state">Ingen innlegg i Derbyprat ennå. Bli den første som deler noe.</p>`;
      const target=document.getElementById("derbyChatUnreadStart");
      if(target){const jump=()=>target.scrollIntoView({behavior:"auto",block:"center"});requestAnimationFrame(()=>requestAnimationFrame(jump));setTimeout(jump,350);setTimeout(jump,900);}
      else if(chronological.length){setTimeout(()=>derbyPostList.lastElementChild?.scrollIntoView({behavior:"auto",block:"end"}),350);}
    }
    if (tipsList) tipsList.innerHTML = content.tips.length ? content.tips.map(x=>postCard(x,{canModerate})).join("") : `<p class="empty-state">Ingen medlemstips er publisert ennå.</p>`;

    const latestNews = document.querySelector('[data-page="dashboard"] .dashboard-grid article:nth-child(2)');
    if (latestNews && content.announcements.length) {
      const a = content.announcements[0];
      latestNews.classList.remove("development-card");
      latestNews.innerHTML = `<div class="card-header"><div><p class="card-kicker">NABOLAGSNYTT</p><h2>${esc(a.title)}</h2></div></div><p>${esc(a.body)}</p><p class="helper-text">Publisert ${esc(formatDate(a.publishedAt))}</p><button class="text-button" data-route="discussions">Se alle kunngjøringer</button>`;
      latestNews.querySelector('[data-route="discussions"]').onclick = () => navigate("discussions");
    }

    if (hasPermission("content.pending.view")) {
      const pending = $("pendingTips");
      if (pending) pending.innerHTML = content.pendingTips.length ? content.pendingTips.map(t => `<div class="approval-card"><div><strong>${esc(t.title)}</strong><span>${esc(t.category || "Tips")} · fra ${esc(t.authorName)}</span><p>${esc(t.body)}</p></div><div class="approval-actions">${hasPermission("content.approve")?`<button class="button button-primary" data-tip-approve="${t.id}">Godkjenn</button>`:""}${hasPermission("content.reject")?`<button class="button button-secondary" data-tip-reject="${t.id}">Avslå</button>`:""}</div></div>`).join("") : `<p class="empty-state">Ingen tips venter på gjennomgang.</p>`;
      $$('[data-tip-approve]').forEach(b => b.onclick = async () => {
        if(!hasPermission("content.approve")) return alert("Du har ikke rettighet til å godkjenne innhold.");
        if (busy) return; setBusy(true);
        try { await backend.moderateContent(b.dataset.tipApprove,"published"); await refreshState(); } catch(e) { alert(humanError(e)); }
        setBusy(false);
      });
      $$('[data-tip-reject]').forEach(b => b.onclick = async () => {
        if(!hasPermission("content.reject")) return alert("Du har ikke rettighet til å avvise innhold.");
        if (busy) return; setBusy(true);
        try { await backend.moderateContent(b.dataset.tipReject,"rejected"); await refreshState(); } catch(e) { alert(humanError(e)); }
        setBusy(false);
      });
    }

    $$('[data-delete-content]').forEach(b => b.onclick = async () => {
      if (!hasPermission("chat.moderate") || !confirm(currentLanguage==="en"?"Delete this content?":"Slette dette innholdet?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteContent(b.dataset.deleteContent); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    bindSocialActions(document);
  }

  function renderLeadershipChat() {
    const list = $("leadershipMessageList");
    if(list && !list.dataset.userScrollBound){
      const markUserScroll=()=>{ list.dataset.userHasScrolled="1"; };
      list.addEventListener("touchstart",markUserScroll,{passive:true});
      list.addEventListener("wheel",markUserScroll,{passive:true});
      list.addEventListener("pointerdown",markUserScroll,{passive:true});
      list.dataset.userScrollBound="1";
    }
    if (!list) return;
    if (!hasPermission("chat.leadership.view")) { list.innerHTML = ""; return; }
    const messages = state.leadershipMessages || [];
    const readRow=(state.chatReadState||[]).find(x=>x.channel==="leadership");
    const lastReadAt=readRow?.last_read_at||"1970-01-01";
    const firstUnreadIndex=messages.findIndex(m=>m.userId!==current()?.id && newerThan(m.createdAt,lastReadAt));
    list.innerHTML = messages.length ? messages.map((m,i) => {
      const own = m.userId === current()?.id;
      const canDelete = own || hasPermission("chat.moderate");
      const view=translatedContent("leadership",m); const unreadMark=i===firstUnreadIndex?`<div class="chat-unread-divider" id="leadershipUnreadStart">Nye innlegg</div>`:""; return `${unreadMark}<article class="leadership-message ${own ? "own" : ""}" data-message-id="${m.id}"><div class="leadership-message-head"><strong>${esc(m.authorName)}</strong><small>${esc(formatDate(m.createdAt))}</small></div><p>${esc(view.body)}</p>${canDelete ? `<div class="leadership-message-tools"><button class="text-button" data-leadership-delete="${m.id}">${currentLanguage==="en"?"Delete":"Slett"}</button></div>` : ""}${socialBlock("leadership",m)}</article>`;
    }).join("") : `<p class="empty-state">Ingen meldinger ennå. Start planleggingen her.</p>`;
    if(firstUnreadIndex>=0){
      const newerCount=messages.length-firstUnreadIndex;
      if(newerCount>1){
        const jump=document.createElement("button");jump.type="button";jump.className="chat-newer-indicator";jump.textContent=`↓ ${newerCount-1} nyere innlegg`;jump.onclick=()=>list.lastElementChild?.scrollIntoView({behavior:"smooth",block:"end"});list.appendChild(jump);
      }
      // Position the first unread message once. Do not keep forcing the
      // scroll position after the user starts reading a long message.
      const unreadMessageId=messages[firstUnreadIndex]?.id;
      const unreadKey=String(unreadMessageId||"");
      if(unreadKey && list.dataset.positionedUnreadId!==unreadKey && list.dataset.userHasScrolled!=="1"){
        const jumpToUnreadOnce=()=>{
          const target=document.getElementById("leadershipUnreadStart");
          if(!target) return;
          const listRect=list.getBoundingClientRect();
          const targetRect=target.getBoundingClientRect();
          const relativeTop=targetRect.top-listRect.top+list.scrollTop;
          const desiredTop=Math.max(0,relativeTop-Math.min(90,list.clientHeight*.22));
          list.scrollTo({top:desiredTop,behavior:"auto"});
          list.dataset.positionedUnreadId=unreadKey;
        };
        requestAnimationFrame(()=>requestAnimationFrame(jumpToUnreadOnce));
      }
      const latest=messages[messages.length-1];
      setTimeout(async()=>{try{await backend.markChatRead("leadership",latest?.id,latest?.createdAt||new Date().toISOString());state.chatReadState=state.chatReadState||[];const r=state.chatReadState.find(x=>x.channel==="leadership");if(r){r.last_read_at=latest?.createdAt;r.last_message_id=latest?.id;}else state.chatReadState.push({channel:"leadership",last_read_at:latest?.createdAt,last_message_id:latest?.id});renderNotifications();}catch(e){console.warn(e);}},1500);
    }
    translateUi(list);
    $$('[data-leadership-delete]').forEach(button => button.onclick = async () => {
      const message=messages.find(x=>String(x.id)===String(button.dataset.leadershipDelete));
      if(String(message?.userId)!==String(current()?.id) && !hasPermission("chat.moderate"))return;
      if (!confirm(currentLanguage === "en" ? "Delete this message?" : "Slette denne meldingen?")) return;
      if (busy) return; setBusy(true);
      try { await backend.deleteLeadershipMessage(button.dataset.leadershipDelete); await refreshState(); } catch(e) { alert(humanError(e)); }
      setBusy(false);
    });
    bindSocialActions(list);
  }

  function renderAdmin() {
    if (!canAccessAdmin()) return;
    applyPermissionVisibility();
    const pending = state.accounts.filter(a => a.status === "pending");
    const all = approved();
    const canHandleApplications=hasAnyPermission(["members.approve","members.reject"]);
    const canManageMembers=hasAnyPermission(["members.view","members.change_role","members.remove"]);
    const canViewDerbyStatus=hasPermission("derby.settings.publish");
    if($("pendingMembers")) $("pendingMembers").innerHTML = canHandleApplications ? (pending.length ? pending.map(a => `<div class="approval-item"><div><strong>${esc(a.name)}</strong><small>Hay Day-navn</small></div><div class="approval-actions">${hasPermission("members.approve")?`<button class="button button-primary button-small" data-approve="${a.id}">Godkjenn</button>`:""}${hasPermission("members.reject")?`<button class="button button-small button-danger" data-reject="${a.id}">Avslå</button>`:""}</div></div>`).join("") : `<p class="empty-state">Ingen søknader venter på godkjenning.</p>`) : "";
    if($("accountAdminTable")) $("accountAdminTable").innerHTML = canManageMembers ? all.map(a => {
      const lockedOwner = a.role === "owner" && !isOwner();
      const ownAccount = a.id === current().id;
      const ownerOption = isOwner() ? `<option value="owner" ${a.role === "owner" ? "selected" : ""}>Eier</option>` : (a.role === "owner" ? `<option value="owner" selected>Eier</option>` : "");
      return `<tr><td><strong>${esc(a.name)}</strong></td><td><select class="role-select" data-role-id="${a.id}" ${!hasPermission("members.change_role") || ownAccount || lockedOwner ? "disabled" : ""}><option value="member" ${a.role === "member" ? "selected" : ""}>Medlem</option><option value="senior" ${a.role === "senior" ? "selected" : ""}>Senior</option><option value="assistant_leader" ${a.role === "assistant_leader" ? "selected" : ""}>Ass. leder</option><option value="admin" ${a.role === "admin" ? "selected" : ""}>Administrator</option>${ownerOption}</select></td><td>${choiceLabel(a.choice)}</td><td>${a.id === current().id ? `<span class="logout-note">Din konto</span>` : (hasPermission("members.remove")?`<button class="table-action" data-remove="${a.id}">Fjern</button>`:"")}</td></tr>`;
    }).join("") : "";
    const counts = {joined:0,pause:0,unsure:0,waiting:0};
    all.forEach(a => counts[a.choice] = (counts[a.choice] || 0) + 1);
    if($("adminStatusGrid")) $("adminStatusGrid").innerHTML = canViewDerbyStatus ? [["Deltar",counts.joined],["Tar pause",counts.pause],["Usikker",counts.unsure],["Mangler svar",counts.waiting]].map(x => `<article><span>${x[0]}</span><strong>${x[1]}</strong><small>medlemmer</small></article>`).join("") : "";
    if($("adminResponseBadge")) $("adminResponseBadge").textContent = canViewDerbyStatus ? (all.length - counts.waiting) + " av " + all.length + " svar" : "";
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
  let permissionDraft=null;
  function permissionValue(role,key){
    const def=PERMISSION_DEFINITIONS.find(x=>x.key===key);
    if(def?.ownerOnly&&role!=="owner")return false;
    const row=(state.permissions?.rolePermissions||[]).find(x=>x.role===role&&x.permission_key===key);
    return row ? !!row.enabled : defaultPermissionValue(def,role);
  }
  function beginPermissionEdit(){
    permissionDraft={};
    EDITABLE_PERMISSION_ROLES.forEach(role=>PERMISSION_DEFINITIONS.filter(p=>!p.ownerOnly).forEach(p=>permissionDraft[`${role}|${p.key}`]=permissionValue(role,p.key)));
    permissionEditMode=true; renderPermissionMatrix();
  }
  function cancelPermissionEdit(){permissionEditMode=false;permissionDraft=null;renderPermissionMatrix();}
  async function savePermissionDraft(){
    if(!isOwner()||!permissionDraft)return;
    const changes=[];
    EDITABLE_PERMISSION_ROLES.forEach(role=>PERMISSION_DEFINITIONS.filter(p=>!p.ownerOnly).forEach(p=>{
      const before=permissionValue(role,p.key), after=!!permissionDraft[`${role}|${p.key}`];
      if(before!==after)changes.push({role,key:p.key,label:p.label,before,after});
    }));
    if(!changes.length){cancelPermissionEdit();return;}
    const summary=changes.map(c=>`${roleLabel(c.role)} – ${c.label}: ${c.before?"På":"Av"} → ${c.after?"På":"Av"}`).join("\n");
    if(!confirm(`Lagre endringer i rettigheter?\n\n${changes.length} rettighet${changes.length===1?"":"er"} endres:\n\n${summary}`))return;
    try{
      for(const c of changes)await backend.saveRolePermission(c.role,c.key,c.after);
      permissionEditMode=false;permissionDraft=null;await refreshState();
    }catch(e){alert(humanError(e));}
  }
  function renderPermissionMatrix(){
    const body=$("permissionMatrixBody"), audit=$("permissionAudit"), card=$("permissionsMatrixCard");
    if(!body)return;
    if(!hasPermission("permissions.view")){body.innerHTML="";return;}
    let currentGroup="";
    body.innerHTML=PERMISSION_DEFINITIONS.map(p=>{
      const groupRow=p.group!==currentGroup ? (currentGroup=p.group,`<tr class="permission-group-row"><th colspan="6">${esc(p.group)}</th></tr>`) : "";
      const cell=(role)=>{
        const enabled=role==="owner"?true:(permissionEditMode&&permissionDraft?!!permissionDraft[`${role}|${p.key}`]:permissionValue(role,p.key));
        if(role==="owner")return `<td><span class="permission-lock">✓ 🔒</span></td>`;
        if(p.ownerOnly)return `<td><span class="permission-lock permission-no">– 🔒</span></td>`;
        if(permissionEditMode&&isOwner())return `<td><label class="permission-switch"><input type="checkbox" data-permission-role="${role}" data-permission-key="${p.key}" ${enabled?"checked":""}><span>${enabled?"✓":"–"}</span></label></td>`;
        return `<td><strong class="${enabled?"permission-yes":"permission-no"}">${enabled?"✓":"–"}</strong></td>`;
      };
      return groupRow+`<tr><td>${esc(p.label)}</td>${cell("owner")}${cell("admin")}${cell("assistant_leader")}${cell("senior")}${cell("member")}</tr>`;
    }).join("");
    body.querySelectorAll("[data-permission-key]").forEach(input=>input.onchange=()=>{if(!permissionDraft)return;permissionDraft[`${input.dataset.permissionRole}|${input.dataset.permissionKey}`]=input.checked;renderPermissionMatrix();});
    let controls=card?.querySelector(".permission-edit-controls");
    if(card&&!controls){controls=document.createElement("div");controls.className="permission-edit-controls";card.querySelector(".card-header")?.after(controls);}
    if(controls)controls.innerHTML=isOwner()?(permissionEditMode?`<button class="button button-secondary" id="cancelPermissionEdit">Avbryt</button><button class="button button-primary" id="savePermissionEdit">Lagre endringer</button>`:`<button class="button button-secondary" id="startPermissionEdit">Rediger rettigheter</button>`):"";
    card?.querySelector("#startPermissionEdit")?.addEventListener("click",beginPermissionEdit);
    card?.querySelector("#cancelPermissionEdit")?.addEventListener("click",cancelPermissionEdit);
    card?.querySelector("#savePermissionEdit")?.addEventListener("click",savePermissionDraft);
    const old=card?.querySelector("#togglePermissionEdit");if(old)old.style.display="none";
    if(audit){
      const rows=state.permissions?.audit||[];
      audit.innerHTML=hasPermission("history.permission_audit")&&rows.length?`<h3>Siste rettighetsendringer</h3>${rows.slice(0,10).map(r=>{const actor=state.accounts.find(a=>String(a.id)===String(r.changed_by));const def=PERMISSION_DEFINITIONS.find(x=>x.key===r.permission_key);return `<div class="permission-audit-row"><strong>${esc(roleLabel(r.role))}: ${esc(def?.label||r.permission_key)}</strong><span>${r.old_value===null?"Standard":(r.old_value?"På":"Av")} → ${r.new_value?"På":"Av"} · ${esc(actor?.name||"Eier")} · ${esc(formatDate(r.changed_at))}</span></div>`;}).join("")}`:"";
    }
  }
  function progress() {
    const done = +taskRange.value, total = +taskRange.max, percent = total ? done/total*100 : 0;
    $("tasksDone").textContent = done; $("tasksTotal").textContent = total;
    $("dashboardTasksDone").textContent = done; $("dashboardTasksTotal").textContent = total;
    $("derbyProgress").style.width = percent + "%"; $("dashboardProgress").style.width = percent + "%";
  }

  function derbyDashboardPhase(event) {
    const p = bunnyOsloParts();
    const osloDay = new Date(Date.UTC(p.y,p.mo-1,p.d)).getUTCDay();
    const mins = p.h * 60 + (p.mi || 0);

    // Fast WGANG-fokus:
    // Søndag 18:00 -> tirsdag 10:00 = neste derby/påmelding.
    // Denne regelen har prioritet selv om forrige derby fortsatt teknisk pågår.
    const planning =
      (osloDay === 0 && mins >= 18*60) ||
      osloDay === 1 ||
      (osloDay === 2 && mins < 10*60);

    if (planning) return "planning";

    const now = new Date();
    if (event?.start_at) {
      const start = new Date(event.start_at);
      const end = event.end_at ? new Date(event.end_at) : null;
      if (!Number.isNaN(start.getTime()) && now >= start &&
          (!end || Number.isNaN(end.getTime()) || now < end)) return "active";
      if (!Number.isNaN(start.getTime()) && now < start) return "planning";
    }
    return "active";
  }

  let derbyPhaseWatcherKey = "";
  function currentDerbyPhaseWatcherKey(){
    const p=bunnyOsloParts();
    const day=new Date(Date.UTC(p.y,p.mo-1,p.d)).getUTCDay();
    const mins=p.h*60+(p.mi||0);
    const planning=(day===0&&mins>=18*60)||day===1||(day===2&&mins<10*60);
    return `${p.y}-${p.mo}-${p.d}:${planning?"planning":"active"}`;
  }
  async function checkDerbyPhaseBoundary(){
    const key=currentDerbyPhaseWatcherKey();
    if(!derbyPhaseWatcherKey){derbyPhaseWatcherKey=key;return;}
    if(key===derbyPhaseWatcherKey)return;
    derbyPhaseWatcherKey=key;
    try{await refreshState();}catch(e){console.warn("Kunne ikke oppdatere derbyfase:",e);}
  }
  setInterval(checkDerbyPhaseBoundary,30000);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){
      checkDerbyPhaseBoundary();
      refreshState().catch(e=>console.warn("Kunne ikke oppdatere derby ved gjenåpning:",e));
    }
  });

  let dashboardCountdownTimer = null;

  function dashboardCountdownTarget(event) {
    if (event?.start_at) {
      const start = new Date(event.start_at);
      if (!Number.isNaN(start.getTime()) && start > new Date()) return start;
    }
    // Reserve: neste tirsdag kl. 10:00. Portalen brukes i Norge, og derbytid følger Europe/Oslo.
    const osloNow = new Date(new Date().toLocaleString("en-US", {timeZone:"Europe/Oslo"}));
    const target = new Date(osloNow);
    const day = target.getDay();
    let days = (2 - day + 7) % 7;
    if (days === 0 && target.getHours() >= 10) days = 7;
    target.setDate(target.getDate() + days);
    target.setHours(10,0,0,0);
    return new Date(target.getTime() + (new Date().getTime() - osloNow.getTime()));
  }

  function formatDashboardCountdown(ms) {
    if (ms <= 0) return "Starter nå";
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days} d ${hours} t ${minutes} min`;
    if (hours > 0) return `${hours} t ${minutes} min`;
    return `${Math.max(1, minutes)} min`;
  }

  function startDashboardCountdown(event, visible, bunny) {
    if (dashboardCountdownTimer) clearInterval(dashboardCountdownTimer);
    dashboardCountdownTimer = null;
    const wrap = $("dashboardCountdownWrap"), value = $("dashboardCountdown"), label = $("dashboardCountdownLabel");
    if (!wrap || !value || !label || !visible) { if (wrap) wrap.classList.add("hidden"); return; }
    const target = dashboardCountdownTarget(event);
    wrap.classList.remove("hidden");
    label.textContent = bunny ? "Neste harepus starter om" : "Derbyet starter om";
    const paint=()=>{ value.textContent = formatDashboardCountdown(target.getTime() - Date.now()); };
    paint();
    dashboardCountdownTimer = setInterval(paint, 30000);
  }

  let bunnyDashboardTimer = null;
  let bunnyRoundRows = [];
  let bunnyScheduleRows = [];
  let bunnyRoundEventId = null;

  function bunnyRoundStarts(event) {
    let derbyStart = event?.start_at ? new Date(event.start_at) : null;
    if (!derbyStart || Number.isNaN(derbyStart.getTime())) derbyStart = dashboardCountdownTarget(null);
    return [6, 36, 84].map(hours => new Date(derbyStart.getTime() + hours * 3600000));
  }

  function bunnyClock(ms) {
    ms=Math.max(0,ms);
    const total=Math.floor(ms/1000), days=Math.floor(total/86400), hours=Math.floor((total%86400)/3600), mins=Math.floor((total%3600)/60), secs=total%60;
    if(days>0) return `${days} d ${String(hours).padStart(2,"0")} : ${String(mins).padStart(2,"0")} : ${String(secs).padStart(2,"0")}`;
    return `${String(hours).padStart(2,"0")} : ${String(mins).padStart(2,"0")} : ${String(secs).padStart(2,"0")}`;
  }

  function bunnyTimeLabel(date) {
    return new Intl.DateTimeFormat("nb-NO",{timeZone:"Europe/Oslo",weekday:"long",hour:"2-digit",minute:"2-digit"}).format(date).replace(/^./,c=>c.toUpperCase());
  }

  function bunnyRoundModel(event) {
    const starts=bunnyRoundStarts(event), now=Date.now();
    const completed=new Set((bunnyRoundRows||[]).map(x=>Number(x.round_number)));
    const taken=completed.size;
    const round=[1,2,3].find(n=>!completed.has(n)) || 4;
    if(round===4) return {done:true,taken,round:3};
    const automaticSpawn=starts[round-1];
    const override=(bunnyScheduleRows||[]).find(x=>Number(x.round_number)===round);
    const overrideAt=override?.next_bunny_at ? new Date(override.next_bunny_at) : null;
    const hasOverride=!!(overrideAt && !Number.isNaN(overrideAt.getTime()));
    const spawn=hasOverride ? overrideAt : automaticSpawn;
    if(now<spawn.getTime()) return {done:false,taken,round,mode:"round_wait",target:spawn,spawn,hasOverride};
    const elapsed=now-spawn.getTime(), interval=90*60000, active=10*60000;
    const cycle=Math.floor(elapsed/interval);
    const cycleStart=new Date(spawn.getTime()+cycle*interval);
    if(now<cycleStart.getTime()+active) return {done:false,taken,round,mode:"active",target:new Date(cycleStart.getTime()+active),cycleStart,spawn,hasOverride};
    return {done:false,taken,round,mode:"bunny_wait",target:new Date(cycleStart.getTime()+interval),spawn,hasOverride};
  }

  let bunnyPlannerCycleKey="";
  let bunnyPlannerSyncing=false;
  function bunnyPlannerCycle(event){
    const m=bunnyRoundModel(event);if(m.done)return null;
    const start=m.mode==="active"?m.cycleStart:m.target;if(!start)return null;
    const s=new Date(start),e=new Date(s.getTime()+10*60000);
    return {eventId:event?.id||null,round:m.round,start:s,end:e,key:`${event?.id||"event"}:${m.round}:${s.toISOString()}`};
  }
  async function syncBunnyPlannerCycle(event,force=false){
    const c=bunnyPlannerCycle(event);if(!c?.eventId||bunnyPlannerSyncing)return;
    if(!force&&c.key===bunnyPlannerCycleKey)return;
    bunnyPlannerSyncing=true;
    try{await backend.syncBunnyPlannerCycle(c.eventId,c.round,c.key,c.start.toISOString(),c.end.toISOString());bunnyPlannerCycleKey=c.key;bunnyData=await backend.getBunnyData();renderBunny();}
    catch(e){console.warn("Kunne ikke synkronisere harepusplan",e);}finally{bunnyPlannerSyncing=false;}
  }

  function paintBunnyDashboard(event) {
    const panel=$("bunnyDashboardPanel"); if(!panel)return;
    const m=bunnyRoundModel(event), value=$("bunnyCountdownValue"), kicker=$("bunnyCountdownKicker"), start=$("bunnyCountdownStart"), duration=$("bunnyCountdownDuration"), btn=$("bunnyRoundCompleteButton"), manualStatus=$("bunnyManualStatus"), manualClear=$("bunnyManualClear");
    if($("bunnyRoundNumber")) $("bunnyRoundNumber").textContent=`${m.round} av 3`;
    if($("bunnyRoundsTaken")) $("bunnyRoundsTaken").textContent=`${m.taken} av 3`;
    if(m.done){
      kicker.textContent="ALLE HAREPUSENE ER TATT"; value.textContent="✓ 3 / 3"; start.textContent="Denne ukens harepusmål er fullført"; duration.textContent="Ingen flere harepusrunder"; if(btn)btn.classList.add("hidden"); return;
    }
    if(btn){btn.classList.remove("hidden");btn.textContent=`✓ Harepus ${m.round} tatt – avslutt runde`;btn.dataset.round=String(m.round);}
    if(manualClear) manualClear.classList.toggle("hidden",!m.hasOverride);
    if(manualStatus) manualStatus.textContent=m.hasOverride ? `Manuelt tidspunkt er aktivt for runde ${m.round}. Videre harepust beregnes automatisk hvert 1,5 time fra dette tidspunktet.` : "Automatisk beregning er aktiv.";
    if(m.mode==="active"){
      kicker.textContent="🐰 HAREPUST PÅGÅR"; value.textContent=bunnyClock(m.target.getTime()-Date.now()); start.textContent=`Runde ${m.round} er aktiv nå`; duration.textContent="10 minutter harepust";
    } else if(m.mode==="round_wait"){
      kicker.textContent=`NESTE HAREPUS – RUNDE ${m.round}`; value.textContent=bunnyClock(m.target.getTime()-Date.now()); start.textContent=`Starter ${bunnyTimeLabel(m.target)}`; duration.textContent=m.hasOverride?"Tidspunkt justert manuelt av leder":(m.round===1?"Første harepus åpner 6 t etter derbystart":`Estimert rundestart · kan justeres av leder`);
    } else {
      kicker.textContent="NESTE HAREPUST"; value.textContent=bunnyClock(m.target.getTime()-Date.now()); start.textContent=`Starter kl. ${new Intl.DateTimeFormat("nb-NO",{timeZone:"Europe/Oslo",hour:"2-digit",minute:"2-digit"}).format(m.target)}`; duration.textContent=m.hasOverride?"Manuelt synkronisert · deretter hvert 1,5 t":"Varer i 10 min · ny harepust hvert 1,5 t";
    }
  }

  async function renderBunnyDashboard(event, bunny, active) {
    const panel=$("bunnyDashboardPanel"), note=$("dashboardDevelopmentNote");
    if(bunnyDashboardTimer){clearInterval(bunnyDashboardTimer);bunnyDashboardTimer=null;}
    if(!panel)return;
    const show=!!(bunny&&active); panel.classList.toggle("hidden",!show); if(note)note.classList.toggle("hidden",show);
    if(!show)return;
    bunnyRoundEventId=event?.id||null;
    try{[bunnyRoundRows,bunnyScheduleRows]=await Promise.all([backend.getBunnyRoundState(bunnyRoundEventId),backend.getBunnyRoundSchedule(bunnyRoundEventId)]);}catch(e){console.warn("Harepusstatus kunne ikke hentes",e);bunnyRoundRows=[];bunnyScheduleRows=[];}
    await syncBunnyPlannerCycle(event,true);
    paintBunnyDashboard(event);
    bunnyDashboardTimer=setInterval(()=>{paintBunnyDashboard(event);syncBunnyPlannerCycle(event);},1000);
    const btn=$("bunnyRoundCompleteButton");
    if(btn)btn.onclick=async()=>{
      const round=Number(btn.dataset.round); if(!round||!hasPermission("derby.board.update"))return; if(!bunnyRoundEventId){alert("Pågående derby mangler Derby-ID. Publiser derbyet i Derbyadministrasjon først.");return;}
      if(!confirm(`Bekreft at harepus ${round} er tatt. Da avsluttes denne runden for alle medlemmer.`))return;
      btn.disabled=true;
      try{await backend.completeBunnyRound(bunnyRoundEventId,round);bunnyRoundRows=await backend.getBunnyRoundState(bunnyRoundEventId);paintBunnyDashboard(event);}catch(e){alert(humanError(e,"Kunne ikke lagre harepusstatus. Kontroller at SQL-oppdateringen er kjørt."));}
      btn.disabled=false;
    };
    const save=$("bunnyManualSave"), clear=$("bunnyManualClear"), input=$("bunnyManualNextAt");
    if(save) save.onclick=async()=>{
      if(!hasPermission("derby.board.update")||!bunnyRoundEventId)return; const model=bunnyRoundModel(event); const raw=input?.value; if(!raw){alert("Velg dato og klokkeslett for neste harepust.");return;}
      const nextAt=new Date(raw); if(Number.isNaN(nextAt.getTime())){alert("Tidspunktet er ikke gyldig.");return;}
      if(!confirm(`Sett neste harepust i runde ${model.round} til ${bunnyTimeLabel(nextAt)}? Deretter fortsetter automatikken hvert 1,5 time.`))return;
      save.disabled=true; try{await backend.setBunnyRoundSchedule(bunnyRoundEventId,model.round,nextAt.toISOString());bunnyScheduleRows=await backend.getBunnyRoundSchedule(bunnyRoundEventId);paintBunnyDashboard(event);}catch(e){alert(humanError(e,"Kunne ikke lagre manuelt harepusttidspunkt. Kontroller at SQL-oppdateringen er kjørt."));} save.disabled=false;
    };
    if(clear) clear.onclick=async()=>{
      if(!hasPermission("derby.board.update")||!bunnyRoundEventId)return; const model=bunnyRoundModel(event); if(!confirm(`Fjerne manuell tidsjustering for runde ${model.round} og gå tilbake til automatisk beregning?`))return;
      clear.disabled=true; try{await backend.clearBunnyRoundSchedule(bunnyRoundEventId,model.round);bunnyScheduleRows=await backend.getBunnyRoundSchedule(bunnyRoundEventId);paintBunnyDashboard(event);}catch(e){alert(humanError(e,"Kunne ikke fjerne tidsjusteringen."));} clear.disabled=false;
    };
  }

  function renderDashboardDerbyFocus(d, event) {
    const phase = derbyDashboardPhase(event);
    const active = phase === "active";
    const rawType = d.type || "Derby";
    const type = /^Standard Derby$/i.test(rawType) ? "Normal Derby" : rawType;
    const shortType = type.replace(/\s*Derby$/i, "");
    const bunny = /bunny|harepus/i.test(type);

    const spotlight=$("dashboardDerbySpotlight");
    if (spotlight) spotlight.classList.toggle("bunny-focus", bunny);
    setText("dashboardDerbyIcon", bunny ? "🐰" : "◇");
    setText("dashboardDerbyPhase", active ? "PÅGÅENDE DERBY" : (bunny ? "🐰 CHILL BUNNY DERBY" : "NESTE DERBY"));
    setText("dashboardIntro", active ? "Her er det viktigste for derbyet som pågår nå." : (bunny ? "Gjør deg klar til neste harepus." : `Her er det viktigste i planleggingen mot ${type}.`));
    if (bunny && !active) setText("dashboardDerbyType", "Planlegg neste harepus");
    setText("dashboardDerbyFocusText", active
      ? (bunny ? "Harepus-derbyet er i gang. Bruk oppslagstavla for å koordinere klargjorte oppgaver og se hva naboene planlegger." : "Derbyet er i gang. Strategi og koordinering er nå hovedfokus.")
      : (bunny ? "Gjør oppgavene klare på forhånd og se hvilke oppgaver flest planlegger å ta." : "Påmelding til neste derby er hovedfokus. Bekreft om du deltar eller tar pause før fristen."));
    setText("dashboardDerbyAction", bunny ? "Åpne oppslagstavla" : "Åpne derby-senter");
    const dashboardDerbyActionEl=$("dashboardDerbyAction");
    if(dashboardDerbyActionEl) dashboardDerbyActionEl.dataset.route=bunny ? "preferences" : "derby";
    startDashboardCountdown(event, !active, bunny);
    renderBunnyDashboard(event, bunny, active);
    renderNormalDerbyCompletion();
    setText("dashboardStatusHint", active ? "status for pågående derby" : "kan endres frem til fristen");
    setText("dashboardDeadlineLabel", active ? "Derbystatus" : "Svarfrist");
    setText("dashboardDeadline", active ? "Pågår nå" : "Mandag kl. 23:00");
    setText("dashboardDeadlineHint", active ? type : "svar gjerne innen fristen");
    setText("dashboardDerbyMetricLabel", active ? "Pågående derby" : "Neste derby");
    setText("dashboardNextDerbyName", shortType);
    setText("dashboardDerbyMetricHint", active ? "startet tirsdag kl. 10" : "oppstart tirsdag kl. 10");
  }

  function currentActiveDerbyEvent() {
    const events=Array.isArray(state.derbyManagement?.events)?state.derbyManagement.events:[];
    const now=Date.now();
    const currentByTime=events
      .filter(event=>{
        const start=event?.start_at?new Date(event.start_at).getTime():NaN;
        const end=event?.end_at?new Date(event.end_at).getTime():NaN;
        return Number.isFinite(start) && now>=start && (!Number.isFinite(end)||now<end);
      })
      .sort((a,b)=>new Date(b.start_at||0)-new Date(a.start_at||0))[0];
    if(currentByTime)return currentByTime;
    const activeByStatus=events
      .filter(event=>event?.status==="active")
      .sort((a,b)=>new Date(b.start_at||0)-new Date(a.start_at||0))[0];
    if(activeByStatus)return activeByStatus;
    const fallback=state.derbyManagement?.next;
    return fallback && derbyDashboardPhase(fallback)==="active" ? fallback : null;
  }

  function activeNormalDerby() {
    const event=currentActiveDerbyEvent();
    return !!(event && derbyDashboardPhase(event)==="active" && /normal|standard/i.test(String(event.name||"")));
  }

  function renderNormalDerbyCompletion() {
    const user=current();
    const visible=!!(user && user.choice==="joined" && activeNormalDerby());
    const completed=!!user?.derbyCompleted;
    const dashboardButton=$("dashboardDerbyComplete");
    const derbyCard=$("normalDerbyCompletionCard");
    if(dashboardButton){
      dashboardButton.classList.toggle("hidden",!visible);
      dashboardButton.classList.toggle("is-completed",completed);
      dashboardButton.innerHTML=completed
        ? '<span class="completion-main">Ferdig registrert ✓</span><span class="completion-sub">Angre valg?</span>'
        : 'Jeg er ferdig';
    }
    derbyCard?.classList.toggle("hidden",!visible);
    setText("normalDerbyCompletionTitle",completed?"Du er registrert som ferdig":"Har du fullført ukens oppgaver?");
    setText("normalDerbyCompletionText",completed?"Oppgavepreferansene dine teller ikke lenger i den aktive statistikken for dette derbyet.":"Når du registrerer deg som ferdig, tas oppgavepreferansene dine ut av den aktive statistikken for dette derbyet.");
    const button=$("derbyCompleteButton");
    if(button){
      button.classList.toggle("button-ghost",completed);
      button.classList.toggle("is-completed",completed);
      button.innerHTML=completed
        ? '<span class="completion-main">Ferdig registrert ✓</span><span class="completion-sub">Angre valg?</span>'
        : 'Jeg er ferdig med ukens oppgaver';
    }
    setText("derbyCompletionStatus",completed&&user.derbyCompletedAt?`Registrert ${new Date(user.derbyCompletedAt).toLocaleString("nb-NO")}.`:"");
    const preferenceList=$("preferenceList");
    if(preferenceList) preferenceList.classList.toggle("preferences-inactive",visible&&completed);
  }

  async function toggleNormalDerbyCompletion() {
    if(busy||!current()||!activeNormalDerby()||current().choice!=="joined") return;
    const user=current(), next=!user.derbyCompleted;
    const message=next
      ? "Registrere at du er ferdig med ukens oppgaver? Oppgavepreferansene dine tas da ut av den aktive statistikken."
      : "Angre ferdigstatus? Oppgavepreferansene dine tas da med i den aktive statistikken igjen.";
    if(!confirm(message)) return;
    setBusy(true);
    try{
      await backend.setDerbyCompleted(user.id,next);
      user.derbyCompleted=next;user.derbyCompletedAt=next?new Date().toISOString():null;
      renderNormalDerbyCompletion();renderAdminPreferences();renderMembers();
    }catch(e){alert(humanError(e,"Kunne ikke oppdatere ferdigstatus."));}
    setBusy(false);
  }

  function renderTaskHubContext(){
    const event=state.derbyManagement?.next;
    const type=String(event?.name||state.derby?.type||"Normal Derby");
    const bunny=/bunny|harepus/i.test(type), derbyScope=preferenceDerbyScope(type), preferenceBased=!!derbyScope;
    $("standardTaskHub")?.classList.toggle("hidden",!preferenceBased);
    $("bunnyTaskHub")?.classList.toggle("hidden",!bunny);
    $("genericTaskHub")?.classList.toggle("hidden",preferenceBased||bunny);
    if(bunny){setText("taskHubEyebrow","HAREPUS DERBY");setText("taskHubTitle","Oppgaver i neste harepus");setText("taskHubIntro","Planlegg oppgavene sammen og se felles interesse før neste harepus.");}
    else if(preferenceBased){setText("taskHubEyebrow",derbyScope.eyebrow);setText("taskHubTitle","Oppgaver");setText("taskHubIntro","Oppgavepreferansene hjelper lederne å velge hva som bør beholdes eller slettes.");setText("preferenceTaskHubKicker",derbyScope.eyebrow);}
    else{setText("taskHubEyebrow",type.toUpperCase());setText("taskHubTitle",`Oppgaver – ${type}`);setText("taskHubIntro","Oppgaveområdet tilpasses derbytypen som pågår.");setText("genericTaskHubTitle",`Oppgaver for ${type}`);}
  }

  function derbyCommitmentDetails() {
    const event = state.derbyManagement?.next;
    const eventName = String(event?.name || state.derby?.type || "Normal Derby");
    const includedTasks = Math.max(0, Number(event?.task_total || state.derby?.taskTotal || 0));
    const extraTasks = Math.max(0, Number(event?.extra_tasks || 0));
    const pointsPerTask = Math.max(0, Number(event?.max_points || state.derby?.maxPoints || 320));
    const baseMaximum = includedTasks * pointsPerTask;
    return {
      eventName: /^Standard Derby$/i.test(eventName) ? "Normal Derby" : eventName,
      includedTasks,
      extraTasks,
      pointsPerTask,
      baseMaximum,
      minimumPoints: Math.ceil(baseMaximum * 0.8)
    };
  }

  function derbyCommitmentNumber(value) {
    return new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "nb-NO").format(Number(value || 0));
  }

  function renderParticipationCommitment(details=derbyCommitmentDetails()) {
    setText("participationPointsCommitment", `${derbyCommitmentNumber(details.pointsPerTask)} ${currentLanguage === "en" ? "points" : "poeng"}`);
    setText("participationMinimumCommitment", `${derbyCommitmentNumber(details.minimumPoints)} ${currentLanguage === "en" ? "points (80%)" : "poeng (80 %)"}`);
  }

  function updateParticipationConfirmationState() {
    const checks = [...document.querySelectorAll("[data-participation-rule]")];
    const confirmButton = $("confirmDerbyParticipation");
    if (confirmButton) confirmButton.disabled = busy || !checks.length || !checks.every(input => input.checked);
  }

  function openParticipationConfirmation() {
    if (participationDeadlineState().locked) {
      renderParticipationLock();
      alert(currentLanguage === "en" ? "The response deadline has passed. Your Derby response cannot be changed." : "Svarfristen er utløpt. Det går ikke an å registrere eller endre derby-svaret.");
      return;
    }
    const details = derbyCommitmentDetails();
    const number = derbyCommitmentNumber;
    $("derbyParticipationForm")?.reset();
    setText("participationDialogTitle", currentLanguage === "en" ? `Confirm participation in ${tText(details.eventName)}` : `Bekreft deltakelse i ${details.eventName}`);
    setText("participationDialogIntro", currentLanguage === "en" ? "Read and tick every item before your response can be saved." : "Les og kryss av hvert punkt før svaret kan lagres.");
    setText("participationDialogDerbyName", currentLanguage === "en" ? tText(details.eventName) : details.eventName);
    setText("participationDialogTarget", `${number(details.baseMaximum)} ${currentLanguage === "en" ? "points" : "poeng"}`);
    setText("participationDialogMinimum", `${number(details.minimumPoints)} ${currentLanguage === "en" ? "points" : "poeng"}`);
    setText("participationRulePoints", currentLanguage === "en"
      ? `I only choose tasks worth ${number(details.pointsPerTask)} points (the maximum per task for this Derby).`
      : `Jeg velger bare oppgaver med ${number(details.pointsPerTask)} poeng (makspoeng per oppgave i dette derbyet).`);
    setText("participationRuleTarget", currentLanguage === "en"
      ? `I understand that WGANG's goal is 100% (${number(details.baseMaximum)} points) and the minimum is 80% (${number(details.minimumPoints)} points).`
      : `Jeg forstår at WGANGs mål er 100 % (${number(details.baseMaximum)} poeng) og minimum er 80 % (${number(details.minimumPoints)} poeng).`);
    setText("participationDialogStatus", "");
    updateParticipationConfirmationState();
    showDialog(derbyParticipationDialog);
  }

  function participationDeadlineState() {
    const event = state.derbyManagement?.next;
    if (!event) return { locked:false, deadline:null };
    const deadline = event.signup_deadline ? new Date(event.signup_deadline) : null;
    const start = event.start_at ? new Date(event.start_at) : null;
    const now = new Date();
    const locked = event.status === "active" || (deadline && !Number.isNaN(deadline.getTime()) && now >= deadline) || (start && !Number.isNaN(start.getTime()) && now >= start);
    return { locked:!!locked, deadline };
  }

  function renderParticipationLock() {
    const {locked, deadline} = participationDeadlineState();
    const canPlan=hasPermission("derby.plan");
    $$(".choice-button").forEach(button => {
      button.disabled = locked || !canPlan;
      button.setAttribute("aria-disabled", String(locked || !canPlan));
      button.title = !canPlan ? "Rollen din har ikke tilgang til derbyplanlegging." : (locked ? "Svarfristen er utløpt. Svaret kan ikke registreres eller endres." : "");
    });
    const status = $("participationStatus");
    if (locked && status) {
      const suffix = deadline ? ` (${new Intl.DateTimeFormat("nb-NO",{weekday:"long",hour:"2-digit",minute:"2-digit"}).format(deadline)})` : "";
      status.textContent = `Svarfristen er utløpt${suffix}. Registrert svar er låst og kan ikke endres.`;
    }
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
    $("derbyType").textContent = /^Standard Derby$/i.test(d.type) ? "Normal Derby" : d.type; $("dashboardDerbyType").textContent = /^Standard Derby$/i.test(d.type) ? "Normal Derby" : d.type;
    renderDashboardDerbyFocus(d, next);
    renderTaskHubContext();
    const phase = derbyDashboardPhase(next);
    const startText = $("nextDerbyStart"); if (startText) startText.textContent = phase === "active" ? "Pågår nå" : (d.startAt ? `Starter ${formatDate(d.startAt)}` : "Starter tirsdag kl. 10:00");
    $("derbyTaskTotalLabel").textContent = d.taskTotal || "–"; $("derbyMaxPoints").textContent = d.maxPoints || "–";
    const includedTasks = Number(d.taskTotal || 0);
    const extraTasks = Number(d.extraTasks || 0);
    const pointsPerTask = Number(d.maxPoints || 0);
    const baseMaximum = includedTasks * pointsPerTask;
    const extraMaximum = (includedTasks + extraTasks) * pointsPerTask;
    const number = value => new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "nb-NO").format(value || 0);
    renderParticipationCommitment();
    setText("derbyIncludedTasks", number(includedTasks));
    setText("derbyPointsPerTask", number(pointsPerTask));
    setText("derbyBaseMaximum", number(baseMaximum));
    setText("derbyExtraMaximum", number(extraMaximum));
    setText("derbyTargetTitle", currentLanguage === "en" ? `${number(baseMaximum)} points without an extra task` : `${number(baseMaximum)} poeng uten ekstraoppgave`);
    setText("derbyTargetExplanation", currentLanguage === "en"
      ? `The goal is 100% (${number(baseMaximum)} points). WGANG's minimum is 80% (${number(Math.ceil(baseMaximum * 0.8))} points).${extraTasks ? ` With ${extraTasks} extra task${extraTasks === 1 ? "" : "s"}, the maximum possible score is ${number(extraMaximum)} points.` : ""}`
      : `Målet er 100 % (${number(baseMaximum)} poeng). WGANGs minimum er 80 % (${number(Math.ceil(baseMaximum * 0.8))} poeng).${extraTasks ? ` Med ${extraTasks} ekstraoppgave${extraTasks === 1 ? "" : "r"} er mulig maksimum ${number(extraMaximum)} poeng.` : ""}`);
    $("derbyStrategy").innerHTML = (d.strategy || []).map(x => `<li>${esc(tText(x))}</li>`).join("") || `<li>${esc(tText("Strategi publiseres av admin før derbyet starter."))}</li>`;
    const info = $("nextDerbyInfo");
    if (info) {
      const rules = (d.rules || []).map(x=>`<li>${esc(tText(x))}</li>`).join("");
      const dailyQuota = d.dailyTaskLimit
        ? (currentLanguage === "en"
          ? `<p><strong>Daily quota:</strong> ${d.dailyTaskLimit} tasks${d.extraTasks ? ` + ${d.extraTasks} extra` : ""}</p>`
          : `<p><strong>Daglig kvote:</strong> ${d.dailyTaskLimit} oppgaver${d.extraTasks ? ` + ${d.extraTasks} ekstra` : ""}</p>`)
        : "";
      info.innerHTML = `${d.description ? `<p>${esc(tText(d.description))}</p>` : ""}${dailyQuota}${rules ? `<ul class="strategy-list">${rules}</ul>` : ""}`;
    }
    taskRange.max = d.taskTotal || 9;
    if (+taskRange.value > taskRange.max) taskRange.value = taskRange.max;
    progress();
    renderParticipationLock();
  }

  function renderDerbyManagement() {
    if (!hasPermission("derby.settings.publish")) {
      renderAdminActions();
      return;
    }
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
    const pendingMembers = hasAnyPermission(["members.approve","members.reject"]) ? state.accounts.filter(a=>a.status==="pending").length : 0;
    const pendingTips = hasPermission("content.pending.view") ? (state.content?.pendingTips?.length || 0) : 0;
    const total = pendingMembers + pendingTips;
    const badge = $("notificationBadge"); if (badge) { badge.textContent = total; badge.classList.toggle("hidden", total===0); }
    const list = $("adminActionList");
    if (list) list.innerHTML = total ? `${pendingMembers ? `<button class="action-item" data-action-admin="applications"><strong>${pendingMembers}</strong><span>medlemsforespørsel${pendingMembers===1?"":"er"} venter</span></button>`:""}${pendingTips ? `<button class="action-item" data-action-admin="actions"><strong>${pendingTips}</strong><span>tips venter på godkjenning</span></button>`:""}` : `<p class="empty-state">Ingen saker krever handling akkurat nå.</p>`;
    $$("[data-action-admin]").forEach(b=>b.onclick=()=>showAdminModule(b.dataset.actionAdmin));
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
  $("joinMembershipButton").onclick = () => openAuth("register");
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

  if (legalAcceptanceDialog) {
    legalAcceptanceDialog.addEventListener("cancel", event => event.preventDefault());
  }
  if ($("legalAcceptanceForm")) $("legalAcceptanceForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    const msg=$("legalAcceptanceMessage"); msg.textContent="";
    if (!$("legalAcceptanceConfirm")?.checked) {
      msg.textContent="Du må bekrefte før du kan fortsette.";
      return;
    }
    setBusy(true);
    try {
      const accepted=await backend.acceptLegalDocuments();
      state.legalAcceptance=accepted;
      closeDialog(legalAcceptanceDialog);
      document.body.classList.remove("modal-open");
      $("legalAcceptanceForm").reset();
      openPortal();
    } catch(error) {
      msg.textContent=humanError(error,"Kunne ikke registrere bekreftelsen.");
    }
    setBusy(false);
  };

  $("registerForm").onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    const msg = $("registerMessage"); msg.classList.remove("success"); msg.textContent = "";
    if (!$("legalConfirm")?.checked) {
      msg.textContent = "Du må lese personverninformasjonen og godta bruksreglene før søknaden sendes.";
      return;
    }
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
  const dashboardDerbyAction=$("dashboardDerbyAction");
  if($("dashboardDerbyComplete")) $("dashboardDerbyComplete").onclick=toggleNormalDerbyCompletion;
  if($("derbyCompleteButton")) $("derbyCompleteButton").onclick=toggleNormalDerbyCompletion;
  // Route is set dynamically in renderDashboard(): Harepus -> Oppgaver, otherwise -> Derby.

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
      in_app_derby_deadline_reminders:!!$("notifyPersonalDerbyReminder")?.checked,
      in_app_social_activity:!!$("notifySocialActivity")?.checked,
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
    ["profileHubMenu","profileHubNotifications","profileHubSettings","profileHubProfile","profileHubAccount","profileHubPrivacy"].forEach(id=>{
      const el=$(id);
      if(el){ el.classList.add("hidden"); el.setAttribute("aria-hidden","true"); }
    });
    const map={menu:"profileHubMenu",notifications:"profileHubNotifications",settings:"profileHubSettings",profile:"profileHubProfile",account:"profileHubAccount",privacy:"profileHubPrivacy"};
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
    if(section==="privacy"){
      const versions=typeof backend.legalVersions==="function" ? backend.legalVersions() : {privacy:"2026-07-29",rules:"2026-07-29"};
      if($("legalDocumentVersion")) $("legalDocumentVersion").textContent=versions.privacy===versions.rules ? versions.privacy : `${versions.privacy} / ${versions.rules}`;
      const accepted=state.legalAcceptance;
      if($("legalAcceptanceStatus")){
        if(accepted?.acknowledged_at){
          const date=new Date(accepted.acknowledged_at);
          $("legalAcceptanceStatus").textContent=Number.isNaN(date.getTime()) ? "Bekreftet" : `Bekreftet ${date.toLocaleString("nb-NO",{dateStyle:"medium",timeStyle:"short"})}`;
        }else{
          $("legalAcceptanceStatus").textContent="Ikke registrert";
        }
      }
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
    if (busy || !hasPermission("chat.leadership.post")) return;
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

  document.querySelectorAll("[data-participation-rule]").forEach(input => {
    input.onchange = updateParticipationConfirmationState;
  });

  if ($("derbyParticipationForm")) $("derbyParticipationForm").onsubmit = async event => {
    event.preventDefault();
    if (busy || !current() || !hasPermission("derby.plan")) return;
    const checks = [...document.querySelectorAll("[data-participation-rule]")];
    if (!checks.length || !checks.every(input => input.checked)) {
      setText("participationDialogStatus", currentLanguage === "en" ? "Tick every item before confirming." : "Kryss av alle punktene før du bekrefter.");
      updateParticipationConfirmationState();
      return;
    }
    if (participationDeadlineState().locked) {
      closeDialog(derbyParticipationDialog);
      renderParticipationLock();
      alert(currentLanguage === "en" ? "The response deadline has passed. Your Derby response cannot be changed." : "Svarfristen er utløpt. Det går ikke an å registrere eller endre derby-svaret.");
      return;
    }
    const user = current();
    setBusy(true);
    updateParticipationConfirmationState();
    setText("participationDialogStatus", currentLanguage === "en" ? "Saving your confirmation …" : "Lagrer bekreftelsen …");
    try {
      await backend.setParticipation(user.id, "joined", {accepted:true});
      await refreshState();
      closeDialog(derbyParticipationDialog);
    } catch(error) {
      setText("participationDialogStatus", humanError(error, currentLanguage === "en" ? "Could not save the confirmation." : "Kunne ikke lagre bekreftelsen."));
    }
    setBusy(false);
    updateParticipationConfirmationState();
  };

  $$(".choice-button").forEach(button => button.onclick = async () => {
    if (busy || !current() || !hasPermission("derby.plan")) return;
    if (participationDeadlineState().locked) {
      renderParticipationLock();
      alert("Svarfristen er utløpt. Det går ikke an å registrere eller endre derby-svar etter fristen.");
      return;
    }
    const user = current(), choice = button.dataset.choice;
    if (choice === "joined") {
      openParticipationConfirmation();
      return;
    }
    setBusy(true);
    try { await backend.setParticipation(user.id, choice); await refreshState(); } catch(e) { alert(humanError(e)); }
    setBusy(false);
  });

  taskRange.oninput = progress;
  $("finishDerby").onclick = () => { taskRange.value = taskRange.max; progress(); $("derbyStatus").value = "Ferdig"; $("finishStatus").textContent = "Ferdig registrert " + new Date().toLocaleString("nb-NO") + "."; };
  function openDerbyEditorDialog() {
    if(!hasPermission("derby.settings.publish"))return;
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
    if (busy || !hasPermission("derby.settings.publish")) return;
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

  if ($("openDerbyResultButton")) $("openDerbyResultButton").onclick = () => openDerbyResultEditor();
  if ($("resultEventSelect")) $("resultEventSelect").onchange = populateDerbyResultEditor;
  if ($("resultNeighborhoodPoints")) $("resultNeighborhoodPoints").addEventListener("input",updateResultEditorCalculations);
  if ($("derbyResultForm")) $("derbyResultForm").onsubmit = async event => {
    event.preventDefault();
    if(busy||!canManageDerbyResults())return;
    const status=$("derbyResultStatus"); status.textContent=""; status.classList.remove("success");
    try {
      const payload=derbyResultPayload();
      if(!payload.league)throw new Error("Fyll inn liga.");
      if(!Number.isInteger(payload.placement)||payload.placement<1)throw new Error("Fyll inn en gyldig plassering.");
      if(!Number.isInteger(payload.neighborhoodPoints)||payload.neighborhoodPoints<0)throw new Error("Fyll inn lagets totalpoeng.");
      if(!Number.isInteger(payload.trashedTasks)||payload.trashedTasks<0)throw new Error("Antall tapte oppgaver kan ikke være negativt.");
      const archive=(derbyHistoryData().archives||[]).find(item=>String(item.event_id)===String(payload.eventId));
      if(archive&&payload.correctionReason.length<5)throw new Error("Skriv en kort begrunnelse for korreksjonen.");
      const memberTotal=payload.results.reduce((sum,row)=>sum+row.points_earned,0);
      if(memberTotal!==payload.neighborhoodPoints&&!confirm(`Medlemssummen er ${historyNumber(memberTotal)} poeng, mens lagets total er ${historyNumber(payload.neighborhoodPoints)} poeng. Vil du lagre det kontrollerte avviket?`))return;
      setBusy(true); status.textContent=currentLanguage==="en"?"Saving the complete result …":"Lagrer hele resultatet …";
      await backend.saveDerbyResult(payload);
      await refreshState();
      closeDialog(derbyResultDialog);
      $("derbyResultForm").reset();
      navigate("history");
      alert(archive?(currentLanguage==="en"?"The correction was saved and logged.":"Korreksjonen er lagret og loggført."):(currentLanguage==="en"?"The Derby result was saved.":"Derbyresultatet er lagret."));
    } catch(error) {
      status.textContent=humanError(error,currentLanguage==="en"?"Could not save the Derby result.":"Kunne ikke lagre derbyresultatet.");
    } finally {
      setBusy(false);
    }
  };

  $$('[data-close-dialog]').forEach(button => button.onclick = () => closeDialog($(button.dataset.closeDialog)));
  if($("bunnyAmountMinus")) $("bunnyAmountMinus").onclick=()=>{$("bunnyEditAmount").value=Math.max(1,(Number($("bunnyEditAmount").value)||1)-1);updateBunnyEditorPreview();};
  if($("bunnyAmountPlus")) $("bunnyAmountPlus").onclick=()=>{$("bunnyEditAmount").value=(Number($("bunnyEditAmount").value)||1)+1;updateBunnyEditorPreview();};
  if($("bunnyEditAmount")) $("bunnyEditAmount").oninput=updateBunnyEditorPreview;
  if($("bunnyTaskEditorForm")) $("bunnyTaskEditorForm").onsubmit=async e=>{e.preventDefault();if(!hasPermission("derby.task_library.edit"))return;const id=$("bunnyEditTaskId").value,name=$("bunnyEditName").value.trim(),category=$("bunnyEditCategory").value.trim(),description=$("bunnyEditDescription").value.trim(),amount=Number($("bunnyEditAmount").value);if(!name||!category||!description||!amount)return;const status=$("bunnyTaskEditorStatus");status.textContent="Lagrer …";try{await backend.updateBunnyTask(id,{name,category,description,amount});$("bunnyTaskEditorDialog").close();await loadBunny();}catch(err){status.textContent=humanError(err);}};

  if ($("openAnnouncementForm")) $("openAnnouncementForm").onclick = () => { if(!hasPermission("content.approve"))return; $("announcementForm").reset(); $("announcementMessage").textContent=""; showDialog(announcementDialog); };
  if ($("openDerbyPostForm")) $("openDerbyPostForm").onclick = () => { if(!hasPermission("chat.community.post"))return; $("derbyPostForm").reset(); $("derbyPostMessage").textContent=""; showDialog(derbyPostDialog); };
  if ($("openTipForm")) $("openTipForm").onclick = () => { adminTipMode=false; $("tipForm").reset(); $("tipDialogTitle").textContent="Send inn tips"; $("tipSubmitButton").textContent="Send til godkjenning"; $("tipMessage").textContent=""; showDialog(tipDialog); };
  if ($("openAdminTipForm")) $("openAdminTipForm").onclick = () => { if(!hasPermission("content.approve"))return; adminTipMode=true; $("tipForm").reset(); $("tipDialogTitle").textContent="Publiser tips"; $("tipSubmitButton").textContent="Publiser tips"; $("tipMessage").textContent=""; showDialog(tipDialog); };

  if ($("announcementForm")) $("announcementForm").onsubmit = async e => {
    e.preventDefault(); if (busy || !hasPermission("content.approve")) return;
    setBusy(true);
    try { await backend.createContent("announcement", $("announcementTitle").value.trim(), $("announcementBody").value.trim(), "", true); closeDialog(announcementDialog); e.target.reset(); await refreshState(); }
    catch(err) { $("announcementMessage").textContent=humanError(err); }
    setBusy(false);
  };

  if ($("derbyPostForm")) $("derbyPostForm").onsubmit = async e => {
    e.preventDefault(); if (busy || !hasPermission("chat.community.post")) return;
    setBusy(true);
    try { await backend.createContent("derby", $("derbyPostTitle").value.trim(), $("derbyPostBody").value.trim(), "", true); closeDialog(derbyPostDialog); e.target.reset(); await refreshState(); }
    catch(err) { $("derbyPostMessage").textContent=humanError(err); }
    setBusy(false);
  };

  if ($("tipForm")) $("tipForm").onsubmit = async e => {
    e.preventDefault(); if (busy || (adminTipMode && !hasPermission("content.approve"))) return;
    setBusy(true);
    try {
      const publishNow=adminTipMode && hasPermission("content.approve");
      await backend.createContent("tip", $("tipTitle").value.trim(), $("tipBody").value.trim(), $("tipCategory").value, publishNow);
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
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=0.18.0.61").catch(console.error));
    navigator.serviceWorker.addEventListener("message",event=>{
      const d=event.data||{};
      if(d.type!=="WGANG_NOTIFICATION_FOCUS") return;
      openNotificationTarget(d.route||"dashboard",d.entryId||null,d.commentId||null);
    });
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






/* v0.18.0.15 – scroll the chat container itself, not the whole page */
(function(){
  const configs = [
    // Lederprat handles its own one-time unread positioning in renderLeadershipChat().
    // Keep the stabilizer only for community chat.
    { route:"community",  listId:"communityMessageList",  unreadId:"communityUnreadStart"  }
  ];

  function activeRoute(){
    try{
      if(typeof currentRoute==="function") return currentRoute();
    }catch(_){}
    return (location.hash||"").replace(/^#/,"").split(/[/?]/)[0] || "";
  }

  function getScrollableAncestor(el){
    let node = el?.parentElement;
    while(node && node !== document.body){
      const style = getComputedStyle(node);
      const oy = style.overflowY;
      if((oy==="auto" || oy==="scroll") && node.scrollHeight > node.clientHeight + 2){
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function targetFor(cfg){
    const list = document.getElementById(cfg.listId);
    if(!list) return null;

    const unread = document.getElementById(cfg.unreadId);
    if(unread) return unread;

    const messages = [...list.querySelectorAll(
      "article,.leadership-message,.chat-message,.message"
    )];

    return messages.length ? messages[messages.length-1] : list.lastElementChild;
  }

  function scrollInsideContainer(cfg){
    const list = document.getElementById(cfg.listId);
    const target = targetFor(cfg);
    if(!list || !target) return false;

    // In Lederprat the list itself is the scrollable element.
    const container =
      (list.scrollHeight > list.clientHeight + 2 ? list : null) ||
      getScrollableAncestor(target);

    if(!container) return false;

    // Position "NYE INNLEGG" / latest message near the upper third of the chat viewport.
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const currentTop = container.scrollTop;
    const relativeTop = targetRect.top - containerRect.top + currentTop;
    const desiredTop = Math.max(0, relativeTop - Math.min(90, container.clientHeight * 0.22));

    container.scrollTo({ top: desiredTop, behavior:"auto" });
    return true;
  }

  function stabilize(cfg){
    if(activeRoute() !== cfg.route) return;

    let runs = 0;
    const doScroll = ()=>{
      if(activeRoute() !== cfg.route) return;
      const ok = scrollInsideContainer(cfg);
      runs++;
      if(ok && runs < 8){
        // Retry only inside the chat container while layout settles.
        setTimeout(doScroll, runs < 3 ? 100 : 220);
      }
    };

    doScroll();
    setTimeout(doScroll, 250);
    setTimeout(doScroll, 650);
    setTimeout(doScroll, 1200);

    if(document.fonts?.ready){
      document.fonts.ready.then(()=>setTimeout(doScroll,50)).catch(()=>{});
    }
  }

  function run(){
    configs.forEach(stabilize);
  }

  document.addEventListener("DOMContentLoaded",()=>setTimeout(run,120));
  window.addEventListener("load",()=>setTimeout(run,100));
  window.addEventListener("hashchange",()=>setTimeout(run,180));

  document.addEventListener("click",e=>{
    const nav=e.target.closest?.("[data-route],a[href^='#']");
    if(nav) setTimeout(run,220);
  });

  const observer = new MutationObserver(mutations=>{
    if(!mutations.some(m=>m.addedNodes?.length)) return;
    const cfg = configs.find(c=>c.route===activeRoute());
    if(cfg) setTimeout(()=>stabilize(cfg),80);
  });

  observer.observe(document.body,{childList:true,subtree:true});
})();

// v0.18.0.39 – push setting controls
document.addEventListener("click",e=>{
  if(e.target?.id==="enablePushNotifications") enablePushNotifications();
  if(e.target?.id==="disablePushNotifications") disablePushNotifications();
});
