/**
 * Rendered accessibility audit (the measurable half of an impeccable audit).
 *
 *   pnpm --filter website dev        # or a production server on :5010
 *   node apps/website/scripts/a11y-audit.cjs [baseUrl]
 *
 * For each page at 1280px and 375px it reports: text contrast below WCAG AA
 * (computed colours, opacity and translucent backgrounds blended), horizontal
 * overflow, h1 count, heading level skips, images without alt, interactive
 * targets under 24x24px, unlabelled inputs and missing prefers-reduced-motion
 * rules. Text over images or SVG shapes can't be measured and may show as a
 * false positive (e.g. the "Recommended" badge on its yellow shape).
 */
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5010';
const pages = ['/en', '/nl', '/en/news', '/en/news/microsoft-france-cannot-guarantee-eu-data', '/en/services/email',
  '/en/services/eu/proton-mail', '/en/services/non-eu/gmail', '/en/guides/messaging/whatsapp-to-signal', '/en/feedback', '/en/about', '/en/pages/quit-chatgpt'];
const audit = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const parse = (c) => { if (!c || c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }; cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const lum = ({ r, g, b }) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el) => { const layers = []; let n = el; while (n && n.nodeType === 1) { const s = getComputedStyle(n); if (s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('linear')) return null; const c = parse(s.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } n = n.parentElement; } let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base); return base; };
  const out = { contrast: [], images: [], headings: [], targets: [], overflow: document.documentElement.scrollWidth > window.innerWidth + 1, inputs: [] };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const el = t.parentElement; if (!el || !t.textContent.trim()) continue;
    if (el.closest('[aria-hidden="true"],script,style,noscript,svg')) continue;
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || el.getClientRects().length === 0) continue;
    if (el.closest('input,textarea') ) continue;
    let fg = parse(s.color); const bg = bgOf(el); if (!fg || !bg) continue;
    let op = 1; let n = el; while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    fg = { ...fg, a: fg.a * op }; const eff = blend(fg, bg);
    const l1 = lum(eff), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight) >= 700; const large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    if (ratio < need) { const key = t.textContent.trim().slice(0, 40) + ratio.toFixed(2); if (!seen.has(key)) { seen.add(key); out.contrast.push(`${ratio.toFixed(2)} ${size}px "${t.textContent.trim().slice(0, 30)}" <${el.tagName.toLowerCase()} class="${(el.className.baseVal ?? el.className).toString().slice(0, 140)}">`); } }
  }
  document.querySelectorAll('img').forEach((i) => { if (!i.hasAttribute('alt')) out.images.push(i.src.slice(-50)); });
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => h.getClientRects().length);
  out.h1 = hs.filter(h => h.tagName === 'H1').length;
  let prev = 0; hs.forEach((h) => { const l = +h.tagName[1]; if (prev && l > prev + 1) out.headings.push(`h${prev}→h${l} "${h.textContent.trim().slice(0, 40)}"`); prev = l; });
  document.querySelectorAll('a,button,input,select,[role=button]').forEach((e) => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const inline = getComputedStyle(e).display === 'inline' && e.closest('p,li'); if (!inline && (r.width < 24 || r.height < 24)) out.targets.push(`${Math.round(r.width)}x${Math.round(r.height)} ${e.tagName} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)}"`); });
  document.querySelectorAll('input,textarea,select').forEach((i) => { if (i.type === 'hidden') return; const lab = i.labels?.length || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby'); if (!lab) out.inputs.push(i.name || i.placeholder || i.type); });
  out.reducedMotion = [...document.styleSheets].some((ss) => { try { return [...ss.cssRules].some(r => r.media && /prefers-reduced-motion/.test(r.media.mediaText)); } catch { return false; } });
  return out;
};
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 375]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const url of pages) {
      await p.goto(BASE + url, { waitUntil: 'networkidle', timeout: 180000 });
      const r = await p.evaluate(audit);
      const issues = [];
      if (r.contrast.length) issues.push(`contrast(${r.contrast.length}): ` + r.contrast.join('\n      '));
      if (r.overflow) issues.push('HORIZONTAL OVERFLOW');
      if (r.images.length) issues.push('img no alt: ' + r.images.join(', '));
      if (r.h1 !== 1) issues.push(`h1 count ${r.h1}`);
      if (r.headings.length) issues.push('heading skips: ' + r.headings.slice(0, 4).join(' | '));
      if (r.targets.length) issues.push(`small targets(${r.targets.length}): ` + r.targets.join(' | '));
      if (r.inputs.length) issues.push('unlabelled inputs: ' + r.inputs.join(', '));
      if (!r.reducedMotion) issues.push('no prefers-reduced-motion rules');
      console.log(`[${w}] ${url}: ${issues.length ? '\n   ' + issues.join('\n   ') : 'ok'}`);
    }
    await p.close();
  }
  await b.close();
})();
