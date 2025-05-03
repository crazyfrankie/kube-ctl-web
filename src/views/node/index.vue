<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="keyword"
        placeholder="Search nodes"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
        clearable
        @clear="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="fetchData">
        Refresh
      </el-button>
    </div>
    
    <el-table
      v-loading="listLoading"
      :data="nodeList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Name" min-width="180">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/node/edit', query: { name: row.name }}" class="link-type">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Status" prop="status" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Kubernetes Version" prop="version" min-width="120" />
      <el-table-column label="Internal IP" prop="internalIP" min-width="120" />
      <el-table-column label="External IP" prop="externalIP" min-width="120">
        <template slot-scope="{row}">
          {{ row.externalIP || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="OS Image" min-width="180">
        <template slot-scope="{row}">
          <span>{{ row.OSImage }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Container Runtime" prop="containerRuntime" min-width="120" />
      <el-table-column label="Created">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.age) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="160" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">Edit</el-button>
          <el-button type="text" @click="viewPods(row)">View Pods</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Node Pod list dialog -->
    <el-dialog :title="`Pods on Node '${currentNodeName}'`" :visible.sync="podsDialogVisible" width="80%">
      <div v-if="podListLoading" v-loading="true" element-loading-text="Loading"></div>
      <div v-else>
        <el-select v-model="selectedNamespace" placeholder="Select namespace" @change="handleNamespaceChange">
          <el-option
            v-for="item in namespaces"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
        
        <el-table :data="nodePods" border style="width: 100%; margin-top: 15px;">
          <el-table-column prop="name" label="Name" min-width="180" />
          <el-table-column prop="ready" label="Ready" width="80" />
          <el-table-column prop="status" label="Status" width="100">
            <template slot-scope="{row}">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="restarts" label="Restarts" width="100" />
          <el-table-column prop="ip" label="IP Address" min-width="140" />
          <el-table-column label="Age">
            <template slot-scope="{row}">
              <span>{{ formatTime(row.age) }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="nodePods.length === 0" class="empty-block">
          No pods running on this node
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'NodeList',
  data() {
    return {
      keyword: '',
      listLoading: false,
      podsDialogVisible: false,
      podListLoading: false,
      currentNodeName: '',
      selectedNamespace: 'default'
    }
  },
  computed: {
    ...mapState({
      nodeList: state => state.node.nodeList || [],
      nodePods: state => state.node.nodePods || [],
      namespaces: state => state.pod.namespaces || []
    })
  },
  created() {
    this.getNamespaces()
    this.fetchData()
  },
  methods: {
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
      } catch (error) {
        Message.error('Failed to get namespace list')
      }
    },
    async fetchData() {
      this.listLoading = true
      try {
        await this.$store.dispatch('node/getNodeList', {
          keyword: this.keyword
        })
      } catch (error) {
        console.error('Failed to get node list:', error)
        Message.error('Failed to get node list')
      } finally {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.fetchData()
    },
    handleEdit(row) {
      this.$router.push({
        path: '/node/edit',
        query: { name: row.name }
      })
    },
    async viewPods(row) {
      this.currentNodeName = row.name
      this.selectedNamespace = this.namespaces.length > 0 ? this.namespaces[0].name : 'default'
      this.podsDialogVisible = true
      await this.fetchNodePods()
    },
    async fetchNodePods() {
      this.podListLoading = true
      try {
        await this.$store.dispatch('node/getNodePods', {
          namespace: this.selectedNamespace,
          node: this.currentNodeName
        })
      } catch (error) {
        console.error('Failed to get pod list:', error)
        Message.error('Failed to get pod list')
      } finally {
        this.podListLoading = false
      }
    },
    handleNamespaceChange() {
      this.fetchNodePods()
    },
    getStatusType(status) {
      const statusMap = {
        'Ready': 'success',
        'NotReady': 'danger',
        'SchedulingDisabled': 'warning',
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
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      
      const seconds = Math.floor((Date.now() / 1000) - timestamp)
      
      if (seconds < 60) return `${seconds}s`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
      if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`
      if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo`
      
      return `${Math.floor(seconds / 31536000)}y`
    }
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