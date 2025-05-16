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
        placeholder="Search Services"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleSearch"
        clearable
        @clear="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create Service
      </el-button>
    </div>

    <el-card class="list-card">
      <div slot="header">
        <span>Service List</span>
      </div>
      <el-table :data="serviceList" border v-loading="listLoading" element-loading-text="Loading...">
        <el-table-column prop="name" label="Name" min-width="120">
          <template slot-scope="{row}">
            <router-link :to="{path:'/network/service-detail', query: {name: row.name, namespace: currentNamespace}}" class="link-type">
              <span>{{ row.name }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="namespace" label="Namespace" min-width="120" />
        <el-table-column prop="type" label="Type" min-width="100" />
        <el-table-column prop="clusterIP" label="Cluster IP" min-width="150" />
        <el-table-column label="External IP" min-width="180">
          <template slot-scope="{row}">
            <template v-if="row.externalIP && row.externalIP.length">
              {{ row.externalIP.join(', ') }}
            </template>
            <template v-else>
              -
            </template>
          </template>
        </el-table-column>
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
    </el-card>

    <div v-if="serviceList.length === 0 && !listLoading" class="empty-block">
      No services in this namespace
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'ServiceList',
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
      serviceList: state => state.service.serviceList || []
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
        await this.$store.dispatch('service/getServiceList', {
          namespace: this.currentNamespace,
          keyword: this.keyword
        })
      } catch (error) {
        console.error('Failed to get Service list:', error)
        Message.error('Failed to get Service list')
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
        path: '/network/service-create',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/network/service-edit',
        query: {
          namespace: this.currentNamespace,
          name: row.name
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('This will permanently delete the Service. Continue?', 'Warning', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        this.listLoading = true
        await this.$store.dispatch('service/deleteService', {
          namespace: this.currentNamespace,
          name: row.name
        })
        Message.success('Deleted successfully')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete Service:', error)
          Message.error('Failed to delete')
        }
        this.listLoading = false
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