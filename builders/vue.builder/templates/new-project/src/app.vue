<template lang="pug">
  #app
    app-nav
    router-view
</template>

<script>
import Nav from '@/components/Nav'
export default {
  name: 'app',
  components: {
    'app-nav': Nav
  }
}
</script>

<style lang="scss">
@import "./styles/main";
#app {
}
</style>
