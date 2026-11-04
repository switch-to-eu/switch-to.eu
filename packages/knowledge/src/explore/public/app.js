/*
 * Knowledge explorer UI. Plain browser JavaScript, no build step.
 *
 * Safety rule: text from the store only reaches the page as text nodes or
 * attribute values set through the DOM (see h()). Nothing from the store goes
 * through innerHTML, and external links must be http(s).
 */
"use strict";

// Brand colours per node type. Text colour follows the brand contrast rule.
const TYPE_COLORS = {
  service: { bg: "#1E42B0", fg: "#ffffff" },
  category: { bg: "#0D492C", fg: "#ffffff" },
  guide: { bg: "#9BCDD0", fg: "#1a1a1a" },
  entity: { bg: "#E45229", fg: "#1a1a1a" },
  source: { bg: "#FBA616", fg: "#1a1a1a" },
  story: { bg: "#E282B4", fg: "#1a1a1a" },
  article: { bg: "#E22028", fg: "#ffffff" },
  "landing-page": { bg: "#B0D8B0", fg: "#1a1a1a" },
  page: { bg: "#C9CED6", fg: "#1a1a1a" },
};
const OTHER_COLOR = { bg: "#8B919B", fg: "#1a1a1a" };
const STALE_DAYS = 180;
const TABS = ["node", "graph", "context"];
const FACT_LABELS = {
  fact: "Fact",
  superseded: "Superseded",
  pricingTiers: "Pricing tiers",
  pricingDetails: "Pricing details",
  gdprNotes: "Privacy notes",
  gdprCompliance: "GDPR",
  dataStorageLocations: "Data stored in",
  parentCompany: "Owner",
  recommendedAlternative: "Recommended alternative",
  userSentiment: "User sentiment",
  lastResearchedAt: "Last researched",
  headquarters: "Headquarters",
  foundedYear: "Founded",
  employeeCount: "Employees",
  certifications: "Certifications",
  openSource: "Open source",
  region: "Region",
  category: "Category",
  location: "Location",
  freeOption: "Free option",
  startingPrice: "Starting price",
  missingFeatures: "Missing features",
};

const state = {
  route: null,
  stats: null,
  overview: null, // Promise of /api/graph without a center
  search: null, // last search: { key, q, found, resolved }
  sideKey: "",
  cy: null,
  lastNode: "",
};

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/** Creates an element. Children are nodes or plain text (added as text nodes). */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") el.className = value;
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
  add(el, children);
  return el;
}

function add(el, children) {
  for (const child of [children].flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

function fill(el, ...children) {
  el.replaceChildren();
  return add(el, children);
}

function safeHref(url) {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

function externalLink(url, label) {
  const href = safeHref(url);
  const text = label || url || "";
  if (!href) return h("span", {}, text);
  return h("a", { href, target: "_blank", rel: "noopener noreferrer", class: "external" }, text);
}

function typeColor(type) {
  return TYPE_COLORS[type] || OTHER_COLOR;
}

function typePill(type, kind) {
  const pill = h("span", { class: "type-pill" }, kind ? `${type} · ${kind}` : type);
  const c = typeColor(type);
  pill.style.background = c.bg;
  pill.style.color = c.fg;
  return pill;
}

function typeDot(type) {
  const dot = h("span", { class: "dot", "aria-hidden": "true" });
  dot.style.background = typeColor(type).bg;
  return dot;
}

function nodeLink(n, params) {
  return h(
    "a",
    { href: nodeHash(n.id, params), class: "node-link", "data-id": n.id },
    typeDot(n.type),
    h("span", { class: "node-link-title" }, n.title || n.id),
    h("code", { class: "id" }, n.id)
  );
}

function section(title, ...body) {
  return h("section", { class: "block" }, h("h3", {}, title), body);
}

function loading(text = "Loading…") {
  return h("p", { class: "muted loading", role: "status" }, text);
}

function errorBox(err) {
  const box = h("div", { class: "error", role: "alert" }, h("p", {}, err && err.message ? err.message : String(err)));
  const suggestions = err && err.body && err.body.suggestions;
  if (suggestions && suggestions.length) {
    add(box, h("p", {}, "Did you mean:"), h("ul", { class: "plain" }, suggestions.map((s) => h("li", {}, nodeLink(s)))));
  }
  return box;
}

/** «match» marks from the full-text snippet, as <mark> elements. */
function marked(snippet) {
  const out = [];
  const text = String(snippet || "");
  let last = 0;
  for (const m of text.matchAll(/«([^»]*)»/g)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(h("mark", {}, m[1]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const INLINE_RE = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]*))?\]\]|https?:\/\/[^\s<>()\]]+/g;

/** Text with [[wikilinks]] to nodes and http(s) URLs made clickable. */
function linkify(value) {
  const text = String(value ?? "");
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[0].startsWith("[[")) {
      const id = m[1].trim();
      out.push(h("a", { href: nodeHash(id), class: "wikilink" }, m[3] || (m[2] ? `${id}#${m[2]}` : id)));
    } else {
      const url = m[0].replace(/[.,;:!?]+$/, "");
      out.push(externalLink(url, url));
      if (url.length < m[0].length) out.push(m[0].slice(url.length));
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function ageDays(date) {
  if (!date) return null;
  const t = Date.parse(date);
  return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86_400_000);
}

function isStale(date) {
  const age = ageDays(date);
  return age !== null && age > STALE_DAYS;
}

function dateLabel(date) {
  if (!date) return h("span", { class: "muted" }, "undated");
  const age = ageDays(date);
  const stale = isStale(date);
  const ago = age === null ? "" : age <= 0 ? "today" : age === 1 ? "1 day ago" : `${age} days ago`;
  return h(
    "span",
    { class: stale ? "date stale" : "date", title: stale ? `Older than ${STALE_DAYS} days. Re-check before relying on it.` : ago || null },
    date,
    ago ? h("small", {}, ` ${ago}`) : null
  );
}

// ---------------------------------------------------------------------------
// Routes: #/  #/search/<text>?type=&lang=  #/node/<id>?tab=graph&hops=2
// ---------------------------------------------------------------------------

function encodeId(id) {
  return id.split("/").map(encodeURIComponent).join("/");
}

function routeHash(view, arg, params) {
  const base = view === "node" ? `#/node/${encodeId(arg)}` : view === "search" ? `#/search/${encodeURIComponent(arg)}` : "#/";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

function nodeHash(id, params) {
  return routeHash("node", id, params);
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const cut = raw.indexOf("?");
  const pathPart = cut === -1 ? raw : raw.slice(0, cut);
  const params = new URLSearchParams(cut === -1 ? "" : raw.slice(cut + 1));
  const decode = (s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  if (pathPart.startsWith("node/") && pathPart.length > 5) return { view: "node", arg: decode(pathPart.slice(5)), params };
  if (pathPart.startsWith("search/") && pathPart.length > 7) return { view: "search", arg: decode(pathPart.slice(7)), params };
  return { view: "home", arg: "", params };
}

function withParams(route, changes) {
  return routeHash(route.view, route.arg, { ...Object.fromEntries(route.params), ...changes });
}

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function currentTab(route) {
  const allowed = route.view === "node" ? TABS : ["graph", "context"];
  const tab = route.params.get("tab");
  if (allowed.includes(tab)) return tab;
  return route.view === "node" ? "node" : route.view === "search" ? "context" : "graph";
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

async function api(path, params) {
  const url = new URL(path, location.origin);
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  const res = await fetch(url);
  let body;
  try {
    body = await res.json();
  } catch {
    body = { error: `HTTP ${res.status}` };
  }
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function overview() {
  if (!state.overview) {
    state.overview = api("/api/graph").catch((err) => {
      state.overview = null;
      throw err;
    });
  }
  return state.overview;
}

// ---------------------------------------------------------------------------
// Header: store stats
// ---------------------------------------------------------------------------

async function loadStats() {
  let s;
  try {
    s = await api("/api/stats");
  } catch (err) {
    fill($("store-meta"), h("span", { class: "warn" }, err.message));
    fill($("stats"));
    state.stats = null;
    state.overview = null;
    return;
  }
  const changed = !state.stats || state.stats.builtAt !== s.builtAt;
  state.stats = s;
  if (!changed) return;
  state.overview = null;
  state.sideKey = "";

  const built = s.builtAt ? new Date(s.builtAt) : null;
  const vectors = s.embeddings && s.embeddings.on ? `vector search on (${s.embeddings.provider}, ${s.embeddings.model})` : "vector search off, full text only";
  fill(
    $("store-meta"),
    "Generated ",
    h("strong", {}, s.generated || "unknown"),
    built ? ` · file written ${built.toLocaleString()}` : "",
    ` · ${vectors}`
  );

  const t = s.totals || {};
  const extras = [
    ["edges", s.edges],
    ["passages", t.chunks],
    ["facts", t.facts],
    ["events", t.events],
    ["URLs", t.urls],
    ["claims", t.claims],
  ].filter(([, n]) => typeof n === "number");
  fill(
    $("stats"),
    s.types.map((row) =>
      h("li", { class: "stat" }, typeDot(row.type), row.type, " ", h("strong", {}, row.count), row.derived ? h("small", { class: "muted" }, ` (${row.derived} derived)`) : null)
    ),
    extras.map(([label, n]) => h("li", { class: "stat plain-stat" }, label, " ", h("strong", {}, n)))
  );

  const typeSel = $("type");
  const langSel = $("lang");
  fill(typeSel, h("option", { value: "" }, "All types"), s.types.map((row) => h("option", { value: row.type }, row.type)));
  fill(langSel, h("option", { value: "" }, "All"), s.langs.map((row) => h("option", { value: row.lang }, row.lang)));
  syncForm(state.route);
}

// ---------------------------------------------------------------------------
// Sidebar: search results or browse list
// ---------------------------------------------------------------------------

function syncForm(route) {
  if (!route || route.view !== "search") return;
  $("q").value = route.arg;
  $("type").value = route.params.get("type") || "";
  $("lang").value = route.params.get("lang") || "";
}

function setActive(box, id) {
  for (const a of box.querySelectorAll("a[data-id]")) {
    const on = a.dataset.id === id;
    if (on) {
      a.setAttribute("aria-current", "page");
      const group = a.closest("details");
      if (group) group.open = true;
    } else a.removeAttribute("aria-current");
  }
}

async function renderSide(route, seq) {
  const box = $("side-list");
  const activeId = route.view === "node" ? route.arg : null;

  if (route.view === "search") {
    const type = route.params.get("type") || "";
    const lang = route.params.get("lang") || "";
    const key = `search:${JSON.stringify([route.arg, type, lang])}:${state.stats ? state.stats.builtAt : ""}`;
    if (!state.search || state.search.key !== key) {
      fill(box, loading("Searching…"));
      const [found, resolved] = await Promise.allSettled([
        api("/api/search", { q: route.arg, type, lang, limit: 30 }),
        api("/api/resolve", { q: route.arg }),
      ]);
      if (seq !== renderSeq) return;
      state.search = { key, q: route.arg, found, resolved };
    }
  }

  const showResults = route.view === "search" || (route.view === "node" && state.search && state.sideKey.startsWith("search:"));
  if (showResults) {
    if (state.sideKey !== state.search.key) {
      drawResults(box, state.search);
      state.sideKey = state.search.key;
    }
  } else {
    const key = `browse:${state.stats ? state.stats.builtAt : ""}`;
    if (state.sideKey !== key) {
      fill(box, loading());
      let data;
      try {
        data = await overview();
      } catch (err) {
        if (seq === renderSeq) fill(box, errorBox(err));
        return;
      }
      if (seq !== renderSeq) return;
      drawBrowse(box, data);
      state.sideKey = key;
    }
  }
  setActive(box, activeId);
}

function drawResults(box, s) {
  const parts = [h("div", { class: "side-head" }, h("h2", {}, "Results"), h("a", { href: "#/", class: "small-link" }, "Browse all nodes"))];

  const direct = s.resolved.status === "fulfilled" ? s.resolved.value.matches.filter((m) => m.confidence >= 0.7).slice(0, 5) : [];
  if (direct.length) {
    parts.push(
      h(
        "section",
        { class: "direct" },
        h("h3", {}, "Direct matches"),
        h(
          "ul",
          { class: "plain" },
          direct.map((m) => h("li", {}, nodeLink(m), h("small", { class: "muted match-why" }, `${m.match}${m.via ? `, ${m.via}` : ""} · ${m.confidence.toFixed(1)}`)))
        )
      )
    );
  }

  if (s.found.status === "rejected") {
    parts.push(errorBox(s.found.reason));
  } else {
    const { hits, warning, vectors } = s.found.value;
    if (warning) parts.push(h("p", { class: "warn small" }, warning));
    parts.push(h("p", { class: "muted small" }, `${hits.length} node${hits.length === 1 ? "" : "s"}${vectors ? ", full text and vectors" : ", full text"}`));
    if (!hits.length) parts.push(h("p", { class: "empty" }, "No matches. Try fewer words, or remove the filters."));
    parts.push(
      h(
        "ol",
        { class: "results" },
        hits.map((hit) =>
          h(
            "li",
            {},
            h(
              "a",
              { href: nodeHash(hit.id), class: "result", "data-id": hit.id },
              h("span", { class: "result-top" }, h("strong", { class: "result-title" }, hit.title), typePill(hit.type, hit.kind)),
              h("code", { class: "id" }, hit.id),
              h("span", { class: "result-heading" }, hit.heading || "Intro", h("small", { class: "muted" }, ` · ${hit.lang}`), hit.draft ? h("small", { class: "badge" }, "draft") : null),
              h("span", { class: "snippet" }, marked(hit.snippet))
            )
          )
        )
      )
    );
  }
  fill(box, parts);
}

function drawBrowse(box, data) {
  const groups = new Map();
  for (const n of data.nodes) {
    if (!groups.has(n.type)) groups.set(n.type, []);
    groups.get(n.type).push(n);
  }
  const sorted = [...groups].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  fill(
    box,
    h("div", { class: "side-head" }, h("h2", {}, "Browse"), h("span", { class: "muted small" }, `${data.nodes.length} nodes`)),
    sorted.map(([type, nodes]) =>
      h(
        "details",
        { class: "group" },
        h("summary", {}, typeDot(type), h("span", {}, type), h("span", { class: "count" }, nodes.length)),
        h(
          "ul",
          { class: "plain browse" },
          nodes
            .slice()
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((n) =>
              h(
                "li",
                {},
                h("a", { href: nodeHash(n.id), class: "browse-link", "data-id": n.id }, n.title, n.virtual ? h("small", { class: "muted" }, " derived") : null, n.draft ? h("small", { class: "badge" }, "draft") : null)
              )
            )
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Node tab
// ---------------------------------------------------------------------------

async function renderNodeTab(panel, id, seq) {
  fill(panel, loading());
  let v;
  try {
    v = await api("/api/node", { id });
  } catch (err) {
    if (seq === renderSeq) fill(panel, errorBox(err));
    return;
  }
  if (seq !== renderSeq) return;
  const n = v.node;
  document.title = `${n.title} · Knowledge explorer`;
  fill(
    panel,
    nodeHeader(n),
    Object.keys(v.extra || {}).length ? section("Details", detailsList(v.extra)) : null,
    v.facts.length ? section(`Facts (${v.facts.length})`, factsTable(v.facts)) : null,
    section(`Links (${v.out.length + v.in.length})`, linksBlock(v)),
    urlsBlocks(v.urls),
    v.events.length ? section(`Events (${v.events.length})`, eventsList(v.events)) : null,
    v.claims.length ? section(`Claims (${v.claims.length})`, claimsList(v.claims)) : null,
    v.aliases.length ? section(`Aliases (${v.aliases.length})`, h("ul", { class: "aliases" }, v.aliases.map((a) => h("li", {}, a)))) : null
  );
}

function nodeHeader(n) {
  return h(
    "header",
    { class: "node-head" },
    h(
      "div",
      { class: "pills" },
      typePill(n.type, n.kind),
      n.draft ? h("span", { class: "badge" }, "draft") : null,
      n.virtual ? h("span", { class: "badge", title: "Derived from parentCompany. There is no knowledge note for it yet." }, "derived") : null
    ),
    h("h2", { class: "node-title" }, n.title),
    n.summary ? h("p", { class: "summary" }, n.summary) : null,
    h(
      "dl",
      { class: "meta-list" },
      h("dt", {}, "id"),
      h("dd", {}, h("code", {}, n.id)),
      h("dt", {}, "file"),
      h("dd", {}, n.path ? h("code", {}, n.path) : h("span", { class: "muted" }, "none (derived node)")),
      n.updated ? [h("dt", {}, "updated"), h("dd", {}, dateLabel(n.updated))] : null,
      n.heat ? [h("dt", {}, "heat"), h("dd", {}, String(n.heat))] : null
    )
  );
}

function detailsList(extra) {
  return h(
    "dl",
    { class: "meta-list" },
    Object.entries(extra).map(([k, v]) => [
      h("dt", {}, k),
      h("dd", {}, /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? dateLabel(String(v)) : typeof v === "object" ? JSON.stringify(v) : String(v)),
    ])
  );
}

function factsTable(facts) {
  return h(
    "div",
    { class: "table-wrap" },
    h(
      "table",
      { class: "facts" },
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Field"), h("th", { scope: "col" }, "Value, date and source"))),
      h(
        "tbody",
        {},
        facts.map((f) =>
          h(
            "tr",
            { class: [f.field === "superseded" ? "superseded" : "", isStale(f.date) ? "stale" : ""].filter(Boolean).join(" ") || null },
            h("th", { scope: "row" }, FACT_LABELS[f.field] || f.field),
            // Date and source sit under the value, so the table fits a narrow panel.
            h(
              "td",
              { class: "value" },
              linkify(f.value),
              h("div", { class: "fact-meta" }, "as of ", dateLabel(f.date), f.cite ? h("span", { class: "cite" }, " · ", linkify(f.cite)) : null)
            )
          )
        )
      )
    )
  );
}

function linksBlock(v) {
  const groups = new Map();
  const push = (dir, e) => {
    const key = `${dir}:${e.rel}`;
    if (!groups.has(key)) groups.set(key, { dir, rel: e.rel, items: [] });
    groups.get(key).items.push(e);
  };
  for (const e of v.out) push("out", e);
  for (const e of v.in) push("in", e);
  if (!groups.size) return h("p", { class: "muted" }, "No links to or from this node.");
  return h(
    "div",
    { class: "link-groups" },
    [...groups.values()].map((g) =>
      h(
        "div",
        { class: "link-group" },
        h(
          "h4",
          {},
          g.dir === "out" ? h("span", { class: "dir" }, "out →") : h("span", { class: "dir in" }, "← in"),
          " ",
          g.rel,
          h("small", { class: "muted" }, g.dir === "out" ? " (this node links to)" : " (links to this node)")
        ),
        h("ul", { class: "plain" }, g.items.map((e) => h("li", {}, nodeLink(e))))
      )
    )
  );
}

function urlsBlocks(urls) {
  const sources = urls.filter((u) => u.role === "source");
  const other = urls.filter((u) => u.role !== "source");
  return [
    sources.length
      ? section(
          `Sources (${sources.length})`,
          h(
            "ul",
            { class: "sources" },
            sources.map((u) =>
              h(
                "li",
                { class: isStale(u.checked_at) ? "stale" : null },
                externalLink(u.href, u.label || u.href),
                h("span", { class: "checked" }, "checked ", u.checked_at ? dateLabel(u.checked_at) : h("span", { class: "warn" }, "no check date")),
                u.label ? h("span", { class: "url muted" }, u.href) : null
              )
            )
          )
        )
      : null,
    other.length
      ? section(
          "URLs",
          h(
            "dl",
            { class: "meta-list" },
            other.map((u) => [h("dt", {}, u.role), h("dd", {}, externalLink(u.href, u.label || u.href), u.checked_at ? [" · checked ", dateLabel(u.checked_at)] : null)])
          )
        )
      : null,
  ];
}

function eventsList(events) {
  return h(
    "ol",
    { class: "timeline" },
    events.map((e) =>
      h(
        "li",
        { class: "event" },
        h("div", { class: "event-date" }, dateLabel(e.date)),
        h(
          "div",
          { class: "event-body" },
          h("span", { class: "kind" }, e.kind),
          " ",
          e.url ? externalLink(e.url, e.title || e.url) : h("strong", {}, e.title || ""),
          e.source ? h("span", { class: "muted" }, ` · ${e.source}`) : null,
          e.summary ? h("p", {}, linkify(e.summary)) : null
        )
      )
    )
  );
}

function claimsList(claims) {
  return h("ol", { class: "claims plain" }, claims.map((c) => h("li", {}, h("code", { class: "claim-id" }, c.claim_id), " ", linkify(c.text))));
}

// ---------------------------------------------------------------------------
// Graph tab
// ---------------------------------------------------------------------------

function graphStyle(labelEdges) {
  const style = [
    {
      selector: "node",
      style: {
        "background-color": OTHER_COLOR.bg,
        "border-width": 1,
        "border-color": "#ffffff",
        label: "data(label)",
        color: "#1a1a1a",
        "font-size": 10,
        // cytoscape's font-family parser accepts double quotes only.
        "font-family": 'system-ui, -apple-system, "Segoe UI", sans-serif',
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 3,
        "text-wrap": "ellipsis",
        "text-max-width": "120px",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.85,
        "text-background-padding": "1px",
        "min-zoomed-font-size": 7,
        width: "mapData(degree, 0, 24, 14, 44)",
        height: "mapData(degree, 0, 24, 14, 44)",
      },
    },
    ...Object.entries(TYPE_COLORS).map(([type, c]) => ({ selector: `node[type = "${type}"]`, style: { "background-color": c.bg } })),
    { selector: "node.derived", style: { "border-width": 2, "border-style": "dashed", "border-color": "#1a1a1a" } },
    { selector: "node.hit", style: { "border-width": 5, "border-color": "#FBA616", "border-style": "solid" } },
    { selector: "node.center", style: { width: 48, height: 48, "border-width": 4, "border-color": "#1a1a1a", "font-size": 13, "font-weight": "bold", "z-index": 10 } },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "#b4bac4",
        "target-arrow-color": "#b4bac4",
        "target-arrow-shape": "triangle",
        "arrow-scale": 0.8,
        "curve-style": "bezier",
      },
    },
    { selector: ".faded", style: { opacity: 0.2 } },
  ];
  if (labelEdges) {
    style.push({
      selector: "edge",
      style: {
        label: "data(rel)",
        "font-size": 8,
        color: "#3f4650",
        "text-rotation": "autorotate",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.9,
        "text-background-padding": "1px",
        "min-zoomed-font-size": 7,
      },
    });
  }
  return style;
}

function destroyGraph() {
  if (state.cy) {
    state.cy.destroy();
    state.cy = null;
  }
}

async function renderGraph(panel, route, seq) {
  const center = route.view === "node" ? route.arg : null;
  const hops = route.params.get("hops") === "2" ? 2 : 1;
  fill(panel, loading("Drawing the graph…"));
  let data;
  try {
    data = center ? await api("/api/graph", { center, hops }) : await overview();
  } catch (err) {
    if (seq === renderSeq) fill(panel, errorBox(err));
    return;
  }
  if (seq !== renderSeq) return;
  if (typeof window.cytoscape !== "function") {
    fill(panel, errorBox(new Error("The graph library did not load (/vendor/cytoscape.min.js). Run pnpm install and restart the explorer.")));
    return;
  }

  const hits = new Set(
    route.view === "search" && state.search && state.search.found.status === "fulfilled" ? state.search.found.value.hits.map((x) => x.id) : []
  );
  const holder = h("div", {
    class: "graph",
    role: "img",
    "aria-label": center ? `Graph of the nodes within ${hops} hop${hops === 1 ? "" : "s"} of ${center}` : "Graph of all nodes",
  });
  const fit = h("button", { type: "button", class: "pill", onclick: () => state.cy && state.cy.fit(undefined, 24) }, "Fit");
  const title = center ? "Neighbourhood" : route.view === "search" ? "Overview, search hits ringed" : "Overview";
  const counts = `${data.nodes.length} nodes, ${data.edges.length} edges${data.truncated ? " (trimmed to the nearest nodes)" : ""}`;

  fill(
    panel,
    h(
      "div",
      { class: "panel-head" },
      h("div", {}, h("h2", {}, title), h("p", { class: "muted small" }, counts, ". Click a node to open it. Hover to see its links.")),
      h(
        "div",
        { class: "controls" },
        center
          ? [1, 2].map((n) =>
              h("a", { href: withParams(route, { tab: "graph", hops: n }), class: n === hops ? "pill active" : "pill", "aria-current": n === hops ? "true" : null }, `${n} hop${n === 1 ? "" : "s"}`)
            )
          : null,
        fit
      )
    ),
    legend(data, hits.size > 0),
    holder
  );

  destroyGraph();
  const degree = new Map();
  for (const e of data.edges) {
    degree.set(e.src, (degree.get(e.src) || 0) + 1);
    degree.set(e.dst, (degree.get(e.dst) || 0) + 1);
  }
  const elements = [
    ...data.nodes.map((n) => ({
      group: "nodes",
      data: { id: n.id, label: n.title, type: n.type, distance: n.distance || 0, degree: degree.get(n.id) || 0 },
      classes: [n.id === center ? "center" : "", n.virtual ? "derived" : "", hits.has(n.id) ? "hit" : ""].filter(Boolean).join(" "),
    })),
    ...data.edges.map((e, i) => ({ group: "edges", data: { id: `e${i}`, source: e.src, target: e.dst, rel: e.rel } })),
  ];
  const layout = center
    ? { name: "concentric", animate: false, concentric: (n) => 10 - n.data("distance"), levelWidth: () => 1, minNodeSpacing: 40, avoidOverlap: true, padding: 24 }
    : { name: "cose", animate: false, randomize: true, nodeRepulsion: () => 9000, idealEdgeLength: () => 70, nodeOverlap: 20, gravity: 0.3, componentSpacing: 80, padding: 24 };

  const cy = window.cytoscape({ container: holder, elements, style: graphStyle(Boolean(center)), layout, minZoom: 0.15, maxZoom: 3 });
  cy.on("tap", "node", (evt) => go(nodeHash(evt.target.id(), { tab: "graph", hops: hops === 2 ? 2 : undefined })));
  cy.on("mouseover", "node", (evt) => {
    holder.classList.add("pointer");
    cy.elements().addClass("faded");
    evt.target.closedNeighborhood().removeClass("faded");
  });
  cy.on("mouseout", "node", () => {
    holder.classList.remove("pointer");
    cy.elements().removeClass("faded");
  });
  state.cy = cy;
}

function legend(data, withHits) {
  const counts = new Map();
  for (const n of data.nodes) counts.set(n.type, (counts.get(n.type) || 0) + 1);
  const derived = data.nodes.some((n) => n.virtual);
  return h(
    "ul",
    { class: "legend", "aria-label": "Legend" },
    [...counts].map(([type, n]) => h("li", {}, typeDot(type), `${type} ${n}`)),
    derived ? h("li", {}, h("span", { class: "dot dashed", "aria-hidden": "true" }), "derived company") : null,
    withHits ? h("li", {}, h("span", { class: "dot ring", "aria-hidden": "true" }), "search hit") : null
  );
}

// ---------------------------------------------------------------------------
// Context tab
// ---------------------------------------------------------------------------

async function renderContext(panel, route, seq) {
  const target = route.view === "home" ? "" : route.arg;
  if (!target) {
    fill(
      panel,
      h("div", { class: "empty" }, h("h2", {}, "Context"), h("p", {}, "Open a node or search for a topic to see the brief a writing agent gets for it."))
    );
    return;
  }
  const budgetRaw = Number(route.params.get("budget"));
  const budget = Number.isInteger(budgetRaw) && budgetRaw >= 200 ? Math.min(budgetRaw, 50000) : 6000;
  const focus = route.params.get("focus") || "";
  const lang = route.params.get("lang") || "";

  const budgetInput = h("input", { type: "number", id: "ctx-budget", name: "budget", min: 200, max: 50000, step: 500, value: budget });
  const focusInput = h("input", {
    type: "text",
    id: "ctx-focus",
    name: "focus",
    value: focus,
    placeholder: route.view === "node" ? "Optional, e.g. pricing" : "Defaults to the search text",
  });
  const out = h("pre", { class: "context", tabindex: "0", "aria-label": "Context markdown" }, "Loading…");
  const status = h("p", { class: "muted small", role: "status" });
  const copyBtn = h("button", { type: "button", class: "pill", onclick: () => copyText(out.textContent, status) }, "Copy");
  const form = h(
    "form",
    {
      class: "context-form",
      onsubmit: (e) => {
        e.preventDefault();
        go(withParams(route, { tab: "context", budget: budgetInput.value, focus: focusInput.value.trim() }));
      },
    },
    h("label", { class: "field", for: "ctx-budget" }, h("span", { class: "label" }, "Budget (tokens)"), budgetInput),
    h("label", { class: "field grow", for: "ctx-focus" }, h("span", { class: "label" }, "Focus passages on"), focusInput),
    h("button", { type: "submit", class: "pill primary" }, "Update"),
    copyBtn
  );
  const cli = `pnpm -s knowledge context "${target}" --budget ${budget}${focus ? ` --query "${focus}"` : ""}${lang ? ` --lang ${lang}` : ""}`;
  fill(panel, h("div", { class: "panel-head" }, h("div", {}, h("h2", {}, "Context"), h("p", { class: "muted small" }, "Same as ", h("code", {}, cli)))), form, status, out);

  let res;
  try {
    res = await api("/api/context", { target, budget, query: focus, lang });
  } catch (err) {
    if (seq === renderSeq) {
      out.textContent = "";
      out.replaceWith(errorBox(err));
    }
    return;
  }
  if (seq !== renderSeq) return;
  out.textContent = res.markdown;
  const chars = res.markdown.length;
  status.textContent = `${chars.toLocaleString()} characters, about ${Math.round(chars / 4).toLocaleString()} of ${res.budget.toLocaleString()} tokens${
    res.vectors ? ", with vector search" : ""
  }${res.warning ? `. ${res.warning}` : ""}`;
}

async function copyText(text, status) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied to the clipboard.";
  } catch {
    const area = h("textarea", { class: "offscreen", "aria-hidden": "true" }, text);
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    status.textContent = ok ? "Copied to the clipboard." : "Copy failed. Select the text and copy it by hand.";
  }
}

// ---------------------------------------------------------------------------
// Render loop
// ---------------------------------------------------------------------------

let renderSeq = 0;

function renderTabs(route, tab) {
  for (const btn of document.querySelectorAll("[role=tab]")) {
    const t = btn.dataset.tab;
    const selected = t === tab;
    btn.setAttribute("aria-selected", String(selected));
    btn.tabIndex = selected ? 0 : -1;
    btn.disabled = t === "node" && route.view !== "node";
    btn.title = btn.disabled ? "Open a node first" : "";
  }
  $("panel").setAttribute("aria-labelledby", `tab-${tab}`);
}

async function render() {
  const seq = ++renderSeq;
  const route = parseHash();
  state.route = route;
  const tab = currentTab(route);
  renderTabs(route, tab);
  syncForm(route);
  destroyGraph();
  fill($("panel"), loading());
  document.title = route.view === "home" ? "Knowledge explorer" : `${route.arg} · Knowledge explorer`;

  // Bring the panel into view when moving to another node from far down a page.
  const nodeKey = route.view === "node" ? route.arg : "";
  if (nodeKey && nodeKey !== state.lastNode && $("main").getBoundingClientRect().top < 0) $("main").scrollIntoView({ block: "start" });
  state.lastNode = nodeKey;

  await loadStats(); // first, so a rebuilt store resets the cached overview
  if (seq !== renderSeq) return;

  const panel = $("panel");
  const side = renderSide(route, seq).catch((err) => fill($("side-list"), errorBox(err)));
  const main = (tab === "node" ? renderNodeTab(panel, route.arg, seq) : tab === "graph" ? renderGraph(panel, route, seq) : renderContext(panel, route, seq)).catch(
    (err) => fill(panel, errorBox(err))
  );
  await Promise.all([side, main]);
}

function init() {
  $("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("q").value.trim();
    if (!q) {
      $("q").focus();
      return;
    }
    go(routeHash("search", q, { type: $("type").value, lang: $("lang").value }));
  });

  const tabs = [...document.querySelectorAll("[role=tab]")];
  for (const btn of tabs) {
    btn.addEventListener("click", () => {
      if (!btn.disabled && state.route) go(withParams(state.route, { tab: btn.dataset.tab }));
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const enabled = tabs.filter((t) => !t.disabled);
      const i = enabled.indexOf(btn);
      const next = enabled[(i + (e.key === "ArrowRight" ? 1 : enabled.length - 1)) % enabled.length];
      next.focus();
      next.click();
    });
  }

  document.addEventListener("keydown", (e) => {
    const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      $("q").focus();
      $("q").select();
    }
  });

  window.addEventListener("hashchange", render);
  render();
}

init();
