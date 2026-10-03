"use client";

import { useMemo, useState } from "react";

const PHONE = "4063995959";
const DISPLAY_PHONE = "406-399-5959";
const EMAIL = "ben@bensimple.co";
const INVENTORY = "https://www.butteauto.com/";
const INSTAGRAM = "https://www.instagram.com/benlavelle26/";
const FACEBOOK = "https://www.facebook.com/share/1G2DhPPrVo/";

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
  const [form, setForm] = useState({ need: "", vehicle: "", budget: "", trade: "", name: "", note: "" });

  const sms = useMemo(() => `sms:${PHONE}?&body=${encodeURIComponent(buildMessage(form))}`, [form]);

  function chooseNeed(value) {
    setForm((f) => ({ ...f, need: value }));
    setStep(1);
  }

  function reset() {
    setStep(0);
    setForm({ need: "", vehicle: "", budget: "", trade: "", name: "", note: "" });
  }

  return (
    <main>
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />
      <div className="grain" />

      <header className="nav shell">
        <a className="brand" href="#top" aria-label="BenSimple home">BenSimple<span>.</span></a>
        <div className="navRight">
          <a className="navLink" href="/specials">Specials</a>
          <a className="navLink" href={INVENTORY} target="_blank" rel="noreferrer">Inventory</a>
          <a className="pill ghost" href={`tel:${PHONE}`}>Call Ben</a>
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow"><i /> Butte, Montana · New + Used</div>
          <h1>Cars don't have to be <span>complicated.</span></h1>
          <p className="lede">
            Buying, trading, finding, comparing, or just trying to figure out what a button does?
            Tell me what you need. I'll help you make it simple.
          </p>

          <div className="heroActions">
            <button className="pill primary" onClick={() => setDrawer(true)}>Tell Ben what you need</button>
            <a className="pill secondary" href={INVENTORY} target="_blank" rel="noreferrer">Browse inventory</a>
          </div>

          <div className="trustRow">
            <div><b>No pressure</b><span>Start with a question</span></div>
            <div><b>8 brands + used</b><span>More choices, less tunnel vision</span></div>
            <div><b>Local help</b><span>Butte Auto · Butte, MT</span></div>
          </div>
        </div>

        <div className="heroVisual">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="portraitCard">
            <img src="/ben-profile.webp" alt="BenSimple cartoon portrait of Ben LaVelle" />
          </div>
          <div className="floatCard floatTop">
            <span className="miniLabel">BEN HELPS</span>
            <strong>Find the right fit</strong>
            <small>Not just the next car on the lot.</small>
          </div>
          <div className="floatCard floatBottom">
            <span className="pulse" />
            <div><strong>Text Ben</strong><small>{DISPLAY_PHONE}</small></div>
          </div>
        </div>
      </section>

      <section className="quick shell">
        <a href="#help"><span>01</span><strong>Find me a vehicle</strong><small>Tell me what matters</small></a>
        <a href="#help"><span>02</span><strong>Value my trade</strong><small>Start the conversation</small></a>
        <a href={INVENTORY} target="_blank" rel="noreferrer"><span>03</span><strong>Browse inventory</strong><small>New + used at Butte Auto</small></a>
        <a href="/specials"><span>04</span><strong>Monthly specials</strong><small>Manager-approved offers</small></a>
      </section>

      <section className="specialTeaser shell">
        <div>
          <span className="eyebrow"><i /> CURRENT OFFERS</span>
          <h2>Monthly specials without hijacking the homepage.</h2>
          <p>
            The main message stays simple. Featured rebates, price moves, and manager-approved vehicles live on their own page and can change month to month.
          </p>
        </div>
        <a className="pill secondary" href="/specials">See current specials</a>
      </section>

      <section className="help shell" id="help">
        <div className="sectionHead">
          <span className="eyebrow"><i /> START HERE</span>
          <h2>What are you trying to figure out?</h2>
          <p>You do not need to know the exact make, model, trim, payment, or answer before you contact me.</p>
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
            <h2>One person. A lot more inventory.</h2>
            <p>
              I can help with RAM, Dodge, Chrysler, Jeep, Chevrolet, GMC, Toyota, Subaru, and used vehicles.
              The point is not to force one badge. The point is to find what actually works for you.
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
          <h2>See what I'm working on at the dealership.</h2>
          <p>Fresh trades, useful car tips, deliveries, local stuff, and the occasional thing that probably should have stayed in the group chat.</p>
        </div>
        <div className="socialButtons">
          <a className="socialBtn" href={FACEBOOK} target="_blank" rel="noreferrer">Facebook <span>Follow BenSimple</span></a>
          <a className="socialBtn" href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram <span>@benlavelle26</span></a>
          <a className="socialBtn mutedSocial" href="mailto:ben@bensimple.co">Email <span>ben@bensimple.co</span></a>
        </div>
      </section>

      <section className="contact shell">
        <div>
          <span className="eyebrow"><i /> BEN LAVELLE</span>
          <h2>It's BenSimple all along.</h2>
          <p>If you have a vehicle question, you have a place to start.</p>
        </div>
        <div className="contactButtons">
          <a className="pill primary" href={`sms:${PHONE}`}>Text {DISPLAY_PHONE}</a>
          <a className="pill secondary" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </section>

      <footer className="shell footer">
        <a className="brand" href="#top">BenSimple<span>.</span></a>
        <p>Cars don't have to be complicated.</p>
        <div className="footerLinks">
          <a href="/specials">Specials</a>
          <a href="/legal">Disclosures & Privacy</a>
        </div>
        <span>Butte Auto · Butte, Montana</span>
      </footer>

      <div className="mobileBar">
        <a href={`tel:${PHONE}`}>Call</a>
        <a href={`sms:${PHONE}`}>Text</a>
        <button onClick={() => setDrawer(true)}>Tell Ben</button>
      </div>

      {drawer && (
        <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}>
          <div className="drawer">
            <button className="close" onClick={() => setDrawer(false)} aria-label="Close">×</button>
            <div className="progress"><span style={{ width: step === 0 ? "30%" : step === 1 ? "62%" : "100%" }} /></div>

            {step === 0 && (
              <>
                <span className="eyebrow"><i /> QUICK START</span>
                <h3>What can I help with?</h3>
                <div className="drawerChoices">
                  {needs.map(([value, title]) => <button key={value} onClick={() => chooseNeed(title)}>{title}<span>→</span></button>)}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <span className="eyebrow"><i /> A LITTLE CONTEXT</span>
                <h3>Give me enough to be useful.</h3>
                <label>Vehicle or type you're considering
                  <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Example: AWD SUV under 30k" />
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
                <span className="eyebrow"><i /> READY</span>
                <h3>Send it straight to Ben.</h3>
                <p className="drawerCopy">Your phone will open a text with the details already filled in. Edit anything you want before sending.</p>
                <label>Your name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First name is fine" />
                </label>
                <a className="pill primary full center" href={sms}>Open text to Ben</a>
                <a className="plainLink" href={`mailto:${EMAIL}?subject=BenSimple%20vehicle%20help&body=${encodeURIComponent(buildMessage(form))}`}>Prefer email?</a>
                <button className="plainLink buttonLink" onClick={reset}>Start over</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
