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
        v-model="searchPodName"
        placeholder="Search Pod"
        style="width: 200px; margin-left: 10px"
        class="filter-item"
        @keyup.enter.native="handleSearch"
        clearable
        @clear="handleSearchClear"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create Pod
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="podList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Name" prop="name">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/pod/detail', query: { namespace: currentNamespace, name: row.name }}">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Ready" prop="ready" />
      <el-table-column label="Status" prop="status">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)" size="medium">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Restarts" prop="restarts" />
      <el-table-column label="IP Address" prop="ip" />
      <el-table-column label="Node" prop="node" />
      <el-table-column label="Age">
        <template slot-scope="{row}">
          <timestamp :data="row.age" />
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">Edit</el-button>
          <el-button type="text" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Timestamp from '@/components/Timestamp'
import { Message } from 'element-ui'

export default {
  name: 'PodIndex',
  components: {
    Timestamp
  },
  data() {
    return {
      currentNamespace: '',
      searchPodName: '',
      podList: [],
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  created() {
    this.getNamespaces()
  },
  watch: {
    '$route': {
      handler(to, from) {
        const toNamespace = to.query.namespace
        const fromNamespace = from?.query?.namespace
        if (toNamespace && toNamespace !== this.currentNamespace) {
          this.currentNamespace = toNamespace
          this.getPodList()
        }
      },
      immediate: true
    }
  },
  methods: {
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        // 优先使用 URL 中的 namespace 参数
        const urlNamespace = this.$route.query.namespace
        if (urlNamespace) {
          this.currentNamespace = urlNamespace
        } else if (this.namespaces.length > 0) {
          this.currentNamespace = this.namespaces[0].name
        }
        this.getPodList()
      } catch (error) {
        Message.error('Failed to fetch namespace list')
      }
    },
    async getPodList() {
      if (!this.currentNamespace) return
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('pod/getPodList', this.currentNamespace)
        this.podList = response.data || []
      } catch (error) {
        Message.error('Failed to fetch Pod list')
      } finally {
        this.listLoading = false
      }
    },
    async handleSearch() {
      if (!this.searchPodName.trim()) {
        return this.getPodList()
      }
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('pod/searchPod', {
          namespace: this.currentNamespace,
          name: this.searchPodName.trim()
        })
        if (response.data) {
          this.podList = Array.isArray(response.data) ? response.data : [response.data]
        } else {
          this.podList = []
        }
      } catch (error) {
        Message.error('Failed to search Pods')
        this.podList = []
      } finally {
        this.listLoading = false
      }
    },
    handleSearchClear() {
      this.getPodList()
    },
    handleNamespaceChange() {
      this.searchPodName = ''
      this.$router.replace({
        query: { namespace: this.currentNamespace }
      })
      this.getPodList()
    },
    handleCreate() {
      this.$router.push({
        path: '/pod/create',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/pod/create',
        query: {
          namespace: this.currentNamespace,
          name: row.name,
          edit: 'true'
        }
      })
    },
    async handleDelete(row) {
      try {
        const confirmResult = await this.$confirm(
          'Are you sure you want to delete this Pod?',
          'Warning',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
        
        this.listLoading = true
        await this.$store.dispatch('pod/deletePod', {
          namespace: this.currentNamespace,
          name: row.name
        })
        
        // Start polling to check if the Pod has been deleted
        let retryCount = 0
        const maxRetries = 10 // Maximum of 10 retries
        
        const checkPodDeleted = async () => {
          try {
            const response = await this.$store.dispatch('pod/getPodList', {
              namespace: this.currentNamespace
            })
            const podStillExists = (response.data || []).some(pod => pod.name === row.name)
            
            if (!podStillExists) {
              this.listLoading = false
              Message.success('Deleted successfully')
              this.podList = response.data || []
              return
            }
            
            retryCount++
            if (retryCount < maxRetries) {
              setTimeout(checkPodDeleted, 2000) // Check every 2 seconds
            } else {
              this.listLoading = false
              Message.warning('Pod is being deleted, please refresh later to check')
              await this.getPodList() // Refresh the list one last time
            }
          } catch (error) {
            this.listLoading = false
            Message.error('Failed to fetch Pod list')
          }
        }
        
        await checkPodDeleted()
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('Failed to delete Pod')
        }
        this.listLoading = false
      }
    },
    getStatusType(status) {
      const statusMap = {
        'Running': 'success',
        'Pending': 'warning',
        'Failed': 'danger',
        'Unknown': 'info',
        'Succeeded': 'success',
        'CrashLoopBackOff': 'danger',
        'Error': 'danger',
        'Terminating': 'warning'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  padding-bottom: 20px;
}

.el-tag {
  text-align: center;
  width: 100px;
}
</style>
