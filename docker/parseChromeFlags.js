const yargsParser = require('yargs-parser');

function parseChromeFlags(flags = "") {
  const parsed = yargsParser(flags.trim(), {
    configuration: { "camel-case-expansion": false, "boolean-negation": false }
  });

  return (
    Object.keys(parsed)
      // Remove unnecessary _ item provided by yargs,
      .filter(key => key !== "_")
      // Avoid '=true', then reintroduce quotes
      .map(key => {
        if (parsed[key] === true) return `--${key}`;
        // ChromeLauncher passes flags to Chrome as atomic arguments, so do not double quote
        // i.e. `lighthouse --chrome-flags="--user-agent='My Agent'"` becomes `chrome "--user-agent=My Agent"`
        // see https://github.com/GoogleChrome/lighthouse/issues/3744
        return `--${key}=${parsed[key]}`;
      })
  );
}

module.exports = { parseChromeFlags };
