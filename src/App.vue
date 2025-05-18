<template>
  <div id="app">
    <LayOut />
  </div>
</template>

<script>
import LayOut from './layout.vue'; 

export default {
  name: 'App',
  components: {
    LayOut
  }
}
</script>

<style>
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  /* font-family: 'Microsoft YaHei', Arial, sans-serif; */
  overflow: hidden;
}


</style>
