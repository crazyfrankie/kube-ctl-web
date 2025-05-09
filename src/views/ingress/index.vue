<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.namespace"
        placeholder="Namespace"
        style="width: 200px"
        class="filter-item"
        @change="handleNamespaceChange"
      >
        <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <el-input
        v-model="listQuery.keyword"
        placeholder="Search Ingress"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        Create
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="success"
        icon="el-icon-refresh"
        @click="getList"
      >
        Refresh
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading..."
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="Name" width="220">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Namespace" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.namespace }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Hosts">
        <template slot-scope="scope">
          <span>{{ scope.row.hosts || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Class" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.class || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Age" width="120">
        <template slot-scope="scope">
          <timestamp :timestamp="scope.row.age" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">Edit</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Timestamp from '@/components/Timestamp'

export default {
  name: 'IngressList',
  components: {
    Timestamp
  },
  data() {
    return {
      list: [],
      listLoading: true,
      listQuery: {
        namespace: '',
        keyword: ''
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      await this.getNamespaces()
      // If namespace is in URL query, use it
      if (this.$route.query.namespace) {
        this.listQuery.namespace = this.$route.query.namespace
      } else if (this.namespaces && this.namespaces.length > 0) {
        // Otherwise use first namespace in list
        this.listQuery.namespace = this.namespaces[0].name
      }
      this.getList()
    },
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
      }
    },
    async getList() {
      if (!this.listQuery.namespace) return
      
      this.listLoading = true
      try {
        await this.$store.dispatch('ingress/getIngressList', {
          namespace: this.listQuery.namespace,
          keyword: this.listQuery.keyword
        })
        this.list = this.$store.state.ingress.ingressList
      } catch (error) {
        console.error('Failed to get ingress list:', error)
        this.$message.error('Failed to fetch ingress list')
      } finally {
        this.listLoading = false
      }
    },
    handleNamespaceChange() {
      this.getList()
      // Update URL query parameters
      this.$router.push({
        path: '/network/ingresses',
        query: { namespace: this.listQuery.namespace }
      })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.$router.push({
        path: '/network/ingress-create',
        query: { namespace: this.listQuery.namespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/network/ingress-edit',
        query: {
          name: row.name,
          namespace: row.namespace
        }
      })
    },
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this ingress?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('ingress/deleteIngress', {
          name: row.name,
          namespace: row.namespace
        }).then(() => {
          this.$message({
            type: 'success',
            message: 'Ingress deleted successfully!'
          })
          this.getList()
        }).catch(err => {
          console.error(err)
          this.$message.error('Failed to delete ingress')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    }
  }
}
</script>