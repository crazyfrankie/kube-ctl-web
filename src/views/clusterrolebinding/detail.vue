<template>
  <div class="app-container">
    <div v-loading="loading">
      <div class="detail-header">
        <el-page-header @back="goBack" :content="clusterRoleBindingName" />
        <el-button type="primary" @click="handleEdit">Edit</el-button>
      </div>

      <!-- Base Information -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form label-width="140px" class="detail-form">
          <el-form-item label="Name">
            <span>{{ clusterRoleBindingDetail.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="Role Reference">
            <span>{{ clusterRoleBindingDetail.roleRef || '-' }}</span>
          </el-form-item>
          <el-form-item label="Labels">
            <template v-if="clusterRoleBindingDetail.labels && clusterRoleBindingDetail.labels.length">
              <el-tag
                v-for="(label, i) in clusterRoleBindingDetail.labels"
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
        <div v-for="(subject, index) in clusterRoleBindingDetail.subjects" :key="index" class="subject-block">
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
          <el-divider v-if="index < clusterRoleBindingDetail.subjects.length - 1"></el-divider>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClusterRoleBindingDetail',
  data() {
    return {
      loading: false,
      clusterRoleBindingDetail: {},
      clusterRoleBindingName: ''
    }
  },
  computed: {
    hasSubjects() {
      return this.clusterRoleBindingDetail.subjects && this.clusterRoleBindingDetail.subjects.length > 0
    }
  },
  created() {
    this.clusterRoleBindingName = this.$route.params.name
    this.getClusterRoleBindingDetail()
  },
  methods: {
    getClusterRoleBindingDetail() {
      if (!this.clusterRoleBindingName) return
      this.loading = true
      this.$store.dispatch('clusterrolebinding/getClusterRoleBindingDetail', {
        name: this.clusterRoleBindingName,
        namespace: ''
      }).then(() => {
        this.clusterRoleBindingDetail = this.$store.state.clusterrolebinding.currentClusterRoleBinding || {}
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleEdit() {
      this.$router.push(`/authority/clusterrolebinding-edit/${this.clusterRoleBindingName}`)
    },
    goBack() {
      this.$router.push('/authority/clusterrolebindings')
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
}

.detail-form {
  padding: 20px;
}

.detail-tag {
  margin-right: 10px;
  margin-bottom: 5px;
}

.subject-block {
  padding: 10px 0;
  .subject-header {
    font-weight: 500;
    margin-bottom: 15px;
    padding-left: 20px;
  }
}
</style>
