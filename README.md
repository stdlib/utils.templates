# utils.templates

## The Official Template Repository for StdLib

Ever wanted to create a StdLib service with some additional boilerplate to
make project generation a little easier? Starting from scratch every time isn't
always ideal.

That's why we built `utils.templates`. It hooks into the `lib` command line
tools seamlessly to deliver you templates over-the-wire. As it's a remote
service, any time you start a new project you'll get the newest templates
without any additional installation.

## Usage

Use `utils.templates` from the command line as a part of the [StdLib CLI](https://github.com/stdlib/lib).

When you're creating a new service, simply type;

```bash
$ lib create -t <template>
```

Where `<template>` is your desired template. You'll download the template
automatically, and once it's ready, local npm installation will get everything
running for you.

## Development

To develop a new StdLib template, simply clone this repo, run 'npm install'
and then run `lib http` from the root directory. Add files to
`templates/<template>/_files`. Add `package.json` desired fields (additive to
base `package.json`) using `templates/<template>/package.json`.

To make sure your template will work with StdLib, in another terminal window,
create a new directory for your app and run (assuming you're running the
template server on `localhost:8170`):

```bash
$ lib init
$ lib create -t <template> -d localhost:8170
```

This will create a new app based on the template by pulling it from the 'lib http'
process. From there you can run `lib http -p 8080` to test the new app instance
by navigating to `localhost:8080/{service name}`. For example, if you created a
service called "stdlib/test", you would access your new app instance at
`localhost:8080/stdlib/test`.

If you make changes to your template then restart the 'lib http' process running
under utils.templates, delete your app instance and recreate it by running the
'lib create -t ...' command again.

Once your template is ready for development, open up a Pull Request here and
we'll be happy to verify that it works and add it in! Also, please remember to
update this README.

## Supported Templates

### Alexa Skills

Alexa Skills are supported via `alexa`.
[Check out our quick guide on Medium](https://hackernoon.com/build-an-alexa-skill-in-7-minutes-flat-with-node-js-and-stdlib-70611f58c37f)
for more information.

```bash
$ lib create -t alexa
```

### Slack Apps

Slack Apps are supported via `slack`.

```bash
$ lib create -t slack
```

### Twilio Messaging Hubs

Twilio Messaging Hubs are supported via `twilio`.

```bash
$ lib create -t twilio
```

### Vue.js

[Vue](https://vuejs.org) is supported via `vue`.

```bash
$ lib create -t vue
```

## That's It!

That's all for now, check back for more templates soon!
