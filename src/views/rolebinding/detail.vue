<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="roleBindingName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ roleBindingDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Namespace">
            <span>{{ roleBindingDetail.namespace || '-' }}</span>
          </el-form-item>
          <el-form-item label="Created">
            <span>{{ formatKubeTimestamp(roleBindingDetail.age) }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Role Reference -->
      <el-card class="box-card" v-if="hasRoleRef">
        <div slot="header" class="clearfix">
          <span>Role Reference</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Kind">
            <el-tag :type="roleBindingDetail.roleRef.kind === 'ClusterRole' ? 'danger' : 'primary'">
              {{ roleBindingDetail.roleRef.kind }}
            </el-tag>
          </el-form-item>
          <el-form-item label="Name">
            <span>{{ roleBindingDetail.roleRef.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="API Group">
            <span>{{ roleBindingDetail.roleRef.apiGroup || '-' }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Subjects -->
      <el-card class="box-card" v-if="hasSubjects">
        <div slot="header" class="clearfix">
          <span>Subjects</span>
        </div>
        <div v-for="(subject, index) in roleBindingDetail.subjects" :key="index" class="subject-block">
          <div class="subject-header">Subject #{{ index + 1 }}</div>
          <el-form label-width="140px" class="detail-form">
            <el-form-item label="Kind">
              <el-tag :type="getSubjectTypeTag(subject.kind)">
                {{ subject.kind }}
              </el-tag>
            </el-form-item>
            <el-form-item label="Name">
              <span>{{ subject.name || '-' }}</span>
            </el-form-item>
            <el-form-item v-if="subject.namespace" label="Namespace">
              <span>{{ subject.namespace }}</span>
            </el-form-item>
          </el-form>
          <el-divider v-if="index < roleBindingDetail.subjects.length - 1"></el-divider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'RoleBindingDetail',
  data() {
    return {
      loading: false,
      roleBindingDetail: {
        name: '',
        namespace: '',
        age: '',
        roleRef: {},
        subjects: []
      }
    }
  },
  computed: {
    roleBindingName() {
      return this.roleBindingDetail.name || 'RoleBinding Detail'
    },
    hasRoleRef() {
      return this.roleBindingDetail.roleRef && Object.keys(this.roleBindingDetail.roleRef).length > 0
    },
    hasSubjects() {
      return this.roleBindingDetail.subjects && this.roleBindingDetail.subjects.length > 0
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
        const response = await this.$store.dispatch('rolebinding/getRoleBindingDetail', { namespace, name })
        if (response && response.data) {
          this.roleBindingDetail = response.data
        }
      } catch (error) {
        console.error('Failed to get rolebinding details:', error)
        this.$message.error('Failed to fetch rolebinding details')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    getSubjectTypeTag(kind) {
      const tagTypes = {
        'User': 'warning',
        'Group': 'info',
        'ServiceAccount': 'success'
      }
      return tagTypes[kind] || 'primary'
    },
    formatKubeTimestamp,
    goBack() {
      const { namespace } = this.$route.query
      this.$router.push({
        path: '/authority/rolebindings',
        query: { namespace }
      })
    },
    handleEdit() {
      const { namespace, name } = this.$route.query
      this.$router.push({
        path: '/authority/rolebinding-edit',
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

.subject-block {
  margin-bottom: 10px;
}

.subject-header {
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