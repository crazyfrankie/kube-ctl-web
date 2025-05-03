<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="nodeName" />
      <el-button type="primary" @click="handleRefresh" icon="el-icon-refresh">Refresh</el-button>
    </div>
    
    <el-card class="box-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>Basic Information</span>
      </div>
      <el-form label-width="140px" class="detail-form">
        <el-form-item label="Name">
          <span>{{ nodeDetail.name }}</span>
        </el-form-item>
        <el-form-item label="Status">
          <el-tag :type="getStatusType(nodeDetail.status)">{{ nodeDetail.status }}</el-tag>
        </el-form-item>
        <el-form-item label="Kubernetes Version">
          <span>{{ nodeDetail.version }}</span>
        </el-form-item>
        <el-form-item label="Internal IP">
          <span>{{ nodeDetail.internalIP }}</span>
        </el-form-item>
        <el-form-item label="External IP">
          <span>{{ nodeDetail.externalIP || '-' }}</span>
        </el-form-item>
        <el-form-item label="OS Image">
          <span>{{ nodeDetail.OSImage }}</span>
        </el-form-item>
        <el-form-item label="Kernel Version">
          <span>{{ nodeDetail.kernelVersion }}</span>
        </el-form-item>
        <el-form-item label="Container Runtime">
          <span>{{ nodeDetail.containerRuntime }}</span>
        </el-form-item>
        <el-form-item label="Created">
          <span>{{ formatTime(nodeDetail.age) }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>Label Management</span>
      </div>
      <div class="button-container">
        <el-button type="primary" size="small" @click="addLabel">Add Label</el-button>
        <el-button type="success" size="small" @click="saveLabels" :disabled="!labelsChanged">Save Changes</el-button>
      </div>
      <div v-if="nodeDetail.labels && nodeDetail.labels.length" class="tags-container">
        <el-tag
          v-for="(label, index) in nodeDetail.labels"
          :key="index"
          closable
          @close="removeLabel(index)"
          class="label-tag"
        >
          {{ label.key }}: {{ label.value }}
        </el-tag>
      </div>
      <div v-else class="empty-block">
        No labels set
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>Taint Management</span>
      </div>
      <div class="button-container">
        <el-button type="primary" size="small" @click="addTaint">Add Taint</el-button>
        <el-button type="success" size="small" @click="saveTaints" :disabled="!taintsChanged">Save Changes</el-button>
      </div>
      <el-table v-if="nodeDetail.taints && nodeDetail.taints.length" :data="nodeDetail.taints" border style="width: 100%">
        <el-table-column prop="key" label="Key" min-width="180" />
        <el-table-column prop="value" label="Value" min-width="180">
          <template slot-scope="scope">
            {{ scope.row.value || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="effect" label="Effect" min-width="180" />
        <el-table-column label="Actions" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="removeTaint(scope.$index)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-block">
        No taints set
      </div>
    </el-card>

    <!-- Label Dialog -->
    <el-dialog title="Add Label" :visible.sync="labelDialogVisible" width="500px">
      <el-form :model="labelForm" label-width="80px">
        <el-form-item label="Key" required>
          <el-input v-model="labelForm.key" placeholder="Enter label key"></el-input>
        </el-form-item>
        <el-form-item label="Value" required>
          <el-input v-model="labelForm.value" placeholder="Enter label value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="labelDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmAddLabel">Confirm</el-button>
      </div>
    </el-dialog>

    <!-- Taint Dialog -->
    <el-dialog title="Add Taint" :visible.sync="taintDialogVisible" width="500px">
      <el-form :model="taintForm" label-width="80px">
        <el-form-item label="Key" required>
          <el-input v-model="taintForm.key" placeholder="Enter taint key"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="taintForm.value" placeholder="Enter taint value"></el-input>
        </el-form-item>
        <el-form-item label="Effect" required>
          <el-select v-model="taintForm.effect" placeholder="Select effect" style="width: 100%">
            <el-option label="NoSchedule" value="NoSchedule"></el-option>
            <el-option label="PreferNoSchedule" value="PreferNoSchedule"></el-option>
            <el-option label="NoExecute" value="NoExecute"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="taintDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmAddTaint">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'NodeEdit',
  data() {
    return {
      nodeName: '',
      loading: false,
      labelDialogVisible: false,
      taintDialogVisible: false,
      labelForm: {
        key: '',
        value: ''
      },
      taintForm: {
        key: '',
        value: '',
        effect: 'NoSchedule'
      },
      originalLabels: [],
      originalTaints: []
    }
  },
  computed: {
    ...mapState({
      nodeDetail: state => state.node.currentNode || { labels: [], taints: [] }
    }),
    labelsChanged() {
      if (!this.nodeDetail.labels || !this.originalLabels) return false
      
      // First check if lengths are different
      if (this.nodeDetail.labels.length !== this.originalLabels.length) return true
      
      // Deep comparison
      return JSON.stringify(this.nodeDetail.labels) !== JSON.stringify(this.originalLabels)
    },
    taintsChanged() {
      if (!this.nodeDetail.taints || !this.originalTaints) return false
      
      // First check if lengths are different
      if (this.nodeDetail.taints.length !== this.originalTaints.length) return true
      
      // Deep comparison
      return JSON.stringify(this.nodeDetail.taints) !== JSON.stringify(this.originalTaints)
    }
  },
  created() {
    this.fetchNodeDetail()
  },
  methods: {
    async fetchNodeDetail() {
      const name = this.$route.query.name
      if (!name) {
        Message.error('Parameter error')
        return
      }
      this.nodeName = name
      this.loading = true
      try {
        await this.$store.dispatch('node/getNodeDetail', { name })
        if (this.nodeDetail.labels) {
          this.originalLabels = JSON.parse(JSON.stringify(this.nodeDetail.labels))
        }
        if (this.nodeDetail.taints) {
          this.originalTaints = JSON.parse(JSON.stringify(this.nodeDetail.taints))
        }
      } catch (error) {
        console.error('Failed to get node details:', error)
        Message.error('Failed to get node details')
      } finally {
        this.loading = false
      }
    },
    handleRefresh() {
      this.fetchNodeDetail()
    },
    // Label related methods
    addLabel() {
      this.labelForm = { key: '', value: '' }
      this.labelDialogVisible = true
    },
    confirmAddLabel() {
      if (!this.labelForm.key || !this.labelForm.value) {
        Message.warning('Please fill in complete label information')
        return
      }
      
      // Check if a label with the same key already exists
      const existingIndex = this.nodeDetail.labels.findIndex(label => label.key === this.labelForm.key)
      if (existingIndex !== -1) {
        // If it exists, replace it
        this.nodeDetail.labels.splice(existingIndex, 1, { ...this.labelForm })
      } else {
        // If it doesn't exist, add a new label
        this.nodeDetail.labels.push({ ...this.labelForm })
      }
      
      this.labelDialogVisible = false
    },
    removeLabel(index) {
      this.nodeDetail.labels.splice(index, 1)
    },
    async saveLabels() {
      try {
        this.loading = true
        await this.$store.dispatch('node/updateNodeLabel', {
          name: this.nodeName,
          labels: this.nodeDetail.labels
        })
        this.originalLabels = JSON.parse(JSON.stringify(this.nodeDetail.labels))
        Message.success('Labels updated successfully')
      } catch (error) {
        console.error('Failed to update labels:', error)
        Message.error('Failed to update labels')
      } finally {
        this.loading = false
      }
    },
    // Taint related methods
    addTaint() {
      this.taintForm = { key: '', value: '', effect: 'NoSchedule' }
      this.taintDialogVisible = true
    },
    confirmAddTaint() {
      if (!this.taintForm.key || !this.taintForm.effect) {
        Message.warning('Please fill in complete taint information')
        return
      }
      
      // Check if a taint with the same key and effect already exists
      const existingIndex = this.nodeDetail.taints.findIndex(
        taint => taint.key === this.taintForm.key && taint.effect === this.taintForm.effect
      )
      if (existingIndex !== -1) {
        // If it exists, replace it
        this.nodeDetail.taints.splice(existingIndex, 1, { ...this.taintForm })
      } else {
        // If it doesn't exist, add a new taint
        this.nodeDetail.taints.push({ ...this.taintForm })
      }
      
      this.taintDialogVisible = false
    },
    removeTaint(index) {
      this.nodeDetail.taints.splice(index, 1)
    },
    async saveTaints() {
      try {
        this.loading = true
        await this.$store.dispatch('node/updateNodeTaint', {
          name: this.nodeName,
          taints: this.nodeDetail.taints
        })
        this.originalTaints = JSON.parse(JSON.stringify(this.nodeDetail.taints))
        Message.success('Taints updated successfully')
      } catch (error) {
        console.error('Failed to update taints:', error)
        Message.error('Failed to update taints')
      } finally {
        this.loading = false
      }
    },
    getStatusType(status) {
      const statusMap = {
        'Ready': 'success',
        'NotReady': 'danger',
        'SchedulingDisabled': 'warning',
        'Unknown': 'info'
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
    },
    goBack() {
      this.$router.push('/node/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.box-card {
  margin-bottom: 20px;
}
.button-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
}
.label-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.empty-block {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.detail-form {
  .el-form-item {
    margin-bottom: 18px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>