/* v0.18.0.67 – Power-påmelding, felles ferdigstatus og teknisk fristmargin */
(function () {
  "use strict";

  const STORAGE_KEY = "wgangPortalV080";
  const TASK_TYPES = (window.ROOSTER_DATA && window.ROOSTER_DATA.taskTypes) || ["Hvete","Mais","Gulrot","Bønner","Sukkererter","Jordbær","Potet","Tomat","Annen høsting","Melk","Bacon","Egg","Ull","Geitemelk","Mate dyr","Produksjonsoppgaver","Lastebiloppgaver","Båtoppgaver","Besøkende","Spesifikke personer","Spesifikke hus","Fiskeoppgaver","Gruveoppgaver","Hjelpeoppgaver","Produkter","Dyr","Transportmidler","Annet"];
  const DEFAULT_DERBY = {
    type: "Standard Derby",
    taskTotal: 9,
    maxPoints: 320,
    strategy: [
      "Ta kun oppgaver med 320 poeng i Standard Derby.",
      "Admin rydder bort oppgaver nabolaget sjelden ønsker, slik at tavla holdes i bevegelse.",
      "Bruk medlemmenes oppgavepreferanser for å vite hvilke 320-oppgaver som bør få stå litt."
    ]
  };
  const EMPTY_LOCAL_STATE = {
    accounts: [],
    derby: DEFAULT_DERBY,
    content: { announcements: [], derbyPosts: [], tips: [], pendingTips: [] },
    derbyManagement: { templates: [], events: [], participations: [], next: null, current: null, upcoming: null },
    derbyHistory: { archives: [], results: [], changeLog: [] },
    legalAcceptance: null,
    currentUserId: null
  };

  const cfg = window.WGANG_SUPABASE || {};
  const configured = Boolean(cfg.url && cfg.anonKey && window.supabase && window.supabase.createClient);
  const LEGAL_PRIVACY_VERSION = "2026-07-29";
  const LEGAL_RULES_VERSION = "2026-07-29";
  const DERBY_RULES_ACK_VERSION = "WGANG-DERBY-RULES-v1";
  const initialHashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const initialQueryParams = new URLSearchParams(window.location.search);
  const initialAuthType = initialHashParams.get("type") || initialQueryParams.get("type") || "";
  const client = configured ? window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }) : null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function derbyOsloClock(now=new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone:"Europe/Oslo", weekday:"short", hour:"2-digit", minute:"2-digit", hourCycle:"h23"
    }).formatToParts(now).filter(part => part.type !== "literal").map(part => [part.type,part.value]));
    return {
      weekday:{Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.weekday],
      minutes:Number(parts.hour || 0) * 60 + Number(parts.minute || 0)
    };
  }

  function selectDerbyContexts(events, now=new Date()) {
    const rows = Array.isArray(events) ? events : [];
    const nowMs = now.getTime();
    const byNewest = (a,b) => new Date(b.start_at || 0) - new Date(a.start_at || 0);
    const bySoonest = (a,b) => new Date(a.start_at || 0) - new Date(b.start_at || 0);
    const currentByTime = rows.filter(event => {
      const start = event?.start_at ? new Date(event.start_at).getTime() : NaN;
      const end = event?.end_at ? new Date(event.end_at).getTime() : NaN;
      return Number.isFinite(start) && nowMs >= start && (!Number.isFinite(end) || nowMs < end);
    }).sort(byNewest)[0] || null;
    const current = currentByTime || rows.filter(event => {
      if(event?.status !== "active")return false;
      const start=event?.start_at?new Date(event.start_at).getTime():NaN;
      const end=event?.end_at?new Date(event.end_at).getTime():NaN;
      return (!Number.isFinite(start)||nowMs>=start)&&(!Number.isFinite(end)||nowMs<end);
    }).sort(byNewest)[0] || null;
    const upcoming = rows.filter(event => {
      const start = event?.start_at ? new Date(event.start_at).getTime() : NaN;
      return event?.status === "published" && Number.isFinite(start) && start > nowMs;
    }).sort(bySoonest)[0] || null;
    const clock = derbyOsloClock(now);
    const planning = (clock.weekday === 0 && clock.minutes >= 18 * 60)
      || clock.weekday === 1
      || (clock.weekday === 2 && clock.minutes < 10 * 60);
    return {current,upcoming,next:planning ? (upcoming || current) : (current || upcoming),planning};
  }

  function derbyParticipationLockAt(event) {
    if (!event) return null;
    const visibleDeadline = event.signup_deadline ? new Date(event.signup_deadline).getTime() : NaN;
    const start = event.start_at ? new Date(event.start_at).getTime() : NaN;
    if (Number.isFinite(start)) {
      const tuesdayGraceLock = start - (2 * 60 * 60 * 1000);
      const requestedLock = Number.isFinite(visibleDeadline) ? Math.max(visibleDeadline,tuesdayGraceLock) : tuesdayGraceLock;
      return new Date(Math.min(requestedLock,start));
    }
    return Number.isFinite(visibleDeadline) ? new Date(visibleDeadline) : null;
  }
  function localLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(EMPTY_LOCAL_STATE);
      const parsed = JSON.parse(raw);
      // Fjern tidligere demo/testkontoer fra lokal nettleserlagring.
      const blocked = new Set(["admin@wgang.no","nabo@wgang.no","sol@wgang.no"]);
      if (Array.isArray(parsed.accounts)) parsed.accounts = parsed.accounts.filter(a => !blocked.has(String(a.email || "").toLowerCase()));
      if (parsed.currentUserId && !parsed.accounts?.some(a => a.id === parsed.currentUserId)) parsed.currentUserId = null;
      parsed.derbyManagement = parsed.derbyManagement || { templates: [], events: [], next: null, current: null, upcoming: null };
      parsed.derbyManagement.participations = parsed.derbyManagement.participations || [];
      Object.assign(parsed.derbyManagement,selectDerbyContexts(parsed.derbyManagement.events || []));
      parsed.derbyHistory = parsed.derbyHistory || { archives: [], results: [], changeLog: [] };
      return parsed;
    } catch (_) { return clone(EMPTY_LOCAL_STATE); }
  }
  function localSave(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  let localState = localLoad();

  async function getAuthUser() {
    if (!configured) return null;
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user || null;
  }

  async function savePushSubscription(subscription, platform) {
    const user = await getAuthUser();
    if (!user?.id) throw new Error("Du må være innlogget.");
    const json = subscription.toJSON ? subscription.toJSON() : subscription;
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const authKey = json.keys?.auth;
    if (!endpoint || !p256dh || !authKey) throw new Error("Ugyldig push-abonnement.");
    const { error } = await client.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth: authKey,
      user_agent: navigator.userAgent || null,
      platform: platform || null,
      enabled: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "endpoint" });
    if (error) throw error;
    return true;
  }

  async function removePushSubscription(endpoint) {
    const user = await getAuthUser();
    if (!user?.id || !endpoint) return false;
    const { error } = await client.from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);
    if (error) throw error;
    return true;
  }

  function mapProfile(row, participation, preferences, expectedMaxPoints) {
    const prefMap = {};
    (preferences || []).filter(p => p.user_id === row.id).forEach(p => { prefMap[p.task_type] = p.preference; });
    const part = (participation || []).find(p => p.user_id === row.id);
    const rawChoice = part ? part.choice : "waiting";
    const participationAcknowledged = rawChoice !== "joined" || Boolean(
      part?.rules_acknowledged_at &&
      part?.rules_acknowledgement_version === DERBY_RULES_ACK_VERSION &&
      Number(part?.acknowledged_max_points) === Number(expectedMaxPoints || 320)
    );
    return {
      id: row.id,
      name: String(row.hay_day_name || "").toUpperCase(),
      role: row.role || "member",
      bio: row.bio || "",
      ageGroup: row.age_group || "",
      countryPlace: row.country_place || "",
      hayDaySince: row.hay_day_since || "",
      favoriteGameAspect: row.favorite_game_aspect || "",
      languages: Array.isArray(row.languages) ? row.languages : [],
      otherLanguages: row.other_languages || "",
      status: row.status || "pending",
      approved: row.status === "approved",
      choice: rawChoice === "joined" && !participationAcknowledged ? "waiting" : rawChoice,
      participationNeedsConfirmation: rawChoice === "joined" && !participationAcknowledged,
      participationRulesAcknowledgedAt: participationAcknowledged ? part?.rules_acknowledged_at || null : null,
      preferences: prefMap,
      createdAt: row.created_at || null,
      updatedAt: row.updated_at || null
    };
  }

  function mapContent(rows, accounts) {
    const names = Object.fromEntries((accounts || []).map(a => [a.id, a.name]));
    return (rows || []).map(row => ({
      id: row.id,
      authorId: row.author_id,
      authorName: names[row.author_id] || "WGANG-medlem",
      kind: row.kind,
      title: row.title,
      body: row.body,
      category: row.category || "",
      status: row.status,
      createdAt: row.created_at,
      publishedAt: row.published_at || row.created_at
    }));
  }

  async function getOwnProfile(userId) {
    const { data, error } = await client.from("profiles").select("id,hay_day_name,role,status,bio,age_group,country_place,hay_day_since,favorite_game_aspect,languages,other_languages,created_at,updated_at").eq("id", userId).single();
    if (error) throw error;
    return data;
  }

  async function loadLegalAcceptance(session) {
    const userId = session?.user?.id;
    if (!userId) return null;
    const { data, error } = await client.from("legal_acceptances")
      .select("privacy_version,rules_version,acknowledged_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || /legal_acceptances/i.test(error.message || "")) {
        throw new Error("Personvernoppdateringen er ikke ferdigstilt i databasen. Kjør SQL for v0.18.0.47 før portalen publiseres.");
      }
      throw error;
    }
    if (data) return data;

    const meta = session.user.user_metadata || {};
    if (meta.legal_privacy_version === LEGAL_PRIVACY_VERSION &&
        meta.legal_rules_version === LEGAL_RULES_VERSION &&
        meta.legal_acknowledged_at) {
      const row = {
        user_id: userId,
        privacy_version: LEGAL_PRIVACY_VERSION,
        rules_version: LEGAL_RULES_VERSION,
        acknowledged_at: meta.legal_acknowledged_at
      };
      const { data: restored, error: restoreError } = await client.from("legal_acceptances")
        .upsert(row, { onConflict:"user_id" })
        .select("privacy_version,rules_version,acknowledged_at")
        .single();
      if (restoreError) throw restoreError;
      return restored;
    }
    return null;
  }

  async function loadRemoteState(session) {
    if (!session || !session.user) return { accounts: [], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],participations:[],next:null,current:null,upcoming:null}, derbyHistory:{archives:[],results:[],changeLog:[]}, legalAcceptance:null, currentUserId: null };
    const own = await getOwnProfile(session.user.id);
    const legalAcceptance = await loadLegalAcceptance(session);
    if (own.status !== "approved") {
      const ownAccount = mapProfile(own, [], []);
      ownAccount.email = session.user.email || "";
      return { accounts: [ownAccount], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],participations:[],next:null,current:null,upcoming:null}, derbyHistory:{archives:[],results:[],changeLog:[]}, legalAcceptance, currentUserId: own.id };
    }
    // Søndag 18:00 -> tirsdag 10:00: sørg for at neste derby finnes.
    // Funksjonen er idempotent og oppretter bare en Normal-standard dersom ledelsen
    // ikke allerede har opprettet et derby for neste tirsdag.
    try {
      const { error: weeklyDerbyError } = await client.rpc("ensure_weekly_derby_transition");
      if (weeklyDerbyError && weeklyDerbyError.code !== "PGRST202") {
        console.warn("Kunne ikke kontrollere ukentlig derbyovergang:", weeklyDerbyError);
      }
    } catch (weeklyDerbyError) {
      console.warn("Kunne ikke kontrollere ukentlig derbyovergang:", weeklyDerbyError);
    }
    const [profilesRes, participationRes, preferencesRes, derbyRes, contentRes, templatesRes, eventsRes, eventParticipationRes, completionRes, leadershipRes, notificationPrefsRes, notificationReadRes, likesRes, commentsRes, translationsRes, activityNotificationsRes, archivesRes, memberResultsRes, resultChangeLogRes] = await Promise.all([
      client.from("profiles").select("id,hay_day_name,role,status,bio,age_group,country_place,hay_day_since,favorite_game_aspect,languages,other_languages,created_at,updated_at").order("hay_day_name"),
      client.from("derby_participation").select("user_id,choice,rules_acknowledged_at,rules_acknowledgement_version,acknowledged_max_points"),
      client.from("task_preferences").select("user_id,task_type,preference"),
      client.from("derby_settings").select("id,type,task_total,max_points,strategy").eq("id", 1).maybeSingle(),
      client.from("community_content").select("id,author_id,kind,title,body,category,status,created_at,published_at").order("created_at", {ascending:false}),
      client.from("derby_templates").select("id,slug,name,description,default_task_total,default_extra_tasks,default_max_points,daily_task_limit,rules,strategy,is_active,updated_by,updated_at").eq("is_active", true).order("name"),
      client.from("derby_events").select("id,template_id,name,status,start_at,end_at,signup_deadline,task_total,extra_tasks,max_points,daily_task_limit,description,rules,strategy,published_at,created_at").order("start_at", {ascending:false}).limit(60),
      client.from("derby_event_participation").select("event_id,user_id,choice,updated_at,rules_acknowledged_at,rules_acknowledgement_version,acknowledged_max_points"),
      client.from("derby_member_completion").select("event_id,user_id,completed_at"),
      client.from("leadership_messages").select("id,user_id,message,created_at,updated_at").order("created_at", {ascending:true}).limit(300),
      client.from("notification_preferences").select("*").eq("user_id", session.user.id).maybeSingle(),
      client.from("notification_read_state").select("*").eq("user_id", session.user.id).maybeSingle(),
      client.from("social_likes").select("user_id,target_type,target_id,created_at"),
      client.from("social_comments").select("id,user_id,target_type,target_id,body,created_at,updated_at").order("created_at", {ascending:true}),
      client.from("content_translations").select("target_type,target_id,language,title,body,source_text,updated_at"),
      client.from("activity_notifications").select("id,recipient_id,actor_id,activity_type,target_type,target_id,created_at,read_at").eq("recipient_id",session.user.id).order("created_at",{ascending:false}).limit(100),
      client.from("derby_result_archives").select("id,event_id,derby_name,derby_type,league,placement,neighborhood_points,participant_count,trashed_tasks,started_at,ended_at,configuration_snapshot,notes,created_by,created_at,updated_at").order("started_at",{ascending:false}).limit(100),
      client.from("derby_member_results").select("id,archive_id,user_id,display_name_snapshot,included_tasks,extra_tasks,tasks_used,tasks_completed,points_per_task,points_earned,possible_points,result_percent,minimum_met,perfect_result,extra_star_earned,extra_stars_earned,notes,created_at,updated_at").order("archive_id",{ascending:false}).limit(3000),
      client.from("derby_result_change_log").select("id,archive_id,action,reason,changed_by,changed_at").order("changed_at",{ascending:false}).limit(200)
    ]);
    for (const result of [profilesRes, participationRes, preferencesRes, derbyRes, contentRes, templatesRes, eventsRes, eventParticipationRes, completionRes, leadershipRes, notificationPrefsRes, notificationReadRes, likesRes, commentsRes, translationsRes, activityNotificationsRes, archivesRes, memberResultsRes, resultChangeLogRes]) {
      if (result.error) throw result.error;
    }
    const d = derbyRes.data;
    const derby = d ? { type:d.type, taskTotal:d.task_total, maxPoints:d.max_points, strategy:Array.isArray(d.strategy)?d.strategy:clone(DEFAULT_DERBY.strategy) } : clone(DEFAULT_DERBY);
    const templates = templatesRes.data || [];
    const events = eventsRes.data || [];
    // Søndag 18:00 til tirsdag 10:00 er neste publiserte derby portalens
    // påmeldingskontekst. Samtidig beholdes derbyet som faktisk pågår som en
    // separat kontekst for ferdigstatus og historikk.
    const contexts = selectDerbyContexts(events);
    const {current,upcoming,next} = contexts;
    const eventParticipation = next ? (eventParticipationRes.data || []).filter(p => String(p.event_id) === String(next.id)) : [];
    const participationForView = next ? eventParticipation : (participationRes.data || []);
    const currentParticipation = current ? (eventParticipationRes.data || []).filter(p => String(p.event_id) === String(current.id)) : [];
    const completionForView = current ? (completionRes.data || []).filter(row => String(row.event_id) === String(current.id)) : [];
    const expectedParticipationMaxPoints = Number(next?.max_points || d?.max_points || DEFAULT_DERBY.maxPoints);
    const accounts = (profilesRes.data || []).map(row => {
      const account = mapProfile(row, participationForView, preferencesRes.data, expectedParticipationMaxPoints);
      const activeAccount = current
        ? mapProfile(row, currentParticipation, [], Number(current.max_points || DEFAULT_DERBY.maxPoints))
        : null;
      const completion = completionForView.find(item => String(item.user_id) === String(row.id));
      account.activeDerbyChoice = activeAccount?.choice || "waiting";
      account.activeDerbyEventId = current?.id || null;
      account.derbyCompleted = !!completion;
      account.derbyCompletedAt = completion?.completed_at || null;
      return account;
    });
    const ownAccount = accounts.find(account => String(account.id) === String(session.user.id));
    if (ownAccount) ownAccount.email = session.user.email || "";
    const contentRows = mapContent(contentRes.data, accounts);
    const content = {
      announcements: contentRows.filter(x => x.kind === "announcement" && x.status === "published"),
      derbyPosts: contentRows.filter(x => x.kind === "derby" && x.status === "published"),
      tips: contentRows.filter(x => x.kind === "tip" && x.status === "published"),
      pendingTips: contentRows.filter(x => x.kind === "tip" && x.status === "pending")
    };
    const nameById = Object.fromEntries(accounts.map(a => [a.id, a.name]));
    const leadershipMessages = (leadershipRes.data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      authorName: nameById[row.user_id] || "WGANG-ledelse",
      message: row.message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    let rolePermissions = [], permissionAudit = [], chatReadState = [];
    try {
      const [rolePermRes, auditRes, chatReadRes] = await Promise.all([
        client.rpc("wgang_get_role_permissions"),
        client.from("permission_audit_log").select("id,role,permission_key,old_value,new_value,changed_by,changed_at").order("changed_at",{ascending:false}).limit(50),
        client.from("chat_read_state").select("channel,last_read_at,last_message_id").eq("user_id",session.user.id)
      ]);
      if (!rolePermRes.error) rolePermissions = rolePermRes.data || [];
      if (!auditRes.error) permissionAudit = auditRes.data || [];
      if (!chatReadRes.error) chatReadState = chatReadRes.data || [];
    } catch (e) {
      console.warn("Optional permissions/read-state tables unavailable",e);
    }

    return {
      accounts, derby, content, leadershipMessages, derbyManagement:{templates,events,participations:eventParticipationRes.data || [],next,current,upcoming},
      derbyHistory:{
        archives:archivesRes.data || [],
        results:memberResultsRes.data || [],
        changeLog:resultChangeLogRes.data || []
      },
      legalAcceptance,
      notifications:{
        preferences: notificationPrefsRes.data || null,
        readState: notificationReadRes.data || null
      },
      permissions:{rolePermissions, audit:permissionAudit},
      chatReadState,
      social:{
        likes: likesRes.data || [],
        comments: commentsRes.data || [],
        translations: translationsRes.data || [],
        activityNotifications: activityNotificationsRes.data || []
      },
      currentUserId: session.user.id
    };
  }

  function appUrl() {
    return window.location.origin + window.location.pathname;
  }

  function cleanAuthUrl() {
    if (!window.history || !window.history.replaceState) return;
    window.history.replaceState({}, document.title, appUrl());
  }

  const api = {
    mode: configured ? "supabase" : "local",
    taskTypes: TASK_TYPES,
    savePushSubscription,
    removePushSubscription,
    async bootstrap() {
      if (!configured) return clone(localState);
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return loadRemoteState(data.session);
    },
    async signIn(email, password) {
      if (!configured) {
        throw new Error("Innlogging er midlertidig utilgjengelig. Kontakt WGANG-ledelsen dersom problemet vedvarer.");
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Feil e-post eller passord.");
      const profile = await getOwnProfile(data.user.id);
      if (profile.status !== "approved") {
        await client.auth.signOut();
        if (profile.status === "rejected") throw new Error("Medlemssøknaden din er avslått.");
        if (profile.status === "removed") throw new Error("Tilgangen din til WGANG Portal er deaktivert.");
        throw new Error("Søknaden din venter fortsatt på godkjenning.");
      }
      return loadRemoteState(data.session);
    },
    async signUp(name, email, password) {
      name = String(name || "").trim().toUpperCase();
      if (!configured) {
        throw new Error("Medlemssøknad er midlertidig utilgjengelig. Kontakt WGANG-ledelsen dersom problemet vedvarer.");
      }
      const acknowledgedAt = new Date().toISOString();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options:{
          data:{
            hay_day_name:name,
            legal_privacy_version:LEGAL_PRIVACY_VERSION,
            legal_rules_version:LEGAL_RULES_VERSION,
            legal_acknowledged_at:acknowledgedAt
          },
          emailRedirectTo:appUrl()
        }
      });
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    },
    async getAuthIntent() {
      if (!configured) return { type:"", hasSession:false, user:null };
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return { type:initialAuthType, hasSession:!!data.session, user:data.session?.user || null };
    },
    async updatePassword(password) {
      if (!configured) throw new Error("Supabase er ikke koblet til.");
      const { data, error } = await client.auth.updateUser({ password });
      if (error) throw error;
      cleanAuthUrl();
      return data;
    },
    async requestPasswordReset(email) {
      if (!configured) throw new Error("Supabase er ikke koblet til.");
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo:appUrl() });
      if (error) throw error;
    },
    legalVersions() {
      return { privacy:LEGAL_PRIVACY_VERSION, rules:LEGAL_RULES_VERSION };
    },
    legalAcceptanceRequired(state) {
      if (!configured) return false;
      const acceptance = state?.legalAcceptance;
      return !acceptance ||
        acceptance.privacy_version !== LEGAL_PRIVACY_VERSION ||
        acceptance.rules_version !== LEGAL_RULES_VERSION;
    },
    async acceptLegalDocuments() {
      if (!configured) {
        return {
          privacy_version:LEGAL_PRIVACY_VERSION,
          rules_version:LEGAL_RULES_VERSION,
          acknowledged_at:new Date().toISOString()
        };
      }
      const user = await getAuthUser();
      if (!user?.id) throw new Error("Du må være logget inn.");
      const row = {
        user_id:user.id,
        privacy_version:LEGAL_PRIVACY_VERSION,
        rules_version:LEGAL_RULES_VERSION,
        acknowledged_at:new Date().toISOString()
      };
      const { data, error } = await client.from("legal_acceptances")
        .upsert(row, { onConflict:"user_id" })
        .select("privacy_version,rules_version,acknowledged_at")
        .single();
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (!configured) { localState.currentUserId = null; localSave(localState); return; }
      await client.auth.signOut();
    },
    async refresh() {
      if (!configured) return clone(localState);
      const { data } = await client.auth.getSession();
      return loadRemoteState(data.session);
    },
    async setParticipation(userId, choice, acknowledgement={}) {
      if (!new Set(["joined","pause","unsure"]).has(choice)) throw new Error("Ugyldig derby-svar.");
      if (choice === "joined" && acknowledgement.accepted !== true) {
        throw new Error("Du må lese og bekrefte derbyreglene før deltakelsen kan lagres.");
      }
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===userId);
        if(a){
          a.choice=choice;
          a.participationNeedsConfirmation=false;
          a.participationRulesAcknowledgedAt=choice==="joined"?new Date().toISOString():null;
        }
        localSave(localState); return;
      }
      const authUser = await getAuthUser();
      if (!authUser?.id || String(authUser.id) !== String(userId)) throw new Error("Du kan bare registrere ditt eget derby-svar.");
      const { data:events, error:eventError } = await client.from("derby_events").select("id,name,status,start_at,end_at,signup_deadline,task_total,extra_tasks,max_points,rules").in("status",["published","active"]).order("start_at",{ascending:false}).limit(20);
      if (eventError) throw eventError;
      const event = selectDerbyContexts(events).next;
      if (event) {
        const now = Date.now();
        const lockAt = derbyParticipationLockAt(event)?.getTime();
        if (Number.isFinite(lockAt) && now >= lockAt) {
          throw new Error("Svarfristen er utløpt. Derby-svaret er låst og kan ikke registreres eller endres.");
        }
        const acknowledgedAt = choice === "joined" ? new Date().toISOString() : null;
        const { error } = await client.from("derby_event_participation").upsert({
          event_id:event.id,
          user_id:userId,
          choice,
          rules_acknowledged_at:acknowledgedAt,
          rules_acknowledgement_version:choice === "joined" ? DERBY_RULES_ACK_VERSION : null,
          acknowledged_max_points:choice === "joined" ? Number(event.max_points || DEFAULT_DERBY.maxPoints) : null,
          updated_at:new Date().toISOString()
        },{onConflict:"event_id,user_id"});
        if (error) throw error;
      } else {
        const { data:settings, error:settingsError } = await client.from("derby_settings").select("max_points").eq("id",1).maybeSingle();
        if (settingsError) throw settingsError;
        const { error } = await client.from("derby_participation").upsert({
          user_id:userId,
          choice,
          rules_acknowledged_at:choice === "joined" ? new Date().toISOString() : null,
          rules_acknowledgement_version:choice === "joined" ? DERBY_RULES_ACK_VERSION : null,
          acknowledged_max_points:choice === "joined" ? Number(settings?.max_points || DEFAULT_DERBY.maxPoints) : null,
          updated_at:new Date().toISOString()
        },{onConflict:"user_id"});
        if (error) throw error;
      }
    },
    async setDerbyCompleted(userId, completed) {
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===userId); if(a){a.derbyCompleted=!!completed;a.derbyCompletedAt=completed?new Date().toISOString():null;} localSave(localState); return;
      }
      const { data:events, error:eventError } = await client.from("derby_events")
        .select("id,name,status,start_at,end_at,max_points")
        .in("status",["published","active"])
        .order("start_at",{ascending:false})
        .limit(20);
      if (eventError) throw eventError;
      const event=selectDerbyContexts(events).current;
      if (!event || !/normal|standard|power|styrke/i.test(String(event.name||""))) throw new Error("Kunne ikke finne et pågående Normal- eller Power-derby. Oppdater siden og prøv igjen.");
      const derbyLabel=/power|styrke/i.test(String(event.name||"")) ? "Power Derby" : "Normal Derby";
      if (String(userId) !== String((await getAuthUser())?.id || "")) throw new Error("Du kan bare endre din egen ferdigstatus.");
      if (completed) {
        const { data:participation, error:participationError } = await client.from("derby_event_participation")
          .select("choice,rules_acknowledged_at,rules_acknowledgement_version,acknowledged_max_points")
          .eq("event_id",event.id)
          .eq("user_id",userId)
          .maybeSingle();
        if (participationError) throw participationError;
        const confirmedParticipation=participation?.choice === "joined"
          && !!participation?.rules_acknowledged_at
          && participation?.rules_acknowledgement_version === DERBY_RULES_ACK_VERSION
          && Number(participation?.acknowledged_max_points) === Number(event.max_points || DEFAULT_DERBY.maxPoints);
        if (!confirmedParticipation) throw new Error(`Du må ha bekreftet påmeldingen og reglene for det pågående ${derbyLabel} før du kan registrere deg som ferdig.`);
        const { error } = await client.from("derby_member_completion").upsert({event_id:event.id,user_id:userId,completed_at:new Date().toISOString()},{onConflict:"event_id,user_id"});
        if (error) throw error;
      } else {
        const { error } = await client.from("derby_member_completion").delete().eq("event_id",event.id).eq("user_id",userId);
        if (error) throw error;
      }
    },
    async setPreference(userId, taskType, preference) {
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===userId); if(a){a.preferences=a.preferences||{}; if(preference)a.preferences[taskType]=preference; else delete a.preferences[taskType];} localSave(localState); return;
      }
      if (!preference) {
        const { error } = await client.from("task_preferences").delete().eq("user_id",userId).eq("task_type",taskType); if(error)throw error;
      } else {
        const { error } = await client.from("task_preferences").upsert({user_id:userId,task_type:taskType,preference,updated_at:new Date().toISOString()},{onConflict:"user_id,task_type"}); if(error)throw error;
      }
    },
    async approve(userId) {
      if (!configured) { const a=localState.accounts.find(x=>x.id===userId); if(a){a.approved=true;a.status="approved";a.choice="unsure";} localSave(localState); return; }
      const { error }=await client.rpc("wgang_set_member_status",{p_user_id:userId,p_status:"approved"}); if(error)throw error;
    },
    async setMemberStatus(userId,status) {
      if (!configured) { const a=localState.accounts.find(x=>x.id===userId); if(a){a.status=status;a.approved=status==="approved";} localSave(localState); return; }
      const { error }=await client.rpc("wgang_set_member_status",{p_user_id:userId,p_status:status}); if(error)throw error;
    },
    async setRole(userId, role) {
      if (!configured) { const a=localState.accounts.find(x=>x.id===userId); if(a)a.role=role; localSave(localState); return; }
      const { error }=await client.rpc("wgang_set_member_role",{p_user_id:userId,p_role:role}); if(error)throw error;
    },
    async updatePublicProfile(profile) {
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===profile.id);
        if(a){
          a.bio=profile.bio||"";
          a.ageGroup=profile.ageGroup||"";
          a.countryPlace=profile.countryPlace||"";
          a.hayDaySince=profile.hayDaySince||"";
          a.favoriteGameAspect=profile.favoriteGameAspect||"";
          a.languages=profile.languages||[];
          a.otherLanguages=profile.otherLanguages||"";
        }
        localSave(localState); return;
      }
      const { error } = await client.rpc("update_my_public_profile", {
        p_bio: profile.bio || null,
        p_gender: null,
        p_age_group: profile.ageGroup || null,
        p_country_place: profile.countryPlace || null,
        p_hay_day_since: profile.hayDaySince || null,
        p_favorite_game_aspect: profile.favoriteGameAspect || null,
        p_languages: profile.languages || [],
        p_other_languages: profile.otherLanguages || null
      });
      if (error) throw error;
    },
    async getBunnyData() {
      if (!configured) {
        const raw=localStorage.getItem("wgang_bunny_v018");
        return raw?JSON.parse(raw):{library:[],board:null,boardTasks:[],statuses:[]};
      }
      const [lib,board]=await Promise.all([
        client.from("bunny_task_library").select("*").eq("active",true).order("id"),
        client.from("bunny_board").select("*").eq("active",true).order("published_at",{ascending:false}).limit(1).maybeSingle()
      ]);
      if(lib.error) throw lib.error; if(board.error) throw board.error;
      let boardTasks=[],statuses=[];
      if(board.data){
        const [bt,st]=await Promise.all([client.from("bunny_board_tasks").select("task_id").eq("board_id",board.data.id),client.from("bunny_task_status").select("board_id,task_id,user_id,status,updated_at,cycle_key,event_id,round_number,cycle_start_at,cycle_ends_at").eq("board_id",board.data.id)]);
        if(bt.error)throw bt.error;if(st.error)throw st.error;boardTasks=bt.data||[];statuses=st.data||[];
      }
      return {library:lib.data||[],board:board.data||null,boardTasks,statuses};
    },
    async getBunnyRoundState(eventId) {
      if (!eventId) return [];
      if (!configured) {
        try { return JSON.parse(localStorage.getItem(`wgang_bunny_rounds_${eventId}`) || "[]"); } catch { return []; }
      }
      const { data, error } = await client.from("bunny_round_completions").select("event_id,round_number,completed_at,completed_by").eq("event_id",eventId).order("round_number");
      if (error) {
        // Migration may not have been applied yet. Countdown still works without persisted completions.
        if (error.code === "42P01" || /bunny_round_completions/i.test(error.message || "")) return [];
        throw error;
      }
      return data || [];
    },
    async getBunnyRoundSchedule(eventId) {
      if (!eventId) return [];
      if (!configured) {
        try { return JSON.parse(localStorage.getItem(`wgang_bunny_schedule_${eventId}`) || "[]"); } catch { return []; }
      }
      const { data, error } = await client.from("bunny_round_schedule_overrides").select("event_id,round_number,next_bunny_at,updated_at,updated_by").eq("event_id",eventId).order("round_number");
      if (error) {
        if (error.code === "42P01" || /bunny_round_schedule_overrides/i.test(error.message || "")) return [];
        throw error;
      }
      return data || [];
    },
    async setBunnyRoundSchedule(eventId, roundNumber, nextBunnyAt) {
      if (!eventId || ![1,2,3].includes(Number(roundNumber))) throw new Error("Ugyldig harepusrunde.");
      const parsed=new Date(nextBunnyAt); if(Number.isNaN(parsed.getTime())) throw new Error("Ugyldig tidspunkt.");
      if (!configured) {
        const key=`wgang_bunny_schedule_${eventId}`; let rows=[]; try{rows=JSON.parse(localStorage.getItem(key)||"[]");}catch{}
        rows=rows.filter(x=>Number(x.round_number)!==Number(roundNumber)); rows.push({event_id:eventId,round_number:Number(roundNumber),next_bunny_at:parsed.toISOString(),updated_at:new Date().toISOString(),updated_by:localState.currentUserId}); localStorage.setItem(key,JSON.stringify(rows)); return;
      }
      const { data:u } = await client.auth.getUser();
      const { error } = await client.from("bunny_round_schedule_overrides").upsert({event_id:eventId,round_number:Number(roundNumber),next_bunny_at:parsed.toISOString(),updated_at:new Date().toISOString(),updated_by:u.user.id},{onConflict:"event_id,round_number"});
      if(error) throw error;
    },
    async clearBunnyRoundSchedule(eventId, roundNumber) {
      if (!eventId || ![1,2,3].includes(Number(roundNumber))) throw new Error("Ugyldig harepusrunde.");
      if (!configured) {
        const key=`wgang_bunny_schedule_${eventId}`; let rows=[]; try{rows=JSON.parse(localStorage.getItem(key)||"[]");}catch{} rows=rows.filter(x=>Number(x.round_number)!==Number(roundNumber)); localStorage.setItem(key,JSON.stringify(rows)); return;
      }
      const { error } = await client.from("bunny_round_schedule_overrides").delete().eq("event_id",eventId).eq("round_number",Number(roundNumber)); if(error) throw error;
    },
    async completeBunnyRound(eventId, roundNumber) {
      if (!eventId || ![1,2,3].includes(Number(roundNumber))) throw new Error("Ugyldig harepusrunde.");
      if (!configured) {
        const key=`wgang_bunny_rounds_${eventId}`;
        let rows=[]; try { rows=JSON.parse(localStorage.getItem(key)||"[]"); } catch {}
        rows=rows.filter(x=>Number(x.round_number)!==Number(roundNumber));
        rows.push({event_id:eventId,round_number:Number(roundNumber),completed_at:new Date().toISOString(),completed_by:localState.currentUserId});
        localStorage.setItem(key,JSON.stringify(rows)); return;
      }
      const { data:u } = await client.auth.getUser();
      const { error } = await client.from("bunny_round_completions").upsert({event_id:eventId,round_number:Number(roundNumber),completed_at:new Date().toISOString(),completed_by:u.user.id},{onConflict:"event_id,round_number"});
      if (error) throw error;
    },
    async reopenBunnyRound(eventId, roundNumber) {
      if (!eventId || ![1,2,3].includes(Number(roundNumber))) throw new Error("Ugyldig harepusrunde.");
      if (!configured) {
        const key=`wgang_bunny_rounds_${eventId}`;
        let rows=[]; try { rows=JSON.parse(localStorage.getItem(key)||"[]"); } catch {}
        rows=rows.filter(x=>Number(x.round_number)!==Number(roundNumber)); localStorage.setItem(key,JSON.stringify(rows)); return;
      }
      const { error } = await client.from("bunny_round_completions").delete().eq("event_id",eventId).eq("round_number",Number(roundNumber));
      if (error) throw error;
    },
    async syncBunnyPlannerCycle(eventId,roundNumber,cycleKey,cycleStartAt,cycleEndsAt) {
      if(!eventId||!cycleKey)return;if(!configured)return;
      const {error}=await client.rpc("sync_bunny_planner_cycle",{p_event_id:eventId,p_round_number:Number(roundNumber),p_cycle_key:cycleKey,p_cycle_start_at:cycleStartAt,p_cycle_ends_at:cycleEndsAt});if(error)throw error;
    },
    async setBunnyStatus(boardId,taskId,status,cycleKey,eventId,roundNumber,cycleStartAt,cycleEndsAt) {
      if(!configured){const d=await this.getBunnyData();const uid=localState.currentUserId;d.statuses=d.statuses.filter(x=>!(String(x.task_id)===String(taskId)&&String(x.user_id)===String(uid)));d.statuses.push({board_id:boardId,task_id:taskId,user_id:uid,status,cycle_key:cycleKey,event_id:eventId,round_number:roundNumber,cycle_start_at:cycleStartAt,cycle_ends_at:cycleEndsAt,updated_at:new Date().toISOString()});localStorage.setItem("wgang_bunny_v018",JSON.stringify(d));return;}
      const {data:u}=await client.auth.getUser();const {error}=await client.from("bunny_task_status").upsert({board_id:boardId,task_id:taskId,user_id:u.user.id,status,cycle_key:cycleKey,event_id:eventId,round_number:Number(roundNumber),cycle_start_at:cycleStartAt,cycle_ends_at:cycleEndsAt,updated_at:new Date().toISOString()},{onConflict:"board_id,task_id,user_id"});if(error)throw error;
    },
    async clearBunnyStatus(boardId,taskId) {
      if(!configured){const d=await this.getBunnyData(),uid=localState.currentUserId;d.statuses=d.statuses.filter(x=>!(String(x.task_id)===String(taskId)&&String(x.user_id)===String(uid)));localStorage.setItem("wgang_bunny_v018",JSON.stringify(d));return;}
      const {data:u}=await client.auth.getUser();const {error}=await client.from("bunny_task_status").delete().eq("board_id",boardId).eq("task_id",taskId).eq("user_id",u.user.id);if(error)throw error;
    },
    async publishBunnyBoard(taskIds) {
      if(!configured){const d=await this.getBunnyData();d.board={id:Date.now(),published_at:new Date().toISOString(),active:true};d.boardTasks=taskIds.map(task_id=>({task_id}));d.statuses=[];localStorage.setItem("wgang_bunny_v018",JSON.stringify(d));return;}
      const {data:u}=await client.auth.getUser();await client.from("bunny_board").update({active:false}).eq("active",true);const {data:b,error}=await client.from("bunny_board").insert({published_by:u.user.id,active:true}).select().single();if(error)throw error;const {error:e2}=await client.from("bunny_board_tasks").insert(taskIds.map(task_id=>({board_id:b.id,task_id})));if(e2)throw e2;
    },
    async addBunnyTask(task) {
      if(!configured){const d=await this.getBunnyData();d.library.push({id:Date.now(),active:true,...task});localStorage.setItem("wgang_bunny_v018",JSON.stringify(d));return;}
      const {error}=await client.from("bunny_task_library").insert(task);if(error)throw error;
    },
    async updateBunnyTask(taskId, patch) {
      if(!configured){
        const d=await this.getBunnyData();
        const t=d.library.find(x=>String(x.id)===String(taskId));
        if(t) Object.assign(t,patch);
        localStorage.setItem("wgang_bunny_v018",JSON.stringify(d));
        return;
      }
      const {error}=await client.from("bunny_task_library").update(patch).eq("id",taskId);
      if(error)throw error;
    },
    async saveDerby(derby) {
      if (!configured) { localState.derby=clone(derby); localSave(localState); return; }
      const { error }=await client.from("derby_settings").upsert({id:1,type:derby.type,task_total:derby.taskTotal,max_points:derby.maxPoints,strategy:derby.strategy,updated_at:new Date().toISOString()},{onConflict:"id"}); if(error)throw error;
    },
    async updateDerbyTemplate(template) {
      if (!configured) return;
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const { error } = await client.from("derby_templates").update({
        name:template.name,
        description:template.description || null,
        default_task_total:template.taskTotal ?? null,
        default_extra_tasks:template.extraTasks ?? 0,
        default_max_points:template.maxPoints ?? null,
        daily_task_limit:template.dailyTaskLimit ?? null,
        rules:template.rules || [],
        strategy:template.strategy || [],
        updated_by:user.id,
        updated_at:new Date().toISOString()
      }).eq("id",template.id).select("id").single();
      if (error) throw error;
    },
    async publishDerbyEvent(event) {
      if (!configured) {
        localState.derbyManagement = localState.derbyManagement || {templates:[],events:[],next:null,current:null,upcoming:null};
        event.id = Date.now(); event.status = "published"; event.published_at = new Date().toISOString();
        localState.derbyManagement.events.unshift(event);
        Object.assign(localState.derbyManagement,selectDerbyContexts(localState.derbyManagement.events));
        localState.derby = {type:event.name,taskTotal:event.task_total || 9,maxPoints:event.max_points || 320,strategy:event.strategy || []};
        localSave(localState); return event;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      await client.from("derby_events").update({status:"completed",updated_at:new Date().toISOString()}).in("status",["published","active"]);
      const payload = Object.assign({}, event, {status:"published",created_by:user.id,published_at:new Date().toISOString(),updated_at:new Date().toISOString()});
      const { data, error } = await client.from("derby_events").insert(payload).select().single();
      if (error) throw error;
      await client.from("derby_settings").upsert({id:1,type:data.name,task_total:data.task_total || 9,max_points:data.max_points || 320,strategy:data.strategy || [],updated_at:new Date().toISOString()},{onConflict:"id"});
      return data;
    },
    async saveDerbyResult(payload) {
      if (!payload || !payload.eventId || !Array.isArray(payload.results) || !payload.results.length) {
        throw new Error("Resultatet mangler derby eller medlemsrader.");
      }
      if (!configured) {
        const actor = localState.accounts.find(item => String(item.id) === String(localState.currentUserId));
        if (!actor || !["owner","admin"].includes(actor.role)) {
          throw new Error("Bare Eier og Admin kan registrere derbyresultater.");
        }
        localState.derbyHistory = localState.derbyHistory || {archives:[],results:[],changeLog:[]};
        const event = (localState.derbyManagement?.events || []).find(item => String(item.id) === String(payload.eventId));
        if (!event) throw new Error("Fant ikke derbyet.");
        let archive = localState.derbyHistory.archives.find(item => String(item.event_id) === String(payload.eventId));
        const correcting = !!archive;
        if (correcting && String(payload.correctionReason || "").trim().length < 5) throw new Error("Skriv en kort begrunnelse for korreksjonen.");
        if (correcting) {
          const previousIds = localState.derbyHistory.results
            .filter(item => String(item.archive_id) === String(archive.id))
            .map(item => String(item.user_id || ""))
            .sort();
          const submittedIds = payload.results
            .map(item => String(item.user_id || ""))
            .sort();
          const participantBasisChanged = previousIds.length !== submittedIds.length
            || previousIds.some((id, index) => !id || id !== submittedIds[index]);
          if (participantBasisChanged) {
            throw new Error("Deltakerlisten har endret seg etter registreringen. Historikken er låst og er ikke endret.");
          }
        }
        const archiveId = archive?.id || Date.now();
        archive = Object.assign({}, archive || {}, {
          id:archiveId,event_id:event.id,derby_name:event.name,derby_type:event.name,
          league:payload.league,placement:payload.placement,neighborhood_points:payload.neighborhoodPoints,
          participant_count:payload.results.length,trashed_tasks:payload.trashedTasks || 0,
          started_at:event.start_at,ended_at:event.end_at,notes:payload.notes || null,
          created_at:archive?.created_at || new Date().toISOString(),updated_at:new Date().toISOString()
        });
        localState.derbyHistory.archives = localState.derbyHistory.archives.filter(item => String(item.id) !== String(archiveId));
        localState.derbyHistory.archives.unshift(archive);
        localState.derbyHistory.results = localState.derbyHistory.results.filter(item => String(item.archive_id) !== String(archiveId));
        payload.results.forEach((item,index) => {
          const included = Number(event.task_total || 0), extra = Number(item.extra_tasks_used || 0), used = included + extra;
          const pointsPerTask = Number(event.max_points || 0), points = Number(item.points_earned || 0), possible = included * pointsPerTask;
          const extraStars = pointsPerTask > 0
            ? Math.min(extra,Math.max(0,Math.floor((points - possible) / pointsPerTask)))
            : 0;
          localState.derbyHistory.results.push({
            id:archiveId * 100 + index,archive_id:archiveId,user_id:item.user_id,
            display_name_snapshot:localState.accounts.find(a=>String(a.id)===String(item.user_id))?.name || "WGANG-medlem",
            included_tasks:included,extra_tasks:extra,tasks_used:used,tasks_completed:Number(item.tasks_completed || 0),
            points_per_task:pointsPerTask,points_earned:points,possible_points:possible,
            result_percent:possible ? Math.min(100, Math.round(points * 10000 / possible) / 100) : 0,
            minimum_met:possible ? points >= possible * .8 : false,perfect_result:possible ? points >= possible : false,
            extra_star_earned:extraStars > 0,extra_stars_earned:extraStars,
            notes:item.notes || null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()
          });
        });
        localState.derbyHistory.changeLog.unshift({
          id:Date.now(),archive_id:archiveId,action:correcting?"corrected":"created",
          reason:correcting?String(payload.correctionReason || "").trim():null,
          changed_by:localState.currentUserId,changed_at:new Date().toISOString()
        });
        localSave(localState);
        return archiveId;
      }
      const { data, error } = await client.rpc("wgang_save_derby_result_v60", {
        p_event_id:Number(payload.eventId),
        p_league:String(payload.league || "").trim(),
        p_placement:Number(payload.placement),
        p_neighborhood_points:Number(payload.neighborhoodPoints),
        p_trashed_tasks:Number(payload.trashedTasks || 0),
        p_notes:String(payload.notes || "").trim() || null,
        p_results:payload.results,
        p_correction_reason:String(payload.correctionReason || "").trim() || null
      });
      if (error) throw error;
      return data;
    },
    async createContent(kind, title, body, category="", publishNow=false) {
      if (!configured) {
        const me = localState.accounts.find(x => x.id === localState.currentUserId);
        const item = {id:Date.now(),authorId:me?.id,authorName:me?.name||"Medlem",kind,title,body,category,status:publishNow||kind==="derby"?"published":"pending",createdAt:new Date().toISOString(),publishedAt:new Date().toISOString()};
        localState.content = localState.content || {announcements:[],derbyPosts:[],tips:[],pendingTips:[]};
        if (kind === "announcement") localState.content.announcements.unshift(item);
        else if (kind === "derby") localState.content.derbyPosts.unshift(item);
        else if (item.status === "published") localState.content.tips.unshift(item); else localState.content.pendingTips.unshift(item);
        localSave(localState); return item;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const status = kind === "derby" || publishNow ? "published" : "pending";
      const payload = {author_id:user.id,kind,title,body,category:category||null,status,published_at:status==="published"?new Date().toISOString():null};
      const { data, error } = await client.from("community_content").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async moderateContent(id, status) {
      if (!configured) {
        localState.content = localState.content || {announcements:[],derbyPosts:[],tips:[],pendingTips:[]};
        const idx = localState.content.pendingTips.findIndex(x => String(x.id) === String(id));
        if (idx >= 0) {
          const [item] = localState.content.pendingTips.splice(idx,1);
          item.status=status; if(status==="published"){item.publishedAt=new Date().toISOString();localState.content.tips.unshift(item);}
        }
        localSave(localState); return;
      }
      const { error } = await client.rpc("wgang_moderate_content",{p_content_id:Number(id),p_status:status});
      if (error) throw error;
    },
    async deleteContent(id) {
      if (!configured) return;
      const { error } = await client.from("community_content").delete().eq("id",id);
      if (error) throw error;
    },
    async sendLeadershipMessage(message) {
      if (!configured) {
        localState.leadershipMessages = localState.leadershipMessages || [];
        const me = localState.accounts.find(x => x.id === localState.currentUserId);
        const item = {id:Date.now(),userId:me?.id,authorName:me?.name||"WGANG-ledelse",message,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
        localState.leadershipMessages.push(item); localSave(localState); return item;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const { data, error } = await client.from("leadership_messages").insert({user_id:user.id,message}).select().single();
      if (error) throw error;
      return data;
    },
    async updateLeadershipMessage(id, message) {
      if (!configured) return;
      const { error } = await client.from("leadership_messages").update({message,updated_at:new Date().toISOString()}).eq("id",id);
      if (error) throw error;
    },
    async deleteLeadershipMessage(id) {
      if (!configured) return;
      const { error } = await client.from("leadership_messages").delete().eq("id",id);
      if (error) throw error;
    },
    async saveNotificationPreferences(changes) {
      if (!configured) {
        localState.notifications = localState.notifications || {preferences:{},readState:{}};
        localState.notifications.preferences = Object.assign({}, localState.notifications.preferences || {}, changes);
        localSave(localState);
        return localState.notifications.preferences;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const payload = Object.assign({user_id:user.id,updated_at:new Date().toISOString()}, changes);
      const { data, error } = await client.from("notification_preferences").upsert(payload,{onConflict:"user_id"}).select().single();
      if (error) throw error;
      return data;
    },
    async markNotificationSeen(category) {
      const columns = {
        announcements:"announcements_seen_at",
        derby_chat:"derby_chat_seen_at",
        leadership_chat:"leadership_chat_seen_at",
        membership_requests:"membership_requests_seen_at",
        pending_tips:"pending_tips_seen_at",
        derby_published:"derby_published_seen_at",
        derby_deadline:"derby_deadline_seen_at"
      };
      const column = columns[category];
      if (!column) return;
      const now = new Date().toISOString();
      if (!configured) {
        localState.notifications = localState.notifications || {preferences:{},readState:{}};
        localState.notifications.readState = Object.assign({}, localState.notifications.readState || {}, {[column]:now,updated_at:now});
        localSave(localState); return localState.notifications.readState;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const payload = {user_id:user.id,updated_at:now}; payload[column]=now;
      const { data, error } = await client.from("notification_read_state").upsert(payload,{onConflict:"user_id"}).select().single();
      if (error) throw error;
      return data;
    },
    async saveRolePermission(role, permissionKey, enabled) {
      if (!configured) return;
      const { error } = await client.rpc("wgang_set_role_permission",{
        p_role:role,p_permission_key:permissionKey,p_enabled:!!enabled
      });
      if (error) throw error;
    },
    async markChatRead(channel, lastMessageId, lastReadAt) {
      if (!configured) {
        localState.chatReadState = localState.chatReadState || [];
        const row={channel,last_message_id:lastMessageId||null,last_read_at:lastReadAt||new Date().toISOString()};
        const i=localState.chatReadState.findIndex(x=>x.channel===channel);
        if(i>=0)localState.chatReadState[i]=row; else localState.chatReadState.push(row);
        localSave(localState); return row;
      }
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const payload={user_id:user.id,channel,last_message_id:lastMessageId||null,last_read_at:lastReadAt||new Date().toISOString(),updated_at:new Date().toISOString()};
      const {data,error}=await client.from("chat_read_state").upsert(payload,{onConflict:"user_id,channel"}).select().single();
      if(error)throw error; return data;
    },

    async toggleLike(targetType, targetId, currentlyLiked) {
      if (!configured) return;
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      if (currentlyLiked) {
        const { error } = await client.from("social_likes").delete()
          .eq("user_id",user.id).eq("target_type",targetType).eq("target_id",String(targetId));
        if (error) throw error;
      } else {
        const { error } = await client.from("social_likes").insert({
          user_id:user.id,target_type:targetType,target_id:String(targetId)
        });
        if (error) throw error;
      }
    },
    async addComment(targetType, targetId, body) {
      if (!configured) return;
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const { error } = await client.from("social_comments").insert({
        user_id:user.id,target_type:targetType,target_id:String(targetId),body
      });
      if (error) throw error;
    },
    async deleteComment(id) {
      if (!configured) return;
      const { error } = await client.from("social_comments").delete().eq("id",id);
      if (error) throw error;
    },
    async markActivityNotificationRead(id) {
      if (!configured) return;
      const { error } = await client.from("activity_notifications")
        .update({read_at:new Date().toISOString()}).eq("id",id);
      if (error) throw error;
    },
    async requestTranslation(targetType, targetId, title, body) {
      if (!configured) throw new Error("KI-oversettelse krever Supabase.");
      const { data, error } = await client.functions.invoke("translate-content", {
        body:{targetType,targetId:String(targetId),title:title||"",body:body||"",language:"en"}
      });
      if (error) throw error;
      return data;
    },
    onAuthChange(callback) {
      if (!configured) return function(){};
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        try { callback(await loadRemoteState(session), event); } catch (e) { console.error(e); }
      });
      return () => data.subscription.unsubscribe();
    }
  };

  window.WGANG_BACKEND = api;
})();
