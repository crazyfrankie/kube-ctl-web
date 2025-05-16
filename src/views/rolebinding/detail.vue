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
          <el-form-item label="Role Reference">
            <span>{{ roleBindingDetail.roleRef || '-' }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="roleBindingDetail.labels && roleBindingDetail.labels.length">
              <el-tag
                v-for="(label, i) in roleBindingDetail.labels"
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

      <!-- Subjects -->
      <el-card class="box-card" v-if="hasSubjects">
        <div slot="header" class="clearfix">
          <span>Subjects</span>
        </div>
        <div v-for="(subject, index) in roleBindingDetail.subjects" :key="index" class="subject-block">
          <div class="subject-header">Subject {{ index + 1 }}</div>
          <el-form label-width="140px" class="detail-form">
            <el-form-item label="Kind">
              <span>{{ subject.kind || '-' }}</span>
            </el-form-item>
            <el-form-item label="Name">
              <span>{{ subject.name || '-' }}</span>
            </el-form-item>
            <el-form-item label="Namespace" v-if="subject.namespace">
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
export default {
  name: 'RoleBindingDetail',
  data() {
    return {
      loading: false,
      roleBindingDetail: {},
      roleBindingName: ''
    }
  },
  computed: {
    hasSubjects() {
      return this.roleBindingDetail.subjects && this.roleBindingDetail.subjects.length > 0
    }
  },
  created() {
    this.roleBindingName = this.$route.params.name
    this.getRoleBindingDetail()
  },
  methods: {
    getRoleBindingDetail() {
      if (!this.roleBindingName) return
      this.loading = true
      this.$store.dispatch('rolebinding/getRoleBindingDetail', {
        name: this.roleBindingName,
        namespace: this.$route.query.namespace
      }).then(() => {
        this.roleBindingDetail = this.$store.state.rolebinding.currentRoleBinding || {}
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleEdit() {
      this.$router.push({
        path: `/authority/rolebinding/edit/${this.roleBindingName}`,
        query: { namespace: this.roleBindingDetail.namespace }
      })
    },
    goBack() {
      this.$router.push({
        path: '/authority/rolebindings',
        query: { namespace: this.roleBindingDetail.namespace }
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
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f5f7fa;
  border: 1px solid #e6e9f0;
  color: #606266;
  
  &:hover {
    background: #eef1f6;
  }
}

.subject-block {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  background: white;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .subject-header {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
}

.link-type {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}
</style>
