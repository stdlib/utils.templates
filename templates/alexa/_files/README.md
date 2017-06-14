# Your StdLib Alexa Skill

This is a template for your StdLib Alexa Skill.

It's easy to get started, to create a new intent simply create a file
with the name of your intent in `./functions/intents/`.

You'll see a sample `HelloWorld` intent already in there (the name is
  matched without the `.js` file.)

## Sample Intent: HelloWorld

```javascript
/**
* @param {string} name Intent Name (Automatically Populated by Handler)
* @param {object} slots Slot Information, {name, value}
* @returns {any}
*/
module.exports = (name = '', slots = {}, callback) => {

  return callback(null, `Hello World`);

};
```

This intent will cause Alexa to respond with "Hello World." You can see that
intents defined in this way receive `slots` automatically, and are executed
with a `callback` - the first parameter is an `Error` parameter, and if provided,
Alexa will respond with an error. Otherwise Alexa will respond with the string
provided by the second parameter.

For more information on Alexa Skills please check out
https://developer.amazon.com/.
