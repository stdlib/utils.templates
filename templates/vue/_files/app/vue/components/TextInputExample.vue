<style lang="sass">
  .text-input-example-container {
    padding: 12px;
    border: 1px solid #000;
  }
</style>

<template>
  <div class="text-input-example-container">
    This is an example component. Try typing something into the textbox below!
    <br>
    <br>
    <input v-model="text">
    <br>
    <br>
    You typed: {{ text }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: ''
    };
  }
}
</script>
