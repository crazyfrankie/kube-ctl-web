<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.namespace"
        placeholder="Namespace"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="item in namespaceList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-input
        v-model="listQuery.keyword"
        placeholder="Search deployment name"
        style="width: 220px; margin-left: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleFilter"></el-button>
      </el-input>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        Create
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-refresh"
        @click="getList"
      >
        Refresh
      </el-button>
    </div>

    <el-card class="list-card">
      <div slot="header">
        <span>Deployment List</span>
      </div>
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        @sort-change="sortChange"
      >
        <el-table-column label="Name" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link :to="'/workload/deployment-edit?namespace=' + scope.row.namespace + '&name=' + scope.row.name" class="link-type">
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Timestamp from '@/components/Timestamp'
import waves from '@/directive/waves'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'DeploymentList',
  components: { Timestamp },
  directives: { waves },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        namespace: '',
        keyword: ''
      },
      namespaceList: []
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    this.initData()
  },
  watch: {
    'listQuery.namespace'() {
      this.getList()
      
      // Update URL query parameters when namespace changes
      if (this.listQuery.namespace) {
        this.$router.replace({
          query: { namespace: this.listQuery.namespace }
        })
      }
    },
    // Watch for route changes to handle returning from edit/create
    '$route'(to, from) {
      const toPath = to.path
      const fromPath = from ? from.path : ''
      
      if (toPath === '/workload/deployments') {
        // If returning from edit/create page, check if there's a namespace in the query
        if (from && (fromPath.includes('deployment-edit') || fromPath.includes('deployment-create'))) {
          const namespace = to.query.namespace || this.listQuery.namespace
          if (namespace && namespace !== this.listQuery.namespace) {
            this.listQuery.namespace = namespace
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
    getList() {
      this.listLoading = true
      this.$store.dispatch('deployment/getDeploymentList', this.listQuery).then(() => {
        this.list = this.$store.state.deployment.deployments
        this.listLoading = false
      }).catch(error => {
        console.error('Failed to fetch deployment list:', error)
        this.$message.error('Failed to fetch deployment list')
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.$router.push({ 
        path: '/workload/deployment-create',
        query: { namespace: this.listQuery.namespace } 
      })
    },
    handleUpdate(row) {
      this.$router.push({ 
        path: '/workload/deployment-edit', 
        query: { namespace: row.namespace, name: row.name }
      })
    },
    handleDelete(row) {
      this.$confirm('Confirm to delete the deployment?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('deployment/deleteDeployment', {
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
</style>