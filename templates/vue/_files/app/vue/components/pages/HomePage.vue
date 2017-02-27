<template>
  <div>
    <p>
      Thanks for taking the time to set up your Vue app using stdlib. We're
      happy to have you along for the ride! From here on out it should be pretty
      simple. Feel free to play around with these pages to build your own app.
    </p>
    <p>
      The goal of stdlib is really to create the "Standard Library of the Internet"
      by allowing anybody to create indefinitely scalable, self-healing web
      applications without managing infrastructure. While there are a lot of
      computational use cases, we thought it would be fun to show people just
      how powerful this technology is, and how you can use it in any facet of
      your development toolchain. Have fun!
    </p>
    <hr>
    <h2>Links</h2>
    <h3>Vue</h3>
    <ul>
      <li>
        <a href="https://vuejs.org">Vue.js &mdash; The Progressive JavaScript Framework</a>
      </li>
      <li>
        <a href="https://github.com/vuejs/vue">GitHub &mdash; vuejs/vue</a>
      </li>
      <li>
        <a href="https://twitter.com/vuejs">Twitter &mdash; @vuejs</a>
      </li>
      <li>
        <a href="https://twitter.com/youyuxi">Twitter &mdash; @youyuxi (Evan You)</a>
      </li>
    </ul>
    <h3>stdlib</h3>
    <ul>
      <li>
        <a href="https://stdlib.com">stdlib &mdash; Function as a Service Software Library</a>
      </li>
      <li>
        <a href="https://github.com/poly/stdlib">GitHub &mdash; poly/stdlib</a>
      </li>
      <li>
        <a href="https://twitter.com/polybit">Twitter &mdash; @polybit</a>
      </li>
      <li>
        <a href="https://twitter.com/youyuxi">Twitter &mdash; @keithwhor (Keith Horwood)</a>
      </li>
    </ul>
    <hr>
    <h2>Tips</h2>
    <p>
      There are a few things to keep in mind with your Vue App on stdlib;
    </p>
    <ul>
      <li>
        It is a <em>single page app</em>, meaning all content is loaded at once
      </li>
      <li>
        Static files (in your <pre>app/static/{path}</pre> folder in development)
        can be accessed via the url <pre>static/path={path}</pre> when written
        in HTML templates.
      </li>
      <li>
        Your main Vue app lives in <pre>app/vue/main.js</pre>, with components
        existing in <pre>app/vue/components</pre>.
      </li>
      <li>
        Styling is provided by <a href="http://sass-lang.com/">Sass</a> CSS
        extension.
      </li>
      <li>
        Run your Vue app locally at any time with <pre>$ lib http</pre>, or specify
        <pre>$ lib http -p [PORT]</pre> to choose a port.
      </li>
      <li>
        Deploy your Vue app to a development environment (online) with
        <pre>$ lib up dev</pre>, a URL will be provided to you.
      </li>
      <li>
        Release your Vue app publicly with <pre>$ lib release</pre>, but if you
        want to access it without a version identifier please set
        <pre>{"stdlib": {"publish": true}}</pre> in your <pre>package.json</pre>
        for the service.
      </li>
    </ul>
  </div>
</template>

<script>
export default {

}
</script>
