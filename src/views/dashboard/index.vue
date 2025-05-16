<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Kubernetes Cluster Overview</h1>
      <el-tooltip content="Refresh Dashboard" placement="top">
        <el-button 
          type="primary" 
          icon="el-icon-refresh" 
          circle 
          class="global-refresh-btn" 
          :loading="manualRefreshing"
          @click="handleManualRefresh">
        </el-button>
      </el-tooltip>
    </div>
    <div v-loading="loading" element-loading-text="Loading dashboard data...">
    <!-- Cluster Information Section -->
    <el-row :gutter="24">
      <el-col :span="6" v-for="(item, index) in clusterInfo" :key="'cluster'+index">
        <el-card shadow="always" class="dashboard-card cluster-card" :style="getClusterCardStyle(item)">
          <div class="card-content">
            <div class="icon-wrapper">
              <svg-icon :icon-class="getIconForCluster(item.title)" class-name="cluster-icon" />
            </div>
            <div class="info-wrapper">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">{{ item.value }}</div>
              <div class="card-label" v-if="item.label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Resources Information Section -->
    <el-row :gutter="24" class="resource-section">
      <el-col :span="24">
        <div class="section-header">
          <svg-icon icon-class="workload" class-name="section-icon" />
          <h2>Kubernetes Resources</h2>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="6" v-for="(item, index) in resourcesInfo" :key="'resource'+index">
        <el-card shadow="always" class="resource-card enhanced" :body-style="{ padding: '0' }" @click.native="showResourceDetail(item)">
          <div class="resource-content" :style="getResourceCardStyle(item)">
            <div class="resource-icon-wrapper">
              <svg-icon :icon-class="getIconForResource(item.title)" class-name="resource-icon" />
            </div>
            <div class="resource-info">
              <div class="resource-value">{{ item.value }}</div>
              <div class="resource-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Usage Information Section -->
    <el-row :gutter="20" class="usage-section">
      <el-col :span="24">
        <div class="section-header">
          <svg-icon icon-class="dashboard" class-name="section-icon" />
          <h2>Cluster Usage</h2>
        </div>
      </el-col>
      <el-col :span="8" v-for="(item, index) in usageInfo" :key="'usage'+index">
        <el-card shadow="hover" class="usage-card">
          <div class="usage-header">
            <svg-icon :icon-class="getIconForUsage(item.title)" class-name="usage-icon" />
            <div class="usage-title">{{ item.title }}</div>
          </div>
          <el-progress 
            :text-inside="true" 
            :stroke-width="20" 
            :percentage="parseFloat(item.value)"
            :color="getProgressColor(parseFloat(item.value))"
            :format="percent => `${percent}%`"
          ></el-progress>
          <div class="usage-label" v-if="item.label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Usage Range Charts -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="24">
        <div class="section-header">
          <svg-icon icon-class="form" class-name="section-icon" />
          <h2>Resource Usage Trends</h2>
          <el-tooltip content="手动刷新数据" placement="top">
            <el-button 
              type="primary" 
              icon="el-icon-refresh" 
              circle 
              size="mini" 
              class="refresh-btn" 
              :loading="manualRefreshing"
              @click="handleManualRefresh">
            </el-button>
          </el-tooltip>
        </div>
      </el-col>
      <el-col :span="12" v-for="(item, index) in usageRangeInfo" :key="'chart'+index">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">
            <svg-icon :icon-class="index === 0 ? 'dashboard' : 'volume'" class-name="chart-icon" />
            <span>{{ item.title }}</span>
            <span class="unit-selector">
              <el-select 
                v-model="selectedUnitMultipliers[index]" 
                size="mini" 
                placeholder="单位" 
                @change="(val) => updateChartUnit(val, index)"
              >
                <el-option 
                  v-for="option in unitOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                >
                </el-option>
              </el-select>
            </span>
            <span class="last-updated" v-if="lastUpdated">
              Last Updated: <timestamp :data="lastUpdated" />
            </span>
          </div>
          <div class="chart-container" :id="'chart'+index"></div>
        </el-card>
      </el-col>
    </el-row>
    </div>
    
    <el-dialog title="Resource Details" :visible.sync="dialogVisible" width="80%">
      <div v-if="selectedResource">
        <h3>{{ selectedResource.title }} Details</h3>
        <p>Current Value: {{ selectedResource.value }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'
import SvgIcon from '@/components/SvgIcon'
import Timestamp from '@/components/Timestamp'

export default {
  name: 'Dashboard',
  components: {
    SvgIcon,
    Timestamp
  },
  data() {
    return {
      charts: [],
      chartInstances: [],
      loading: false,
      lastUpdated: Math.floor(Date.now() / 1000),
      dialogVisible: false,
      selectedResource: null,
      manualRefreshing: false, // 手动刷新状态
      unitOptions: [
        { label: 'x0.01', value: 0.01 },
        { label: 'x0.1', value: 0.1 },
        { label: 'x0.5', value: 0.5 },
        { label: 'x1', value: 1 },
        { label: 'x2', value: 2 },
        { label: 'x5', value: 5 },
        { label: 'x10', value: 10 }
      ],
      selectedUnitMultipliers: [1, 1] // 默认为每个图表选择的倍数值
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
    getClusterCardStyle(item) {
      if (!item.color) return {}
      const color = item.color.replace(/,\s*$/, '').split(',')
      if (color.length < 3) return {}
      return {
        background: `linear-gradient(135deg, rgba(${color[0]},${color[1]},${color[2]},1) 0%, rgba(${color[0]},${color[1]},${color[2]},0.8) 100%)`
      }
    },
    getResourceCardStyle(item) {
      if (!item.color) return {}
      const color = item.color.replace(/,\s*$/, '').split(',')
      if (color.length < 3) return {}
      return {
        background: `linear-gradient(135deg, rgba(${color[0]},${color[1]},${color[2]},1) 0%, rgba(${color[0]},${color[1]},${color[2]},0.8) 100%)`
      }
    },
    getIconForCluster(title) {
      const iconMap = {
        'Cluster': 'workload',
        'Kubernetes Version': 'dashboard',
        'Nodes': 'node',
        'Created': 'dashboard'
      }
      return iconMap[title] || 'dashboard'
    },
    getIconForResource(title) {
      const iconMap = {
        'Namespace': 'dashboard',
        'Pod': 'pod',
        'ConfigMap': 'cm',
        'Secret': 'secret',
        'PersistentVolume': 'pv',
        'PersistentVolumeClaim': 'pvc',
        'StorageClass': 'storage',
        'Service': 'service',
        'Ingress': 'ingress',
        'Deployment': 'deployment',
        'DaemonSet': 'daemonset',
        'StatefulSet': 'statefulset',
        'Job': 'job',
        'CronJob': 'cronjob',
        'ServiceAccount': 'user',
        'Role': 'user',
        'ClusterRole': 'user',
        'RoleBinding': 'user',
        'ClusterRoleBinding': 'user'
      }
      return iconMap[title] || 'dashboard'
    },
    getIconForUsage(title) {
      if (title.includes('CPU')) return 'dashboard'
      if (title.includes('Memory')) return 'volume'
      return 'pod'
    },
    showResourceDetail(resource) {
      this.selectedResource = resource
      this.dialogVisible = true
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
            this.renderChart(chart, item, index)
          } catch (e) {
            console.error('Failed to parse chart data:', e)
          }
        })
      })
    },
    
    renderChart(chart, item, index) {
      const data = JSON.parse(item.value)
      const multiplier = this.selectedUnitMultipliers[index]
      
      // Apply unit multiplier to y values
      const scaledData = data.y ? data.y.map(val => {
        const numVal = Number(val)
        return isNaN(numVal) ? val : (numVal * multiplier)
      }) : []
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const param = params[0]
            return `${param.name}<br/>${param.seriesName}: ${param.value} (x${multiplier}倍率)`
          }
        },
        xAxis: {
          type: 'category',
          data: data.x || []
        },
        yAxis: {
          type: 'value',
          name: `data (x${multiplier})`,
          axisLabel: {
            formatter: (value) => {
              return value
            }
          }
        },
        series: [{
          name: item.title,
          data: scaledData,
          type: 'line',
          smooth: true,
          areaStyle: {},
          markLine: {
            silent: true,
            lineStyle: {
              color: '#409EFF'
            },
            data: [{
              type: 'average',
              name: '平均值'
            }]
          }
        }]
      }
      
      chart.setOption(option)
    },
    
    updateChartUnit(value, index) {
      if (index >= 0 && index < this.chartInstances.length) {
        try {
          this.renderChart(
            this.chartInstances[index], 
            this.usageRangeInfo[index], 
            index
          )
        } catch (e) {
          console.error('Failed to update chart unit:', e)
        }
      }
    },
    
    // 手动刷新处理函数
    handleManualRefresh() {
      this.manualRefreshing = true
      this.$store.dispatch('dashboard/getDashboardData')
        .then(() => {
          this.initCharts()
          this.lastUpdated = Math.floor(Date.now() / 1000)
          this.$message.success('Dashboard refreshed successfully')
        })
        .catch(error => {
          console.error('Failed to refresh dashboard data:', error)
          this.$message.error('Failed to refresh data')
        })
        .finally(() => {
          this.manualRefreshing = false
        })
    },
    fetchDashboardData(showLoading = false) {
      if (showLoading) {
        this.loading = true
      }
      
      return this.$store.dispatch('dashboard/getDashboardData')
        .then(() => {
          this.initCharts()
          this.lastUpdated = Math.floor(Date.now() / 1000)
          if (showLoading) {
            this.loading = false
          }
        })
        .catch(error => {
          console.error('Failed to fetch dashboard data:', error)
          if (showLoading) {
            this.$message.error('Failed to load dashboard data')
            this.loading = false
          }
        })
    }
  },
  mounted() {
    // Initial load with loading state
    this.fetchDashboardData(true)
    
    // Add resize listener
    window.addEventListener('resize', this.initCharts)
    
    // Set up auto-refresh every 30 seconds (for more responsive updates)
    this.refreshInterval = setInterval(() => {
      this.fetchDashboardData(false) // Silent refresh
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
  background-color: #f5f7fa;
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #dcdfe6;
    
    .dashboard-title {
      margin: 0;
      font-size: 28px;
      color: #303133;
      font-weight: 600;
    }
    
    .global-refresh-btn {
      font-size: 18px;
    }
  }
  
  h2 {
    font-size: 24px;
    margin: 20px 0;
    color: #303133;
    display: inline-block;
    vertical-align: middle;
    font-weight: 600;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    
    .section-icon {
      font-size: 26px;
      margin-right: 12px;
      color: #409EFF;
    }
  }
  
  .dashboard-card {
    margin-bottom: 30px;
    text-align: center;
    height: 180px;
    transition: all 0.3s;
    overflow: hidden;
    position: relative;
    border: none;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    
    &.cluster-card {
      border-radius: 12px;
      
      .card-content {
        display: flex;
        height: 100%;
        padding: 20px;
        align-items: center;
        color: #fff;
        position: relative;
        z-index: 1;
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          
          .cluster-icon {
            font-size: 40px;
            color: #fff;
          }
        }
        
        .info-wrapper {
          text-align: left;
          flex-grow: 1;
          
          .card-title {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 12px;
          }
          
          .card-value {
            font-size: 38px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .card-label {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
      // 动态颜色由JavaScript控制
    }
  }
  
  .resource-section {
    margin-top: 40px;
    
    .resource-card {
      margin-bottom: 30px;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      overflow: hidden;
      border-radius: 12px;
      background-color: #fff;  /* Add default background */
      
      &.enhanced {
        height: 140px;
        
        .resource-content {
          display: flex;
          align-items: center;
          padding: 20px;
          height: 100%;
          color: #fff;
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Default gradient */
          
          .resource-icon-wrapper {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            
            .resource-icon {
              font-size: 30px;
              color: #fff;
            }
          }
          
          .resource-info {
            flex-grow: 1;
            
            .resource-value {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #fff;
            }
            
            .resource-title {
              font-size: 16px;
              color: rgba(255, 255, 255, 0.9);
            }
          }
        }
        
        // 动态颜色由JavaScript控制
      }
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  .usage-section {
    margin-top: 40px;
    
    .usage-card {
      height: 140px;  /* Fixed height for all usage cards */
      margin-bottom: 24px;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: #fff;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }
      
      .usage-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .usage-icon {
          font-size: 24px;
          margin-right: 10px;
          color: #409EFF;
        }
        
        .usage-title {
          font-size: 16px;
          color: #303133;
          font-weight: 500;
        }
      }
      
      .usage-label {
        margin-top: 10px;
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  .chart-section {
    margin-top: 40px;
    
    .chart-card {
      margin-bottom: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .chart-container {
        height: 320px;
        padding: 10px;
      }
      
      .chart-header {
        display: flex;
        align-items: center;
        height: 56px;
        padding: 0 15px;
        background-color: #f7f9fc;
        border-bottom: 1px solid #ebeef5;
        
        .chart-icon {
          font-size: 20px;
          margin-right: 10px;
          color: #409EFF;
          background-color: #ecf5ff;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        span:not(.unit-selector):not(.last-updated) {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
        
        .unit-selector {
          margin-left: 15px;
        }
        
        .last-updated {
          margin-left: auto;
          font-size: 13px;
          color: #606266;
        }
      }
    }
    
    .refresh-btn {
      margin-left: 15px;
    }
  }
}

.el-progress {
  margin-top: 5px;
}

.unit-selector {
  .el-select {
    width: 110px;
  }
  
  .el-input__inner {
    height: 24px;
    line-height: 24px;
    font-size: 12px;
  }
}
</style>