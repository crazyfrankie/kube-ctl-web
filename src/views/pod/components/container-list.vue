<template>
  <div class="container-list" ref="containerList">
    <template v-if="isEdit">
      <template v-for="(container, index) in containers">
        <container-form 
          :key="index"
          :container="container"
          @remove="() => removeContainer(index)"
          @expanded="handleExpanded"
        />
      </template>
    </template>
    <template v-else>
      <template v-for="(container, index) in containers">
        <probe-info
          :key="index"
          :container="container"
          @expanded="handleExpanded"
        />
      </template>
    </template>
    
    <el-button v-if="isEdit" type="primary" plain @click="addContainer">
      添加容器
    </el-button>
  </div>
</template>

<script>
import ContainerForm from './container-form'
import ProbeInfo from './probe-info'

export default {
  name: 'ContainerList',
  components: {
    ContainerForm,
    ProbeInfo
  },
  props: {
    containers: {
      type: Array,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    addContainer() {
      this.containers.push({
        name: '',
        image: '',
        imagePullPolicy: 'Always',
        workingDir: '',
        privileged: false,
        tty: false,
        command: [],
        args: [],
        ports: [],
        env: [],
        volumeMounts: [],
        resources: null,
        livenessProbe: {},
        readinessProbe: {},
        startupProbe: {}
      })
      
      // 添加容器后自动滚动到新添加的容器位置
      this.$nextTick(() => {
        const containers = this.$el.querySelectorAll('.container-form')
        const lastContainer = containers[containers.length - 1]
        this.scrollToElement(lastContainer)
      })
    },
    removeContainer(index) {
      this.containers.splice(index, 1)
    },
    handleExpanded(element) {
      // 当任何部分被展开时，滚动到展开的位置
      this.scrollToElement(element)
    },
    scrollToElement(element) {
      if (!element) return
      
      // 获取元素的位置信息
      const rect = element.getBoundingClientRect()
      const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      )

      if (!isVisible) {
        const scrollOffset = window.pageYOffset
        const targetPosition = scrollOffset + rect.top - 100 // 上方预留100px空间
        
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
.container-list {
  margin: 20px 0;
}
</style>