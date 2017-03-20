/**
  channel_join message subtype:
    fires when a user joins a channel
*/

/**
* @param {String} token The bot token for the Slack App
* @param {Object} event The event data as passed from Slack
* @param {String} text Shortcut to event.text
* @param {Function} callback Callback to execute upon completion, sends message
*/
function ChannelJoinMessageEventHandler(token, event, text, callback) {

  return callback(null, `Hello, <@${event.user}>! Welcome to <#${event.channel}>. :relaxed:`);

}

module.exports = ChannelJoinMessageEventHandler;
