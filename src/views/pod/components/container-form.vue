<template>
  <div class="container-form">
    <el-card class="box-card" ref="containerCard">
      <div slot="header" class="clearfix">
        <el-button type="danger" size="small" style="float: right" @click="$emit('remove')">删除容器</el-button>
      </div>
      
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="container.name" />
        </el-form-item>
        
        <el-form-item label="镜像">
          <el-input v-model="container.image" />
        </el-form-item>
        
        <el-form-item label="拉取策略">
          <el-select v-model="container.imagePullPolicy">
            <el-option label="Always" value="Always" />
            <el-option label="IfNotPresent" value="IfNotPresent" />
            <el-option label="Never" value="Never" />
          </el-select>
        </el-form-item>

        <el-form-item label="工作目录">
          <el-input v-model="container.workingDir" />
        </el-form-item>

        <el-form-item label="特权模式">
          <el-switch v-model="container.privileged" />
        </el-form-item>

        <el-form-item label="TTY">
          <el-switch v-model="container.tty" />
        </el-form-item>

        <el-form-item label="命令">
          <el-input v-model="commandStr" placeholder="输入命令，用空格分隔" @change="updateCommand" />
        </el-form-item>

        <el-form-item label="参数">
          <el-input v-model="argsStr" placeholder="输入参数，用空格分隔" @change="updateArgs" />
        </el-form-item>

        <!-- 端口配置 -->
        <el-form-item label="端口">
          <el-button size="small" type="primary" @click="addPort">添加端口</el-button>
          <div v-for="(port, index) in container.ports" :key="index" class="port-item" style="margin-top: 10px">
            <el-input v-model="port.name" placeholder="名称" style="width: 120px" />
            <el-input v-model.number="port.containerPort" placeholder="容器端口" style="width: 120px; margin: 0 10px" />
            <el-input v-model.number="port.hostPort" placeholder="主机端口" style="width: 120px" />
            <el-button type="danger" size="small" @click="removePort(index)" style="margin-left: 10px">删除</el-button>
          </div>
        </el-form-item>

        <!-- 环境变量 -->
        <el-form-item label="环境变量">
          <el-button size="small" type="primary" @click="addEnv">添加环境变量</el-button>
          <div v-for="(env, index) in container.env" :key="index" class="env-item" style="margin-top: 10px">
            <el-input v-model="env.key" placeholder="键" style="width: 180px" />
            <el-input v-model="env.value" placeholder="值" style="width: 180px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeEnv(index)">删除</el-button>
          </div>
        </el-form-item>

        <!-- 资源配额 -->
        <el-form-item label="资源配额">
          <el-switch v-model="hasResources" @change="handleResourcesChange" />
          <template v-if="hasResources">
            <div class="resource-quota" ref="resourceQuota">
              <el-form-item label="CPU请求">
                <el-input-number 
                  v-model="container.resources.requests.cpu" 
                  :min="0"
                  :max="64"
                  :step="0.1"
                  :precision="1"
                  controls-position="right"
                />
                <span class="unit">核</span>
              </el-form-item>
              <el-form-item label="CPU限制">
                <el-input-number 
                  v-model="container.resources.limits.cpu" 
                  :min="0"
                  :max="64"
                  :step="0.1"
                  :precision="1"
                  controls-position="right"
                />
                <span class="unit">核</span>
              </el-form-item>
              <el-form-item label="内存请求">
                <el-input-number 
                  v-model="container.resources.requests.memory" 
                  :min="0"
                  :step="64"
                  controls-position="right"
                />
                <span class="unit">Mi</span>
              </el-form-item>
              <el-form-item label="内存限制">
                <el-input-number 
                  v-model="container.resources.limits.memory" 
                  :min="0"
                  :step="64"
                  controls-position="right"
                />
                <span class="unit">Mi</span>
              </el-form-item>
            </div>
          </template>
        </el-form-item>

        <!-- 探针配置 -->
        <el-form-item label="存活探针">
          <div ref="livenessProbeRef">
            <probe-form ref="livenessProbe" v-model="container.livenessProbe" @enable-change="handleProbeEnableChange($event, 'livenessProbeRef')" />
          </div>
        </el-form-item>

        <el-form-item label="就绪探针">
          <div ref="readinessProbeRef">
            <probe-form ref="readinessProbe" v-model="container.readyProbe" @enable-change="handleProbeEnableChange($event, 'readinessProbeRef')" />
          </div>
        </el-form-item>

        <el-form-item label="启动探针">
          <div ref="startupProbeRef">
            <probe-form ref="startupProbe" v-model="container.startUpProbe" @enable-change="handleProbeEnableChange($event, 'startupProbeRef')" />
          </div>
        </el-form-item>

        <!-- 挂载卷 -->
        <el-form-item label="挂载卷">
          <el-button size="small" type="primary" @click="addVolumeMount">添加挂载</el-button>
          <div v-for="(mount, index) in container.volumeMounts" :key="index" class="mount-item" style="margin-top: 10px">
            <el-input v-model="mount.mountName" placeholder="卷名称" style="width: 150px" />
            <el-input v-model="mount.mountPath" placeholder="挂载路径" style="width: 150px; margin: 0 10px" />
            <el-switch v-model="mount.readOnly" active-text="只读" />
            <el-button type="danger" size="small" @click="removeVolumeMount(index)" style="margin-left: 10px">删除</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import ProbeForm from './probe-form'

export default {
  name: 'ContainerForm',
  components: {
    ProbeForm
  },
  props: {
    container: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      commandStr: '',
      argsStr: '',
      hasResources: false
    }
  },
  created() {
    // 初始化命令和参数字符串
    this.commandStr = this.container.command ? this.container.command.join(' ') : ''
    this.argsStr = this.container.args ? this.container.args.join(' ') : ''
    
    // 初始化资源配额
    this.initResources()
  },
  methods: {
    initResources() {
      // 检查是否已经有资源配额配置
      if (this.container.resources &&
          (this.container.resources.requests || this.container.resources.limits)) {
        this.hasResources = true
      } else {
        this.container.resources = {
          requests: {
            cpu: 0.1,
            memory: 128
          },
          limits: {
            cpu: 0.5,
            memory: 256
          }
        }
      }
    },
    handleResourcesChange(val) {
      if (val) {
        this.initResources()
        this.$nextTick(() => {
          const element = this.$refs.resourceQuota
          if (element) {
            this.scrollToElement(element)
          }
        })
      }
    },
    handleProbeEnableChange(val, refName) {
      if (val) {
        this.$nextTick(() => {
          const element = this.$refs[refName]
          if (element) {
            this.scrollToElement(element)
          }
        })
      }
    },
    updateCommand(value) {
      this.container.command = value ? value.split(' ').filter(Boolean) : []
    },
    updateArgs(value) {
      this.container.args = value ? value.split(' ').filter(Boolean) : []
    },
    addPort() {
      this.container.ports.push({
        name: '',
        containerPort: null,
        hostPort: null
      })
      this.$nextTick(() => {
        const elements = this.$el.querySelectorAll('.port-item')
        const lastElement = elements[elements.length - 1]
        this.$emit('expanded', lastElement)
      })
    },
    removePort(index) {
      this.container.ports.splice(index, 1)
    },
    addEnv() {
      this.container.env.push({
        key: '',
        value: ''
      })
      this.$nextTick(() => {
        const elements = this.$el.querySelectorAll('.env-item')
        const lastElement = elements[elements.length - 1]
        this.$emit('expanded', lastElement)
      })
    },
    removeEnv(index) {
      this.container.env.splice(index, 1)
    },
    addVolumeMount() {
      this.container.volumeMounts.push({
        mountName: '',
        mountPath: '',
        readOnly: false
      })
      this.$nextTick(() => {
        const elements = this.$el.querySelectorAll('.mount-item')
        const lastElement = elements[elements.length - 1]
        this.$emit('expanded', lastElement)
      })
    },
    removeVolumeMount(index) {
      this.container.volumeMounts.splice(index, 1)
    },
    scrollToElement(element) {
      if (!element) return

      // 获取元素的位置信息
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const bottomVisible = rect.bottom <= windowHeight
      const topVisible = rect.top >= 0

      // 如果元素不在可视区域内
      if (!bottomVisible || !topVisible) {
        // 计算滚动位置，将元素滚动到视图中部偏上位置
        const targetPosition = window.pageYOffset + rect.top - (windowHeight * 0.3)
        
        // 使用平滑滚动
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }
  }
}
</script>

<style scoped>
.container-form {
  margin: 20px 0;
}
.resource-quota {
  margin-top: 10px;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}
.unit {
  margin-left: 5px;
  color: #909399;
  width: 30px;
  display: inline-block;
}
.el-form-item {
  margin-bottom: 22px;
}
.el-input-number {
  width: 150px;
}
.port-item,
.env-item,
.mount-item {
  margin-top: 10px;
  transition: all 0.3s ease;
}
</style>