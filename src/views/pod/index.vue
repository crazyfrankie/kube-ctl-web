<template>
  <div>hello vue!</div>
</template>

<script>
export default {
  name: "GetPodList",

  created() {
    this.$store.dispatch("pod/getPodList").then((response) => {
      console.log(response);
    });
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
