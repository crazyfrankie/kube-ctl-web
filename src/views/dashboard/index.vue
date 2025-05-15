<template>
  <div class="dashboard-container">
    <div v-loading="loading" element-loading-text="Loading dashboard data...">
    <!-- Cluster Information Section -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in clusterInfo" :key="'cluster'+index">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <svg-icon :icon-class="getIconForCluster(item.title)" class-name="card-icon" />
            <span class="card-title">{{ item.title }}</span>
          </div>
          <div class="card-value" :style="{'color': `rgba(${item.color}1)`}">{{ item.value }}</div>
          <div class="card-label" v-if="item.label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Resources Information Section -->
    <el-row :gutter="20" class="resource-section">
      <el-col :span="24">
        <div class="section-header">
          <svg-icon icon-class="workload" class-name="section-icon" />
          <h2>Kubernetes Resources</h2>
        </div>
      </el-col>
      <el-col :xs="8" :sm="6" :md="4" :lg="3" v-for="(item, index) in resourcesInfo" :key="'resource'+index">
        <el-card shadow="hover" class="resource-card" :body-style="{ padding: '10px' }" @click.native="showResourceDetail(item)">
          <div class="resource-header">
            <svg-icon :icon-class="getIconForResource(item.title)" class-name="resource-icon" />
            <div class="resource-title">{{ item.title }}</div>
          </div>
          <div class="resource-value" :style="{'color': `rgba(${item.color}1)`}">{{ item.value }}</div>
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
    fetchDashboardData() {
      this.loading = true
      this.$store.dispatch('dashboard/getDashboardData').then(() => {
        this.initCharts()
        this.loading = false
        this.lastUpdated = Math.floor(Date.now() / 1000)
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
    display: inline-block;
    vertical-align: middle;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
    
    .section-icon {
      font-size: 20px;
      margin-right: 10px;
      color: #409EFF;
    }
  }
  
  .dashboard-card {
    margin-bottom: 20px;
    text-align: center;
    height: 120px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      
      .card-icon {
        font-size: 16px;
        margin-right: 5px;
        color: #409EFF;
      }
      
      .card-title {
        font-size: 14px;
        color: #606266;
      }
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
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .resource-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10px;
        
        .resource-icon {
          font-size: 18px;
          margin-bottom: 5px;
          color: #409EFF;
        }
      }
      
      .resource-title {
        font-size: 12px;
        color: #606266;
        margin-bottom: 8px;
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
      padding: 10px;
      
      .usage-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .usage-icon {
          font-size: 16px;
          margin-right: 8px;
          color: #409EFF;
        }
        
        .usage-title {
          font-size: 14px;
          color: #606266;
        }
      }
      
      .usage-label {
        font-size: 12px;
        color: #909399;
        margin-top: 5px;
        text-align: right;
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
      
      .chart-header {
        display: flex;
        align-items: center;
        
        .chart-icon {
          font-size: 16px;
          margin-right: 8px;
          color: #409EFF;
        }
        
        .unit-selector {
          margin-left: 10px;
        }
        
        .last-updated {
          margin-left: auto;
          font-size: 12px;
          color: #909399;
        }
      }
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