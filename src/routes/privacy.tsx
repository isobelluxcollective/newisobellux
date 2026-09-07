import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Isobels" },
      {
        name: "description",
        content: "How Isobels collects, uses and protects your personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <section className="bg-brand-cream py-20 md:py-28">
      <div className="container mx-auto px-6 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          Legal
        </p>
        <h1 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-10">
          Privacy Policy
        </h1>

        <div className="space-y-10 text-brand-ink/75 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">Who we are</h2>
            <p>
              Isobels is operated by Isobels Luxe Collective (&quot;Isobels&quot;, &quot;we&quot;,
              &quot;us&quot;).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              What information we collect
            </h2>
            <p>
              Your name, email address and mobile number when you sign up to our pre-launch list,
              and, once the full platform launches, information relating to your account, entries
              and payments.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              How we use your information
            </h2>
            <p>
              To contact you about the launch of our first draw and fulfil any free-ticket
              promotion, to send marketing communications where you&apos;ve given consent, to
              process entries and payments once the platform is live, and to meet our legal
              obligations relating to prize draws.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              Our legal basis for processing
            </h2>
            <p>
              Consent for marketing communications; contract for processing entries and prizes;
              legitimate interest for fraud prevention and service improvement; legal obligation for
              record-keeping required of prize draw operators.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              Who we share your information with
            </h2>
            <p>
              Our payment processor, our email/SMS marketing platform, and our hosting and IT
              providers, and, where legally required, regulators or law enforcement. We do not sell
              your personal information to anyone.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              How long we keep your information
            </h2>
            <p>
              For as long as necessary to fulfil the purposes described here, or as required by law.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">Your rights</h2>
            <p>
              Under UK GDPR you can ask to access, correct, delete, or restrict our use of your
              information, and withdraw marketing consent at any time. Contact us at{" "}
              <a
                href="mailto:Isobelluxcollective@gmail.com"
                className="underline underline-offset-2 text-brand-oxblood hover:text-brand-gold"
              >
                Isobelluxcollective@gmail.com
              </a>{" "}
              to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">Cookies</h2>
            <p>
              See our{" "}
              <a href="/cookies" className="underline underline-offset-2 text-brand-oxblood hover:text-brand-gold">
                Cookie Policy
              </a>{" "}
              for details of the cookies we use.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time; the latest version will always be
              available on this page.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">Contact us</h2>
            <p>
              <a
                href="mailto:Isobelluxcollective@gmail.com"
                className="underline underline-offset-2 text-brand-oxblood hover:text-brand-gold"
              >
                Isobelluxcollective@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
