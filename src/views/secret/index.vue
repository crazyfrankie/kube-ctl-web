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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create Secret
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="fetchData">
        Refresh
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="secretList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Name" prop="name">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/volume/secret-edit', query: { namespace: currentNamespace, name: row.name }}">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Namespace" prop="namespace" />
      <el-table-column label="Type" prop="type" />
      <el-table-column label="Data Count" prop="dataCount" />
      <el-table-column label="Created">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.age) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">Edit</el-button>
          <el-button type="text" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="secretList.length === 0 && !listLoading" class="empty-block">
      No secrets in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'SecretList',
  data() {
    return {
      currentNamespace: '',
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces || [],
      secretList: state => state.secret.secretList || []
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
          this.currentNamespace = urlNamespace || this.namespaces[0].name
          this.fetchData()
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        Message.error('Failed to get namespace list')
      }
    },
    async fetchData() {
      if (!this.currentNamespace) return
      
      this.listLoading = true
      try {
        await this.$store.dispatch('secret/getSecretList', {
          namespace: this.currentNamespace
        })
      } catch (error) {
        console.error('Failed to get Secret list:', error)
        Message.error('Failed to get Secret list')
      } finally {
        this.listLoading = false
      }
    },
    handleNamespaceChange() {
      this.$router.replace({
        query: { namespace: this.currentNamespace }
      })
      this.fetchData()
    },
    handleCreate() {
      this.$router.push({
        path: '/volume/secret-edit',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/volume/secret-edit',
        query: {
          namespace: this.currentNamespace,
          name: row.name
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('This will permanently delete the Secret. Continue?', 'Warning', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        this.listLoading = true
        await this.$store.dispatch('secret/deleteSecret', {
          namespace: this.currentNamespace,
          name: row.name
        })
        Message.success('Deleted successfully')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete Secret:', error)
          Message.error('Failed to delete Secret')
        }
        this.listLoading = false
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      
      const seconds = timestamp
      
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