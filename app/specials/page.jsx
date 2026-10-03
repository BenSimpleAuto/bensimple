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
          This page is reserved for current, manager-approved rebates, featured new vehicles, meaningful price moves, and limited offers. If an offer is conditional, the condition will be stated with it.
        </p>

        <div className="specialsRail">
          <article className="specialCard specialEmpty">
            <div>
              <span className="tag">OCTOBER 2026</span>
              <h3>New specials are being loaded.</h3>
              <p>Ben is confirming this month's offers with management before publishing anything here.</p>
            </div>
            <a className="pill primary" href={`sms:${PHONE}?&body=${encodeURIComponent("Hi Ben, I saw the specials page on BenSimple.co. What current offers should I know about?")}`}>Ask Ben what's current</a>
          </article>

          <article className="specialCard">
            <div>
              <span className="tag">HOW THIS PAGE WORKS</span>
              <h3>No mystery rebates.</h3>
              <p>Conditional incentives, eligibility rules, expiration dates, stock limitations, and location details will be shown with the offer instead of buried somewhere else.</p>
            </div>
            <span className="smallPrint">Offers are subject to vehicle availability and official program terms.</span>
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
          Vehicle pricing, rebates, incentives, financing, and availability can change. Any advertised vehicle price on BenSimple.co is intended to reflect the actual price available to all consumers before government-required taxes and fees, unless a clearly identified eligibility condition applies. Conditional incentives are not included in an all-consumer price unless expressly stated. Confirm current availability and program terms before traveling.
        </div>
      </section>
    </main>
  );
}
