"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "../../lib/track";

const INVENTORY = "https://www.butteauto.com/all-inventory/index.htm";
const PHONE = "4063995959";
const starters = [
  ["Find a Vehicle", "I need help finding a vehicle."],
  ["Trade / Sell", "I have a vehicle to trade or sell."],
  ["Ask a Car Question", "I have a car question."],
  ["Check a VIN", "I want to decode a VIN."],
  ["Check Recalls", "I want to check for recalls."],
  ["Browse Inventory", "I saw a vehicle on Butte Auto and want help with inventory."],
  ["Talk to Ben", "I would like Ben to contact me."]
];

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("bensimple_session_id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("bensimple_session_id", id);
  }
  return id;
}

function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  let referringHost = "direct";
  if (document.referrer) {
    try {
      referringHost = new URL(document.referrer).hostname;
    } catch {
      referringHost = "referral";
    }
  }
  return {
    pagePath: window.location.pathname,
    referrer: document.referrer || null,
    source: params.get("source") || params.get("utm_source") || referringHost,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content")
  };
}

function RecallResults({ data }) {
  if (!data) return null;
  return <section className="agentResult" aria-label="NHTSA recall results">
    <header><span>NHTSA RECALL DATA</span><strong>{data.count} record{data.count === 1 ? "" : "s"}</strong></header>
    {data.recalls?.slice(0, 4).map((recall) => <article key={recall.campaign || recall.component}>
      <b>{recall.component || "Safety recall"}</b>
      {recall.campaign && <small>Campaign {recall.campaign}</small>}
      <p>{recall.summary || "Open the official NHTSA record for details."}</p>
    </article>)}
    <p className="sourceNote">{data.disclaimer}</p>
  </section>;
}

function VinResult({ data }) {
  if (!data) return null;
  return <section className="agentResult vinResult" aria-label="NHTSA VIN decode">
    <header><span>NHTSA VPIC DECODE</span><strong>{[data.year, data.make, data.model].filter(Boolean).join(" ")}</strong></header>
    <dl>
      {data.bodyClass && <div><dt>Body</dt><dd>{data.bodyClass}</dd></div>}
      {data.driveType && <div><dt>Drive</dt><dd>{data.driveType}</dd></div>}
      {data.engine && <div><dt>Engine</dt><dd>{data.engine}</dd></div>}
    </dl>
  </section>;
}

export default function BdcAgent() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi, I’m BenSimple. What can Ben help you with today?" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [qualification, setQualification] = useState(null);
  const [nhtsa, setNhtsa] = useState({});
  const [handoffSent, setHandoffSent] = useState(false);
  const transcriptRef = useRef(null);
  const [sessionId] = useState(getSessionId);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(text) {
    const message = String(text || input).trim();
    if (!message || busy) return;
    const nextMessages = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setNotice("");
    setHandoffSent(false);
    if (messages.length === 1) track("bdc_started", { starter: Boolean(text) });
    try {
      const response = await fetch("/api/bdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: nextMessages })
      });
      const data = await response.json();
      if (!response.ok && !data.message) throw new Error(data.error || "Assistant unavailable");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
      setQualification(data.qualification || null);
      setNhtsa(data.nhtsa || {});
      track("bdc_response", {
        mode: data.mode,
        intent: data.qualification?.intent || null,
        leadTemperature: data.qualification?.leadTemperature || null,
        handoffReady: Boolean(data.qualification?.handoffReady)
      });
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I hit a temporary problem. You can keep your message here and send it directly to Ben below." }]);
      setNotice("The assistant is temporarily unavailable.");
      track("bdc_error");
    } finally {
      setBusy(false);
    }
  }

  async function sendToBen() {
    if (!qualification?.handoffReady || handoffSent) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages, consent: true, attribution: getAttribution() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setHandoffSent(true);
      setNotice(data.appointmentStatus === "Needs Ben Confirmation" ? "Appointment request sent. Ben will confirm the time personally." : "Sent to Ben. He has the conversation summary and next action.");
      track("bdc_handoff_sent", { appointmentRequested: data.appointmentStatus === "Needs Ben Confirmation" });
    } catch (error) {
      setNotice(error.message || "That did not save. Please text or call Ben directly.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="bdcAgent" id="bensimple-ai" aria-labelledby="agentTitle">
    <aside className="agentMasthead">
      <span className="sectionLabel">BenSimple AI</span>
      <h2 id="agentTitle">Start with Ben.</h2>
      <p>Ask naturally. The assistant will answer what it can, gather only what matters, and work toward the right next step.</p>
      <div className="agentTrust">
        <span>NO VEHICLE PRICES</span>
        <span>NO FAKE AVAILABILITY</span>
        <span>BEN CONFIRMS APPOINTMENTS</span>
      </div>
      <a className="agentDirect" href={`sms:${PHONE}`}>Prefer a person? Text Ben directly.</a>
    </aside>

    <div className="agentConsole">
      <div className="agentStatus"><span><i /> ONLINE AUTOMOTIVE ASSISTANT</span><b>BEN REVIEWS LEADS</b></div>
      <div className="agentStarters" aria-label="Conversation starters">
        {starters.map(([label, prompt]) => label === "Browse Inventory"
          ? <a key={label} href={INVENTORY} target="_blank" rel="noreferrer">{label}</a>
          : <button key={label} type="button" onClick={() => sendMessage(prompt)} disabled={busy}>{label}</button>)}
      </div>
      <div className="agentTranscript" ref={transcriptRef} aria-live="polite">
        {messages.map((message, index) => <div className={`agentMessage ${message.role}`} key={`${message.role}-${index}`}>
          <span>{message.role === "assistant" ? "BENSIMPLE AI" : "YOU"}</span>
          <p>{message.content}</p>
        </div>)}
        {busy && <div className="agentMessage assistant thinking"><span>BENSIMPLE AI</span><p>Working on the best next step…</p></div>}
        <VinResult data={nhtsa.vin} />
        <RecallResults data={nhtsa.recalls} />
      </div>
      {qualification?.handoffReady && <div className="agentHandoff">
        <div><span>{qualification.appointment ? "APPOINTMENT REQUEST" : "READY FOR BEN"}</span><strong>{qualification.nextAction}</strong></div>
        <button type="button" onClick={sendToBen} disabled={busy || handoffSent}>{handoffSent ? "Sent to Ben" : "Send This to Ben"}</button>
        <small>By sending, you agree that Ben may contact you about this request.</small>
      </div>}
      {notice && <p className="agentNotice">{notice}</p>}
      <form className="agentComposer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
        <label htmlFor="agentInput">Your message</label>
        <textarea id="agentInput" rows="2" value={input} onChange={(event) => setInput(event.target.value)} placeholder="I’m looking for an AWD SUV under $30,000…" disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()}>Send</button>
      </form>
      <p className="agentFinePrint">Do not send Social Security numbers, banking information, passwords, or payment-card details.</p>
    </div>
  </section>;
}

