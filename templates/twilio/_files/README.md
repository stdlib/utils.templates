# Your StdLib Twilio Hub

Welcome to your Twilio Hub on StdLib!

The goal of the Twilio Hub is to provide your project, team or company
with a fully-functional, robust telephony hub for things like bots and
customer support. Through StdLib, you're guaranteed that your infrastructure
scales infinitely and you never have to manage servers. While it is necessary
to write *some* code, StdLib is easy and malleable enough to be completely hackable
to even the most junior developers.

# Your Project

The first thing you'll probably notice is your `functions/` directory. This is
your StdLib function directory which maps directly to HTTP endpoints. There are
six "out of the box" functions in your Twilio Hub.

- `__main__.js`
- `voice/__main__.js`
- `messaging/__main__.js`
- `messaging/__notfound__.js`
- `messaging/more.js`
- `messaging/whoami.js`

We'll go through these in the order listed here.

## Function: `functions/__main__.js`

This is your main endpoint, corresponding to `https://<username>.lib.id/<service>/`.
This is, of course, where `<username>` is your username and `<service>` is your service
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

This endpoint initiates a conversation with a specific telephone number via SMS.
Just provide a number (via the `tel` parameter) to begin.

With the [StdLib command line tools](https://github.com/stdlib/lib), you can
test this using `$ lib . --tel [Telephone Number]`

## Function: `functions/voice/__main__.js`

This is the main HTTP Webhook handler for incoming phonecalls from Twilio.
You'll set your Twilio Webhook handler to accept this using the URL:

```
dev environment:
http://username.lib.id/service@dev/voice/

production:
http://username.lib.id/service/voice/
```

Where `username` is your StdLib username and `service` is the name of this
service as its deployed.

### Usage

Simply point your Twilio number voice webhook to this URL. By default, it
redirects any incoming calls to `process.env.FORWARD_NUMBER` (`"FORWARD_NUMBER"`
in `env.json`.)

## Function: `functions/messaging/__main__.js`

This is the main HTTP Webhook handler for incoming SMS and MMS messages from
Twilio. You'll set your Twilio Webhook handler to accept this using the URL:

```
dev environment:
http://username.lib.id/service@dev/messaging/

production:
http://username.lib.id/service/messaging/
```

Where `username` is your StdLib username and `service` is the name of this
service as its deployed.

### Usage

This function will dispatch other StdLib functions that you've built, namely
the `functions/messaging/__notfound__.js`, `functions/messaging/more.js`
and `functions/messaging/whoami.js` to begin with (unless you add more).

## Function: `functions/messaging/__notfound__.js`

This is the SMS / MMS "not found" handler. It also handles *any MMS messages*
via the `media` parameter. If the message your Twilio Hub on StdLib receives
can not be mapped to a named function (like `more` or `whoami`) this handler
will be triggered.

### Usage

This handler outputs a string for simple messaging and development testing.
You can test from your command line using:

```shell
$ lib .messaging.__notfound__ --body "My message"
```

Or for an MMS message,

```shell
$ lib .messaging.__notfound__ --media file:./path/to/myfile.jpg
```

## Function: `functions/messaging/more.js`

This is the SMS handler for messages containing the word "more" (in any
  capitalization variation) as their sole contents.

All named functions will be dispatched similarly from `functions/messaging/__main__.js`,
but this can be modified to suit your needs, specifically.

### Usage

This handler outputs a string for simple messaging and development testing.
You can test from your command line using:

```shell
$ lib .messaging.more
```

## Function: `functions/messaging/whoami.js`

This is the SMS handler for messages containing the word "whoami" (in any
  capitalization variation) as their sole contents.

It is meant to show the use of the `to` and `from` objects to show you can
track originating number information.

### Usage

This handler outputs a string for simple messaging and development testing.
You can test from your command line using:

```shell
$ lib .messaging.whoami
```

# Helpers

You'll notice a `/helpers/` directory which contains a single function.
You should store Twilio helpers here, like sending picture messages, videos,
or any time you want to write logic that you don't want to repeat.

## Helper: `helpers/send.js`

Sends messages using [Twilio's NPM module](https://www.npmjs.com/package/twilio)
and your account information from `env.json`.

# That's it!

We hope this has served as a welcoming introduction to your
Twilio Hub project scaffold on [StdLib](https://stdlib.com) --- happy building!
