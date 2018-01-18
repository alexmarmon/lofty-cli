<template lang="pug">
  .landing
    h1 Landing Page
    hero
</template>

<script>
import Hero from '@/components/Hero'
export default {
  name: 'landing',
  components: {
    'hero': Hero
  }
  // data: () => ({
  //   foo: 'bar'
  // })
}
</script>

<style scoped lang="scss">
@import "../styles/_variables";
@import "../styles/_mixins";
.landing {

}
</style>
