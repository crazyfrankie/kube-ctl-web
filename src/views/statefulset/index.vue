<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="currentNamespace" placeholder="Select namespace" @change="handleNamespaceChange">
        <el-option
          v-for="item in namespaces"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="Search StatefulSets"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
        clearable
        @clear="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create StatefulSet
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-refresh" @click="fetchData">
        Refresh
      </el-button>
    </div>

    <el-card class="list-card">
      <div slot="header">
        <span>StatefulSet List</span>
      </div>
      <el-table
        v-loading="listLoading"
        :data="statefulSetList"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Name" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link :to="'/workload/statefulset-edit?namespace=' + scope.row.namespace + '&name=' + scope.row.name" class="link-type">
              <span>{{ scope.row.name }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Namespace" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.namespace }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Replicas" min-width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.replicas }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ready" min-width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.ready }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Up-to-Date" min-width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.upToDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Available" min-width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.available }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Age" min-width="100" align="center">
          <template slot-scope="scope">
            <span>{{ formatKubeTimestamp(scope.row.age) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" min-width="160" align="center">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              Edit
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div v-if="statefulSetList && statefulSetList.length === 0 && !listLoading" class="empty-block">
      No StatefulSets in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Timestamp from '@/components/Timestamp'
import waves from '@/directive/waves'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'StatefulSetList',
  components: { Timestamp },
  directives: { waves },
  data() {
    return {
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
      statefulsets: state => state.statefulset.statefulsets || []
    })
  },
  created() {
    this.initData()
  },
  watch: {
    statefulsets: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true
    },
    // Watch for route changes to handle returning from edit/create
    '$route'(to, from) {
      const toPath = to.path
      const fromPath = from ? from.path : ''
      
      if (toPath === '/workload/statefulsets') {
        // If returning from edit/create page, check if there's a namespace in the query
        if (from && (fromPath.includes('statefulset-edit') || fromPath.includes('statefulset-create'))) {
          const namespace = to.query.namespace || this.listQuery.namespace
          if (namespace && namespace !== this.listQuery.namespace) {
            this.listQuery.namespace = namespace
            this.getList()
          }
        }
      }
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
        await this.$store.dispatch('statefulset/getStatefulSetList', this.listQuery)
        // List will be updated via the watcher
      } catch (error) {
        console.error('Failed to fetch statefulset list:', error)
        this.$message.error('Failed to fetch statefulset list')
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
        path: '/workload/statefulset-create',
        query: { namespace: this.listQuery.namespace } 
      })
    },
    handleUpdate(row) {
      this.$router.push({ 
        path: '/workload/statefulset-edit', 
        query: { namespace: row.namespace, name: row.name }
      })
    },
    handleDelete(row) {
      this.$confirm('Confirm to delete the statefulset?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('statefulset/deleteStatefulSet', {
          namespace: row.namespace,
          name: row.name
        }).then(() => {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        this.$notify({
          title: 'Info',
          message: 'Delete Canceled',
          type: 'info',
          duration: 2000
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'age') {
        this.sortByAge(order)
      }
    },
    sortByAge(order) {
      if (order === 'ascending') {
        this.list = this.list.sort((a, b) => a.age - b.age)
      } else {
        this.list = this.list.sort((a, b) => b.age - a.age)
      }
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
.list-card {
  margin-top: 20px;
}
</style>