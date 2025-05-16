<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="clusterRoleName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ clusterRoleDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="formattedLabels.length">
              <el-tag
                v-for="(label, i) in formattedLabels"
                :key="i"
                type="info"
                size="small"
                class="detail-tag"
              >
                {{ label.key }}: {{ label.value }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Rules -->
      <el-card class="box-card" v-if="hasRules">
        <div slot="header" class="clearfix">
          <span>Rules</span>
        </div>
        <div v-for="(rule, index) in clusterRoleDetail.rules" :key="index" class="rule-block">
          <div class="rule-header">Rule {{ index + 1 }}</div>
          <el-form label-width="140px" class="detail-form">
            <el-form-item label="API Groups">
              <template v-if="rule.apiGroups && rule.apiGroups.length">
                <el-tag
                  v-for="(group, i) in rule.apiGroups"
                  :key="i"
                  type="info"
                  class="detail-tag"
                >
                  {{ group || '""' }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-form-item>
            
            <el-form-item label="Resources">
              <template v-if="rule.resources && rule.resources.length">
                <el-tag
                  v-for="(resource, i) in rule.resources"
                  :key="i"
                  type="success"
                  class="detail-tag"
                >
                  {{ resource }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-form-item>
            
            <el-form-item label="Resource Names" v-if="rule.resourceNames && rule.resourceNames.length">
              <template v-if="rule.resourceNames.length">
                <el-tag
                  v-for="(name, i) in rule.resourceNames"
                  :key="i"
                  type="warning"
                  class="detail-tag"
                >
                  {{ name }}
                </el-tag>
              </template>
            </el-form-item>
            
            <el-form-item label="Verbs">
              <template v-if="rule.verbs && rule.verbs.length">
                <el-tag
                  v-for="(verb, i) in rule.verbs"
                  :key="i"
                  type="primary"
                  class="detail-tag"
                >
                  {{ verb }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-form-item>
          </el-form>
          <el-divider v-if="index < clusterRoleDetail.rules.length - 1"></el-divider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ClusterRoleDetail',
  data() {
    return {
      loading: false,
      clusterRoleDetail: {
        name: '',
        namespace: '',
        labels: [],
        rules: []
      }
    }
  },
  computed: {
    clusterRoleName() {
      return this.clusterRoleDetail.name || 'ClusterRole Detail'
    },
    hasRules() {
      return this.clusterRoleDetail.rules && this.clusterRoleDetail.rules.length > 0
    },
    // Convert labels array of objects to a mapped array
    formattedLabels() {
      return this.clusterRoleDetail.labels || []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const { name } = this.$route.query
      if (!name) {
        this.$message.error('Invalid parameters')
        this.goBack()
        return
      }

      this.loading = true
      try {
        const response = await this.$store.dispatch('clusterrole/getClusterRole', name)
        this.clusterRoleDetail = response
        console.log('ClusterRole detail:', this.clusterRoleDetail)
      } catch (error) {
        console.error('Failed to get clusterrole details:', error)
        this.$message.error('Failed to fetch clusterrole details')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/authority/clusterroles'
      })
    },
    handleEdit() {
      const { name } = this.$route.query
      this.$router.push({
        path: '/authority/clusterrole-edit',
        query: { name }
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
      flex-wrap: wrap;
      
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

.rule-block {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.rule-header {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.empty-block {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px dashed #e6e9f0;
}
</style>