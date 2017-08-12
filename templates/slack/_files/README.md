# Your StdLib Slack App

Welcome to your StdLib Slack template!

If you're not sure what StdLib ("Standard Library") is, please check out
https://stdlib.com.

Here we'll walk you through how StdLib works, your Slack App endpoints,
and how to handle Slack Slash Commands, Events, and Actions from interactive
messages.

# Your Project

The first thing you'll probably notice is your `functions/` directory. This is
your StdLib function directory which maps directly to HTTP endpoints. There are
five main functions in your Slack App:

- `__main__.js`
- `auth.js`
- `commands/__main__.js`
- `events/__main__.js`
- `actions/__main__.js`

We'll go through these in the order listed here.

## Function: `functions/__main__.js`

This is your main endpoint, corresponding to `https://username.lib.id/service/`.
This is, of course, where `username` is your username and `service` is your service
name.

Any time a function has the filename `__main__.js`, the enclosing folder is
used as the route name over HTTP. You can think of it like the default function
for a specific directory.

Note that when pushing to a development environment (or if you want to access
  a specific version), this should be reached via:
  `https://username.lib.id/service@dev/main` (if your dev environment is called
  `dev`, also the default local environment name) or
  `https://username.lib.id/service@0.0.0/main` (if your version is 0.0.0).

### Usage

This endpoint generates a template based on the contents of `pages/index.ejs`,
which is modifiable and contains your "Add to Slack" button. It is the easiest
way to distribute your app to other users.

## Function: `functions/auth.js`

This is the OAuth endpoint for your Slack App that verifies another team (or your
  own) has properly validated the slack app.

### Usage

This endpoint processes an OAuth request and returns the contents of
`slack/pages/auth.ejs`. (Typically "Success!" if successful.)

## Function: `functions/commands/__main__.js`

This is the main **Command Handler** function for handling Slack Slash Commands.
You can read more about them here: https://api.slack.com/slash-commands

This function is triggered by slack at the following URL:
`https://<username>.lib.id/<service>@<ver>/commands/:bg`

Where `<username>` is your username, `<service>` is the service name and
`<ver>` is the environment or semver release of your service. The `:bg`
indicates you'd like this function to return an HTTP 2XX code as quickly as
possible and do all processing behind the scenes. (Ideal for Slack.)

### Usage

To add or modify Slash commands, you'll want to look in the directory
`functions/commands/` and create files with the name
`functions/commands/NAME.js` where `NAME` is your intended command,
and also add them to your Slash Commands list via Slack's Slash Command interface.

For the default "hello" command (should be added as `/hello` to your app) you'll
notice the following boilerplate code:

```javascript
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {

  callback(null, {
    response_type: 'in_channel',
    text: `Hello, <@${user}>...\nYou said: ${text}`
  });

};
```

In this function, `user` and `channel` are strings representing the user and
channel the command was called from. The contents of the command (text) are
available in `text`, a full `command` object is available
that contains all data passed from slack (https://api.slack.com/slash-commands),
and a botToken for your Slack App's bot is passed in (if you want to use it
  to post additional messages, upload files, etc.).

The first parameter passed to `callback` is an error (if present), use `new Error()`
when possible. The second parameter is a `chat.postMessage` object,
more details can be found here: https://api.slack.com/methods/chat.postMessage.

You can test the sample hello command on the command line by running

```shell
$ lib .commands.hello test_user general "some text"
```

## Function: `functions/events/__main__.js`

This is the main **Event Handler** function for handling public channel events
from Slack's Event API: https://api.slack.com/events

This function is triggered by slack at the following URL:
`https://<username>.lib.id/<service>@<ver>/events/:bg`

Where `<username>` is your username, `<service>` is the service name and
`<ver>` is the environment or semver release of your service. The `:bg`
indicates you'd like this function to return an HTTP 2XX code as quickly as
possible.

You'll notice an `* @bg params` line in the comments for this function. This
means, when executed as a background function, it will return a JSON object
mapping to the parameters passed to it (which also passes Slack's `challenge`
litmus test).

### Usage

This function will delegate incoming events to their appropriate handler,
which can be placed in `functions/events/TYPE.js` or `functions/events/TYPE/__main__.js`
as these are functionally equivalent. If there is a subtype involved,
`functions/events/TYPE/SUBTYPE.js` or `functions/events/TYPE/SUBTYPE/__main__.js`
will be invoked.

By default your `functions/events/message/__main__.js` should look like this:

```javascript
module.exports = (user, channel, text = '', event = {}, botToken = null, callback) => {

  // Only send a response to certain messages
  if (text.match(/hey|hello|hi|sup/i)) {
    callback(null, {
      text: `Hey there! <@${user}> said ${text}`
    });
  } else {
    callback(null, {});
  }

};
```

In this function, `user` and `channel` are strings representing the user and
channel the event was triggered by. The contents of the command (text) are
available in `text`, a full `event` object is available
that contains all data passed from slack (https://api.slack.com/events),
and a `botToken` for your Slack App's bot is passed in (if you want to use it
  to post additional messages, upload files, etc.).

The first parameter passed to `callback` is an error (if present), use `new Error()`
when possible. The second parameter is a `chat.postMessage` object,
more details can be found here: https://api.slack.com/methods/chat.postMessage.

You can test the sample message event on the command line by running:

```shell
$ lib .events.message test_user general "hello"
```

## Function: `functions/actions/__main__.js`

This is the main **Action Handler** function for handling Slack Actions from
interactive messages. You can read more about actions and interactive messages
here: https://api.slack.com/docs/message-buttons.

This function is triggered by slack at the following URL:
`https://<username>.lib.id/<service>@<ver>/actions/:bg`.
You should add this URL to the interactive messages section of your Slack app
dashboard.

Where `<username>` is your username, `<service>` is the service name and
`<ver>` is the environment or semver release of your service. The `:bg`
indicates you'd like this function to return an HTTP 2XX code as quickly as
possible.

### Usage

This function will delegate incoming actions to their appropriate handler,
which should be placed in `functions/actions/NAME.js`.

We've included a simple sample handler for an action named `example`. The code
for this is below:

```javascript
module.exports = (user, channel, action = {}, botToken = null, callback) => {

  callback(null, {
    text: `Hello, <@${user}>!\nThis text will overwrite the original interactive message`,
    attachments: [{
      text: 'Try hitting this endpoint again by clicking the button!',
      fallback: 'Can\'t display attachment',
      callback_id: 'callback_id',
      actions: [
        {
          name: 'example',
          text: 'Refresh',
          type: 'button',
          value: 'value'
        }
      ]
    }]
  });

};
```

In this function, `user` and `channel` are again strings representing the user
and channel the event was triggered by. A full `action` object is available
that contains all data passed from Slack
(https://api.slack.com/docs/interactive-message-field-guide#action_payload),
and a `botToken` for your Slack App's bot is passed in (if you want to use it
  to post additional messages, upload files, etc.).

The first parameter passed to `callback` is an error (if present), use `new Error()`
when possible. The second parameter is a `chat.updateMessage` object,
more details can be found here: https://api.slack.com/methods/chat.update.

Whatever you choose to return in the second callback parameter will
__overwrite__ the original message. This parameter could be a confirmation
message or another call to action. This value can be a simple string or an
object that conforms to the spec set in `chat.update`
(see https://api.slack.com/methods/chat.update. We automatically
attach the token, ts, and channel params for you outside of this handler). You
can also restore the original message in case of an error by returning Slack's
`original_message` parameter, which will be present in the `action` parameter.

You could create a interactive message that would trigger this handler with the
following Javascript code (you will have to run `npm install slack --save`
first):

```javascript
const slack = require('slack');

slack.chat.postMessage({
 token: process.env.BOT_TOKEN,
 channel: '#general',
 text: 'Respond to this',
 attachments: [{
   text: 'Here is the action:',
   actions: [
     {
       name: 'example',
       text: 'Press me',
       type: 'button'
     }
   ]
 }]
}, (err, result) => {
 // Handle result
});
```

You can retrieve your bot token from the OAuth and Permissions section of your
Slack dashboard.

Additionally, you can test the example action locally from your command line by
running:

```shell
lib .actions --action example --channel general --user user
```

**Note:** Your action handlers will only work with messages created via the
`slack.chat.postMessage` API call.

# Utilities

This Slack App template comes with some utility function in `slack/utils`.
We'll go over a few of them;

- message.js
- update_message.js
- respond.js
- upload.js

## Utility: `utils/message.js`

This function has a fingerprint of:

```javascript
module.exports = (token, channel, text, callback) => {}
```

Where `token` is your bot token (the token used for the bot response),
`channel` as the channel where the response is expected, `text` being a
string or `channel.postMessage` object (for more granular control),
and `callback` being a function expecting one parameter (an `error`, if applicable)
that executes the call.

Use this function to get your bot to send messages to users or channels --- that's
it. The `token` field should be passed in any `slack/commands` or `slack/events`
handlers.

## Utility: `utils/update_message.js`

This function has a fingerprint of:

```javascript
module.exports = (token, channel, ts, message, callback) => {}
```

Where `token` is your bot token (the token used for the bot response),
`channel` as the channel where the response is expected, `ts` as the timestamp
of the message being updated, `message` being a string or `chat.update` object
(for more granular control) that will replace the original message, and
`callback` being a function expecting one parameter (an `error`, if applicable)
that executes the call.

Use this function to get your bot to update messages in channels.

## Utility: `utils/respond.js`

Very similar to `message.js`, this is a Slash Command response that `HTTP POST`s
a message to a webhook endpoint instead of creating a new bot message directly.

The benefits this has over `message.js`, is that Slash Commands can be used in
private channels (or globally, within a team) where applicable.

## Utility: `utils/upload.js`

Similar to `message.js`, this function has a fingerprint of:

```javascript
module.exports = (token, channel, filename, contentType, file, callback) => {}
```

Where `token` is your bot token, `channel` is the channel to upload a file to,
`filename` is the desired filename, `contentType` is the desired content type
(i.e. a string like `image/png`), file is a `Buffer` of file contents
and `callback` is a function that can handle an optional `err` parameter.

# Helpers

There are a few helper functions for message formatting, etc. Feel free to
look at them at your leisure, we've documented `storage.js` to better understand
how team data is stored.

## Helper: `helpers/storage.js`

This is a storage helper based upon https://stdlib.com/utils/storage. It
is a basic key-value store that saves crucial team (including bot) details
about each and every team its installed on, specific to the `SLACK_APP_NAME`
field in your `env.json` and your StdLib (https://stdlib.com) account. You
should probably avoid interfacing with this function directly, but it should
be noted that it is *critical* for the ability to install your app on
multiple teams.

# That's it!

We hope this has served as a welcoming introduction to your
Slack App project scaffold on [StdLib](https://stdlib.com) --- happy building!
