const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const names = pkg.stdlib.name.split('/');
const assistant = pkg.stdlib.assistant || {};
const endpoint = `https://${names[0]}.stdlib.com/${names[1]}@dev/${names.slice(2).join('/')}`;

assistant.name = assistant.name || 'test';
assistant.voice = assistant.voice || 'male_1';
let voiceOptions = ['male_1', 'male_2', 'female_1', 'female_2'];

if (voiceOptions.indexOf(assistant.voice) === -1) {
  console.error(`Assistant Voice must be one of: ${voiceOptions.join(', ')}`)
  process.exit(1);
}

let actions = fs.readdirSync(path.join(process.cwd(), 'assistant', 'actions'));
actions.sort((a, b) => a < b ? 1 : -1);
actions = actions.reduce((actions, dirname) => {

  if (!fs.statSync(path.join(process.cwd(), 'assistant', 'actions', dirname)).isDirectory()) {
    return actions;
  }

  let action;

  try {
    action = require(`../assistant/actions/${dirname}/action.json`);
  } catch (e) {
    console.error(e);
    process.exit(1);
    return;
  }

  actions.push({
    description: action.description,
    initialTrigger: {
      intent: dirname === '__main__' ? 'assistant.intent.action.MAIN' : dirname,
      queryPatterns: action.queries && action.queries.map(q => { return {queryPattern: q}; })
    },
    httpExecution: {
      url: endpoint
    }
  });

  return actions;

}, []);

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'gactions', 'action.json'), JSON.stringify({
  versionLabel: pkg.version,
  agentInfo: {
    languageCode: 'en-US',
    projectId: pkg.stdlib.name,
    voiceName: assistant.voice
  },
  actions: actions
}, null, 2));

let command = spawnSync(
  './scripts/gactions/gactions',
  [
    'preview',
    '-action_package=scripts/gactions/action.json',
    `-invocation_name=${assistant.name}`
  ],
  {
    stdio: [0, 1, 2]
  }
);

if (command.status !== 0) {
  console.error(command.error);
  process.exit(1);
}
