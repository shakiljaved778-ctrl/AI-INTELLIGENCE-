# Promotion & growth setup

The site now ships with the technical enablers for promotion. Here's how to turn
each on. Anything left unset degrades gracefully (nothing breaks).

## 1. RSS feed — ready
Live at **`/rss.xml`** (e.g. `https://your-domain/rss.xml`). Nothing to
configure. Submit it to Feedly, and it's how aggregators pick you up. It's also
linked from every page's `<head>`.

## 2. Search Console verification
1. **Google:** create a property at <https://search.google.com/search-console>,
   choose the *HTML tag* method, copy the `content` value.
2. **Bing:** <https://www.bing.com/webmasters>, same idea.
3. Provide the codes one of two ways:
   - paste them into `lib/site.ts` → `verification.google` / `verification.bing`, **or**
   - set build env vars `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and
     `NEXT_PUBLIC_BING_SITE_VERIFICATION` (in Vercel → Settings → Environment
     Variables, or as repo secrets used by the build).
4. Rebuild, then click **Verify** in each console. Finally, **submit your
   sitemap** (`/sitemap.xml`) in Google Search Console — this is the biggest
   free-traffic lever.

## 3. Analytics — ready on Vercel
`@vercel/analytics` is wired in. Enable **Analytics** in your Vercel project
(Project → Analytics → Enable). Zero config, privacy-light. Prefer Google
Analytics or Plausible instead? Say so and it can be swapped.

## 4. Newsletter — connect a provider
The signup form posts real subscribers once you set a provider's public embed
**form action URL**:
- **Buttondown** (simplest, free tier): create an account, then your action is
  `https://buttondown.com/api/emails/embed-subscribe/YOURUSERNAME`.
- **Mailchimp / Beehiiv:** copy the `action` URL from their embedded-form code.

Set it via `lib/site.ts` → `newsletter.action` (and `emailField` if your
provider uses a name other than `email`), or the env var
`NEXT_PUBLIC_NEWSLETTER_ACTION`. Submissions post to a hidden iframe so the page
doesn't navigate away.

## 5. Social blurbs — automatic in the daily pipeline
The daily Gemini writer now generates a ready-to-post **social blurb** for each
new article (a `social:` field in the frontmatter) and appends it, with the
article link, to **`content/social-queue.md`**. Open that file to copy/paste
posts for X, LinkedIn, etc. It travels in each day's review PR.

---

### Recommended order
1. Buy + connect a **custom domain** in Vercel (do this first — everything else
   is stronger on a real domain).
2. **Search Console + sitemap** submission.
3. Enable **Vercel Analytics**.
4. Connect the **newsletter** provider.
5. Start posting the **social blurbs** and sharing in AI communities.
