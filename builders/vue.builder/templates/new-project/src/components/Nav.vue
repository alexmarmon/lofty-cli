<template lang="pug">
  .nav
    router-link.t4(to="/" v-bind:class="{ isInactive: !isRoot }") Landing
</template>

<script>
export default {
  name: 'nav',
  computed: {
    isRoot () {
      return this.$store.state.route.path === '/landing'
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables";
@import "../styles/_mixins";
.nav {
}
a {
  display: inline-block;
  padding: 30px;
}
.router-link-active {
  background: $brandPrimary;
  color: $white;
  &.isInactive {
    background: transparent;
    color: $brandPrimary;
  }
}
</style>
