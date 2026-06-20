# github-stats-card

A tiny, dependency-free GitHub stats card you host yourself. Because it runs on
**your own** Personal Access Token, it can count your **private-repo commits** —
the shared `github-readme-stats.vercel.app` instance can't, since it only ever
sees public data.

Already themed to match a dark profile with a violet accent
(`#0D1117` surface, `#8B5CF6` / `#A78BFA` accents).

---

## Deploy (≈10 minutes, free)

### 1. Create a GitHub token
- Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
  (direct link: https://github.com/settings/tokens)
- **Generate new token (classic)**. Tick scopes: **`repo`** and **`read:user`**.
- Set no expiry (or a long one), generate, and **copy** the token.

### 2. Push this folder to a new GitHub repo
```bash
cd github-stats-card
git init
git add .
git commit -m "GitHub stats card"
git branch -M main
git remote add origin https://github.com/ireckons/github-stats-card.git
git push -u origin main
```

### 3. Deploy on Vercel
- Go to https://vercel.com → **Add New… → Project** → import `github-stats-card`.
- Before deploying, open **Environment Variables** and add:
  - **Name:** `GH_TOKEN`  **Value:** *(the token from step 1)*
- Click **Deploy**. You'll get a URL like `https://github-stats-card-xxxx.vercel.app`.

> Your token lives only in Vercel's env vars — it's never in the code or the README.

### 4. Test it
Open in a browser:
```
https://YOUR-INSTANCE.vercel.app/api/stats?username=ireckons
```
You should see the card, and the commit count should now include your private repos. 🎉

---

## Use it in your profile README

Replace your current stats-card `<img>` (the one pointing at
`github-readme-stats.vercel.app/api?username=...`) with:

```html
<a href="https://github.com/ireckons"><img height="170" src="https://YOUR-INSTANCE.vercel.app/api/stats?username=ireckons" alt="GitHub Stats" /></a>
```

Theme is baked in, but you can override any color via query params:
`&title_color=`, `&icon_color=`, `&text_color=`, `&bg_color=` (hex, no `#`).

---

## Notes
- **Commits = last 12 months, including private.** Stars / PRs / Issues are all-time.
- Stars are summed over your first 100 owned repos (plenty here; bump the query if you ever exceed that).
- GitHub caches the image (~2h) via its image proxy, so the number updates periodically, not instantly.
- This card only replaces the **stats** card. Your **top-languages** card and **pinned repo** cards still use `github-readme-stats` and remain public-only — ping me if you want a private-aware languages card too.
