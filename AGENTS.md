<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Deployment

- This app is self-hosted at https://hospitals.fundezer.org on a Debian server, not on Lovable's
  hosting. A push to `main` triggers `.github/workflows/deploy.yml`, which builds
  on the server and restarts the `fundezer-hospital` service. Leave that workflow in place.
- The production build MUST use `NITRO_PRESET=node-server`. The default nitro
  target here is a Cloudflare Worker bundle, which cannot run under Node.
  Lovable's own sandbox ignores that variable, so its builds are unaffected.
- The server runs Node 24. `@supabase/supabase-js` does not work on Node 20 — it
  emits only a deprecation warning and then fails at request time with HTTP 500.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are needed at runtime as well as
  at build time; the service reads them from `.env` via systemd.
