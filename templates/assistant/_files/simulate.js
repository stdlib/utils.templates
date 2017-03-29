const async = require('async');
const chalk = require('chalk');

const AssistantDeployment = require('./scripts/assistant/assistant_deployment.js');
const deployment = new AssistantDeployment();

const AssistantSimulation = require('./scripts/assistant/assistant_simulation.js');
const simulation = new AssistantSimulation();

process.argv.slice(2).filter(v => v === '-s').length && simulation.silence();
process.argv.slice(2).filter(v => v === '--silence').length && simulation.silence();
process.argv.slice(2).filter(v => v === '-d').length && simulation.debug();
process.argv.slice(2).filter(v => v === '--debug').length && simulation.debug();

async.waterfall([
  (cb) => deployment.createAccessToken(cb),
  (accessToken, cb) => deployment.previewActionPackage(accessToken, deployment.getActionPackage(), cb)
], (err) => {

  if (err) {
    return deployment.error(err);
  }

  console.log();
  console.log(`${chalk.bold.green('Success!')} Your Google Assistant, ${chalk.bold.green(deployment.assistant.name)}, is ready for preview.`);
  simulation.start();

});
