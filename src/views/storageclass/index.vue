<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        Create StorageClass
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="storageClassList"
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
      <el-table-column label="Provisioner" prop="provisioner" />
      <el-table-column label="Reclaim Policy">
        <template slot-scope="{row}">
          <span>{{ row.reclaimPolicy }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Volume Binding Mode">
        <template slot-scope="{row}">
          <span>{{ row.volumeBindingMode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Allow Volume Expansion">
        <template slot-scope="{row}">
          <el-tag :type="row.allowVolumeExpansion ? 'success' : 'info'">
            {{ row.allowVolumeExpansion ? 'Yes' : 'No' }}
          </el-tag>
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
  name: 'StorageClassIndex',
  data() {
    return {
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      storageClassList: state => state.storageclass.storageClassList
    })
  },
  created() {
    this.getStorageClassList()
  },
  methods: {
    async getStorageClassList() {
      this.listLoading = true
      try {
        await this.$store.dispatch('storageclass/getStorageClassList')
      } catch (error) {
        Message.error('Failed to fetch StorageClass list')
      } finally {
        this.listLoading = false
      }
    },
    formatKubeTimestamp,
    handleCreate() {
      this.$router.push('/volume/storageclass-create')
    },
    async handleDelete(row) {
      try {
        await this.$confirm(
          `Are you sure you want to delete this StorageClass: ${row.name}?`,
          'Warning',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
        
        this.listLoading = true
        await this.$store.dispatch('storageclass/deleteStorageClass', row.name)
        Message.success('StorageClass deleted successfully')
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('Failed to delete StorageClass')
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