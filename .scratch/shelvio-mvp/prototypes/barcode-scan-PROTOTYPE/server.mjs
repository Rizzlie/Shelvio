// PROTOTYPE — throwaway. Answers ticket 12 (Barcode scan prototype). Do not reuse as production code.
// Run: node .scratch/shelvio-mvp/prototypes/barcode-scan-PROTOTYPE/server.mjs
// No dependencies. Proxies lookups (BN and e-ISBN send no CORS headers; Discogs token is a secret).
import http from 'node:http';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../../..');
const PORT = Number(process.env.PORT || 8787);
const LOG = path.join(dir, 'scan-log.PROTOTYPE.jsonl');
const UA = 'ShelvioPrototype/0.1 (private prototype)';

// Read DISCOGS_TOKEN from the repo .env (never sent to the browser).
let DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || '';
const envFile = path.join(root, '.env');
if (!DISCOGS_TOKEN && existsSync(envFile)) {
  const m = readFileSync(envFile, 'utf8').match(/^DISCOGS_TOKEN=(.*)$/m);
  if (m) DISCOGS_TOKEN = m[1].trim();
}

// Random path prefix so a public tunnel URL is not an open proxy for the Discogs token.
const SECRET = process.env.SECRET || randomBytes(6).toString('hex');

async function timed(name, fn) {
  const t0 = performance.now();
  try {
    const candidates = await fn();
    return { source: name, ms: Math.round(performance.now() - t0), candidates };
  } catch (e) {
    return { source: name, ms: Math.round(performance.now() - t0), candidates: [], error: String(e.message || e) };
  }
}

async function get(url, headers = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r;
}

// ---------- Books ----------
const clean = (s) => (s || '').replace(/\s*[\/:;,]\s*$/, '').trim();

async function bn(isbn) {
  const j = await (await get(`https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn=${isbn}`)).json();
  return (j.bibs || []).map((b) => ({
    title: clean(b.title.replace(/\s*\(pol\.\).*$/, '')) || clean(b.title),
    creators: clean(b.author),
    publisher: clean(b.publisher),
    year: b.publicationYear,
    extra: [b.kind, b.genre].filter(Boolean).join(' · '),
    id: `BN ${b.id}`,
  }));
}

const tag = (xml, t) => (xml.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];
async function eisbn(isbn) {
  const xml = await (await get(`https://e-isbn.pl/IsbnWeb/api.xml?isbn=${isbn}`)).text();
  return (xml.match(/<Product[ >][\s\S]*?<\/Product>/g) || []).map((p) => ({
    title: tag(p, 'TitleText'),
    creators: [...p.matchAll(/<PersonNameInverted>([^<]*)</g)].map((m) => m[1]).join(', '),
    publisher: tag(p, 'PublisherName'),
    year: (tag(p, 'Date') || '').slice(0, 4),
    cover: tag(p, 'ResourceLink'),
    id: 'e-ISBN',
  }));
}

async function openLibrary(isbn) {
  const j = await (await get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)).json();
  return Object.values(j).map((b) => ({
    title: b.title,
    creators: (b.authors || []).map((a) => a.name).join(', '),
    publisher: (b.publishers || []).map((p) => p.name).join(', '),
    year: b.publish_date,
    cover: b.cover?.medium,
    id: b.key,
  }));
}

async function lookupBook(isbn) {
  const polish = isbn.startsWith('97883');
  const chain = polish
    ? [['BN', bn], ['e-ISBN', eisbn], ['Open Library', openLibrary]]
    : [['Open Library', openLibrary], ['BN', bn]];
  const steps = [];
  let hit = null;
  for (const [name, fn] of chain) {
    const s = await timed(name, () => fn(isbn));
    steps.push(s);
    if (s.candidates.length) { hit = s; break; }
  }
  // Cover is fetched separately (BN has none): e-ISBN, else Open Library.
  let cover = hit?.candidates.find((c) => c.cover)?.cover || null;
  if (hit && !cover) {
    const s = await timed('cover', async () => {
      const e = hit.source === 'e-ISBN' ? [] : await eisbn(isbn).catch(() => []);
      const ec = e.find((c) => c.cover)?.cover;
      if (ec) return [{ cover: ec, from: 'e-ISBN' }];
      const r = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
      return r.ok ? [{ cover: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`, from: 'Open Library' }] : [];
    });
    steps.push({ ...s, candidates: s.candidates.length });
    cover = s.candidates[0]?.cover || null;
  }
  return { kind: 'book', steps, source: hit?.source || null, candidates: hit?.candidates || [], cover };
}

// ---------- Vinyl ----------
async function discogs(code) {
  // Keyless works until 2026-12-01 (25 req/min); a token raises it to 60.
  const auth = DISCOGS_TOKEN ? { Authorization: `Discogs token=${DISCOGS_TOKEN}` } : {};
  const j = await (await get(`https://api.discogs.com/database/search?barcode=${code}&type=release&per_page=50`, auth)).json();
  return (j.results || []).map((r) => ({
    title: r.title,
    label: [...new Set(r.label || [])].slice(0, 2).join(', '),
    catno: r.catno,
    country: r.country,
    year: r.year,
    format: (r.formats || []).map((f) => [f.qty > 1 ? `${f.qty}×` : '', f.name, f.text, ...(f.descriptions || [])].filter(Boolean).join(' ')).join(' + '),
    id: `Discogs r${r.id} (master ${r.master_id || '—'})`,
    masterId: r.master_id,
  }));
}

async function musicbrainz(code) {
  const j = await (await get(`https://musicbrainz.org/ws/2/release/?query=barcode:${code}&fmt=json&limit=25`)).json();
  return (j.releases || []).map((r) => ({
    title: `${(r['artist-credit'] || []).map((a) => a.name).join(', ')} - ${r.title}`,
    label: (r['label-info'] || []).map((l) => l.label?.name).filter(Boolean).join(', '),
    catno: (r['label-info'] || []).map((l) => l['catalog-number']).filter(Boolean).join(', '),
    country: r.country,
    year: (r.date || '').slice(0, 4),
    format: (r.media || []).map((m) => `${m['track-count'] ? '' : ''}${m.format || '?'}`).join(' + '),
    id: `MB ${r.id}`,
    mbid: r.id,
  }));
}

async function lookupVinyl(code) {
  const steps = [];
  let hit = null;
  for (const [name, fn] of [['Discogs', discogs], ['MusicBrainz', musicbrainz]]) {
    const s = await timed(name, () => fn(code));
    steps.push(s);
    if (s.candidates.length) { hit = s; break; }
  }
  // Cover from Cover Art Archive needs an MBID; for a Discogs hit, find the MB release by barcode.
  let cover = null;
  if (hit) {
    const s = await timed('cover (CAA)', async () => {
      let mbid = hit.candidates[0].mbid;
      if (!mbid) mbid = (await musicbrainz(code).catch(() => []))[0]?.mbid;
      if (!mbid) return [];
      const r = await fetch(`https://coverartarchive.org/release/${mbid}/front-250`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000) });
      return r.status < 400 ? [{ cover: `https://coverartarchive.org/release/${mbid}/front-250` }] : [];
    });
    steps.push({ ...s, candidates: s.candidates.length });
    cover = s.candidates[0]?.cover || null;
  }
  return { kind: 'vinyl', steps, source: hit?.source || null, candidates: hit?.candidates || [], cover };
}

// ---------- HTTP ----------
const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  if (!p.startsWith(`/${SECRET}/`)) return send(res, 404, 'not found', 'text/plain');
  const route = p.slice(SECRET.length + 1);
  try {
    if (route === '/') return send(res, 200, readFileSync(path.join(dir, 'index.html'), 'utf8'), 'text/html; charset=utf-8');
    let m;
    if ((m = route.match(/^\/api\/book\/(\d{13})$/))) return send(res, 200, await lookupBook(m[1]));
    if ((m = route.match(/^\/api\/vinyl\/(\d{8,14})$/))) return send(res, 200, await lookupVinyl(m[1]));
    if (route === '/api/log' && req.method === 'POST') {
      let body = '';
      for await (const c of req) body += c;
      appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ua: req.headers['user-agent'], ...JSON.parse(body) }) + '\n');
      return send(res, 200, { ok: true });
    }
    send(res, 404, 'not found', 'text/plain');
  } catch (e) {
    send(res, 500, { error: String(e) });
  }
}).listen(PORT, () => {
  console.log(`PROTOTYPE barcode scan on http://localhost:${PORT}/${SECRET}/`);
  console.log(`Discogs token: ${DISCOGS_TOKEN ? 'loaded' : 'not set (keyless Discogs, works until 2026-12-01)'}`);
  console.log(`Phone needs HTTPS. In a second terminal:  ssh -R 80:localhost:${PORT} nokey@localhost.run`);
  console.log(`then open  https://<printed-host>/${SECRET}/  on the phone.`);
  console.log(`Scan log: ${LOG}`);
});
