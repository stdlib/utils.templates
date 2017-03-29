module.exports = (user, device, conversation, query, callback) => {

  if (!query.name) {
    return callback(null, `Hey there! Sorry, I didn\'t catch your name.`);
  }

  return callback(null, `Nice to meet you, ${query.name.value}`);

};
