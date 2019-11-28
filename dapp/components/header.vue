<template>
  <header class="jcc-moac-alarm-header jcc-moac-alarm-large-font-size" flex="main:center cross:center">
    {{ title }}
  </header>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    }
  }
};
</script>
<style lang="scss">
.jcc-moac-alarm-header {
  position: relative;
  height: 0.9rem;
  width: 100%;
  line-height: 0.9rem;
  color: #24262c;
  background-color: #f4faff;
}
</style>
