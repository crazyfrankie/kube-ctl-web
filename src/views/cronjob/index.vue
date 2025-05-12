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
        placeholder="Search cronjob name"
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

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      style="width: 100%"
    >
      <el-table-column label="Name" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <router-link :to="'/workload/cronjob-edit?namespace=' + scope.row.namespace + '&name=' + scope.row.name" class="link-type">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Namespace" min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.namespace }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Schedule" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.schedule }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Suspend" min-width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.suspend ? 'danger' : 'success'">
            {{ scope.row.suspend ? 'Yes' : 'No' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Active" min-width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.active }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Schedule" min-width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.lastSchedule ? formatKubeTimestamp(scope.row.lastSchedule) : 'Never' }}</span>
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

    <div v-if="list && list.length === 0 && !listLoading" class="empty-block">
      No CronJobs in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Timestamp from '@/components/Timestamp'
import waves from '@/directive/waves'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'CronJobList',
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
      cronjobs: state => state.cronjob.cronjobs || []
    })
  },
  created() {
    this.initData()
  },
  watch: {
    cronjobs: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true
    },
    // Watch for route changes to handle returning from edit/create
    '$route'(to, from) {
      const toPath = to.path
      const fromPath = from ? from.path : ''
      
      if (toPath === '/workload/cronjobs') {
        // If returning from edit/create page, check if there's a namespace in the query
        if (from && (fromPath.includes('cronjob-edit') || fromPath.includes('cronjob-create'))) {
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
        await this.$store.dispatch('cronjob/getCronJobList', this.listQuery)
        // List will be updated via the watcher
      } catch (error) {
        console.error('Failed to fetch cronjob list:', error)
        this.$message.error('Failed to fetch cronjob list')
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
        path: '/workload/cronjob-create',
        query: { namespace: this.listQuery.namespace } 
      })
    },
    handleUpdate(row) {
      this.$router.push({ 
        path: '/workload/cronjob-edit', 
        query: { namespace: row.namespace, name: row.name }
      })
    },
    handleDelete(row) {
      this.$confirm('Confirm to delete the cronjob?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('cronjob/deleteCronJob', {
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
</style>