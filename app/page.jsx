import BdcAgent from "./components/BdcAgent";
import BrandWordmark from "./components/BrandWordmark";
import QuickLeadForm from "./components/QuickLeadForm";

const PHONE = "4063995959";
const DISPLAY_PHONE = "406-399-5959";
const EMAIL = "ben@bensimple.co";
const INVENTORY = "https://www.butteauto.com/all-inventory/index.htm";
const INSTAGRAM = "https://www.instagram.com/benlavelle26/";
const FACEBOOK = "https://www.facebook.com/benlavelle26";

const capabilityRows = [
  ["01", "Find the right direction", "The conversation adapts to a specific vehicle, a short list, or a customer who is still narrowing things down."],
  ["02", "Handle the trade", "VIN, mileage, condition, payoff, timing, and what the customer wants next, without pretending to provide a value."],
  ["03", "Answer the car question", "Specifications, features, comparisons, ownership questions, and Montana driving needs, with verification when facts are uncertain."],
  ["04", "Recognize buying intent", "When the customer is ready, the assistant stops over-qualifying and moves toward contact or an appointment request."],
  ["05", "Give Ben the useful summary", "Buying timeframe, priorities, deal-breakers, trade, appointment status, and the recommended next action are organized for follow-up."]
];

export default function Home() {
  return <main>
    <header className="siteHeader shell">
      <a className="wordmarkLink" href="#top" aria-label="BenSimple home"><BrandWordmark priority /></a>
      <div className="headerIdentity"><strong>Ben LaVelle</strong><span>Butte Auto · Butte, Montana</span></div>
      <nav aria-label="Main navigation">
        <a href="#bensimple-ai">BenSimple AI</a>
        <a href="#vehicle-data">VIN + Recalls</a>
        <a href={INVENTORY} target="_blank" rel="noreferrer">Inventory</a>
        <a href="#contact">Talk to Ben</a>
      </nav>
      <a className="mobileCall" href={`tel:${PHONE}`} aria-label={`Call Ben at ${DISPLAY_PHONE}`}>Call Ben</a>
    </header>

    <section className="aiHero shell" id="top" aria-labelledby="heroTitle">
      <div className="aiHeroCopy">
        <span className="heroKicker">BenSimple Automotive BDC · Butte, Montana</span>
        <h1 id="heroTitle"><span>A smarter first</span><span>conversation.</span></h1>
        <p>Ask a car question, find the right vehicle, decode a VIN, check recalls, work through a trade, or request time with Ben.</p>
        <div className="heroActions">
          <a className="button primary" href="#bensimple-ai">Start With Ben</a>
          <a className="button secondary" href={INVENTORY} target="_blank" rel="noreferrer">Browse Inventory</a>
        </div>
        <small>Cars don’t have to be complicated.</small>
      </div>
      <figure className="aiHeroPortrait">
        <img src="/BEN_MASTER_PROFILE_APPROVED.png" alt="Approved BenSimple character artwork of Ben LaVelle" />
        <figcaption><strong>BEN LAVELLE</strong><span>BUTTE AUTO</span></figcaption>
      </figure>
    </section>

    <div className="signalBand" aria-label="BenSimple assistant capabilities">
      <span>FIND A VEHICLE</span><i>•</i><span>TRADE / SELL</span><i>•</i><span>ASK BEN</span><i>•</i><span>VIN DECODE</span><i>•</i><span>NHTSA RECALLS</span><i>•</i><span>APPOINTMENT REQUESTS</span>
    </div>

    <BdcAgent />

    <section className="capabilitySection shell" aria-labelledby="capabilityTitle">
      <header><span className="sectionLabel">What the assistant does</span><h2 id="capabilityTitle">Useful first.<br />Sales-aware second.</h2><p>The goal is not maximum data. It is the best next action for the customer and for Ben.</p></header>
      <div className="capabilityRows">{capabilityRows.map(([number, title, copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="vehicleDataSection" id="vehicle-data" aria-labelledby="vehicleDataTitle">
      <div className="vehicleDataArt"><span>NHTSA</span><strong>OFFICIAL DATA</strong><small>VIN · YEAR · MAKE · MODEL · RECALLS</small></div>
      <div className="vehicleDataCopy">
        <span className="sectionLabel">Vehicle data tools</span>
        <h2 id="vehicleDataTitle">Decode the vehicle.<br />Explain what matters.</h2>
        <p>BenSimple AI uses official NHTSA vPIC data for VIN decoding and year, make, and model support. Recall results are attributed to NHTSA and presented without dumping raw API data.</p>
        <ul><li>VIN details stay readable</li><li>Recall records include affected components and remedies when available</li><li>External API failures never block the conversation</li></ul>
        <a className="textLink" href="#bensimple-ai">Start a VIN or recall conversation</a>
      </div>
    </section>

    <section className="inventoryPolicy shell" aria-labelledby="inventoryTitle">
      <div><span className="sectionLabel">Butte Auto inventory</span><h2 id="inventoryTitle">Official listings.<br />Personal verification.</h2></div>
      <div>
        <p>The assistant can help narrow the search and reference Butte Auto as the official inventory source. Ben confirms availability and the current details before recommending a vehicle.</p>
        <div className="policyRules"><span>NO DEALERSHIP PRICES</span><span>NO AVAILABILITY PROMISES</span><span>NO PAYMENT QUOTES</span></div>
        <a className="button primary" href={INVENTORY} target="_blank" rel="noreferrer">Open Butte Auto Inventory</a>
      </div>
    </section>

    <section className="contactSection shell" id="contact">
      <div className="contactIntro"><span className="sectionLabel">Talk to Ben</span><h2>When it needs a person, it reaches a person.</h2><p>Ben reviews the conversation summary, verifies the vehicle information, and confirms appointment requests personally.</p><a className="contactPhone" href={`tel:${PHONE}`}>{DISPLAY_PHONE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
      <QuickLeadForm />
    </section>

    <footer className="siteFooter shell">
      <a className="wordmarkLink footerWordmark" href="#top" aria-label="BenSimple home"><BrandWordmark /></a>
      <p>Ben LaVelle · Butte Auto · Butte, Montana</p>
      <nav><a href="/legal">Privacy</a><a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook</a><a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a><a href={INVENTORY} target="_blank" rel="noreferrer">Butte Auto Inventory</a></nav>
      <small>BenSimple is Ben LaVelle’s personal automotive brand. Butte Auto is the dealership affiliation and official inventory source.</small>
    </footer>
  </main>;
}
