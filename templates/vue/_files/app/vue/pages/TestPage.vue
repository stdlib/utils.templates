<template>
  <div>
    <p>
      This is some test data.
    </p>
    <p>
      App name is <strong>{{ appName }}</strong> with an environment variable
      called key set to be <strong>{{ testValue }}</strong>.
    </p>
    <p>
      Please note that environment variables are loaded into a
      global <pre>env</pre> variable directly from your <pre>env.json</pre> file
      in your root directory for your given environment -- try setting some values!
    </p>
    <p>
      Here's an example of how you can integrate components into your SPA's pages:
      <br>
      <br>
      <text-input-example></text-input-example>
    </p>
  </div>
</template>

<script>
import TextInputExample from '../components/TextInputExample.vue';

export default {
  data() {
    return {
      appName: 'Your Vue App',
      testValue: env.key
    }
  },
  components: {
    'text-input-example': TextInputExample
  }
}
</script>
