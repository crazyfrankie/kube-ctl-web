<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="podName" />
    </div>

    <el-card class="box-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>基本信息</span>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="名称">{{ podDetail.base && podDetail.base.name }}</el-descriptions-item>
        <el-descriptions-item label="命名空间">{{ podDetail.base && podDetail.base.namespace }}</el-descriptions-item>
        <el-descriptions-item label="重启策略">{{ podDetail.base && podDetail.base.restartPolicy }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-for="label in (podDetail.base && podDetail.base.labels)" :key="label.key" type="info" style="margin-right: 5px">
            {{ label.key }}: {{ label.value }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>网络配置</span>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="主机名">{{ podDetail.network && podDetail.network.hostName }}</el-descriptions-item>
        <el-descriptions-item label="使用主机网络">{{ podDetail.network && podDetail.network.hostNetwork ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="DNS策略">{{ podDetail.network && podDetail.network.dnsPolicy }}</el-descriptions-item>
        <el-descriptions-item label="DNS服务器">
          {{ podDetail.network && podDetail.network.dnsConfig && podDetail.network.dnsConfig.nameservers && podDetail.network.dnsConfig.nameservers.join(', ') }}
        </el-descriptions-item>
        <el-descriptions-item label="主机别名">
          <div v-for="alias in (podDetail.network && podDetail.network.hostAliases)" :key="alias.key">
            {{ alias.key }}: {{ alias.value }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>容器列表</span>
      </div>
      <div v-if="podDetail.initContainers && podDetail.initContainers.length > 0">
        <h4>初始化容器</h4>
        <container-list :containers="podDetail.initContainers" />
      </div>
      <div style="margin-top: 20px">
        <h4>主容器</h4>
        <container-list :containers="podDetail.containers || []" />
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>存储卷</span>
      </div>
      <el-table :data="podDetail.volume || []" border>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import ContainerList from './components/container-list'
import { Message } from 'element-ui'

export default {
  name: 'PodDetail',
  components: {
    ContainerList
  },
  data() {
    return {
      loading: false,
      podName: '',
      podDetail: {},
      pollingTimer: null,
      isPolling: false
    }
  },
  created() {
    this.fetchPodDetail()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    async fetchPodDetail() {
      const { namespace, name } = this.$route.query
      if (!namespace || !name) {
        Message.error('参数错误')
        return
      }
      this.podName = name
      this.loading = true
      try {
        const response = await this.$store.dispatch('pod/getPodDetail', {
          namespace,
          name
        })
        this.podDetail = response.data
        
        // 如果Pod不是终态，开始轮询
        if (!this.isPodInTerminalState(this.podDetail.status)) {
          this.startPolling()
        }
      } catch (error) {
        Message.error('获取Pod详情失败')
      }
      this.loading = false
    },
    isPodInTerminalState(status) {
      const terminalStates = ['Running', 'Failed', 'Succeeded']
      return terminalStates.includes(status)
    },
    startPolling() {
      if (!this.isPolling) {
        this.isPolling = true
        this.pollingTimer = setInterval(() => {
          this.fetchPodDetail()
        }, 5000) // 每5秒轮询一次
      }
    },
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
      this.isPolling = false
    },
    goBack() {
      this.stopPolling() // 返回时停止轮询
      this.$router.push('/pod/list')
    }
  }
}
</script>

<style scoped>
.detail-header {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>