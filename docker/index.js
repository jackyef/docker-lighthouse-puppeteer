const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const fs = require("fs");

const { parseChromeFlags } = require('./parseChromeFlags.js');
const printer = require('./printer.js');
const { getFlags } = require("./getFlags.js");
const saveResults = require('./saveResults.js');

const lighthouseCliFlags = getFlags();

const PORT = lighthouseCliFlags.port || 5555;

async function addCookies(browser, cookieObjects) {
  const page = await browser.newPage();

  for (let i = 0; i < cookieObjects.length; i += 1) {
    const cookieObject = cookieObjects[i];

    await page.setCookie(cookieObject);
  }

  await page.close();
}

/**
 * @param {puppeteer.Browser} browser
 * @param {string} origin
 */
async function logout(browser) {
  const page = await browser.newPage();
  await page.deleteCookie({
    name: "_SID_Tokopedia_",
    domain: ".tokopedia.com",
    path: "/"
  });
  await page.close();
}

async function main() {
  // Add cookies to the browser instances
  const { addBrowserCookie, browserCookieDomain } = lighthouseCliFlags; // this is a custom param we added

  const cookieObjects = [];
  if (addBrowserCookie) {
    if (Array.isArray(addBrowserCookie)) {
      addBrowserCookie.forEach(cookiePair => {
        const [key, value] = cookiePair.split(":");

        cookieObjects.push({
          name: key,
          value: value,
          domain: browserCookieDomain,
          path: "/"
        });
      });
    } else {
      cookiePair = addBrowserCookie;
      const [key, value] = cookiePair.split(":");

      cookieObjects.push({
        name: key,
        value: value,
        domain: browserCookieDomain,
        path: "/"
      });
    }
  }

  // Direct Puppeteer to open Chrome with a specific debugging port.
  const browser = await puppeteer.launch({
    args: [
      `--remote-debugging-port=${PORT}`,
      ...parseChromeFlags(lighthouseCliFlags.chromeFlags),
    ],
    // Optional, set to true if you want to see the tests in action.
    // headless: false,
    slowMo: 50
  });

  await addCookies(browser, cookieObjects);

  /**
   * Steps copied from https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-cli/bin.js
   */

  if (
    lighthouseCliFlags.output.length === 1 &&
    lighthouseCliFlags.output[0] === printer.OutputMode.json &&
    !lighthouseCliFlags.outputPath
  ) {
    lighthouseCliFlags.outputPath = 'stdout';
  }

  // @ts-ignore - deprecation message for removed disableDeviceEmulation; can remove warning in v6.
  if (lighthouseCliFlags.disableDeviceEmulation) {
    log.warn('config', 'The "--disable-device-emulation" has been removed in v5.' +
        ' Please use "--emulated-form-factor=none" instead.');
  }

  if (typeof lighthouseCliFlags.extraHeaders === 'string') {
    // TODO: LH.Flags.extraHeaders is sometimes actually a string at this point, but needs to be
    // copied over to LH.Settings.extraHeaders, which is LH.Crdp.Network.Headers. Force
    // the conversion here, but long term either the CLI flag or the setting should have
    // a different name.
    // @ts-ignore
    let extraHeadersStr = /** @type {string} */ (lighthouseCliFlags.extraHeaders);
    // If not a JSON object, assume it's a path to a JSON file.
    if (extraHeadersStr.substr(0, 1) !== '{') {
      extraHeadersStr = fs.readFileSync(extraHeadersStr, 'utf-8');
    }

    lighthouseCliFlags.extraHeaders = JSON.parse(extraHeadersStr);
  }


  const url = lighthouseCliFlags._[0];
  // Direct Lighthouse to use the same port.
  const result = await lighthouse(url, {
    ...lighthouseCliFlags,
    port: PORT,
  });

  // Direct Puppeteer to close the browser as we're done with it.
  await browser.close();

  // Output the result.
  await saveResults(result, lighthouseCliFlags);
}

process.on('unhandledRejection', err => {
  console.error('[unhandledRejection]', err.message)
  console.error(err.stack);
  process.exit(123);
});

process.on('uncaughtExceptiont', err => {
  console.error('[uncaughtException]', err.message)
  console.error(err.stack);
  process.exit(124);
});

main();
