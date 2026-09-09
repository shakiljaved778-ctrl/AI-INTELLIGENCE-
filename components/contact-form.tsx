"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/**
 * Contact form (no backend).
 * =============================================================================
 * Because the site is fully static, this form composes a `mailto:` link on
 * submit — it opens the visitor's email client pre-filled. To collect messages
 * server-side instead, swap `handleSubmit` for a POST to a form service
 * (Formspree, Basin, Resend, a serverless function, etc.).
 */
export function ContactForm() {
  const [topic, setTopic] = React.useState("Tip");
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[${topic}] from ${name || "a reader"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  }

  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="mb-1 block text-sm font-medium">
          Reason
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={fieldClass}
        >
          <option>Tip</option>
          <option>Correction</option>
          <option>Press inquiry</option>
          <option>General</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Your name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="What would you like to tell us?"
        />
      </div>

      <Button type="submit">Compose email</Button>
    </form>
  );
}
