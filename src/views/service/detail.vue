<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="serviceName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ serviceDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Namespace">
            <span>{{ serviceDetail.namespace || '-' }}</span>
          </el-form-item>
          <el-form-item label="Type">
            <el-tag type="primary">{{ serviceDetail.type || '-' }}</el-tag>
          </el-form-item>
          <el-form-item label="Cluster IP">
            <span>{{ serviceDetail.clusterIP || '-' }}</span>
          </el-form-item>
          <el-form-item v-if="serviceDetail.type === 'ExternalName'" label="External Name">
            <span>{{ serviceDetail.externalName || '-' }}</span>
          </el-form-item>
          <el-form-item label="Created">
            <span>{{ formatKubeTimestamp(serviceDetail.age) }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="serviceDetail.labels && serviceDetail.labels.length">
              <el-tag
                v-for="label in serviceDetail.labels"
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

      <!-- External IPs -->
      <el-card class="box-card" v-if="serviceDetail.type === 'LoadBalancer' || (serviceDetail.externalIP && serviceDetail.externalIP.length)">
        <div slot="header" class="clearfix">
          <span>External Access</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="External IPs">
            <template v-if="serviceDetail.externalIP && serviceDetail.externalIP.length">
              <el-tag
                v-for="(ip, index) in serviceDetail.externalIP"
                :key="index"
                type="success"
                class="detail-tag"
              >
                {{ ip }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-form-item>
          <el-form-item v-if="serviceDetail.loadBalancerIP" label="Load Balancer IP">
            <span>{{ serviceDetail.loadBalancerIP }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Ports Configuration -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Ports</span>
        </div>
        <div v-if="serviceDetail.ports && serviceDetail.ports.length">
          <el-table :data="serviceDetail.ports" border style="width: 100%">
            <el-table-column prop="name" label="Name" min-width="120" />
            <el-table-column prop="port" label="Port" min-width="100" />
            <el-table-column prop="targetPort" label="Target Port" min-width="120" />
            <el-table-column prop="nodePort" label="Node Port" min-width="120">
              <template slot-scope="scope">
                {{ scope.row.nodePort || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="protocol" label="Protocol" min-width="100">
              <template slot-scope="scope">
                {{ scope.row.protocol || 'TCP' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-block">No ports configured</div>
      </el-card>

      <!-- Selectors -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Selectors</span>
        </div>
        <div v-if="serviceDetail.selector && serviceDetail.selector.length">
          <el-table :data="serviceDetail.selector" border style="width: 100%">
            <el-table-column prop="key" label="Label Key" min-width="180" />
            <el-table-column prop="value" label="Label Value" min-width="180" />
          </el-table>
        </div>
        <div v-else class="empty-block">No selectors configured</div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'ServiceDetail',
  data() {
    return {
      loading: false,
      serviceName: '',
      serviceDetail: {}
    }
  },
  created() {
    this.fetchServiceDetail()
  },
  methods: {
    async fetchServiceDetail() {
      const { namespace, name } = this.$route.query
      if (!namespace || !name) {
        Message.error('Invalid parameters')
        return
      }
      this.serviceName = name
      this.loading = true
      try {
        const response = await this.$store.dispatch('service/getServiceDetail', { namespace, name })
        if (response.data) {
          this.serviceDetail = response.data
        }
      } catch (error) {
        console.error('Error fetching service details:', error)
        Message.error('Failed to fetch service details')
      } finally {
        this.loading = false
      }
    },
    formatKubeTimestamp,
    goBack() {
      const { namespace } = this.$route.query
      this.$router.push({
        path: '/network/services',
        query: { namespace }
      })
    },
    handleEdit() {
      const { namespace, name } = this.$route.query
      this.$router.push({
        path: '/network/service-edit',
        query: { namespace, name }
      })
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