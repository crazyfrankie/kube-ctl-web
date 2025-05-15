<template>
  <el-row class="dash-container">
    <el-col :span="2" :style="{
      height:'100%',
      background:'rgb('+data.color+')',
      'border-top-left-radius':'10px',
      'border-bottom-left-radius':'10px'
    }">
    </el-col>
    <el-col :span="22" :style="{
      'background-color':'rgba('+data.color+',0.5)',
      height: '100%',
      'border-top-right-radius':'10px',
      'border-bottom-right-radius':'10px',
    }">
      <el-col :span="8" :style="{
          height:'100%',
        }">
        <svg-icon :icon-class="data.logo" :style="{
            color:'rgb('+data.color+')',
            'margin-top':'10px',
            'font-size':'40px'
          }"/>
      </el-col>
      <el-col :span="16" :style="{
        'padding-right':'5px'
        }">
        <div style="height: 40px;font-size: 30px;font-weight: 900;border-bottom: 1px solid #eee">{{
            data.value
          }}
        </div>
        <div style="height: 40px">{{ data. title}}</div>
      </el-col>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    data: {
      type: Object
    }
  },
  name: "DashboardCard"
}
</script>

<style scoped>
.dash-container {
  height: 80px;
  width: 100%;
}
</style>
