const async = require('async');
const chalk = require('chalk');
const Action = require('gactions').Action;

const AssistantDeployment = require('./assistant/assistant_deployment.js');
const deployment = new AssistantDeployment(process.env.SUBTYPE, process.env.DATA_version);

let myAction = new Action().loadIntents('./action/intents');
let actionPackage = myAction.generateActionPackage(
  deployment.assistant.projectId,
  deployment.pkg.version,
  deployment.assistant.name,
  deployment.assistant.voice,
  deployment.assistant.language,
  deployment.endpoint
);

console.log();

async.waterfall([
  (cb) => deployment.createAccessToken(cb),
  (accessToken, cb) => deployment.createActionPackage(accessToken, actionPackage, cb)
], (err) => {

  if (err) {
    return deployment.error(err);
  }

  console.log();
  console.log(`Your Google Assistant, ${chalk.bold.green(deployment.assistant.name)}, has been created.`);
  console.log();
  return deployment.complete();

});
