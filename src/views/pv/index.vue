<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create PV
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="pvList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Name" prop="name">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Capacity" prop="capacity" />
      <el-table-column label="Access Modes">
        <template slot-scope="{row}">
          <span>{{ formatAccessModes(row.accessModes) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Reclaim Policy">
        <template slot-scope="{row}">
          <span>{{ row.reclaimPolicy }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)" size="medium">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Claim">
        <template slot-scope="{row}">
          <span>{{ row.claim || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Storage Class">
        <template slot-scope="{row}">
          <span>{{ row.storageClass || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Age">
        <template slot-scope="{row}">
          <span>{{ formatKubeTimestamp(row.age) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'PVIndex',
  data() {
    return {
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      pvList: state => state.pv.pvList
    })
  },
  created() {
    this.getPVList()
  },
  methods: {
    async getPVList() {
      this.listLoading = true
      try {
        await this.$store.dispatch('pv/getPVList')
      } catch (error) {
        Message.error('Failed to fetch Persistent Volumes list')
      } finally {
        this.listLoading = false
      }
    },
    formatKubeTimestamp,
    formatAccessModes(accessModes) {
      if (!accessModes || accessModes.length === 0) return '-'
      return accessModes.join(', ')
    },
    getStatusType(status) {
      const statusMap = {
        'Available': 'success',
        'Bound': 'primary',
        'Released': 'warning',
        'Failed': 'danger',
        'Pending': 'info'
      }
      return statusMap[status] || 'info'
    },
    handleCreate() {
      this.$router.push('/volume/pv-create')
    },
    async handleDelete(row) {
      try {
        await this.$confirm(
          `Are you sure you want to delete this PV: ${row.name}?`,
          'Warning',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
        
        this.listLoading = true
        await this.$store.dispatch('pv/deletePV', row.name)
        Message.success('Deleted successfully')
        await this.getPVList() // 添加刷新PV列表的调用
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('Failed to delete PV')
        }
      } finally {
        this.listLoading = false
      }
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