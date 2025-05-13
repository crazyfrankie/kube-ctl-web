<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.namespace" placeholder="Namespace" clearable class="filter-item" style="width: 200px" @change="handleNamespaceChange">
        <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      
      <el-input v-model="listQuery.keyword" placeholder="Search by name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-plus" @click="handleCreate">
        Create
      </el-button>
    </div>
    
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="Namespace" min-width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.namespace }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="Age" min-width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ formatKubeTimestamp(row.age) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" fixed="right" min-width="160" align="center">
        <template slot-scope="{row}">
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import waves from '@/directive/waves'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'ServiceAccountList',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      listLoading: true,
      listQuery: {
        namespace: '',
        keyword: ''
      },
      namespaceList: []
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces,
      serviceAccounts: state => state.serviceaccount.serviceAccounts || []
    })
  },
  created() {
    this.initData()
  },
  watch: {
    serviceAccounts: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true
    }
  },
  methods: {
    async initData() {
      this.listLoading = true
      try {
        await this.getNamespaceList()
      } catch (error) {
        console.error('Failed to initialize data:', error)
        this.$message.error('Failed to initialize data')
      } finally {
        this.listLoading = false
      }
    },
    async getNamespaceList() {
      try {
        const response = await this.$store.dispatch('pod/getNamespaces')
        this.namespaceList = response.data || []
        if (this.namespaceList.length > 0) {
          // If there's a namespace in the URL query params, use it
          const urlNamespace = this.$route.query.namespace
          this.listQuery.namespace = urlNamespace || this.namespaceList[0].name
          
          // Update URL query params to reflect current namespace
          if (this.listQuery.namespace && this.$route.query.namespace !== this.listQuery.namespace) {
            this.$router.replace({
              query: { namespace: this.listQuery.namespace }
            })
          }
          
          // Explicitly call getList after setting namespace
          await this.getList()
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
        throw error
      }
    },
    async getList() {
      if (!this.listQuery.namespace) return
      
      this.listLoading = true
      try {
        await this.$store.dispatch('serviceaccount/getServiceAccountList', this.listQuery)
        // List will be updated via the watcher
      } catch (error) {
        console.error('Failed to fetch ServiceAccount list:', error)
        this.$message.error('Failed to fetch ServiceAccount list')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.getList()
    },
    handleNamespaceChange() {
      this.getList()
      
      // Update URL query parameters when namespace changes
      if (this.listQuery.namespace) {
        this.$router.replace({
          query: { namespace: this.listQuery.namespace }
        })
      }
    },
    handleCreate() {
      this.$router.push({ 
        path: '/authority/serviceaccount-create',
        query: { namespace: this.listQuery.namespace } 
      })
    },
    handleDelete(row) {
      this.$confirm('This will permanently delete the ServiceAccount. Continue?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('serviceaccount/deleteServiceAccount', {
          namespace: row.namespace,
          name: row.name
        }).then(() => {
          this.$message({
            type: 'success',
            message: 'Delete completed'
          })
          this.getList()
        }).catch(err => {
          console.error(err)
          this.$message({
            type: 'error',
            message: 'Delete failed'
          })
        })
      }).catch(() => {
        // User canceled, do nothing
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
.filter-item {
  margin-right: 10px;
}
.link-type {
  color: #409EFF;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>