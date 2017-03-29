const async = require('async');
const chalk = require('chalk');

const AssistantDeployment = require('./assistant/assistant_deployment.js');
const deployment = new AssistantDeployment(process.env.SUBTYPE, process.env.DATA_version);

async.waterfall([
  (cb) => deployment.previewActionPackage(deployment.getAccessToken(), deployment.getActionPackage(), cb)
], (err) => {

  if (err) {
    return deployment.error(err);
  }

  console.log();
  console.log(`${chalk.bold.green('Success!')} Your Google Assistant, ${chalk.bold.green(deployment.assistant.name)}, is ready for preview.`);
  console.log();
  return deployment.complete();

});
