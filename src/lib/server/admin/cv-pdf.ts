import { access } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

async function browserOptions() {
  if (process.platform === 'linux') {
    const { default: chromium } = await import('@sparticuz/chromium');
    return { executablePath: await chromium.executablePath(), args: chromium.args };
  }
  const candidates = process.platform === 'win32'
    ? ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe']
    : ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const executablePath of candidates) {
    try { await access(executablePath); return { executablePath, args: [] }; } catch { /* Try the next browser. */ }
  }
  throw new Error('No se encontró un navegador para generar el PDF.');
}

/** Print the existing paginated HTML with Chromium, preserving text and links. */
export async function renderCvPdf(url: URL, cookies: { name: string; value: string }[]) {
  const browser = await puppeteer.launch({ ...await browserOptions(), headless: true });
  try {
    const page = await browser.newPage();
    await page.bringToFront();
    page.on('pageerror', cause => console.error('[cv] Render', cause));
    await page.setViewport({ width: 1280, height: 900 });
    // The CV uses self-hosted fonts. The surrounding dashboard still imports
    // Google Fonts for the public site; those requests must not delay this PDF.
    await page.setRequestInterception(true);
    page.on('request', request => {
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'fonts.googleapis.com' || hostname === 'fonts.gstatic.com') void request.abort();
      else void request.continue();
    });
    // Cookies belong only to this origin; never forward them to font providers.
    await browser.setCookie(...cookies.map(cookie => ({ ...cookie, domain: url.hostname, path: '/', httpOnly: true, secure: url.protocol === 'https:' })));
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (new URL(page.url()).pathname.startsWith('/auth/')) throw new Error('La sesión ha caducado. Vuelve a iniciar sesión para descargar el CV.');
    await page.waitForFunction(() => document.querySelector('.cv-pages[data-ready="true"]') || document.querySelector('.cv-toolbar [role="alert"]'), { timeout: 45000 });
    const failure = await page.$eval('body', element => element.querySelector('.cv-toolbar [role="alert"]')?.textContent);
    if (failure) throw new Error(failure);
    await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 15000 });
    return await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  } finally {
    await browser.close();
  }
}
