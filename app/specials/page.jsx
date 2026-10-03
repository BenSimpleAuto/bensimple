import { specials } from "../../data/specials";

export const metadata = {
  title: "Monthly Specials | BenSimple.",
  description: "Current manager-approved vehicle specials, rebates, and featured opportunities from Ben LaVelle at Butte Auto."
};

const PHONE = "4063995959";

export default function SpecialsPage() {
  return (
    <main>
      <div className="grain" />
      <header className="nav shell">
        <a className="brand" href="/">BenSimple<span>.</span></a>
        <div className="navRight">
          <a className="navLink" href="/">Home</a>
          <a className="pill ghost" href={`tel:${PHONE}`}>Call Ben</a>
        </div>
      </header>

      <section className="specialsPage">
        <span className="eyebrow"><i /> MONTHLY SPECIALS</span>
        <h1>The deals worth knowing about.</h1>
        <p className="specialsIntro">
          Current, manager-approved rebates, featured new vehicles, meaningful price moves, and limited offers. Conditional incentives are shown separately instead of being blended into a price everyone may not qualify for.
        </p>

        <div className="specialsRail">
          {specials.length > 0 ? specials.map((offer) => (
            <article className="specialCard" key={offer.id}>
              <div>
                <span className="tag">{offer.eyebrow}</span>
                <h3>{offer.title}</h3>
                {offer.price && <div className="specialPrice">{offer.price}</div>}
                {offer.msrp && <div className="specialMsrp">MSRP {offer.msrp}</div>}
                <p>{offer.summary}</p>
                {offer.stock && <p className="smallPrint">Stock #{offer.stock}</p>}
                {offer.conditions?.map((condition) => <p className="smallPrint" key={condition}>{condition}</p>)}
              </div>
              <div>
                <a className="pill primary" href={`sms:${PHONE}?&body=${encodeURIComponent(`Hi Ben, I saw ${offer.title} on BenSimple.co. Is it still available?`)}`}>
                  {offer.cta || "Ask Ben about this offer"}
                </a>
                <div className="smallPrint offerMeta">
                  Verified {offer.verifiedAt || "recently"}{offer.expires ? ` · Offer ends ${offer.expires}` : ""}
                </div>
              </div>
            </article>
          )) : (
            <article className="specialCard specialEmpty">
              <div>
                <span className="tag">CURRENT MONTH</span>
                <h3>New specials are being confirmed.</h3>
                <p>Ben is checking this month's offers with management before publishing any price or rebate here.</p>
              </div>
              <a className="pill primary" href={`sms:${PHONE}?&body=${encodeURIComponent("Hi Ben, I saw the specials page on BenSimple.co. What current offers should I know about?")}`}>
                Ask Ben what's current
              </a>
            </article>
          )}

          <article className="specialCard">
            <div>
              <span className="tag">HOW THIS PAGE WORKS</span>
              <h3>No mystery rebates.</h3>
              <p>Conditional incentives, eligibility rules, expiration dates, stock limitations, and location details are shown with the offer instead of buried somewhere else.</p>
            </div>
            <span className="smallPrint">Offers remain subject to vehicle availability and official program terms.</span>
          </article>

          <article className="specialCard">
            <div>
              <span className="tag">NEED SOMETHING ELSE?</span>
              <h3>I can still go find it.</h3>
              <p>If the right vehicle is not featured here, tell me the budget, body style, drivetrain, and must-have features. I will look across available inventory.</p>
            </div>
            <a className="pill secondary" href="/">Tell Ben what you need</a>
          </article>
        </div>

        <div className="specialsFooter">
          Vehicle pricing, rebates, incentives, financing, and availability can change. Any advertised vehicle price on BenSimple.co is intended to reflect the actual price available to all consumers before government-required taxes and fees, unless a clearly identified eligibility condition applies. Dealer-required charges should be included in the advertised price. Conditional incentives are shown separately unless expressly stated otherwise. Confirm current availability and program terms before traveling.
        </div>
      </section>
    </main>
  );
}
