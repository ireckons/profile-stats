// GitHub stats card — counts PRIVATE commits because it runs on YOUR token.
// Endpoint: /api/stats?username=ireckons
// Optional theme overrides: &title_color=A78BFA&icon_color=8B5CF6&text_color=C9D1D9&bg_color=0D1117

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    name
    login
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes { stargazerCount }
    }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
    }
  }
}`;

// Octicons (16x16) — inherit fill from their parent <g>.
const ICONS = {
  star: '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>',
  commit: '<path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>',
  pr: '<path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>',
  issue: '<path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>',
  people: '<path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.005 6.005 0 0 1 3.431-5.142 4 4 0 1 1 5.122 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>'
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

function statsCard({ name, rows, title_color, icon_color, text_color, bg_color }) {
  const W = 480;
  const titleY = 38;
  const firstRow = 84;
  const gap = 30;
  const H = firstRow + (rows.length - 1) * gap + 26;

  const body = rows.map((r, i) => {
    const y = firstRow + i * gap;
    return `<g transform="translate(28 ${y})">
      <g transform="translate(0 -12)" fill="#${icon_color}">${r.icon}</g>
      <text x="26" y="0" fill="#${text_color}" font-size="15">${esc(r.label)}</text>
      <text x="${W - 28}" y="0" text-anchor="end" fill="#${text_color}" font-size="15" font-weight="600">${fmt(r.value)}</text>
    </g>`;
  }).join("\n    ");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Ubuntu, system-ui, sans-serif">
    <rect width="${W}" height="${H}" rx="10" fill="#${bg_color}"/>
    <text x="28" y="${titleY}" fill="#${title_color}" font-size="20" font-weight="600">${esc(name)}'s GitHub Stats</text>
    <line x1="28" y1="54" x2="${W - 28}" y2="54" stroke="#30363D" stroke-width="1"/>
    ${body}
  </svg>`;
}

function errorCard(message, t) {
  const W = 480, H = 110;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Ubuntu, system-ui, sans-serif">
    <rect width="${W}" height="${H}" rx="10" fill="#${t.bg_color}"/>
    <text x="28" y="44" fill="#${t.title_color}" font-size="18" font-weight="600">Something went wrong</text>
    <text x="28" y="72" fill="#${t.text_color}" font-size="13">${esc(message)}</text>
  </svg>`;
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const q = url.searchParams;

  const t = {
    title_color: q.get("title_color") || "A78BFA",
    icon_color: q.get("icon_color") || "8B5CF6",
    text_color: q.get("text_color") || "C9D1D9",
    bg_color: q.get("bg_color") || "0D1117"
  };
  const username = (q.get("username") || "").trim();

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=7200, stale-while-revalidate=86400");
  res.statusCode = 200;

  if (!username) return res.end(errorCard("Add ?username=YOUR_HANDLE to the URL", t));
  if (!process.env.GH_TOKEN) return res.end(errorCard("Server is missing the GH_TOKEN env var", t));

  try {
    const r = await fetch(GITHUB_GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.GH_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "github-stats-card"
      },
      body: JSON.stringify({ query: QUERY, variables: { login: username } })
    });
    const json = await r.json();

    if (json.errors || !json.data || !json.data.user) {
      const msg = json.errors ? json.errors[0].message : "User not found";
      return res.end(errorCard(msg, t));
    }

    const u = json.data.user;
    const c = u.contributionsCollection;
    const stars = u.repositories.nodes.reduce((sum, n) => sum + n.stargazerCount, 0);
    // With YOUR token, totalCommitContributions already includes private commits
    // (restrictedContributionsCount is 0). On a foreign token it's the reverse —
    // so this sum is correct either way and never double-counts.
    const commits = c.totalCommitContributions + c.restrictedContributionsCount;

    const rows = [
      { icon: ICONS.star, label: "Total Stars", value: stars },
      { icon: ICONS.commit, label: "Commits, last year (incl. private)", value: commits },
      { icon: ICONS.pr, label: "Total PRs", value: u.pullRequests.totalCount },
      { icon: ICONS.issue, label: "Total Issues", value: u.issues.totalCount },
      { icon: ICONS.people, label: "Followers", value: u.followers.totalCount }
    ];

    return res.end(statsCard({ name: u.name || u.login, rows, ...t }));
  } catch (e) {
    return res.end(errorCard("Error: " + e.message, t));
  }
}
