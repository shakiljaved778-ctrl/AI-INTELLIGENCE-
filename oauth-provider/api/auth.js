// Step 1 of the GitHub OAuth handshake for Decap CMS.
// Redirects the editor to GitHub's authorize page. Deployed as a Vercel
// serverless function at /api/auth on the OAuth-provider project.

export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("Missing OAUTH_GITHUB_CLIENT_ID env var.");
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `https://${host}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    // `repo` scope lets Decap read and commit to the content repository.
    scope: "repo",
    redirect_uri: redirectUri,
    allow_signup: "false",
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
  res.end();
}
