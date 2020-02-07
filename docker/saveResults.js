const path = require('path');
const Printer = require('./printer.js');
const { getFilenamePrefix } = require('./getFilenamePrefix.js');
const log = require('./logger.js');

async function saveResults(runnerResult, flags) {
  const cwd = process.cwd();

  if (flags.lanternDataOutputPath) {
    const devtoolsLog = runnerResult.artifacts.devtoolsLogs.defaultPass;
    await assetSaver.saveLanternNetworkData(devtoolsLog, flags.lanternDataOutputPath);
  }

  const shouldSaveResults = flags.auditMode || (flags.gatherMode === flags.auditMode);
  if (!shouldSaveResults) return;
  const {lhr, artifacts, report} = runnerResult;

  // Use the output path as the prefix for all generated files.
  // If no output path is set, generate a file prefix using the URL and date.
  const configuredPath = !flags.outputPath || flags.outputPath === 'stdout' ?
      getFilenamePrefix(lhr) :
      flags.outputPath.replace(/\.\w{2,4}$/, '');
  const resolvedPath = path.resolve(cwd, configuredPath);

  if (flags.saveAssets) {
    await assetSaver.saveAssets(artifacts, lhr.audits, resolvedPath);
  }

  for (const outputType of flags.output) {
    const extension = outputType;
    const output = report[flags.output.indexOf(outputType)];
    let outputPath = `${resolvedPath}.report.${extension}`;
    // If there was only a single output and the user specified an outputPath, force usage of it.
    if (flags.outputPath && flags.output.length === 1) outputPath = flags.outputPath;
    await Printer.write(output, outputType, outputPath);

    if (outputType === Printer.OutputMode[Printer.OutputMode.html]) {
      if (flags.view) {
        open(outputPath, {wait: false});
      } else {
        // eslint-disable-next-line max-len
        log.log('CLI', 'Protip: Run lighthouse with `--view` to immediately open the HTML report in your browser');
      }
    }
  }
}

module.exports = saveResults;
