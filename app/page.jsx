"use client";

import { useEffect, useMemo, useState } from "react";
import { submitLead, track } from "../lib/track";

const PHONE = "4063995959";
const DISPLAY_PHONE = "406-399-5959";
const EMAIL = "ben@bensimple.co";
const INVENTORY = "https://www.butteauto.com/";
const INSTAGRAM = "https://www.instagram.com/benlavelle26/";
const FACEBOOK = "https://www.facebook.com/benlavelle26";

const needs = [
  ["vehicle", "I need a vehicle", "Tell me what fits your life and budget."],
  ["trade", "I have a trade", "Get a simple path to figuring out what it is worth."],
  ["compare", "I'm comparing vehicles", "I'll help you sort out the real differences."],
  ["question", "I have a car question", "Features, ownership, towing, AWD, buttons, anything."],
  ["browse", "I'm just browsing", "No pressure. Start with inventory or ask a question."]
];

function buildMessage(form) {
  const rows = [
    "Hi Ben, I came from BenSimple.co.",
    `I need help with: ${form.need || "vehicle shopping"}`,
    form.vehicle ? `Vehicle / type: ${form.vehicle}` : "",
    form.budget ? `Budget: ${form.budget}` : "",
    form.trade ? `Trade: ${form.trade}` : "",
    form.name ? `Name: ${form.name}` : "",
    form.note ? `Note: ${form.note}` : ""
  ].filter(Boolean);
  return rows.join("\n");
}

export default function Home() {
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    need: "", vehicle: "", budget: "", trade: "", name: "", phone: "", email: "", note: "", consent: false
  });

  useEffect(() => {
    track("page_view");
  }, []);

  const sms = useMemo(() => `sms:${PHONE}?&body=${encodeURIComponent(buildMessage(form))}`, [form]);

  function openDrawer(source = "unknown") {
    track("tell_ben_opened", { source });
    setDrawer(true);
  }

  function chooseNeed(value) {
    setForm((f) => ({ ...f, need: value }));
    track("need_selected", { need: value });
    setStep(1);
  }

  function reset() {
    setStep(0);
    setError("");
    setForm({ need: "", vehicle: "", budget: "", trade: "", name: "", phone: "", email: "", note: "", consent: false });
  }

  async function finishLead() {
    setError("");
    if (!form.name.trim()) {
      setError("Add your name so I know who I am helping.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError("Add a phone number or email so I can get back to you.");
      return;
    }
    if (!form.consent) {
      setError("Please confirm I can contact you about this request.");
      return;
    }

    setSubmitting(true);
    try {
      await submitLead(form);
      setStep(3);
    } catch {
      setError("I couldn't save that request yet. You can still text or email Ben directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />
      <div className="grain" />

      <header className="nav shell">
        <a className="brandLockup" href="#top" aria-label="BenSimple home"><span className="brandBen">Ben</span><span className="brandSimple">Simple.</span><small>IT'S BENSIMPLE ALL ALONG.</small></a>
        <div className="navRight">
          <a className="navLink" href="/specials" onClick={() => track("specials_nav_clicked")}>Specials</a>
          <a className="navLink" href={INVENTORY} target="_blank" rel="noreferrer" onClick={() => track("inventory_clicked", { placement: "nav" })}>Inventory</a>
          <a className="pill ghost" href={`tel:${PHONE}`} onClick={() => track("call_clicked", { placement: "nav" })}>Call Ben</a>
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow"><i /> BEN LAVELLE · BUTTE AUTO · BUTTE, MT</div>
          <h1>Need a vehicle?<br/><span>Start with Ben.</span></h1>
          <p className="lede">
            New, used, trade-in help, vehicle questions, or a hard-to-find car. Tell me what you are trying to do and I will help you sort it out.
          </p>
          <div className="heroPromise">Cars don't have to be complicated.</div>

          <div className="heroActions">
            <button className="pill primary" onClick={() => openDrawer("hero")}>Help me find a vehicle</button>
            <a className="pill secondary" href={`sms:${PHONE}`} onClick={() => track("text_clicked", { placement: "hero" })}>Text Ben</a>
          </div>

          <div className="trustRow">
            <div><b>New + used</b><span>Across the Butte Auto group</span></div>
            <div><b>Trades welcome</b><span>Bring me what you have</span></div>
            <div><b>Real local help</b><span>Before and after the sale</span></div>
          </div>
        </div>

        <div className="heroVisual">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="portraitCard">
            <img src="/ben-profile.webp" alt="BenSimple cartoon portrait of Ben LaVelle" />
          </div>
          <div className="floatCard floatTop">
            <span className="miniLabel">BENSIMPLE</span>
            <strong>Buy · Trade · Find · Learn</strong>
            <small>One place to start with any vehicle question.</small>
          </div>
          <div className="floatCard floatBottom">
            <span className="pulse" />
            <div><strong>Text Ben</strong><small>{DISPLAY_PHONE}</small></div>
          </div>
        </div>
      </section>

      <section className="quick shell">
        <button onClick={() => { chooseNeed("I need a vehicle"); setDrawer(true); }}><span>01</span><strong>Find me a vehicle</strong><small>Tell me what matters</small></button>
        <button onClick={() => { chooseNeed("I have a trade"); setDrawer(true); }}><span>02</span><strong>Value my trade</strong><small>Start the conversation</small></button>
        <a href={INVENTORY} target="_blank" rel="noreferrer" onClick={() => track("inventory_clicked", { placement: "quick" })}><span>03</span><strong>Browse inventory</strong><small>New + used at Butte Auto</small></a>
        <a href="/specials" onClick={() => track("specials_clicked", { placement: "quick" })}><span>04</span><strong>Monthly specials</strong><small>Manager-approved offers</small></a>
      </section>

      <section className="specialTeaser shell">
        <div>
          <span className="eyebrow"><i /> CURRENT OFFERS</span>
          <h2>The good stuff this month.</h2>
          <p>
            Real price moves, rebates worth knowing about, aged inventory, and vehicles I think deserve attention. I verify the details before they go live.
          </p>
        </div>
        <a className="pill secondary" href="/specials" onClick={() => track("specials_clicked", { placement: "teaser" })}>See current specials</a>
      </section>

      <section className="help shell" id="help">
        <div className="sectionHead">
          <span className="eyebrow"><i /> START HERE</span>
          <h2>You do not need to have it all figured out.</h2>
          <p>Tell me what you need the vehicle to do, what you want to spend, or what is confusing you. We can start there.</p>
        </div>

        <div className="needGrid">
          {needs.map(([value, title, copy]) => (
            <button key={value} className="needCard" onClick={() => { chooseNeed(title); setDrawer(true); }}>
              <span className="arrow">↗</span>
              <strong>{title}</strong>
              <small>{copy}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="local shell">
        <div className="localCard">
          <div>
            <span className="eyebrow"><i /> BUTTE AUTO</span>
            <h2>I am not here to force one badge.</h2>
            <p>
              I can work with RAM, Dodge, Chrysler, Jeep, Chevrolet, GMC, Toyota, Subaru, plus used vehicles. If the right answer is across the group instead of directly in front of me, I will go look for it.
            </p>
          </div>
          <div className="brandRail" aria-label="Vehicle brands">
            {["RAM","DODGE","CHRYSLER","JEEP","CHEVROLET","GMC","TOYOTA","SUBARU","USED"].map((x) => <span key={x}>{x}</span>)}
          </div>
        </div>
      </section>

      <section className="social shell">
        <div>
          <span className="eyebrow"><i /> FOLLOW BENSIMPLE</span>
          <h2>Follow the cars, the deals, and the useful stuff.</h2>
          <p>Fresh trades, used-car finds, feature help, deliveries, Butte life, and whatever automotive problem I am solving that day.</p>
        </div>
        <div className="socialButtons">
          <a className="socialBtn" href={FACEBOOK} target="_blank" rel="noreferrer" onClick={() => track("social_clicked", { platform: "facebook" })}>Facebook <span>Follow BenSimple</span></a>
          <a className="socialBtn" href={INSTAGRAM} target="_blank" rel="noreferrer" onClick={() => track("social_clicked", { platform: "instagram" })}>Instagram <span>@benlavelle26</span></a>
          <a className="socialBtn mutedSocial" href={`mailto:${EMAIL}`} onClick={() => track("email_clicked", { placement: "social" })}>Email <span>{EMAIL}</span></a>
        </div>
      </section>

      <section className="contact shell">
        <div>
          <span className="eyebrow"><i /> BEN LAVELLE</span>
          <h2>It's BenSimple all along.</h2>
          <p>Buying, trading, finding, or figuring one out. Start here.</p>
        </div>
        <div className="contactButtons">
          <a className="pill primary" href={`sms:${PHONE}`} onClick={() => track("text_clicked", { placement: "contact" })}>Text {DISPLAY_PHONE}</a>
          <a className="pill secondary" href={`mailto:${EMAIL}`} onClick={() => track("email_clicked", { placement: "contact" })}>{EMAIL}</a>
        </div>
      </section>

      <footer className="shell footer">
        <a className="brandLockup footerBrand" href="#top"><span className="brandBen">Ben</span><span className="brandSimple">Simple.</span></a>
        <p>Cars don't have to be complicated.</p>
        <div className="footerLinks">
          <a href="/specials">Specials</a>
          <a href="/legal">Disclosures & Privacy</a>
        </div>
        <span>Butte Auto · Butte, Montana</span>
      </footer>

      <div className="mobileBar">
        <a href={`tel:${PHONE}`} onClick={() => track("call_clicked", { placement: "mobile_bar" })}>Call</a>
        <a href={`sms:${PHONE}`} onClick={() => track("text_clicked", { placement: "mobile_bar" })}>Text</a>
        <button onClick={() => openDrawer("mobile_bar")}>Tell Ben</button>
      </div>

      {drawer && (
        <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}>
          <div className="drawer">
            <button className="close" onClick={() => setDrawer(false)} aria-label="Close">×</button>
            <div className="progress"><span style={{ width: step === 0 ? "20%" : step === 1 ? "45%" : step === 2 ? "75%" : "100%" }} /></div>

            {step === 0 && (
              <>
                <span className="eyebrow"><i /> START HERE</span>
                <h3>What do you need from me?</h3>
                <div className="drawerChoices">
                  {needs.map(([value, title]) => <button key={value} onClick={() => chooseNeed(title)}>{title}<span>→</span></button>)}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <span className="eyebrow"><i /> THE VEHICLE</span>
                <h3>What are we looking for?</h3>
                <label>Vehicle, body style, or idea
                  <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Example: white AWD SUV, truck for towing, cheap commuter..." />
                </label>
                <div className="split">
                  <label>Budget
                    <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Example: around $25k" />
                  </label>
                  <label>Trade
                    <input value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} placeholder="Example: 2018 F-150" />
                  </label>
                </div>
                <label>Anything else?
                  <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Commute, towing, color, must-have features, whatever matters." />
                </label>
                <button className="pill primary full" onClick={() => setStep(2)}>Continue</button>
              </>
            )}

            {step === 2 && (
              <>
                <span className="eyebrow"><i /> YOUR INFO</span>
                <h3>Where should I reach you?</h3>
                <label>Your name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First and last name" />
                </label>
                <div className="split">
                  <label>Phone
                    <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="406-555-1234" />
                  </label>
                  <label>Email
                    <input inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                  </label>
                </div>
                <label className="consentRow">
                  <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
                  <span>I agree Ben may contact me about this request. Message and data rates may apply. <a href="/legal" target="_blank">Privacy & disclosures</a>.</span>
                </label>
                {error && <div className="formError">{error}</div>}
                <button className="pill primary full" onClick={finishLead} disabled={submitting}>{submitting ? "Sending..." : "Send my request to Ben"}</button>
                <p className="formFine">This goes directly into BenSimple so I can follow up on what you asked for.</p>
              </>
            )}

            {step === 3 && (
              <>
                <span className="eyebrow"><i /> SENT</span>
                <h3>I have it.</h3>
                <p className="drawerCopy">Your request is saved. If you want to jump the line, open a text to me right now.</p>
                <a className="pill primary full center" href={sms} onClick={() => track("text_clicked_after_lead")}>Text Ben now</a>
                <a className="pill secondary full center" href={INVENTORY} target="_blank" rel="noreferrer">Browse inventory</a>
                <button className="plainLink buttonLink" onClick={reset}>Start another request</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
