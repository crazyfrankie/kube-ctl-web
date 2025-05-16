<template>
  <div>
    <div class="top" :style="{background: 'rgb('+rgbColor+')'}"></div>
    <div class="dashboard-item" :style="{'background':'rgba('+rgbColor+',.2)'}">
      <div class="dashboard-card-text">
        <div class="box title" :style="{'color':'rgb('+rgbColor+')'}">
          {{ data.value }}
        </div>
        <div class="box desc">
          {{ data.title }}
        </div>
      </div>
      <div class="dashboard-card-logo">
        <svg-icon :icon-class="data.logo"
                  :style="{
           'color':'rgb('+rgbColor+')',
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
  computed: {
    rgbColor() {
      // 提供默认颜色值，以防 color 未定义
      const defaultColor = '75,192,192';
      if (!this.data || !this.data.color) {
        return defaultColor;
      }
      // 移除末尾的逗号（如果存在）并返回颜色值
      return this.data.color.replace(/,\s*$/, '');
    }
  },
  name: "DashboardCard"
}
</script>

<style scoped>

.top {
  width: 100%;
  height: 5px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dashboard-item {
  width: 100%;
  min-height: 120px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-card-text {
  flex: 1;
}

.box.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.box.desc {
  font-size: 14px;
  color: #606266;
}

.dashboard-card-logo {
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
}
</style>
