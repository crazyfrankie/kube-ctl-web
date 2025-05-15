<template>
  <div>
    <div class="top" :style="{background: 'rgb('+data.color+')'}"></div>
    <div class="dashboard-item" :style="{'background':'rgba('+data.color+',.2)'}">
      <div class="dashboard-card-text">
        <div class="box title">
          {{ data.value }}
        </div>
        <div class="box desc">
          {{ data.title }}
        </div>
      </div>
      <div class="dashboard-card-logo">
        <svg-icon :icon-class="data.logo"
                  :style="{
           'color':'rgb('+data.color+')',
           'margin-bottom':'15px'
                  }"
        />
      </div>
    </div>
  </div>

</template>

<script>
export default {
  props: {
    data: {
      type: Object
    },
  },
  name: "DashboardCard"
}
</script>

<style scoped>

.top {
  width: 100%;
  height: 10px;
  background: red;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.dashboard-card-text, .dashboard-card-logo {
  display: inline-block;
  height: 80px;
}

.box.title {
  border-bottom: 3px solid #eee;
  font-size: 25px;
  padding-top: 10px;
  font-weight: 900;
}

.box.desc {
  padding-top: 5px;
}

.dashboard-card-text .box {
  display: block;
  /*background: blue;*/
  height: 50px;
}

.dashboard-card-text {
  width: 60%;
}

.dashboard-card-logo {
  font-size: 40px;
  line-height: 0;
  width: 40%;
  text-align: right;
  height: 40px;
}

.dashboard-item {
  width: 100%;
  height: 100%;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 0 15px;
}
</style>
