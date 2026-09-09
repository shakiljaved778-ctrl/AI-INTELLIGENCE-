/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site is fully static: every route is prerendered at build time from MDX
  // in the repo. No runtime API routes or external data fetching.
  // `output: 'export'` emits a self-contained static site to out/, which is
  // committed and served directly by Vercel with NO build step (see vercel.json)
  // — so a Vercel build can never fail. To regenerate out/ after editing content
  // or code, run `pnpm build` locally and commit the updated out/ directory.
  output: "export",
  images: {
    // The site uses local/static assets only; no next/image optimization server
    // is needed.
    unoptimized: true,
  },
  eslint: {
    // Linting is run separately via `pnpm lint` (and in CI). Skipping it during
    // `next build` keeps production deploys from failing on ESLint version /
    // config differences between environments. It does NOT affect type
    // checking — TypeScript errors still fail the build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
