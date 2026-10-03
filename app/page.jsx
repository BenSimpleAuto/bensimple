"use client";

import { useEffect, useMemo, useState } from "react";
import { submitLead, track } from "../lib/track";

const PHONE = "4063995959";
const DISPLAY_PHONE = "406-399-5959";
const EMAIL = "ben@bensimple.co";
const INVENTORY = "https://www.butteauto.com/";
const INSTAGRAM = "https://www.instagram.com/benlavelle26/";
const FACEBOOK = "https://www.facebook.com/benlavelle26";

const intents = ["Buy", "Sell", "Trade", "Locate", "Ask Question"];
const vehicleTypes = ["Car", "Truck", "SUV", "Van", "Undecided"];
const conditions = ["New", "Used", "Either"];
const contactModes = ["Text", "Call", "Email"];
const contactTimes = ["Morning", "Afternoon", "Evening", "Anytime"];
const currentYear = 2027;
const years = Array.from({ length: 31 }, (_, i) => currentYear - i);

const featuredAdvice = [
  { tag: "RIGHT NOW", title: "Cold mornings are coming.", copy: "A quick tire-pressure, battery, coolant, wiper, and washer-fluid check now is easier than finding out what failed on the first ugly morning." },
  { tag: "FREE TOOL", title: "Check your VIN for open recalls.", copy: "NHTSA has a free recall lookup. If you find something you do not understand, send it to me and I will help you sort out the next step.", href: "https://www.nhtsa.gov/recalls", cta: "Open recall lookup" },
  { tag: "BENSIMPLE 101", title: "AWD and 4WD are not the same thing.", copy: "Both can help in Montana. Neither replaces good tires. I can help you figure out which setup actually fits how and where you drive." }
];

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function buildMessage(form) {
  const vehicle = [form.vehicleYear, form.vehicleMake, form.vehicleModel].filter(Boolean).join(" ");
  const rows = [
    "Hi Ben, I came from BenSimple.co.",
    form.intent ? "I'd like help with: " + form.intent : "",
    form.vehicleType ? "Type: " + form.vehicleType : "",
    vehicle ? "Vehicle: " + vehicle : "",
    form.budgetMode === "payment" && form.paymentMax ? "Budget: up to $" + form.paymentMax + "/mo" : "",
    form.budgetMode === "price" && form.budgetMax ? "Budget: " + money(form.budgetMin) + " to " + money(form.budgetMax) : "",
    form.tradeYear || form.tradeMake || form.tradeModel ? "Trade: " + [form.tradeYear, form.tradeMake, form.tradeModel].filter(Boolean).join(" ") : "",
    form.tradeMileage ? "Trade miles: " + Number(form.tradeMileage).toLocaleString() : "",
    form.note ? "Note: " + form.note : ""
  ].filter(Boolean);
  return rows.join("\n");
}

function ChoiceRow({ options, value, onChange, compact = false }) {
  return <div className={compact ? "choiceRow compact" : "choiceRow"}>{options.map((option) => (
    <button type="button" key={option} className={value === option ? "choice active" : "choice"} onClick={() => onChange(option)}>{option}</button>
  ))}</div>;
}

function MineFrame() {
  return <svg className="headframe" viewBox="0 0 220 150" aria-hidden="true"><path d="M45 135 L75 24 L145 24 L176 135 M67 58 H154 M60 83 H162 M53 108 H169 M84 24 L65 135 M136 24 L156 135 M89 8 H132 M110 8 V24" /></svg>;
}

export default function Home() {
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [vehicleDataLoading, setVehicleDataLoading] = useState(false);
  const [form, setForm] = useState({
    intent: "", vehicleType: "", vehicleCondition: "Either", vehicleYear: "", vehicleMake: "", vehicleModel: "",
    budgetMode: "price", budgetMin: 10000, budgetMax: 40000, paymentMax: 700,
    tradeYear: "", tradeMake: "", tradeModel: "", tradeVin: "", tradeMileage: "", tradeHasLien: null, tradeStory: "",
    firstName: "", lastName: "", phone: "", email: "", preferredContact: "", preferredTime: "Anytime", note: "", consent: false
  });

  useEffect(() => {
    track("page_view");
    fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json")
      .then((r) => r.json())
      .then((data) => setMakes([...new Set((data.Results || []).map((x) => x.Make_Name).filter(Boolean).sort((a,b)=>a.localeCompare(b)))]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.vehicleMake || !form.vehicleYear) { setModels([]); return; }
    setVehicleDataLoading(true);
    const url = "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/" + encodeURIComponent(form.vehicleMake) + "/modelyear/" + encodeURIComponent(form.vehicleYear) + "?format=json";
    fetch(url).then((r)=>r.json()).then((data)=>setModels([...new Set((data.Results || []).map((x)=>x.Model_Name).filter(Boolean).sort((a,b)=>a.localeCompare(b)))]))
      .catch(()=>setModels([])).finally(()=>setVehicleDataLoading(false));
  }, [form.vehicleMake, form.vehicleYear]);

  const sms = useMemo(() => "sms:" + PHONE + "?&body=" + encodeURIComponent(buildMessage(form)), [form]);

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })); }
  function startIntent(intent) { track("intent_selected", { intent }); setForm((f)=>({ ...f, intent })); setStep(1); setDrawer(true); }
  function reset() {
    setStep(0); setError("");
    setForm({ intent:"", vehicleType:"", vehicleCondition:"Either", vehicleYear:"", vehicleMake:"", vehicleModel:"", budgetMode:"price", budgetMin:10000, budgetMax:40000, paymentMax:700, tradeYear:"", tradeMake:"", tradeModel:"", tradeVin:"", tradeMileage:"", tradeHasLien:null, tradeStory:"", firstName:"", lastName:"", phone:"", email:"", preferredContact:"", preferredTime:"Anytime", note:"", consent:false });
  }
  async function finishLead() {
    setError("");
    if (!form.firstName.trim() || !form.lastName.trim()) { setError("Please add your first and last name."); return; }
    if (!form.phone.trim() && !form.email.trim()) { setError("Please add either a phone number or email so I can reach you."); return; }
    if (!form.consent) { setError("Please confirm that I may contact you about this request."); return; }
    setSubmitting(true);
    try { await submitLead(form); setStep(4); }
    catch { setError("That did not save correctly. You can still text or call me below while I fix it."); }
    finally { setSubmitting(false); }
  }

  const showTrade = ["Sell","Trade"].includes(form.intent);

  return (
    <main>
      <div className="grain" />
      <header className="nav shell">
        <a className="brandLockup" href="#top" aria-label="BenSimple home"><span className="brandBen">Ben</span><span className="brandSimple">Simple.</span><small>IT'S BENSIMPLE ALL ALONG.</small></a>
        <nav className="desktopNav"><a href="/specials">Specials</a><a href="#help">Car Help</a><a href={INVENTORY} target="_blank" rel="noreferrer">Inventory</a></nav>
        <a className="pill ghost" href={"tel:" + PHONE}>Call Ben</a>
      </header>

      <section className="brandHero" id="top"><div className="shell brandHeroInner">
        <div className="butteMark"><MineFrame /><span>BUTTE, MONTANA</span></div>
        <div className="heroCopy">
          <span className="eyebrow"><i /> BEN LAVELLE · BUTTE AUTO</span>
          <h1>Looking for a vehicle?<br/><span>It's BenSimple all along.</span></h1>
          <p className="heroWelcome">Glad you finally showed up. Let's get to work.</p>
          <p className="lede">New, used, trade, locate, sell, or just ask a question. Start with what you need and I will help make the next step clear.</p>
        </div>
        <div className="hostStage">
          <div className="hostCopy"><span className="hostKicker">YOUR LOCAL CAR GUY</span><strong>Buy. Sell. Trade. Locate. Learn.</strong><small>One place to start, even if you are not ready to buy anything.</small></div>
          <div className="hostCharacterPending"><img src="/ben-profile.webp" alt="" /><span>HOST BEN<br/>CHARACTER STAGE</span></div>
        </div>
        <div className="heroMenu" aria-label="What can Ben help with?">{intents.map((intent)=><button key={intent} onClick={()=>startIntent(intent)}>{intent}</button>)}</div>
      </div></section>

      <section className="accomplish shell">
        <div className="sectionHead"><span className="eyebrow"><i /> START HERE</span><h2>What can I help you accomplish today?</h2><p>Pick the closest answer. You do not have to know every detail before we start.</p></div>
        <div className="actionGrid">
          <button onClick={()=>startIntent("Buy")}><span>01</span><strong>Buy a vehicle</strong><small>New, used, or undecided.</small></button>
          <button onClick={()=>startIntent("Sell")}><span>02</span><strong>Sell me your vehicle</strong><small>Tell me about it. Good, bad, ugly. I can work with honest.</small></button>
          <button onClick={()=>startIntent("Trade")}><span>03</span><strong>Trade what you have</strong><small>Let's see what makes sense next.</small></button>
          <button onClick={()=>startIntent("Locate")}><span>04</span><strong>Locate something specific</strong><small>Color, trim, drivetrain, budget. Give me the mission.</small></button>
          <button onClick={()=>startIntent("Ask Question")}><span>05</span><strong>Ask a car question</strong><small>You do not have to be shopping to ask.</small></button>
        </div>
      </section>

      <section className="specialFeature shell">
        <div className="specialFeatureCopy"><span className="eyebrow"><i /> THIS MONTH</span><h2>Deals worth knowing about.</h2><p>Manager-confirmed offers get the BenSimple treatment. Regular inventory still lives on Butte Auto so you always land on the dealer's current vehicle listing.</p><div className="inlineActions"><a className="pill primary" href="/specials">See monthly specials</a><a className="pill secondary" href={INVENTORY} target="_blank" rel="noreferrer">Browse Butte Auto inventory</a></div></div>
        <div className="specialHost"><span>HOST MOMENT</span><strong>"What about this deal?"</strong><small>This space changes with the month, promotion, sport, holiday, or dealership campaign.</small></div>
      </section>

      <section className="brandAccess shell">
        <div><span className="eyebrow"><i /> BRAND ACCESS</span><h2>More choices than one badge.</h2><p>I can help across the Butte Auto group plus used inventory. The goal is the right fit, not forcing the vehicle sitting closest to my desk.</p></div>
        <div className="logoRail">{[["ram","RAM"],["dodge","DODGE"],["chrysler","CHRYSLER"],["jeep","JEEP"],["chevrolet","CHEVROLET"],["gmc","GMC"],["toyota","TOYOTA"],["subaru","SUBARU"]].map(([slug,name])=><div className="oemLogo" key={name}><img src={"https://cdn.simpleicons.org/" + slug + "/FFFFFF"} alt="" onError={(e)=>{e.currentTarget.style.display="none";}} /><span>{name}</span></div>)}</div>
      </section>

      <section className="advice shell" id="help">
        <div className="adviceTop"><div><span className="eyebrow"><i /> BENSIMPLE GARAGE</span><h2>Useful car stuff. Even when you are not buying.</h2><p>Tips, tools, recalls, features, ownership help, market changes, and whatever drivers should probably know right now.</p></div><div className="teacherBen"><img src="/ben-profile.webp" alt="" /><div><strong>Today's lesson:</strong><span>Cars do not have to be complicated.</span></div></div></div>
        <div className="adviceGrid">{featuredAdvice.map((item)=><article key={item.title}><span>{item.tag}</span><h3>{item.title}</h3><p>{item.copy}</p>{item.href && <a href={item.href} target="_blank" rel="noreferrer">{item.cta} ↗</a>}</article>)}</div>
      </section>

      <section className="social shell"><div><span className="eyebrow"><i /> FOLLOW BENSIMPLE</span><h2>Cars, deals, help, Butte, and whatever is happening that day.</h2><p>The website is home base. Social is where BenSimple gets to move.</p></div><div className="socialButtons"><a className="socialBtn" href={FACEBOOK} target="_blank" rel="noreferrer">Facebook <span>Ben LaVelle</span></a><a className="socialBtn" href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram <span>@benlavelle26</span></a><a className="socialBtn mutedSocial" href={"mailto:" + EMAIL}>Email <span>{EMAIL}</span></a></div></section>

      <section className="finalCta shell"><div><span className="eyebrow"><i /> READY?</span><h2>Let's get to work.</h2><p>Tell me what you need. I will take it from there.</p></div><div className="inlineActions"><button className="pill primary" onClick={()=>{setStep(0);setDrawer(true);}}>Start with Ben</button><a className="pill secondary" href={"sms:" + PHONE}>Text {DISPLAY_PHONE}</a></div></section>

      <footer className="shell footer"><a className="brandLockup footerBrand" href="#top"><span className="brandBen">Ben</span><span className="brandSimple">Simple.</span></a><p>Cars don't have to be complicated.</p><div className="footerLinks"><a href="/specials">Specials</a><a href="/legal">Disclosures & Privacy</a></div><span>Ben LaVelle · Butte Auto · Butte, Montana</span></footer>

      <div className="mobileBar"><a href={"tel:" + PHONE}>Call</a><a href={"sms:" + PHONE}>Text</a><button onClick={()=>{setStep(0);setDrawer(true);}}>Start Here</button></div>

      {drawer && <div className="overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setDrawer(false);}}><div className="drawer guidedDrawer">
        <button className="close" onClick={()=>setDrawer(false)} aria-label="Close">×</button>
        <div className="progress"><span style={{width: ((step+1)*20) + "%"}} /></div>

        {step===0 && <><span className="eyebrow"><i /> START HERE</span><h3>What can I help you accomplish today?</h3><ChoiceRow options={intents} value={form.intent} onChange={startIntent} /></>}

        {step===1 && <><span className="eyebrow"><i /> VEHICLE</span><h3>What kind of vehicle are we working with?</h3>
          <label>Vehicle type</label><ChoiceRow options={vehicleTypes} value={form.vehicleType} onChange={(v)=>update("vehicleType",v)} />
          <label>New, used, or either?</label><ChoiceRow options={conditions} value={form.vehicleCondition} onChange={(v)=>update("vehicleCondition",v)} compact />
          <div className="formGrid three">
            <label>Year<select value={form.vehicleYear} onChange={(e)=>{update("vehicleYear",e.target.value);update("vehicleModel","");}}><option value="">Any year</option>{years.map((year)=><option key={year} value={year}>{year}</option>)}</select></label>
            <label>Make<select value={form.vehicleMake} onChange={(e)=>{update("vehicleMake",e.target.value);update("vehicleModel","");}}><option value="">Any make</option>{makes.map((make)=><option key={make} value={make}>{make}</option>)}</select></label>
            <label>Model<select value={form.vehicleModel} onChange={(e)=>update("vehicleModel",e.target.value)} disabled={!form.vehicleMake || !form.vehicleYear || vehicleDataLoading}><option value="">{vehicleDataLoading ? "Loading..." : "Any model"}</option>{models.map((model)=><option key={model} value={model}>{model}</option>)}</select></label>
          </div>
          <div className="stepActions"><button className="plainBack" onClick={()=>setStep(0)}>Back</button><button className="pill primary" onClick={()=>setStep(2)}>Continue</button></div>
        </>}

        {step===2 && <><span className="eyebrow"><i /> BUDGET</span><h3>What would you like me to work around?</h3>
          <ChoiceRow options={["Price","Monthly Payment"]} value={form.budgetMode==="price"?"Price":"Monthly Payment"} onChange={(v)=>update("budgetMode",v==="Price"?"price":"payment")} compact />
          {form.budgetMode==="price" ? <div className="sliderBlock"><div className="sliderValue">{money(form.budgetMin)} to {money(form.budgetMax)}</div><label>Minimum<input type="range" min="0" max="100000" step="2500" value={form.budgetMin} onChange={(e)=>update("budgetMin",Math.min(Number(e.target.value),form.budgetMax))}/></label><label>Maximum<input type="range" min="5000" max="125000" step="2500" value={form.budgetMax} onChange={(e)=>update("budgetMax",Math.max(Number(e.target.value),form.budgetMin))}/></label></div>
          : <div className="sliderBlock"><div className="sliderValue">Up to $ {form.paymentMax}/month</div><label>Target monthly payment<input type="range" min="200" max="1800" step="50" value={form.paymentMax} onChange={(e)=>update("paymentMax",Number(e.target.value))}/></label><p className="formFine">Payment is a target, not a quote. Actual payment depends on vehicle, financing, term, taxes, fees, credit, and approved lender terms.</p></div>}
          {showTrade && <div className="tradeBlock"><span className="miniSection">YOUR CURRENT VEHICLE</span><div className="formGrid three"><label>Year<input inputMode="numeric" value={form.tradeYear} onChange={(e)=>update("tradeYear",e.target.value)} placeholder="2019"/></label><label>Make<input value={form.tradeMake} onChange={(e)=>update("tradeMake",e.target.value)} placeholder="Chevrolet"/></label><label>Model<input value={form.tradeModel} onChange={(e)=>update("tradeModel",e.target.value)} placeholder="Silverado"/></label></div><div className="formGrid two"><label>VIN <span className="optional">optional</span><input value={form.tradeVin} onChange={(e)=>update("tradeVin",e.target.value.toUpperCase())} maxLength="17" placeholder="17-character VIN"/></label><label>Mileage<input inputMode="numeric" value={form.tradeMileage} onChange={(e)=>update("tradeMileage",e.target.value.replace(/\D/g,""))} placeholder="82000"/></label></div><label>Is there a lien on the vehicle?</label><ChoiceRow options={["Yes","No"]} value={form.tradeHasLien===null?"":form.tradeHasLien?"Yes":"No"} onChange={(v)=>update("tradeHasLien",v==="Yes")} compact/><label>Tell me about it. Good, bad, ugly. <span className="optional">optional</span><textarea value={form.tradeStory} onChange={(e)=>update("tradeStory",e.target.value)} placeholder="Condition, damage, recent work, tires, things you love, things you don't..."/></label></div>}
          <label>Anything else I should know? <span className="optional">optional</span><textarea value={form.note} onChange={(e)=>update("note",e.target.value)} placeholder="Color, towing, commute, must-have features, deal-breakers, whatever matters."/></label>
          <div className="stepActions"><button className="plainBack" onClick={()=>setStep(1)}>Back</button><button className="pill primary" onClick={()=>setStep(3)}>Continue</button></div>
        </>}

        {step===3 && <><span className="eyebrow"><i /> CONTACT</span><h3>How may I reach you?</h3>
          <div className="formGrid two"><label>First name <span className="required">required</span><input value={form.firstName} onChange={(e)=>update("firstName",e.target.value)} autoComplete="given-name"/></label><label>Last name <span className="required">required</span><input value={form.lastName} onChange={(e)=>update("lastName",e.target.value)} autoComplete="family-name"/></label></div>
          <div className="formGrid two"><label>Phone <span className="optional">phone or email required</span><input inputMode="tel" value={form.phone} onChange={(e)=>update("phone",e.target.value)} autoComplete="tel" placeholder="406-555-1234"/></label><label>Email <span className="optional">phone or email required</span><input inputMode="email" value={form.email} onChange={(e)=>update("email",e.target.value)} autoComplete="email" placeholder="you@example.com"/></label></div>
          <label>How would you prefer I contact you?</label><ChoiceRow options={contactModes} value={form.preferredContact} onChange={(v)=>update("preferredContact",v)} compact/>
          <label>What time usually works best?</label><ChoiceRow options={contactTimes} value={form.preferredTime} onChange={(v)=>update("preferredTime",v)} compact/>
          <label className="consentRow"><input type="checkbox" checked={form.consent} onChange={(e)=>update("consent",e.target.checked)}/><span>I agree that Ben may contact me about this request. Message and data rates may apply. <a href="/legal" target="_blank">Privacy & disclosures</a>.</span></label>
          {error && <div className="formError">{error}</div>}
          <div className="stepActions"><button className="plainBack" onClick={()=>setStep(2)}>Back</button><button className="pill primary" onClick={finishLead} disabled={submitting}>{submitting?"Sending...":"Send this to Ben"}</button></div>
          <p className="formFine">Only your name and one way to reach you are required. Everything else simply helps me be useful when I respond.</p>
        </>}

        {step===4 && <><span className="eyebrow"><i /> GOT IT</span><h3>Thanks. I have what you sent.</h3><p className="drawerCopy">If you want the quickest possible response, open a text to me now. I already built the message from what you entered.</p><a className="pill primary full center" href={sms}>Text Ben now</a><a className="pill secondary full center" href={INVENTORY} target="_blank" rel="noreferrer">Browse Butte Auto inventory</a><button className="plainLink buttonLink" onClick={reset}>Start another request</button></>}
      </div></div>}
    </main>
  );
}
