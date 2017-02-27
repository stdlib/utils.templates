# stdlib/templates

## The official template repository service for stdlib

Ever wanted to create a stdlib service with some additional boilerplate to
make project generation a little easier? Starting from scratch every time isn't
always ideal.

That's why we built `stdlib/templates`. It hooks into the `stdlib` command line
tools seamlessly to deliver you templates over-the-wire. As it's a remote
service, any time you start a new project you'll get the newest templates
without any additional installation.

## Usage

Use `stdlib/templates` from the command line as a part of the [stdlib CLI](https://github.com/poly/stdlib).

When you're creating a new service, simply type;

```bash
$ lib create -t <template>
```

Where `<template>` is your desired template. You'll download the template
automatically, and once it's ready, local npm installation will get everything
running for you.

## Supported Templates

### Vue.js

[Vue](https://vuejs.org) is supported via `vue`.

```bash
$ lib create -t vue
```

## That's It!

That's all for now, check back for more templates soon!
