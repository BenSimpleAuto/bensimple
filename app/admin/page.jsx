"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import BrandWordmark from "../components/BrandWordmark";

const ADMIN_EMAIL = "ben@bensimple.co";

function Metric({label,value,sub}) {
  return (
    <div className="adminMetric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || session.user.email !== ADMIN_EMAIL) return;
    loadData();
  }, [session]);

  async function sendMagicLink(e) {
    e.preventDefault();
    setSending(true);
    setNotice("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` }
    });
    setNotice(error ? error.message : "Check your email for the secure sign-in link.");
    setSending(false);
  }

  async function loadData() {
    setLoading(true);
    const [{data: leadRows},{data: eventRows}] = await Promise.all([
      supabase.from("auto_leads").select("*").order("created_at",{ascending:false}).limit(200),
      supabase.from("auto_events").select("*").order("created_at",{ascending:false}).limit(1000)
    ]);
    setLeads(leadRows || []);
    setEvents(eventRows || []);
    setLoading(false);
  }

  async function updateStatus(id,status) {
    await supabase.from("auto_leads").update({status}).eq("id",id);
    setLeads((rows) => rows.map((r) => r.id === id ? {...r,status} : r));
  }

  const stats = useMemo(() => {
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    const leadCount = leads.length;
    const appointments = leads.filter(l => l.status === "appointment").length;
    const sold = leads.filter(l => l.status === "sold").length;
    const sourceMap = {};
    for (const l of leads) {
      const key = l.utm_source || l.source || "direct";
      sourceMap[key] = (sourceMap[key] || 0) + 1;
    }
    const sources = Object.entries(sourceMap).sort((a,b)=>b[1]-a[1]);
    return {uniqueSessions,leadCount,appointments,sold,sources};
  }, [leads,events]);

  if (loading && !session) {
    return <main className="adminPage"><div className="adminAuth"><h1>Loading dashboard.</h1></div></main>;
  }

  if (!session) {
    return (
      <main className="adminPage">
        <div className="adminAuth">
          <a className="wordmarkLink" href="/" aria-label="BenSimple home"><BrandWordmark /></a>
          <span className="eyebrow"><i /> PRIVATE DASHBOARD</span>
          <h1>Sign in to your sales dashboard.</h1>
          <p>This dashboard is restricted to {ADMIN_EMAIL}.</p>
          <form onSubmit={sendMagicLink}>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="pill primary" disabled={sending}>{sending ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
          {notice && <div className="adminNotice">{notice}</div>}
        </div>
      </main>
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <main className="adminPage">
        <div className="adminAuth">
          <h1>Not authorized.</h1>
          <button className="pill secondary" onClick={()=>supabase.auth.signOut()}>Sign out</button>
        </div>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminTop">
        <div>
          <a className="wordmarkLink" href="/" aria-label="BenSimple home"><BrandWordmark /></a>
          <span>Lead & conversion dashboard</span>
        </div>
        <div className="adminTopActions">
          <button onClick={loadData}>Refresh</button>
          <button onClick={()=>supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <section className="adminMetrics">
        <Metric label="Tracked sessions" value={stats.uniqueSessions} sub="Preview + live traffic" />
        <Metric label="Leads" value={stats.leadCount} sub={stats.uniqueSessions ? `${((stats.leadCount/stats.uniqueSessions)*100).toFixed(1)}% visitor → lead` : "Waiting for traffic"} />
        <Metric label="Appointments" value={stats.appointments} />
        <Metric label="Sold" value={stats.sold} />
      </section>

      <section className="adminPanel">
        <div className="adminPanelHead">
          <div><span className="eyebrow"><i /> PIPELINE</span><h2>Website leads</h2></div>
          <span>{leads.length} total</span>
        </div>

        <div className="leadTableWrap">
          <table className="leadTable">
            <thead><tr><th>When</th><th>Person</th><th>Need</th><th>Vehicle / trade</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {leads.length ? leads.map((l)=>(
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                  <td>
                    <strong>{l.name || "Unknown"}</strong>
                    {l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}
                    {l.email && <a href={`mailto:${l.email}`}>{l.email}</a>}
                  </td>
                  <td>{l.need || "Not provided"}{l.note && <small>{l.note}</small>}</td>
                  <td>{l.vehicle || "Not provided"}{l.trade && <small>Trade: {l.trade}</small>}</td>
                  <td>{l.utm_source || l.source || "direct"}{l.utm_campaign && <small>{l.utm_campaign}</small>}</td>
                  <td>
                    <select value={l.status} onChange={(e)=>updateStatus(l.id,e.target.value)}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="appointment">Appointment</option>
                      <option value="sold">Sold</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="emptyCell">No website leads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adminGrid">
        <div className="adminPanel">
          <div className="adminPanelHead"><div><span className="eyebrow"><i /> ATTRIBUTION</span><h2>Lead sources</h2></div></div>
          <div className="sourceList">
            {stats.sources.length ? stats.sources.map(([name,count])=><div key={name}><strong>{name}</strong><span>{count}</span></div>) : <p>No source data yet.</p>}
          </div>
        </div>

        <div className="adminPanel">
          <div className="adminPanelHead"><div><span className="eyebrow"><i /> ACTIVITY</span><h2>Top events</h2></div></div>
          <div className="sourceList">
            {Object.entries(events.reduce((m,e)=>{m[e.event_name]=(m[e.event_name]||0)+1;return m;},{})).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=><div key={name}><strong>{name}</strong><span>{count}</span></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}
