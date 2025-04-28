<template>
  <div class="probe-form">
    <div class="probe-header">
      <el-switch v-model="hasProbe" @change="handleEnableChange" style="margin-right: 10px" />
      <span class="probe-label">{{ getProbeTitle }}</span>
    </div>
    <template v-if="hasProbe">
      <div class="probe-config">
        <el-form label-width="100px" ref="probeForm" :model="localProbeConfig">
          <el-form-item label="探针类型">
            <el-select v-model="localProbeConfig.type" @change="handleTypeChange">
              <el-option label="HTTP" value="http" />
              <el-option label="TCP" value="tcp" />
              <el-option label="命令" value="command" />
            </el-select>
          </el-form-item>

          <!-- HTTP探针配置 -->
          <template v-if="localProbeConfig.type === 'http'">
            <el-form-item label="路径">
              <el-input v-model="localProbeConfig.httpGet.path" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number 
                v-model="localProbeConfig.httpGet.port" 
                :min="1" 
                :max="65535"
                controls-position="right" 
              />
            </el-form-item>
            <el-form-item label="协议">
              <el-select v-model="localProbeConfig.httpGet.scheme">
                <el-option label="HTTP" value="HTTP" />
                <el-option label="HTTPS" value="HTTPS" />
              </el-select>
            </el-form-item>
            <el-form-item label="请求头">
              <el-button size="small" type="primary" @click="addHeader">添加请求头</el-button>
              <div v-for="(header, index) in localProbeConfig.httpGet.headers" :key="index" class="header-item">
                <el-input v-model="header.name" placeholder="名称" style="width: 180px" @change="emitUpdate" />
                <el-input v-model="header.value" placeholder="值" style="width: 180px; margin: 0 10px" @change="emitUpdate" />
                <el-button type="danger" size="small" @click="removeHeader(index)">删除</el-button>
              </div>
            </el-form-item>
          </template>

          <!-- TCP探针配置 -->
          <template v-if="localProbeConfig.type === 'tcp'">
            <el-form-item label="主机">
              <el-input v-model="localProbeConfig.tcpSocket.host" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number 
                v-model="localProbeConfig.tcpSocket.port" 
                :min="1" 
                :max="65535"
                controls-position="right"
              />
            </el-form-item>
          </template>

          <!-- 命令探针配置 -->
          <template v-if="localProbeConfig.type === 'command'">
            <el-form-item label="命令">
              <el-input 
                type="textarea"
                v-model="localCommandStr" 
                placeholder="输入命令，用空格分隔"
                @change="handleCommandChange"
                :rows="2"
              />
            </el-form-item>
          </template>

          <!-- 通用探针配置 -->
          <el-form-item label="初始延迟">
            <el-input-number 
              v-model="localProbeConfig.initialDelaySeconds" 
              :min="0"
              controls-position="right"
            />
            <span class="unit">秒</span>
          </el-form-item>
          <el-form-item label="检测间隔">
            <el-input-number 
              v-model="localProbeConfig.periodSeconds" 
              :min="1"
              controls-position="right"
            />
            <span class="unit">秒</span>
          </el-form-item>
          <el-form-item label="超时时间">
            <el-input-number 
              v-model="localProbeConfig.timeoutSeconds" 
              :min="1"
              controls-position="right"
            />
            <span class="unit">秒</span>
          </el-form-item>
          <el-form-item label="成功阈值">
            <el-input-number 
              v-model="localProbeConfig.successThreshold" 
              :min="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="失败阈值">
            <el-input-number 
              v-model="localProbeConfig.failureThreshold" 
              :min="1"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'ProbeForm',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      hasProbe: false,
      localProbeConfig: null,
      localCommandStr: ''
    }
  },
  created() {
    // 初始化本地数据
    this.initLocalConfig()
  },
  computed: {
    getProbeTitle() {
      const typeMap = {
        'livenessProbe': '存活探针',
        'readinessProbe': '就绪探针',
        'startupProbe': '启动探针'
      }
      // 从父组件传来的 value 对象名称判断探针类型
      const probeName = Object.keys(this.$parent.$props).find(key => 
        this.$parent.$props[key] === this.value
      )
      return typeMap[probeName] || ''
    }
  },
  methods: {
    initLocalConfig() {
      // 使用 Vue.set 来确保响应式
      this.localProbeConfig = this.getDefaultConfig()
      
      if (this.value && Object.keys(this.value).length > 0) {
        this.hasProbe = true
        const config = JSON.parse(JSON.stringify(this.value))
        Object.keys(config).forEach(key => {
          Vue.set(this.localProbeConfig, key, config[key])
        })
        
        if (config.type === 'command' && config.command?.command) {
          this.localCommandStr = config.command.command.join(' ')
        }
      }
    },
    getDefaultConfig() {
      return {
        type: 'http',
        httpGet: {
          path: '/',
          port: 80,
          scheme: 'HTTP',
          headers: []
        },
        tcpSocket: {
          host: '',
          port: 80
        },
        command: {
          command: []
        },
        initialDelaySeconds: 0,
        periodSeconds: 10,
        timeoutSeconds: 1,
        successThreshold: 1,
        failureThreshold: 3
      }
    },
    handleEnableChange(val) {
      if (val) {
        this.initLocalConfig()
      } else {
        this.$emit('input', {})
      }
      this.$emit('enable-change', val)
    },
    handleTypeChange() {
      // 使用 Vue.set 来确保响应式更新
      if (this.localProbeConfig.type === 'http') {
        Vue.set(this.localProbeConfig, 'httpGet', {
          path: '/',
          port: 80,
          scheme: 'HTTP',
          headers: []
        })
      } else if (this.localProbeConfig.type === 'tcp') {
        Vue.set(this.localProbeConfig, 'tcpSocket', {
          host: '',
          port: 80
        })
      } else if (this.localProbeConfig.type === 'command') {
        Vue.set(this.localProbeConfig, 'command', {
          command: []
        })
        this.localCommandStr = ''
      }
      this.$nextTick(() => {
        this.emitUpdate()
      })
    },
    addHeader() {
      if (!this.localProbeConfig.httpGet.headers) {
        Vue.set(this.localProbeConfig.httpGet, 'headers', [])
      }
      this.localProbeConfig.httpGet.headers.push({
        name: '',
        value: ''
      })
      this.emitUpdate()
    },
    removeHeader(index) {
      this.localProbeConfig.httpGet.headers.splice(index, 1)
      this.emitUpdate()
    },
    handleCommandChange(value) {
      if (!this.localProbeConfig.command) {
        Vue.set(this.localProbeConfig, 'command', { command: [] })
      }
      this.localProbeConfig.command.command = value ? value.split(' ').filter(Boolean) : []
      this.localCommandStr = value
      this.emitUpdate()
    },
    emitUpdate() {
      this.$nextTick(() => {
        if (this.hasProbe) {
          const config = JSON.parse(JSON.stringify(this.localProbeConfig))
          this.$emit('input', config)
        }
      })
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.hasProbe = true
          const config = JSON.parse(JSON.stringify(newVal))
          Object.keys(config).forEach(key => {
            Vue.set(this.localProbeConfig, key, config[key])
          })
          
          if (config.type === 'command' && config.command?.command) {
            this.localCommandStr = config.command.command.join(' ')
          }
        }
      },
      deep: true
    },
    'localProbeConfig.initialDelaySeconds': 'emitUpdate',
    'localProbeConfig.periodSeconds': 'emitUpdate',
    'localProbeConfig.timeoutSeconds': 'emitUpdate',
    'localProbeConfig.successThreshold': 'emitUpdate',
    'localProbeConfig.failureThreshold': 'emitUpdate',
    'localProbeConfig.httpGet.path': 'emitUpdate',
    'localProbeConfig.httpGet.port': 'emitUpdate',
    'localProbeConfig.httpGet.scheme': 'emitUpdate',
    'localProbeConfig.tcpSocket.host': 'emitUpdate',
    'localProbeConfig.tcpSocket.port': 'emitUpdate'
  }
}
</script>

<style scoped>
.probe-form {
  margin: 10px 0;
}
.probe-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.probe-label {
  font-size: 14px;
  color: #606266;
  line-height: 20px;
}
.probe-config {
  margin-top: 15px;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}
.header-item {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.unit {
  margin-left: 5px;
  color: #909399;
  width: 30px;
  display: inline-block;
}
.el-input-number {
  width: 130px;
}
</style>