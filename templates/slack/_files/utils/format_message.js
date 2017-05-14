/**
  Slack Format Message Utility

  Format a message into the correct format Slack expect (from raw text or
    proper object).

  For full documentation see: https://api.slack.com/methods/chat.postMessage
*/

const FIELDS = [
  'response_type',
  'as_user',
  'text',
  'parse',
  'link_names',
  'attachments',
  'unfurl_links',
  'unfurl_media',
  'username',
  'icon_url',
  'icon_emoji',
  'thread_ts',
  'reply_broadcast',
  'ts'
];

module.exports = (token, channel, text) => {

  // Set defaults
  let data = {
    token: token,
    channel: channel,
    as_user: false,
    response_type: 'in_channel'
  };

  if (typeof text === 'string') {
    data.text = text;
  } else if (text && typeof text === 'object') {
    data = FIELDS.reduce((data, f) => {
      if (f in text) {
        data[f] = text[f]
      }
      return data;
    }, data);
  } else {
    data.text = '';
  }

  return data;

};
