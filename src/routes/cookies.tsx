import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Isobels" },
      {
        name: "description",
        content: "How Isobels uses cookies on our website.",
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <section className="bg-brand-cream py-20 md:py-28">
      <div className="container mx-auto px-6 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          Legal
        </p>
        <h1 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-10">
          Cookie Policy
        </h1>

        <div className="space-y-10 text-brand-ink/75 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">What are cookies</h2>
            <p>
              Small files stored on your device that help a website function and help us understand
              how it&apos;s used.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">How we use cookies</h2>
            <p>
              Essential cookies to make the site work; analytics cookies to understand how visitors
              use the site; marketing cookies to measure sign-ups and campaign performance.
              Analytics and marketing cookies are only set with your consent.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl italic text-brand-ink mb-3">Managing cookies</h2>
            <p>
              You can accept or manage cookie preferences via the banner shown when you first visit,
              and can change or withdraw consent at any time through your browser settings.
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
