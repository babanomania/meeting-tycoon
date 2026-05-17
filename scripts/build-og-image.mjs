/**
 * Render public/og-image.svg → public/og-image.png at exactly 1200×630.
 *
 * Why a PNG when we already have the SVG? WhatsApp, iMessage, Slack, Twitter,
 * and LinkedIn all preview Open Graph images more reliably from PNG/JPG than
 * SVG (WhatsApp in particular has historically failed to render SVG OG
 * previews). The SVG is the editable source of truth; this script bakes the
 * raster every time it changes.
 *
 * Run: `npm run og`
 *
 * No dev server needed — we wrap the SVG in a minimal HTML page and have
 * Playwright take a viewport screenshot of it.
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVG_PATH = resolve(__dirname, '..', 'public', 'og-image.svg');
const PNG_PATH = resolve(__dirname, '..', 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

const svg = await readFile(SVG_PATH, 'utf8');

// Inline-render the SVG full-bleed in a viewport-sized page. The svg's own
// viewBox/preserveAspectRatio handles the layout.
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html, body { margin: 0; padding: 0; background: #2E1065; }
      svg { display: block; width: ${WIDTH}px; height: ${HEIGHT}px; }
    </style>
  </head>
  <body>${svg}</body>
</html>`;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  // deviceScaleFactor 2 would produce a 2400x1260 image — overkill for OG
  // previews and many crawlers downsample anyway. Keep at 1.
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
// Wait for web fonts to load (Inter is in the SVG fontFamily, but if Inter
// isn't available locally the system fallback works fine).
await page.waitForTimeout(300);

await page.screenshot({
  path: PNG_PATH,
  type: 'png',
  fullPage: false,
  clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
});

await browser.close();
console.log(`  ✓ Wrote ${PNG_PATH} (${WIDTH}×${HEIGHT})`);
