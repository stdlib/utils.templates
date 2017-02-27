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

To develop a new StdLib template, simply clone this repo and run `lib http`
from the root directory. Add files to `templates/<template>/_files`.
Add `package.json` desired fields (additive to base `package.json`) using
`templates/<template>/package.json`.

You'll have to restart the StdLib daemon by running `lib http` if you want
to test your template.

To make sure your template will work with StdLib, in another terminal window,
run (assuming you're running on `localhost:8170`):

```bash
$ lib create -t <template> -d localhost:8170
```

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

### Vue.js

[Vue](https://vuejs.org) is supported via `vue`.

```bash
$ lib create -t vue
```

## That's It!

That's all for now, check back for more templates soon!
