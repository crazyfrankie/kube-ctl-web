<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.namespace" class="filter-item" placeholder="Select Namespace" @change="handleNamespaceChange">
        <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      
      <el-input v-model="listQuery.keyword" placeholder="Search by name" style="width: 200px; margin-left: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px;" @click="handleFilter">Search</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">Create</el-button>
    </div>

    <el-table :data="list" style="width: 100%" border v-loading="listLoading" element-loading-text="Loading...">
      <el-table-column prop="name" label="Name" min-width="150">
        <template slot-scope="{row}">
          <router-link :to="{path:'/network/ingressroute-detail', query: {name: row.name, namespace: row.namespace}}" class="link-type">
            <span>{{ row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="namespace" label="Namespace" min-width="120" />
      <el-table-column label="Age" min-width="80">
        <template slot-scope="{row}">
          {{ formatKubeTimestamp(row.age) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" fixed="right" width="160" align="center">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="handleEdit(row)">Edit</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="list.length === 0 && !listLoading" class="empty-block">
      No IngressRoutes in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'IngressRouteList',
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        namespace: '',
        keyword: ''
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces || []
    })
  },
  created() {
    this.getNamespaces()
  },
  methods: {
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        if (this.namespaces.length > 0) {
          const urlNamespace = this.$route.query.namespace
          this.listQuery.namespace = urlNamespace || this.namespaces[0].name
          this.getList()
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
      }
    },
    async getList() {
      if (!this.listQuery.namespace) return
      
      this.listLoading = true
      try {
        await this.$store.dispatch('ingressroute/getIngressRouteList', {
          namespace: this.listQuery.namespace,
          keyword: this.listQuery.keyword
        })
        this.list = this.$store.state.ingressroute.ingressRouteList
      } catch (error) {
        console.error('Failed to get IngressRoute list:', error)
        this.$message.error('Failed to fetch IngressRoute list')
      } finally {
        this.listLoading = false
      }
    },
    handleNamespaceChange() {
      this.getList()
      // Update URL query parameters
      this.$router.push({
        path: '/network/ingressroutes',
        query: { namespace: this.listQuery.namespace }
      })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.$router.push({
        path: '/network/ingressroute-create',
        query: { namespace: this.listQuery.namespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/network/ingressroute-edit',
        query: {
          name: row.name,
          namespace: row.namespace
        }
      })
    },
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this IngressRoute?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('ingressroute/deleteIngressRoute', {
          name: row.name,
          namespace: row.namespace
        }).then(() => {
          this.$message({
            type: 'success',
            message: 'IngressRoute deleted successfully!'
          })
          this.getList()
        }).catch(err => {
          console.error(err)
          this.$message.error('Failed to delete IngressRoute')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    formatKubeTimestamp
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 20px;
  display: flex;
  align-items: center;
}
.link-type {
  color: #409EFF;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
.empty-block {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 15px;
}
</style>