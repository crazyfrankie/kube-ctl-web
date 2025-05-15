<template>
  <div class="dashboard-container">
    <div v-loading="loading" element-loading-text="Loading dashboard data...">
    <!-- Cluster Information Section -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in clusterInfo" :key="'cluster'+index">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-value" :style="{'color': `rgba(${item.color}1)`}">{{ item.value }}</div>
          <div class="card-label" v-if="item.label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Resources Information Section -->
    <el-row :gutter="20" class="resource-section">
      <el-col :span="24">
        <h2>Kubernetes Resources</h2>
      </el-col>
      <el-col :xs="8" :sm="6" :md="4" :lg="3" v-for="(item, index) in resourcesInfo" :key="'resource'+index">
        <el-card shadow="hover" class="resource-card">
          <div class="resource-title">{{ item.title }}</div>
          <div class="resource-value" :style="{'color': `rgba(${item.color}1)`}">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Usage Information Section -->
    <el-row :gutter="20" class="usage-section">
      <el-col :span="24">
        <h2>Cluster Usage</h2>
      </el-col>
      <el-col :span="8" v-for="(item, index) in usageInfo" :key="'usage'+index">
        <el-card shadow="hover" class="usage-card">
          <div class="usage-title">{{ item.title }}</div>
          <el-progress 
            :text-inside="true" 
            :stroke-width="20" 
            :percentage="parseFloat(item.value)"
            :color="getProgressColor(parseFloat(item.value))"
          ></el-progress>
        </el-card>
      </el-col>
    </el-row>

    <!-- Usage Range Charts -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="24">
        <h2>Resource Usage Trends</h2>
      </el-col>
      <el-col :span="12" v-for="(item, index) in usageRangeInfo" :key="'chart'+index">
        <el-card shadow="hover" class="chart-card">
          <div slot="header">
            <span>{{ item.title }}</span>
          </div>
          <div class="chart-container" :id="'chart'+index"></div>
        </el-card>
      </el-col>
    </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  data() {
    return {
      charts: [],
      chartInstances: [],
      loading: false
    }
  },
  computed: {
    ...mapState({
      clusterInfo: state => state.dashboard.clusterInfo,
      resourcesInfo: state => state.dashboard.resourcesInfo,
      usageInfo: state => state.dashboard.usageInfo,
      usageRangeInfo: state => state.dashboard.usageRangeInfo
    })
  },
  methods: {
    getProgressColor(percentage) {
      if (percentage < 60) return '#67C23A'
      if (percentage < 80) return '#E6A23C'
      return '#F56C6C'
    },
    initCharts() {
      // Clear previous charts
      this.chartInstances.forEach(chart => chart.dispose())
      this.chartInstances = []
      
      // Initialize new charts
      this.$nextTick(() => {
        this.usageRangeInfo.forEach((item, index) => {
          const chartDom = document.getElementById('chart' + index)
          if (!chartDom) return
          
          const chart = echarts.init(chartDom)
          this.chartInstances.push(chart)
          
          try {
            const data = JSON.parse(item.value)
            const option = {
              tooltip: {
                trigger: 'axis'
              },
              xAxis: {
                type: 'category',
                data: data.x || []
              },
              yAxis: {
                type: 'value'
              },
              series: [{
                data: data.y || [],
                type: 'line',
                smooth: true,
                areaStyle: {}
              }]
            }
            chart.setOption(option)
          } catch (e) {
            console.error('Failed to parse chart data:', e)
          }
        })
      })
    },
    fetchDashboardData() {
      this.loading = true
      this.$store.dispatch('dashboard/getDashboardData').then(() => {
        this.initCharts()
        this.loading = false
      }).catch(error => {
        console.error('Failed to fetch dashboard data:', error)
        this.$message.error('Failed to load dashboard data')
        this.loading = false
      })
    }
  },
  mounted() {
    this.fetchDashboardData()
    
    // Add resize listener to resize charts
    window.addEventListener('resize', this.initCharts)
    
    // Setup auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchDashboardData()
    }, 30000)
  },
  beforeDestroy() {
    // Clean up resize listener when component is destroyed
    window.removeEventListener('resize', this.initCharts)
    
    // Dispose chart instances
    this.chartInstances.forEach(chart => chart.dispose())
    
    // Clear auto-refresh interval
    clearInterval(this.refreshInterval)
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  h2 {
    font-size: 18px;
    margin: 15px 0;
    color: #606266;
  }
  
  .dashboard-card {
    margin-bottom: 20px;
    text-align: center;
    height: 120px;
    
    .card-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }
    
    .card-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .card-label {
      font-size: 12px;
      color: #C0C4CC;
    }
  }
  
  .resource-section {
    margin-top: 30px;
    
    .resource-card {
      margin-bottom: 20px;
      text-align: center;
      height: 100px;
      
      .resource-title {
        font-size: 12px;
        color: #909399;
        margin-bottom: 10px;
      }
      
      .resource-value {
        font-size: 22px;
        font-weight: bold;
      }
    }
  }
  
  .usage-section {
    margin-top: 30px;
    
    .usage-card {
      margin-bottom: 20px;
      
      .usage-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 15px;
      }
    }
  }
  
  .chart-section {
    margin-top: 30px;
    
    .chart-card {
      margin-bottom: 20px;
      
      .chart-container {
        height: 300px;
      }
    }
  }
}
</style>
