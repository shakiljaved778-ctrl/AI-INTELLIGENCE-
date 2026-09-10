# Decap CMS — GitHub OAuth provider

Decap's GitHub backend needs a tiny server to complete the OAuth handshake
(GitHub requires a client **secret**, which can't live in the browser). This
folder is that server: two Vercel serverless functions, `/api/auth` and
`/api/callback`. Deploy it **once**, as its own Vercel project, and point the
CMS at it.

## One-time setup (~5 minutes)

### 1. Create a GitHub OAuth App
- Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
  (or your org's Developer settings).
- **Application name:** `Cambrian AI CMS` (anything)
- **Homepage URL:** your site, e.g. `https://cambrian-ai.vercel.app`
- **Authorization callback URL:** leave as a placeholder for now, e.g.
  `https://example.com/api/callback` — you'll update it in step 3.
- Click **Register application**, then **Generate a new client secret**.
- Copy the **Client ID** and **Client secret**.

### 2. Deploy this folder to Vercel as a new project
- In Vercel: **Add New → Project → Import** the same repo
  (`shakiljaved778-ctrl/AI-INTELLIGENCE-`).
- **Important:** set **Root Directory** to `oauth-provider`.
- Framework preset: **Other** (Vercel will detect the `api/` functions).
- Add two **Environment Variables**:
  - `OAUTH_GITHUB_CLIENT_ID` = your Client ID
  - `OAUTH_GITHUB_CLIENT_SECRET` = your Client secret
- **Deploy.** Note the resulting domain, e.g.
  `https://cambrian-ai-cms.vercel.app`.

### 3. Finish wiring
- Back in the **GitHub OAuth App**, set the **Authorization callback URL** to:
  `https://<your-oauth-project>.vercel.app/api/callback`
- In the main site, edit **`public/admin/config.yml`** and set:
  ```yaml
  backend:
    base_url: https://<your-oauth-project>.vercel.app
  ```
  Commit that change (the site auto-rebuilds).

### 4. Log in
- Visit `https://<your-site>/admin/`, click **Login with GitHub**, authorize,
  and you're in. Creating or editing an article commits to `main`, which triggers
  the rebuild Action and redeploys the site.

## Local editing (no OAuth needed)
From the main project root:
```
npx decap-server    # terminal 1
pnpm dev            # terminal 2
```
Then open http://localhost:3000/admin/ — `local_backend: true` in config.yml
lets you edit your working copy directly.

## Notes
- This provider does nothing but the OAuth exchange; it stores no data.
- Only users you allow to authorize the OAuth App (i.e. collaborators on the
  repo) can commit through it.
