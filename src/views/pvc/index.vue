<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create PVC
      </el-button>
      <el-select v-model="currentNamespace" placeholder="Select namespace" @change="handleNamespaceChange">
        <el-option
          v-for="item in namespaces"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
    </div>

    <el-table
      v-loading="listLoading"
      :data="pvcList"
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
      <el-table-column label="Namespace">
        <template slot-scope="{row}">
          <span>{{ row.namespace }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)" size="medium">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Volume">
        <template slot-scope="{row}">
          <span>{{ row.volumeName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Capacity">
        <template slot-scope="{row}">
          <span>{{ row.capacity || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Access Modes">
        <template slot-scope="{row}">
          <span>{{ formatAccessModes(row.accessModes) }}</span>
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
  name: 'PVCIndex',
  data() {
    return {
      listLoading: false,
      currentNamespace: '',
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces || [],
      pvcList: state => state.pvc.pvcList
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
      await this.getPVCList()
    },
    async getPVCList() {
      this.listLoading = true
      try {
        await this.$store.dispatch('pvc/getPVCList', this.currentNamespace)
      } catch (error) {
        Message.error('Failed to fetch Persistent Volume Claims list')
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
        'Bound': 'success',
        'Pending': 'warning',
        'Lost': 'danger'
      }
      return statusMap[status] || 'info'
    },
    handleNamespaceChange() {
      this.getPVCList()
    },
    handleCreate() {
      this.$router.push('/volume/pvc-create')
    },
    async handleDelete(row) {
      try {
        await this.$confirm(
          `Are you sure you want to delete this PVC: ${row.name} in namespace ${row.namespace}?`,
          'Warning',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
        
        this.listLoading = true
        await this.$store.dispatch('pvc/deletePVC', {
          namespace: row.namespace,
          name: row.name
        })
        Message.success('Deleted successfully')
        // 确保删除后刷新列表
        await this.getPVCList()
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('Failed to delete PVC')
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