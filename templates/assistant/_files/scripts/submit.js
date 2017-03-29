const async = require('async');
const chalk = require('chalk');

const AssistantDeployment = require('./assistant/assistant_deployment.js');
const deployment = new AssistantDeployment(process.env.SUBTYPE, process.env.DATA_version);

async.waterfall([
  (cb) => deployment.submitActionPackage(deployment.getAccessToken(), deployment.getActionPackage(), cb)
], (err) => {

  if (err) {
    console.log('It seems like there was an issue submitting your package.');
    console.log('Have you set projectId properly in "stdlib.assistant.projectId" of `package.json`?');
    console.log('Please visit the Action Deployment page and follow the instructions to get one:');
    console.log();
    console.log(chalk.underline('https://developers.google.com/actions/distribute/deploy'));
    console.log();
    return deployment.error(err);
  }

  console.log();
  console.log(`${chalk.bold.green('Success!')} Your Google Assistant, ${chalk.bold.green(deployment.assistant.name)}, has been submitted!`);
  console.log();
  return deployment.complete();

});
