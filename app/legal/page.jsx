import BrandWordmark from "../components/BrandWordmark";

export const metadata = {
  title: "Disclosures & Privacy | BenSimple",
  description: "BenSimple automotive advertising, pricing, privacy, and website disclosures."
};

export default function LegalPage() {
  return (
    <main>
      <div className="grain" />
      <header className="nav shell">
        <a className="wordmarkLink" href="/" aria-label="BenSimple home"><BrandWordmark /></a>
        <div className="navRight">
          <a className="navLink" href="/specials">Specials</a>
          <a className="navLink" href="/">Home</a>
        </div>
      </header>

      <section className="legalShell">
        <span className="eyebrow"><i /> DISCLOSURES & PRIVACY</span>
        <h1>Clear information. No hidden surprises.</h1>

        <div className="notice">
          BenSimple is Ben LaVelle's personal automotive brand and is affiliated with Butte Auto. Vehicle sales, financing, contracts, manufacturer programs, warranties, and final transaction terms are handled through the applicable dealership.
        </div>

        <h2>Vehicle pricing and advertising</h2>
        <p>
          Any vehicle price displayed on BenSimple.co is intended to be current and accurate when published and, unless clearly stated otherwise, to reflect the price available to all consumers before government-required taxes and fees. Dealer-required charges should not be hidden outside an advertised price. Conditional rebates, manufacturer incentives, loyalty offers, military or first-responder programs, financing incentives, or other limited-eligibility discounts will be identified as conditional when shown.
        </p>
        <p>
          Prices, incentives, program eligibility, and vehicle availability can change. If BenSimple discovers an incorrect listing, stale price, or sold vehicle, the site will be corrected as soon as practical. Website content does not create a binding sales contract or guarantee that a vehicle remains available.
        </p>

        <h2>Vehicle information</h2>
        <p>
          Photos, colors, equipment descriptions, mileage, specifications, towing figures, fuel economy, option lists, and other vehicle data can come from dealer systems, manufacturers, third-party feeds, or manual entry. Verify equipment, condition, mileage, included accessories, and features on the actual vehicle before purchase.
        </p>

        <h2>Monthly specials and incentives</h2>
        <p>
          Specials may be limited by stock number, model, trim, location, program dates, financing source, residency, ownership or lease history, occupation, military or first-responder status, or other manufacturer or lender criteria. Material eligibility conditions will be stated with the offer. Expired or unavailable programs will be removed when identified.
        </p>

        <h2>Financing and payment examples</h2>
        <p>
          Any financing rate, lease, down payment, or monthly payment example is illustrative unless the specific terms are clearly stated. Credit approval, lender criteria, term length, taxes, fees, trade equity, negative equity, down payment, and optional products can affect the final transaction. No financing approval is promised by this website.
        </p>

        <h2>Trade values</h2>
        <p>
          Any trade estimate is preliminary. Final value depends on an in-person appraisal, condition, mileage, equipment, vehicle history, title status, market conditions, and other factors.
        </p>

        <h2>Lead information and privacy</h2>
        <p>
          When you voluntarily send information through BenSimple.co, the BenSimple assistant, text, email, or a website form, it may be used to respond to your request, help locate or compare vehicles, follow up about a trade, request an appointment, or assist with a vehicle question. Conversation messages and a structured summary may be saved so Ben can follow up without making you repeat everything. An appointment request is not confirmed until Ben confirms it personally. BenSimple does not sell customer contact information to third-party advertisers.
        </p>
        <p>
          For VIN decoding and recall help, the site may send a VIN or the vehicle year, make, and model to official National Highway Traffic Safety Administration services. NHTSA results are informational. Confirm open VIN-specific recalls and remedy status through NHTSA or an authorized dealer.
        </p>
        <p>
          Do not submit Social Security numbers, banking credentials, passwords, full payment-card information, or other highly sensitive financial information through a general website contact form or ordinary text message.
        </p>

        <h2>External links</h2>
        <p>
          BenSimple.co may link to Butte Auto, manufacturers, social networks, mapping services, or other third-party sites. Those sites control their own content, availability, tracking, security, and privacy practices.
        </p>

        <h2>Questions or corrections</h2>
        <p>
          If you see a vehicle, price, feature, or offer that appears incorrect, contact Ben at 406-399-5959 or ben@bensimple.co so it can be checked promptly.
        </p>
      </section>
    </main>
  );
}
