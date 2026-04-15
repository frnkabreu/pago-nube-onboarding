import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Try URLs (user said /medios-de-pago; app route is /configuracion/medios-pago)
  const urls = [
    'http://localhost:5177/configuracion/medios-pago',
    'http://localhost:5177/medios-de-pago'
  ];
  
  let loaded = false;
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      loaded = true;
      break;
    } catch {
      continue;
    }
  }
  
  if (!loaded) {
    console.error('Could not load page. Is the dev server running on port 5177?');
    await browser.close();
    process.exit(1);
  }
  
  // Scroll to the "Conecta con otras opciones de pago" section
  await page.evaluate(() => {
    const section = document.querySelector('.ext-section');
    if (section) {
      section.scrollIntoView({ behavior: 'instant' });
    } else {
      window.scrollTo(0, document.body.scrollHeight / 2);
    }
  });
  
  await page.waitForTimeout(500);
  
  // Take screenshot of the section
  const section = await page.$('.ext-section');
  const screenshotPath = '/Users/nuver/Documents/Cursor 2/ext-section-screenshot.png';
  if (section) {
    await section.screenshot({ path: screenshotPath });
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }
  
  console.log('Screenshot saved to:', screenshotPath);
  await browser.close();
}

capture().catch(e => {
  console.error(e);
  process.exit(1);
});
