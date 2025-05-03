<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="podName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ podDetail.base && podDetail.base.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Namespace">
            <span>{{ podDetail.base && podDetail.base.namespace || '-' }}</span>
          </el-form-item>
          <el-form-item label="Restart Policy">
            <span>{{ podDetail.base && podDetail.base.restartPolicy || '-' }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="podDetail.base && podDetail.base.labels && podDetail.base.labels.length">
              <el-tag
                v-for="label in podDetail.base.labels"
                :key="label.key"
                type="info"
                class="detail-tag"
              >
                {{ label.key }}: {{ label.value }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Network Configuration -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Network Configuration</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Hostname">
            <span>{{ podDetail.network && podDetail.network.hostName || '-' }}</span>
          </el-form-item>
          <el-form-item label="Host Network">
            <span>{{ podDetail.network && podDetail.network.hostNetwork ? 'Yes' : 'No' }}</span>
          </el-form-item>
          <el-form-item label="DNS Policy">
            <span>{{ podDetail.network && podDetail.network.dnsPolicy || '-' }}</span>
          </el-form-item>
          <el-form-item label="DNS Servers">
            <template v-if="podDetail.network && podDetail.network.dnsConfig && podDetail.network.dnsConfig.nameservers && podDetail.network.dnsConfig.nameservers.length">
              <el-tag
                v-for="(server, index) in podDetail.network.dnsConfig.nameservers"
                :key="index"
                type="info"
                class="detail-tag"
              >
                {{ server }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-form-item>
          <el-form-item label="Host Aliases">
            <template v-if="podDetail.network && podDetail.network.hostAliases && podDetail.network.hostAliases.length">
              <el-table :data="podDetail.network.hostAliases" border style="width: 100%">
                <el-table-column prop="key" label="IP" min-width="120" />
                <el-table-column prop="value" label="Hostname" min-width="180" />
              </el-table>
            </template>
            <span v-else>-</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Container Configuration -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Container Configuration</span>
        </div>
        <div v-if="podDetail.initContainers && podDetail.initContainers.length" class="container-section">
          <h3 class="section-title">Init Containers</h3>
          <container-list :containers="podDetail.initContainers" />
          <div class="divider-line"></div>
        </div>
        <div class="container-section">
          <h3 class="section-title">Main Containers</h3>
          <container-list :containers="podDetail.containers || []" />
        </div>
      </el-card>

      <!-- Volume Configuration -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Volume Configuration</span>
        </div>
        <div v-if="podDetail.volume && podDetail.volume.length">
          <el-table :data="podDetail.volume" border style="width: 100%">
            <el-table-column prop="name" label="Name" min-width="120" />
            <el-table-column prop="type" label="Type" min-width="120" />
            <el-table-column label="Source" min-width="180">
              <template slot-scope="scope">
                {{ getVolumeSource(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="Mount Path" min-width="180">
              <template slot-scope="scope">
                {{ getVolumeMountPath(scope.row) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-block">No volumes configured</div>
      </el-card>

      <!-- Node Scheduling -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Node Scheduling</span>
        </div>
        <div v-if="podDetail.nodeScheduling">
          <el-form label-width="140px" class="detail-form">
            <el-form-item label="Schedule Type">
              <el-tag type="primary">{{ formatScheduleType(podDetail.nodeScheduling.type) }}</el-tag>
            </el-form-item>
            
            <!-- Specific Node -->
            <el-form-item v-if="podDetail.nodeScheduling.type === 'nodeName'" label="Node Name">
              <span>{{ podDetail.nodeScheduling.nodeName || '-' }}</span>
            </el-form-item>
            
            <!-- Node Selector -->
            <el-form-item v-if="podDetail.nodeScheduling.type === 'nodeSelector'" label="Node Selectors">
              <template v-if="podDetail.nodeScheduling.nodeSelector && podDetail.nodeScheduling.nodeSelector.length">
                <el-tag
                  v-for="selector in podDetail.nodeScheduling.nodeSelector"
                  :key="selector.key"
                  type="success"
                  class="detail-tag"
                >
                  {{ selector.key }}: {{ selector.value }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-form-item>
            
            <!-- Node Affinity -->
            <el-form-item v-if="podDetail.nodeScheduling.type === 'nodeAffinity'" label="Affinity Rules">
              <template v-if="podDetail.nodeScheduling.nodeAffinity && podDetail.nodeScheduling.nodeAffinity.length">
                <el-table :data="podDetail.nodeScheduling.nodeAffinity" border style="width: 100%">
                  <el-table-column prop="key" label="Key" min-width="120" />
                  <el-table-column prop="operator" label="Operator" min-width="120" />
                  <el-table-column prop="value" label="Value" min-width="120">
                    <template slot-scope="scope">
                      {{ scope.row.value || '-' }}
                    </template>
                  </el-table-column>
                </el-table>
              </template>
              <span v-else>-</span>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-block">No node scheduling configured</div>
      </el-card>
      
      <!-- Tolerations -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Tolerations</span>
        </div>
        <div v-if="podDetail.tolerations && podDetail.tolerations.length">
          <el-table :data="podDetail.tolerations" border style="width: 100%">
            <el-table-column prop="key" label="Key" min-width="120">
              <template slot-scope="scope">
                {{ scope.row.key || 'All Keys' }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="Operator" min-width="100" />
            <el-table-column prop="value" label="Value" min-width="120">
              <template slot-scope="scope">
                {{ (scope.row.operator === 'Equal' ? scope.row.value : '-') || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="effect" label="Effect" min-width="140">
              <template slot-scope="scope">
                {{ scope.row.effect || 'All Effects' }}
              </template>
            </el-table-column>
            <el-table-column label="Toleration Seconds" min-width="150">
              <template slot-scope="scope">
                {{ scope.row.effect === 'NoExecute' && scope.row.tolerationSeconds ? scope.row.tolerationSeconds + 's' : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-block">No tolerations configured</div>
      </el-card>
    </div>
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
      podDetail: {}
    }
  },
  created() {
    this.fetchPodDetail()
  },
  methods: {
    async fetchPodDetail() {
      const { namespace, name } = this.$route.query
      if (!namespace || !name) {
        Message.error('Invalid parameters')
        return
      }
      this.podName = name
      this.loading = true
      try {
        const response = await this.$store.dispatch('pod/getPodDetail', { namespace, name })
        if (response.data) {
          this.podDetail = response.data
        }
      } catch (error) {
        console.error('Error fetching pod details:', error)
        Message.error('Failed to fetch Pod details')
      } finally {
        this.loading = false
      }
    },
    getVolumeSource(volume) {
      switch (volume.type) {
        case 'configMap':
          return volume.configMap && volume.configMap.name ? `ConfigMap: ${volume.configMap.name}` : '-'
        case 'secret':
          return volume.secret && volume.secret.secretName ? `Secret: ${volume.secret.secretName}` : '-'
        case 'hostPath':
          return volume.hostPath && volume.hostPath.path ? `Host Path: ${volume.hostPath.path}` : '-'
        case 'emptyDir':
          return 'Empty Directory'
        default:
          return '-'
      }
    },
    getVolumeMountPath(volume) {
      if (!this.podDetail.containers) return '-'

      const paths = []
      this.podDetail.containers.forEach(container => {
        if (container.volumeMounts) {
          const mount = container.volumeMounts.find(m => m.mountName === volume.name)
          if (mount) {
            paths.push(`${container.name}: ${mount.mountPath}`)
          }
        }
      })

      if (this.podDetail.initContainers) {
        this.podDetail.initContainers.forEach(container => {
          if (container.volumeMounts) {
            const mount = container.volumeMounts.find(m => m.mountName === volume.name)
            if (mount) {
              paths.push(`${container.name}: ${mount.mountPath}`)
            }
          }
        })
      }

      return paths.length ? paths.join('\n') : '-'
    },
    formatScheduleType(type) {
      switch (type) {
        case 'nodeName':
          return 'Specific Node'
        case 'nodeSelector':
          return 'Node Selector'
        case 'nodeAffinity':
          return 'Node Affinity'
        default:
          return '-'
      }
    },
    goBack() {
      const { namespace } = this.$route.query
      this.$router.push({
        path: '/pod/list',
        query: { namespace }
      })
    },
    handleEdit() {
      const { namespace, name } = this.$route.query
      this.$router.push(`/pod/create?namespace=${namespace}&name=${name}&edit=true`)
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-form {
  .el-form-item {
    margin-bottom: 18px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.detail-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.container-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.divider-line {
  height: 1px;
  background-color: #EBEEF5;
  margin: 24px 0;
}

.empty-block {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

::v-deep .el-table {
  margin-top: 8px;
}
</style>
