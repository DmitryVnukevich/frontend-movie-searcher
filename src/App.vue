<template>
  <div id="app">
    <SiteHeader />
    <NavBar />
    <div class="content">
      <router-view />
    </div>
    <SiteFooter />
  </div>
</template>


<script>
import NavBar from '@/components/NavBar.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    SiteHeader,
    SiteFooter,
  },
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

@media (max-width: 600px) {
  .content {
    padding-top: 50px;
  }
}
</style>