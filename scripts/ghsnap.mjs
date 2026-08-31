/* Refreshes the vendored GitHub-contributions snapshot in
   data/about-record.json (privacy ruling 2026-08-19: readers load only
   this repo's own JSON — no reader IPs to any third party). Runs daily
   from .github/workflows/contributions.yml; also runnable by hand.
   With GITHUB_TOKEN set it uses GitHub's own GraphQL API; without it,
   the public jogruber contributions API (local manual runs). */
import { readFileSync, writeFileSync } from 'fs';

const LOGIN = 'Deralik';
const LEVEL = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function viaGraphQL(token) {
  const q = `query{user(login:"${LOGIN}"){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q }),
  });
  if (!r.ok) throw new Error('graphql ' + r.status);
  const j = await r.json();
  if (j.errors) throw new Error('graphql: ' + JSON.stringify(j.errors));
  const weeks = j.data.user.contributionsCollection.contributionCalendar.weeks;
  return weeks.flatMap((w) =>
    w.contributionDays.map((d) => [
      d.date,
      d.contributionCount,
      LEVEL[d.contributionLevel] ?? 0,
    ]),
  );
}

async function viaPublicApi() {
  const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${LOGIN}?y=last`);
  if (!r.ok) throw new Error('api ' + r.status);
  const j = await r.json();
  return j.contributions.map((d) => [d.date, d.count, d.level]);
}

const token = process.env.GITHUB_TOKEN;
let days;
if (token) {
  try {
    days = await viaGraphQL(token);
  } catch (e) {
    console.warn('graphql failed (' + e.message + '), falling back to public api');
    days = await viaPublicApi();
  }
} else {
  days = await viaPublicApi();
}
if (!days.length || days.length < 300) throw new Error('suspicious day count: ' + days.length);

const path = 'data/about-record.json';
const rec = JSON.parse(readFileSync(path, 'utf8'));
const fetched = new Date().toISOString().slice(0, 10);
const prev = rec.contributions && rec.contributions.fetched;
rec.contributions = { fetched, days };
writeFileSync(path, JSON.stringify(rec, null, 0).replace(/^\{/, '{').trim());
console.log(
  `contributions: ${prev || 'none'} -> ${fetched}, ${days.length} days, total ${days.reduce((s, d) => s + d[1], 0)}`,
);
