"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { LEAD_STATUSES } from "../../lib/leadStatuses";
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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);

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
      email: ADMIN_EMAIL,
      options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: false }
    });
    setNotice(error ? error.message : "Check your email for the secure sign-in link.");
    setSending(false);
  }

  async function loadData() {
    setLoading(true);
    setNotice("");
    const [leadResult, eventResult, reviewResult] = await Promise.all([
      supabase.from("auto_leads").select("*").order("created_at",{ascending:false}).limit(200),
      supabase.from("auto_events").select("*").order("created_at",{ascending:false}).limit(1000),
      supabase.from("customer_reviews").select("*").order("created_at",{ascending:false}).limit(200)
    ]);
    const error = leadResult.error || eventResult.error || reviewResult.error;
    if (error) setNotice("Dashboard data could not be loaded. Check the database access policies.");
    setLeads(leadResult.data || []);
    setEvents(eventResult.data || []);
    setReviews(reviewResult.data || []);
    setLoading(false);
  }

  async function updateStatus(id,status) {
    setNotice("");
    const { error } = await supabase.from("auto_leads").update({status}).eq("id",id);
    if (error) {
      setNotice("Lead status did not save.");
      return;
    }
    setLeads((rows) => rows.map((r) => r.id === id ? {...r,status} : r));
  }

  async function updateReviewStatus(id, status) {
    setNotice("");
    const update = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id
    };
    const { error } = await supabase.from("customer_reviews").update(update).eq("id", id);
    if (error) {
      setNotice("Review decision did not save.");
      return;
    }
    setReviews((rows) => rows.map((review) => review.id === id ? { ...review, ...update } : review));
  }

  const stats = useMemo(() => {
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    const leadCount = leads.length;
    const appointments = leads.filter(l => ["appointment_requested", "appointment_confirmed"].includes(l.status)).length;
    const sold = leads.filter(l => l.status === "sold").length;
    const sourceMap = {};
    for (const l of leads) {
      const key = l.utm_source || l.source || "direct";
      sourceMap[key] = (sourceMap[key] || 0) + 1;
    }
    const sources = Object.entries(sourceMap).sort((a,b)=>b[1]-a[1]);
    const pendingReviews = reviews.filter((review) => review.status === "pending").length;
    return {uniqueSessions,leadCount,appointments,sold,sources,pendingReviews};
  }, [leads,events,reviews]);

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
            <input type="email" value={ADMIN_EMAIL} readOnly aria-label="Authorized admin email" />
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
          <span>BenSimple AI BDC pipeline</span>
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
        <Metric label="Reviews to approve" value={stats.pendingReviews} />
      </section>
      {notice && <div className="adminNotice dashboardNotice" role="status">{notice}</div>}

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
                  <td>{l.need || "Not provided"}{l.metadata?.lead_temperature && <small>{l.metadata.lead_temperature} · {l.metadata.buying_timeframe || "Timing not established"}</small>}{l.metadata?.next_action && <small>Next: {l.metadata.next_action}</small>}{l.note && <small>{l.note}</small>}</td>
                  <td>{l.vehicle || "Not provided"}{l.trade && <small>Trade: {l.trade}</small>}</td>
                  <td>{l.utm_source || l.source || "direct"}{l.utm_campaign && <small>{l.utm_campaign}</small>}</td>
                  <td>
                    <select value={l.status} onChange={(e)=>updateStatus(l.id,e.target.value)}>{LEAD_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="emptyCell">No website leads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHead">
          <div><span className="eyebrow"><i /> PRIVATE REVIEW QUEUE</span><h2>Customer submissions</h2></div>
          <span>{stats.pendingReviews} awaiting review</span>
        </div>
        <div className="reviewQueue">
          {reviews.length ? reviews.map((review) => <article className="reviewQueueItem" key={review.id}>
            <div className="reviewQueueMeta">
              <span>{new Date(review.created_at).toLocaleString()}</span>
              <strong>{review.rating}/5 · {review.status}</strong>
            </div>
            <blockquote>“{review.review_text}”</blockquote>
            <div className="reviewQueueDetails">
              <span>Submitted by: {review.name}</span>
              <a href={`mailto:${review.email}`}>{review.email}</a>
              <span>Display as: {review.display_name}</span>
              {review.vehicle && <span>Vehicle: {review.vehicle}</span>}
              <span>Publishing permission: {review.permission_to_publish ? "Yes" : "No"}</span>
            </div>
            <div className="reviewQueueActions">
              <button type="button" className={review.status === "approved" ? "active" : ""} onClick={() => updateReviewStatus(review.id, "approved")}>Approve</button>
              <button type="button" className={review.status === "rejected" ? "active" : ""} onClick={() => updateReviewStatus(review.id, "rejected")}>Reject</button>
            </div>
          </article>) : <p className="emptyCell">No customer review submissions yet.</p>}
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
