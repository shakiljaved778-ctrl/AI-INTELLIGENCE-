// Step 2 of the GitHub OAuth handshake for Decap CMS.
// GitHub redirects here with a `code`; we exchange it for an access token
// (using the client secret, which must stay server-side) and hand the token
// back to the Decap window via the postMessage handshake it expects.

export default async function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query.code;

  if (!clientId || !clientSecret) {
    res.status(500).send("Missing OAuth env vars.");
    return;
  }
  if (!code) {
    res.status(400).send("Missing ?code from GitHub.");
    return;
  }

  let payload;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const data = await tokenRes.json();
    payload = data.access_token
      ? { token: data.access_token, provider: "github" }
      : { error: data.error_description || "No access token returned" };
  } catch (err) {
    payload = { error: String(err) };
  }

  const status = payload.token ? "success" : "error";
  const body = JSON.stringify(payload);

  // Canonical Netlify/Decap popup handshake.
  const html = `<!doctype html><html><body><script>
    (function () {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:github:${status}:${body.replace(/'/g, "\\'")}',
          e.origin
        );
        window.removeEventListener('message', receiveMessage, false);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script></body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
