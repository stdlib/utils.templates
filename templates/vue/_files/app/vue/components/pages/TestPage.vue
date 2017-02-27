<template>
  <div>
    <p>
      This is some test data.
    </p>
    <p>
      App name is <strong>{{ appName }}</strong> with an environment variable set
      as <strong>{{ testValue }}</strong>.
    </p>
    <p>
      Please note that environment variables are loaded into a
      global <pre>env</pre> variable directly from your <pre>env.json</pre> file
      in your root directory for your given environment.
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      appName: 'Your Vue App',
      testValue: env.key
    }
  }
}
</script>
