<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Create Storage Class</span>
      </div>
      <el-form ref="form" :model="form" label-width="180px" :rules="rules">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="StorageClass name"></el-input>
        </el-form-item>
        
        <el-form-item label="Provisioner" prop="provisioner">
          <el-input v-model="form.provisioner" placeholder="Provisioner (e.g. kubernetes.io/no-provisioner)"></el-input>
        </el-form-item>
        
        <el-form-item label="Reclaim Policy" prop="reclaimPolicy">
          <el-select v-model="form.reclaimPolicy" placeholder="Select reclaim policy">
            <el-option label="Delete" value="Delete"></el-option>
            <el-option label="Retain" value="Retain"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Volume Binding Mode" prop="volumeBindingMode">
          <el-select v-model="form.volumeBindingMode" placeholder="Select volume binding mode">
            <el-option label="Immediate" value="Immediate"></el-option>
            <el-option label="WaitForFirstConsumer" value="WaitForFirstConsumer"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Allow Volume Expansion">
          <el-switch v-model="form.allowVolumeExpansion"></el-switch>
        </el-form-item>
        
        <el-form-item label="Parameters">
          <dynamic-item v-model="form.parameters" item-key="key" item-value="value"></dynamic-item>
        </el-form-item>
        
        <el-form-item label="Mount Options">
          <div v-for="(option, index) in form.mountOptions" :key="index" style="margin-bottom: 10px; display: flex;">
            <el-input v-model="form.mountOptions[index]" placeholder="Mount option" style="width: 400px;"></el-input>
            <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeMountOption(index)" style="margin-left: 10px;"></el-button>
          </div>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="addMountOption">Add Mount Option</el-button>
        </el-form-item>
        
        <el-form-item label="Labels">
          <dynamic-item v-model="form.labels" item-key="key" item-value="value"></dynamic-item>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="submitting">Create</el-button>
          <el-button @click="goBack">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import DynamicItem from '@/components/DynamicItem'

export default {
  name: 'CreateStorageClass',
  components: { DynamicItem },
  data() {
    return {
      submitting: false,
      form: {
        name: '',
        provisioner: '',
        reclaimPolicy: 'Delete',
        volumeBindingMode: 'Immediate',
        allowVolumeExpansion: false,
        parameters: [],
        mountOptions: [],
        labels: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input StorageClass name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        provisioner: [
          { required: true, message: 'Please input provisioner', trigger: 'blur' }
        ],
        reclaimPolicy: [
          { required: true, message: 'Please select reclaim policy', trigger: 'change' }
        ],
        volumeBindingMode: [
          { required: true, message: 'Please select volume binding mode', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    goBack() {
      this.$router.push('/volume/storageclasses')
    },
    addMountOption() {
      this.form.mountOptions.push('')
    },
    removeMountOption(index) {
      this.form.mountOptions.splice(index, 1)
    },
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        const storageClassData = {
          name: this.form.name,
          provisioner: this.form.provisioner,
          reclaimPolicy: this.form.reclaimPolicy,
          volumeBindingMode: this.form.volumeBindingMode,
          allowVolumeExpansion: this.form.allowVolumeExpansion,
          parameters: this.form.parameters.length > 0 ? this.form.parameters : [],
          mountOptions: this.form.mountOptions.filter(option => option.trim() !== ''),
          labels: this.form.labels.length > 0 ? this.form.labels : []
        }
        
        await this.$store.dispatch('storageclass/createStorageClass', storageClassData)
        Message.success('Storage Class created successfully')
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          Message.error('Failed to create Storage Class')
          console.error(error)
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>