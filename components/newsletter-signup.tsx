"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Newsletter signup (placeholder).
 * =============================================================================
 * This does NOT send data anywhere. To connect a provider (Substack, Beehiiv,
 * ConvertKit, Mailchimp, Resend, …), replace the `handleSubmit` body with a
 * POST to your provider's form endpoint, or embed the provider's own form.
 */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate your newsletter provider here.
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks! Connect a provider in{" "}
        <code className="rounded bg-muted px-1">NewsletterSignup</code> to start
        collecting real subscribers.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row"}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" className="shrink-0">
        Subscribe
      </Button>
    </form>
  );
}
