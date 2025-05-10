<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="ingressRouteName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ ingressRouteDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Namespace">
            <span>{{ ingressRouteDetail.namespace || '-' }}</span>
          </el-form-item>
          <el-form-item label="Created">
            <span>{{ formatKubeTimestamp(ingressRouteDetail.age) }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="ingressRouteDetail.labels && ingressRouteDetail.labels.length">
              <el-tag
                v-for="label in ingressRouteDetail.labels"
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

      <!-- Entry Points -->
      <el-card class="box-card" v-if="hasEntryPoints">
        <div slot="header" class="clearfix">
          <span>Entry Points</span>
        </div>
        <div class="tag-container">
          <el-tag
            v-for="(entryPoint, index) in ingressRouteDetail.ingressRouteSpec.entryPoints"
            :key="index"
            type="success"
            class="detail-tag"
          >
            {{ entryPoint }}
          </el-tag>
        </div>
      </el-card>

      <!-- TLS Configuration -->
      <el-card class="box-card" v-if="hasTLS">
        <div slot="header" class="clearfix">
          <span>TLS Configuration</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Secret Name">
            <span>{{ ingressRouteDetail.ingressRouteSpec.tls.secretName || '-' }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Routes -->
      <el-card class="box-card" v-if="hasRoutes">
        <div slot="header" class="clearfix">
          <span>Routes</span>
        </div>
        <div v-for="(route, index) in ingressRouteDetail.ingressRouteSpec.routes" :key="index" class="route-block">
          <div class="route-header">Route #{{ index + 1 }}</div>
          <el-form label-width="140px" class="detail-form">
            <el-form-item label="Kind">
              <el-tag type="info">{{ route.kind || 'Rule' }}</el-tag>
            </el-form-item>
            <el-form-item label="Match">
              <span>{{ route.match || '-' }}</span>
            </el-form-item>
            
            <!-- Middlewares -->
            <el-form-item label="Middlewares" v-if="route.middlewares && route.middlewares.length">
              <div class="tag-container">
                <el-tag
                  v-for="(middleware, mwIndex) in route.middlewares"
                  :key="mwIndex"
                  type="warning"
                  class="detail-tag"
                >
                  {{ middleware.name }}
                </el-tag>
              </div>
            </el-form-item>
            
            <!-- Services -->
            <el-form-item label="Services" v-if="route.services && route.services.length">
              <el-table :data="route.services" border style="width: 100%">
                <el-table-column prop="name" label="Service Name" min-width="180" />
                <el-table-column label="Port" width="100">
                  <template slot-scope="scope">
                    {{ scope.row.port }}
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
          <el-divider v-if="index < ingressRouteDetail.ingressRouteSpec.routes.length - 1"></el-divider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'IngressRouteDetail',
  data() {
    return {
      loading: false,
      ingressRouteName: '',
      ingressRouteDetail: {}
    }
  },
  computed: {
    hasEntryPoints() {
      return this.ingressRouteDetail.ingressRouteSpec && 
             this.ingressRouteDetail.ingressRouteSpec.entryPoints && 
             this.ingressRouteDetail.ingressRouteSpec.entryPoints.length > 0
    },
    hasTLS() {
      return this.ingressRouteDetail.ingressRouteSpec && this.ingressRouteDetail.ingressRouteSpec.tls
    },
    hasRoutes() {
      return this.ingressRouteDetail.ingressRouteSpec && 
             this.ingressRouteDetail.ingressRouteSpec.routes && 
             this.ingressRouteDetail.ingressRouteSpec.routes.length > 0
    }
  },
  created() {
    this.fetchIngressRouteDetail()
  },
  methods: {
    async fetchIngressRouteDetail() {
      const { namespace, name } = this.$route.query
      if (!namespace || !name) {
        Message.error('Invalid parameters')
        return
      }
      this.ingressRouteName = name
      this.loading = true
      try {
        const response = await this.$store.dispatch('ingressroute/getIngressRouteDetail', { namespace, name })
        if (response.data) {
          this.ingressRouteDetail = response.data
        }
      } catch (error) {
        console.error('Error fetching IngressRoute details:', error)
        Message.error('Failed to fetch IngressRoute details')
      } finally {
        this.loading = false
      }
    },
    formatKubeTimestamp,
    goBack() {
      const { namespace } = this.$route.query
      this.$router.push({
        path: '/network/ingressroutes',
        query: { namespace }
      })
    },
    handleEdit() {
      const { namespace, name } = this.$route.query
      this.$router.push({
        path: '/network/ingressroute-edit',
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
  background: #f8fafc;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.box-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ::v-deep .el-card__header {
    background: #f8fafc;
    padding: 15px 20px;
    font-weight: 600;
    font-size: 16px;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
  }
}

.detail-form {
  padding: 10px 0;
  
  .el-form-item {
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }
    
    ::v-deep .el-form-item__label {
      font-weight: 500;
      color: #606266;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 4px;
      word-break: break-word;
      line-height: 1.4;
      display: inline-block;
      width: 140px !important;
      text-align: justify;
    }
    
    ::v-deep .el-form-item__content {
      padding: 8px 0;
      margin-left: 150px !important;
      line-height: 1.5;
      min-height: 38px;
      display: flex;
      align-items: center;
      
      span {
        color: #303133;
        font-size: 14px;
      }
    }
  }
}

.detail-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}

.route-block {
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .route-header {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    color: #409EFF;
    padding-bottom: 8px;
    border-bottom: 1px dashed #ebeef5;
  }
}

::v-deep .el-table {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  
  th {
    background-color: #f5f7fa !important;
    color: #606266;
    font-weight: 500;
  }
  
  .el-table__row {
    &:hover {
      background-color: #f5faff;
    }
  }
}
</style>