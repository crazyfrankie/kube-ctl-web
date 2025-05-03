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
        placeholder="Search ConfigMaps"
        style="width: 200px; margin-left: 10px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
        clearable
        @clear="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create ConfigMap
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="fetchData">
        Refresh
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="configMapList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Name" prop="name" min-width="180">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/volume/configmap-edit', query: { namespace: currentNamespace, name: row.name }}" class="link-type">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Namespace" prop="namespace" width="120" />
      <el-table-column label="Data Count" prop="dataNum" width="100" />
      <el-table-column label="Labels" min-width="180">
        <template slot-scope="{row}">
          <template v-if="row.labels && row.labels.length">
            <el-tag
              v-for="label in row.labels"
              :key="label.key"
              type="info"
              class="label-tag"
            >
              {{ label.key }}: {{ label.value }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Created" width="150">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.age) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="160" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">Edit</el-button>
          <el-button type="text" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="configMapList.length === 0 && !listLoading" class="empty-block">
      No ConfigMaps in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'ConfigMapList',
  data() {
    return {
      currentNamespace: '',
      keyword: '',
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces || [],
      configMapList: state => state.configmap.configMapList || []
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
        await this.$store.dispatch('configmap/getConfigMapList', {
          namespace: this.currentNamespace,
          keyword: this.keyword
        })
      } catch (error) {
        console.error('Failed to get ConfigMap list:', error)
        Message.error('Failed to get ConfigMap list')
      } finally {
        this.listLoading = false
      }
    },
    handleNamespaceChange() {
      this.keyword = ''
      this.$router.replace({
        query: { namespace: this.currentNamespace }
      })
      this.fetchData()
    },
    handleSearch() {
      this.fetchData()
    },
    handleCreate() {
      this.$router.push({
        path: '/volume/configmap-edit',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/volume/configmap-edit',
        query: {
          namespace: this.currentNamespace,
          name: row.name
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('This will permanently delete the ConfigMap. Continue?', 'Warning', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        this.listLoading = true
        await this.$store.dispatch('configmap/deleteConfigMap', {
          namespace: this.currentNamespace,
          name: row.name
        })
        Message.success('Deleted successfully')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete ConfigMap:', error)
          Message.error('Failed to delete')
        }
        this.listLoading = false
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      
      // timestamp is already the age in seconds, no need to subtract from current time
      const seconds = Number(timestamp)
      
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
.label-tag {
  margin-right: 6px;
  margin-bottom: 4px;
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