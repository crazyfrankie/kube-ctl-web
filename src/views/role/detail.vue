<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="roleName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ roleDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Namespace">
            <span>{{ roleDetail.namespace || '-' }}</span>
          </el-form-item>
          <el-form-item label="Created">
            <span>{{ formatKubeTimestamp(roleDetail.age) }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Rules -->
      <el-card class="box-card" v-if="hasRules">
        <div slot="header" class="clearfix">
          <span>Rules</span>
        </div>
        <div v-for="(rule, index) in roleDetail.rules" :key="index" class="rule-block">
          <div class="rule-header">Rule #{{ index + 1 }}</div>
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
          <el-divider v-if="index < roleDetail.rules.length - 1"></el-divider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'RoleDetail',
  data() {
    return {
      loading: false,
      roleDetail: {
        name: '',
        namespace: '',
        age: '',
        rules: []
      }
    }
  },
  computed: {
    roleName() {
      return this.roleDetail.name || 'Role Detail'
    },
    hasRules() {
      return this.roleDetail.rules && this.roleDetail.rules.length > 0
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const { namespace, name } = this.$route.query
      if (!namespace || !name) {
        this.$message.error('Invalid parameters')
        this.goBack()
        return
      }

      this.loading = true
      try {
        const response = await this.$store.dispatch('role/getRoleDetail', { namespace, name })
        if (response && response.data) {
          this.roleDetail = response.data
        }
      } catch (error) {
        console.error('Failed to get role details:', error)
        this.$message.error('Failed to fetch role details')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    formatKubeTimestamp,
    goBack() {
      const { namespace } = this.$route.query
      this.$router.push({
        path: '/authority/roles',
        query: { namespace }
      })
    },
    handleEdit() {
      const { namespace, name } = this.$route.query
      this.$router.push({
        path: '/authority/role-edit',
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
}

.detail-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.rule-block {
  margin-bottom: 10px;
}

.rule-header {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #606266;
}

.detail-form {
  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>