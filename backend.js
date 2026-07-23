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
  const DEMO = {
    accounts: [
      {id:"owner-1",name:"Leder",email:"admin@wgang.no",role:"owner",approved:true,status:"approved",choice:"joined",preferences:{By:"like",Gruve:"can",Båt:"avoid",Produksjon:"like"}},
      {id:"member-1",name:"Nabo",email:"nabo@wgang.no",role:"member",approved:true,status:"approved",choice:"unsure",preferences:{Melk:"like",Bacon:"like",Hjelpeoppgaver:"can",Båt:"avoid"}},
      {id:"member-2",name:"Solglimt",email:"sol@wgang.no",role:"member",approved:true,status:"approved",choice:"pause",preferences:{Fisk:"like",Båt:"like",Gruve:"no"}},
      {id:"pending-1",name:"FarmFryd",email:"farmfryd@example.com",role:"member",approved:false,status:"pending",choice:"waiting",preferences:{}}
    ],
    derby: DEFAULT_DERBY,
    content: { announcements: [], derbyPosts: [], tips: [], pendingTips: [] },
    derbyManagement: { templates: [], events: [], next: null },
    currentUserId: null
  };

  const cfg = window.WGANG_SUPABASE || {};
  const configured = Boolean(cfg.url && cfg.anonKey && window.supabase && window.supabase.createClient);
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
  function localLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : clone(DEMO);
    } catch (_) { return clone(DEMO); }
  }
  function localSave(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  let localState = localLoad();

  function mapProfile(row, participation, preferences) {
    const prefMap = {};
    (preferences || []).filter(p => p.user_id === row.id).forEach(p => { prefMap[p.task_type] = p.preference; });
    const part = (participation || []).find(p => p.user_id === row.id);
    return {
      id: row.id,
      name: String(row.hay_day_name || "").toUpperCase(),
      role: row.role || "member",
      bio: row.bio || "",
      gender: row.gender || "",
      ageGroup: row.age_group || "",
      countryPlace: row.country_place || "",
      hayDaySince: row.hay_day_since || "",
      favoriteGameAspect: row.favorite_game_aspect || "",
      languages: Array.isArray(row.languages) ? row.languages : [],
      otherLanguages: row.other_languages || "",
      status: row.status || "pending",
      approved: row.status === "approved",
      choice: part ? part.choice : "waiting",
      preferences: prefMap
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
    const { data, error } = await client.from("profiles").select("id,hay_day_name,role,status,bio,gender,age_group,country_place,hay_day_since,favorite_game_aspect,languages,other_languages").eq("id", userId).single();
    if (error) throw error;
    return data;
  }

  async function loadRemoteState(session) {
    if (!session || !session.user) return { accounts: [], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],next:null}, currentUserId: null };
    const own = await getOwnProfile(session.user.id);
    if (own.status !== "approved") {
      return { accounts: [mapProfile(own, [], [])], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, leadershipMessages:[], derbyManagement:{templates:[],events:[],next:null}, currentUserId: own.id };
    }
    const [profilesRes, participationRes, preferencesRes, derbyRes, contentRes, templatesRes, eventsRes, eventParticipationRes, leadershipRes, notificationPrefsRes, notificationReadRes, likesRes, commentsRes, translationsRes, activityNotificationsRes] = await Promise.all([
      client.from("profiles").select("id,hay_day_name,role,status,bio,gender,age_group,country_place,hay_day_since,favorite_game_aspect").order("hay_day_name"),
      client.from("derby_participation").select("user_id,choice"),
      client.from("task_preferences").select("user_id,task_type,preference"),
      client.from("derby_settings").select("id,type,task_total,max_points,strategy").eq("id", 1).maybeSingle(),
      client.from("community_content").select("id,author_id,kind,title,body,category,status,created_at,published_at").order("created_at", {ascending:false}),
      client.from("derby_templates").select("id,slug,name,description,default_task_total,default_extra_tasks,default_max_points,daily_task_limit,rules,strategy,is_active,updated_by,updated_at").eq("is_active", true).order("name"),
      client.from("derby_events").select("id,template_id,name,status,start_at,end_at,signup_deadline,task_total,extra_tasks,max_points,daily_task_limit,description,rules,strategy,published_at,created_at").order("start_at", {ascending:false}).limit(20),
      client.from("derby_event_participation").select("event_id,user_id,choice,updated_at"),
      client.from("leadership_messages").select("id,user_id,message,created_at,updated_at").order("created_at", {ascending:true}).limit(300),
      client.from("notification_preferences").select("*").eq("user_id", session.user.id).maybeSingle(),
      client.from("notification_read_state").select("*").eq("user_id", session.user.id).maybeSingle(),
      client.from("social_likes").select("user_id,target_type,target_id,created_at"),
      client.from("social_comments").select("id,user_id,target_type,target_id,body,created_at,updated_at").order("created_at", {ascending:true}),
      client.from("content_translations").select("target_type,target_id,language,title,body,source_text,updated_at"),
      client.from("activity_notifications").select("id,recipient_id,actor_id,activity_type,target_type,target_id,created_at,read_at").eq("recipient_id",session.user.id).order("created_at",{ascending:false}).limit(100)
    ]);
    for (const result of [profilesRes, participationRes, preferencesRes, derbyRes, contentRes, templatesRes, eventsRes, eventParticipationRes, leadershipRes, notificationPrefsRes, notificationReadRes, likesRes, commentsRes, translationsRes, activityNotificationsRes]) {
      if (result.error) throw result.error;
    }
    const d = derbyRes.data;
    const derby = d ? { type:d.type, taskTotal:d.task_total, maxPoints:d.max_points, strategy:Array.isArray(d.strategy)?d.strategy:clone(DEFAULT_DERBY.strategy) } : clone(DEFAULT_DERBY);
    const templates = templatesRes.data || [];
    const events = eventsRes.data || [];
    const next = events.find(e => ["published","active"].includes(e.status)) || null;
    const eventParticipation = next ? (eventParticipationRes.data || []).filter(p => String(p.event_id) === String(next.id)) : [];
    const participationForView = next ? eventParticipation : (participationRes.data || []);
    const accounts = (profilesRes.data || []).map(row => mapProfile(row, participationForView, preferencesRes.data));
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
        client.from("role_permissions").select("role,permission_key,enabled,updated_at").order("permission_key"),
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
      accounts, derby, content, leadershipMessages, derbyManagement:{templates,events,next},
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
    async bootstrap() {
      if (!configured) return clone(localState);
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return loadRemoteState(data.session);
    },
    async signIn(email, password) {
      if (!configured) {
        const user = localState.accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && ((a.email === "admin@wgang.no" || a.email === "nabo@wgang.no" || a.email === "sol@wgang.no") ? password === "WGANG2026" : true));
        if (!user) throw new Error("Feil e-post eller passord.");
        if (!user.approved) throw new Error("Søknaden din venter fortsatt på godkjenning.");
        localState.currentUserId = user.id; localSave(localState); return clone(localState);
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
        if (localState.accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) throw new Error("Denne e-postadressen er allerede registrert.");
        if (localState.accounts.some(a => a.name.toLowerCase() === name.toLowerCase())) throw new Error("Dette Hay Day-navnet er allerede registrert.");
        localState.accounts.push({id:"user-"+Date.now(),name,email,role:"member",approved:false,status:"pending",choice:"waiting",preferences:{}});
        localSave(localState);
        return { needsEmailConfirmation:false };
      }
      const { data, error } = await client.auth.signUp({ email, password, options:{ data:{ hay_day_name:name }, emailRedirectTo:appUrl() } });
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
    async signOut() {
      if (!configured) { localState.currentUserId = null; localSave(localState); return; }
      await client.auth.signOut();
    },
    async refresh() {
      if (!configured) return clone(localState);
      const { data } = await client.auth.getSession();
      return loadRemoteState(data.session);
    },
    async setParticipation(userId, choice) {
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===userId); if(a)a.choice=choice; localSave(localState); return;
      }
      const { data:event, error:eventError } = await client.from("derby_events").select("id").in("status",["published","active"]).order("start_at",{ascending:false}).limit(1).maybeSingle();
      if (eventError) throw eventError;
      if (event) {
        const { error } = await client.from("derby_event_participation").upsert({event_id:event.id,user_id:userId,choice,updated_at:new Date().toISOString()},{onConflict:"event_id,user_id"});
        if (error) throw error;
      } else {
        const { error } = await client.from("derby_participation").upsert({user_id:userId,choice,updated_at:new Date().toISOString()},{onConflict:"user_id"});
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
      const { error }=await client.from("profiles").update({status:"approved"}).eq("id",userId); if(error)throw error;
    },
    async setMemberStatus(userId,status) {
      if (!configured) { const a=localState.accounts.find(x=>x.id===userId); if(a){a.status=status;a.approved=status==="approved";} localSave(localState); return; }
      const { error }=await client.from("profiles").update({status}).eq("id",userId); if(error)throw error;
    },
    async setRole(userId, role) {
      if (!configured) { const a=localState.accounts.find(x=>x.id===userId); if(a)a.role=role; localSave(localState); return; }
      const { error }=await client.from("profiles").update({role}).eq("id",userId); if(error)throw error;
    },
    async updatePublicProfile(profile) {
      if (!configured) {
        const a=localState.accounts.find(x=>x.id===profile.id);
        if(a){
          a.bio=profile.bio||"";
          a.gender=profile.gender||"";
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
        p_gender: profile.gender || null,
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
      const { error } = await client.rpc("update_derby_template", {
        p_template_id: template.id,
        p_name: template.name,
        p_description: template.description || null,
        p_task_total: template.taskTotal ?? null,
        p_extra_tasks: template.extraTasks ?? 0,
        p_max_points: template.maxPoints ?? null,
        p_daily_task_limit: template.dailyTaskLimit ?? null,
        p_rules: template.rules || [],
        p_strategy: template.strategy || []
      });
      if (error) throw error;
    },
    async publishDerbyEvent(event) {
      if (!configured) {
        localState.derbyManagement = localState.derbyManagement || {templates:[],events:[],next:null};
        event.id = Date.now(); event.status = "published"; event.published_at = new Date().toISOString();
        localState.derbyManagement.events.unshift(event); localState.derbyManagement.next = event;
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
      const changes = {status, published_at:status==="published"?new Date().toISOString():null};
      const { error } = await client.from("community_content").update(changes).eq("id",id);
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
      const { data:{user}, error:userError } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Du må være logget inn.");
      const { error } = await client.from("role_permissions").upsert({
        role, permission_key:permissionKey, enabled:!!enabled,
        updated_by:user.id, updated_at:new Date().toISOString()
      },{onConflict:"role,permission_key"});
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
