(function () {
  "use strict";

  const STORAGE_KEY = "wgangPortalV080";
  const TASK_TYPES = (window.ROOSTER_DATA && window.ROOSTER_DATA.taskTypes) || ["Hvete","Mais","Gulrot","Bønner","Sukkererter","Jordbær","Potet","Annen høsting","Melk","Bacon","Egg","Ull","Geitemelk","Mate dyr","Produksjonsoppgaver","Lastebiloppgaver","Båtoppgaver","Besøkende","Spesifikke personer","Spesifikke hus","Fiskeoppgaver","Gruveoppgaver","Hjelpeoppgaver","Produkter","Dyr","Transportmidler","Annet"];
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
      name: row.hay_day_name,
      email: row.email || "",
      role: row.role || "member",
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
    const { data, error } = await client.from("profiles").select("id,email,hay_day_name,role,status").eq("id", userId).single();
    if (error) throw error;
    return data;
  }

  async function loadRemoteState(session) {
    if (!session || !session.user) return { accounts: [], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, currentUserId: null };
    const own = await getOwnProfile(session.user.id);
    if (own.status !== "approved") {
      return { accounts: [mapProfile(own, [], [])], derby: clone(DEFAULT_DERBY), content:{announcements:[],derbyPosts:[],tips:[],pendingTips:[]}, currentUserId: own.id };
    }
    const [profilesRes, participationRes, preferencesRes, derbyRes, contentRes] = await Promise.all([
      client.from("profiles").select("id,email,hay_day_name,role,status").order("hay_day_name"),
      client.from("derby_participation").select("user_id,choice"),
      client.from("task_preferences").select("user_id,task_type,preference"),
      client.from("derby_settings").select("id,type,task_total,max_points,strategy").eq("id", 1).maybeSingle(),
      client.from("community_content").select("id,author_id,kind,title,body,category,status,created_at,published_at").order("created_at", {ascending:false})
    ]);
    for (const result of [profilesRes, participationRes, preferencesRes, derbyRes, contentRes]) {
      if (result.error) throw result.error;
    }
    const accounts = (profilesRes.data || []).map(row => mapProfile(row, participationRes.data, preferencesRes.data));
    const d = derbyRes.data;
    const derby = d ? { type:d.type, taskTotal:d.task_total, maxPoints:d.max_points, strategy:Array.isArray(d.strategy)?d.strategy:clone(DEFAULT_DERBY.strategy) } : clone(DEFAULT_DERBY);
    const contentRows = mapContent(contentRes.data, accounts);
    const content = {
      announcements: contentRows.filter(x => x.kind === "announcement" && x.status === "published"),
      derbyPosts: contentRows.filter(x => x.kind === "derby" && x.status === "published"),
      tips: contentRows.filter(x => x.kind === "tip" && x.status === "published"),
      pendingTips: contentRows.filter(x => x.kind === "tip" && x.status === "pending")
    };
    return { accounts, derby, content, currentUserId: session.user.id };
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
      const { error } = await client.from("derby_participation").upsert({user_id:userId,choice,updated_at:new Date().toISOString()},{onConflict:"user_id"});
      if (error) throw error;
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
    async saveDerby(derby) {
      if (!configured) { localState.derby=clone(derby); localSave(localState); return; }
      const { error }=await client.from("derby_settings").upsert({id:1,type:derby.type,task_total:derby.taskTotal,max_points:derby.maxPoints,strategy:derby.strategy,updated_at:new Date().toISOString()},{onConflict:"id"}); if(error)throw error;
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
