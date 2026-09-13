"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/**
 * Newsletter signup.
 * =============================================================================
 * When `siteConfig.newsletter.action` is set (your provider's public embed FORM
 * ACTION URL — Buttondown, Mailchimp, Beehiiv, …), the form posts real
 * subscribers to it. Submissions go to a hidden iframe so the page doesn't
 * navigate away. When it's empty, the form shows a friendly "coming soon".
 */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  const action = siteConfig.newsletter.action;
  const field = siteConfig.newsletter.emailField || "email";
  const connected = Boolean(action);

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        {connected
          ? "Thanks for subscribing — check your inbox to confirm."
          : "Thanks! Newsletter sign-ups open soon."}
      </p>
    );
  }

  const inputAndButton = (
    <>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name={connected ? field : undefined}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" className="shrink-0">
        Subscribe
      </Button>
    </>
  );

  const className = compact ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row";

  // Connected: POST to the provider (into a hidden iframe), then show thanks.
  if (connected) {
    return (
      <>
        <iframe
          name="newsletter_target"
          title="newsletter"
          className="hidden"
          aria-hidden
        />
        <form
          action={action}
          method="post"
          target="newsletter_target"
          onSubmit={() => window.setTimeout(() => setDone(true), 400)}
          className={className}
        >
          {inputAndButton}
        </form>
      </>
    );
  }

  // Not connected yet: no data is sent anywhere.
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className={className}
    >
      {inputAndButton}
    </form>
  );
}
