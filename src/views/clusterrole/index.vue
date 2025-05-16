<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="Search by name"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="fetchData">
        Refresh
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="clusterRoleList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="Name" min-width="180">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">
            <svg-icon icon-class="clusterrole" class-name="table-icon" />
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column label="Created" width="180">
        <template slot-scope="{row}">
          <span>{{ formatKubeTimestamp(row.age) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="warning" size="mini" @click="handleEdit(row)">
            Edit
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { formatKubeTimestamp } from '@/utils'
import { getRoleList, deleteRole } from '@/api/role'

export default {
  name: 'ClusterRoleList',
  data() {
    return {
      listQuery: {
        keyword: ''
      },
      listLoading: true,
      clusterRoleList: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    formatKubeTimestamp,
    async fetchData() {
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('clusterrole/getClusterRoles', this.listQuery.keyword)
        this.clusterRoleList = response || []
        console.log('ClusterRole list:', this.clusterRoleList)
      } catch (error) {
        console.error('Failed to fetch ClusterRole list:', error)
        this.$message.error(error.message || 'Failed to fetch ClusterRole list')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.fetchData()
    },
    handleDetail(row) {
      this.$router.push({ 
        path: '/authority/clusterrole-detail', 
        query: { name: row.name }
      })
    },
    handleEdit(row) {
      this.$router.push({ path: '/authority/clusterrole-edit', query: { name: row.name }})
    },
    handleDelete(row) {
      this.$confirm('This will permanently delete the ClusterRole. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        return deleteRole('', row.name) // 传空字符串作为namespace
      }).then(() => {
        this.fetchData()
        this.$message({
          type: 'success',
          message: 'Delete successful!'
        })
      }).catch(err => {
        if (err !== 'cancel') {
          Message.error('Failed to delete ClusterRole')
        }
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 20px;
}
.table-icon {
  margin-right: 8px;
  font-size: 16px;
  vertical-align: middle;
}
.link-type {
  color: #409EFF;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>