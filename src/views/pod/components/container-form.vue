<template>
  <div class="container-form">
    <el-card class="box-card" ref="containerCard">
      <div slot="header" class="clearfix">
        <el-button type="danger" size="small" style="float: right" @click="$emit('remove')">Delete Container</el-button>
      </div>
      
      <el-form label-width="100px">
        <el-form-item label="Name">
          <el-input v-model="container.name" />
        </el-form-item>
        
        <el-form-item label="Image">
          <el-input v-model="container.image" />
        </el-form-item>
        
        <el-form-item label="Pull Policy">
          <el-select v-model="container.imagePullPolicy">
            <el-option label="Always" value="Always" />
            <el-option label="IfNotPresent" value="IfNotPresent" />
            <el-option label="Never" value="Never" />
          </el-select>
        </el-form-item>

        <el-form-item label="Working Dir">
          <el-input v-model="container.workingDir" />
        </el-form-item>

        <el-form-item label="Privileged">
          <el-switch v-model="container.privileged" />
        </el-form-item>

        <el-form-item label="TTY">
          <el-switch v-model="container.tty" />
        </el-form-item>

        <el-form-item label="Command">
          <el-input v-model="commandStr" placeholder="Enter command, space separated" @change="updateCommand" />
        </el-form-item>

        <el-form-item label="Arguments">
          <el-input v-model="argsStr" placeholder="Enter arguments, space separated" @change="updateArgs" />
        </el-form-item>

        <!-- Port Configuration -->
        <el-form-item label="Ports">
          <el-button size="small" type="primary" @click="addPort">Add Port</el-button>
          <div v-for="(port, index) in container.ports" :key="index" class="port-item" style="margin-top: 10px">
            <el-input v-model="port.name" placeholder="Name" style="width: 120px" />
            <el-input v-model.number="port.containerPort" placeholder="Container Port" style="width: 120px; margin: 0 10px" />
            <el-input v-model.number="port.hostPort" placeholder="Host Port" style="width: 120px" />
            <el-button type="danger" size="small" @click="removePort(index)" style="margin-left: 10px">Delete</el-button>
          </div>
        </el-form-item>

        <!-- Environment Variables -->
        <el-form-item label="Environment">
          <el-button size="small" type="primary" @click="addEnv">Add Environment Variable</el-button>
          <div v-for="(env, index) in container.env" :key="index" class="env-item" style="margin-top: 10px">
            <el-input v-model="env.key" placeholder="Key" style="width: 180px" />
            <el-input v-model="env.value" placeholder="Value" style="width: 180px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeEnv(index)">Delete</el-button>
          </div>
        </el-form-item>

        <!-- Resource Quotas -->
        <el-form-item label="Resource Quotas">
          <el-switch v-model="container.resources.enable" />
          <template v-if="container.resources.enable">
            <div class="resource-quota" ref="resourceQuota">
              <el-form-item label="CPU Request">
                <el-input-number 
                  v-model="container.resources.CPUReq" 
                  :min="0"
                  :max="64000"
                  :step="100"
                  controls-position="right"
                />
                <span class="unit">mCores</span>
              </el-form-item>
              <el-form-item label="CPU Limit">
                <el-input-number 
                  v-model="container.resources.CPULimit" 
                  :min="0"
                  :max="64000"
                  :step="100"
                  controls-position="right"
                />
                <span class="unit">mCores</span>
              </el-form-item>
              <el-form-item label="Memory Request">
                <el-input-number 
                  v-model="container.resources.memory" 
                  :min="0"
                  :step="64"
                  controls-position="right"
                />
                <span class="unit">Mi</span>
              </el-form-item>
              <el-form-item label="Memory Limit">
                <el-input-number 
                  v-model="container.resources.memoryLimit" 
                  :min="0"
                  :step="64"
                  controls-position="right"
                />
                <span class="unit">Mi</span>
              </el-form-item>
            </div>
          </template>
        </el-form-item>

        <!-- Probe Configuration -->
        <el-form-item label="Liveness Probe">
          <div ref="livenessProbeRef">
            <probe-form ref="livenessProbe" v-model="container.livenessProbe" />
          </div>
        </el-form-item>

        <el-form-item label="Readiness Probe">
          <div ref="readinessProbeRef">
            <probe-form ref="readinessProbe" v-model="container.readyProbe" />
          </div>
        </el-form-item>

        <el-form-item label="Startup Probe">
          <div ref="startupProbeRef">
            <probe-form ref="startupProbe" v-model="container.startUpProbe" />
          </div>
        </el-form-item>

        <!-- Volume Mounts -->
        <el-form-item label="Volumes">
          <el-button size="small" type="primary" @click="addVolumeMount">Add Mount</el-button>
          <div v-for="(mount, index) in container.volumeMounts" :key="index" class="mount-item" style="margin-top: 10px">
            <el-input v-model="mount.mountName" placeholder="Volume Name" style="width: 150px" />
            <el-input v-model="mount.mountPath" placeholder="Mount Path" style="width: 150px; margin: 0 10px" />
            <el-switch v-model="mount.readOnly" active-text="Read Only" />
            <el-button type="danger" size="small" @click="removeVolumeMount(index)" style="margin-left: 10px">Delete</el-button>
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
    // Initialize command and arguments strings
    this.commandStr = this.container.command ? this.container.command.join(' ') : ''
    this.argsStr = this.container.args ? this.container.args.join(' ') : ''
    
    // Initialize resource quotas
    this.initResources()
  },
  methods: {
    initResources() {
      // Check if resource quotas are already configured
      if (this.container.resources &&
          (this.container.resources.requests || this.container.resources.limits)) {
        this.hasResources = true
      } else {
        this.container.resources = {
          enable: false,
          CPUReq: 100,
          CPULimit: 500,
          memory: 128,
          memoryLimit: 256
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

      // Get element position
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const bottomVisible = rect.bottom <= windowHeight
      const topVisible = rect.top >= 0

      // If element is not in the visible area
      if (!bottomVisible || !topVisible) {
        // Calculate scroll position to bring the element into view
        const targetPosition = window.pageYOffset + rect.top - (windowHeight * 0.3)
        
        // Use smooth scrolling
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