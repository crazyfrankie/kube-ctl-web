<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Create Persistent Volume Claim</span>
      </div>
      <el-form ref="form" :model="form" label-width="150px" :rules="rules">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="PVC name"></el-input>
        </el-form-item>

        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="currentNamespace" placeholder="Select namespace">
            <el-option 
              v-for="item in namespaces" 
              :key="item.name" 
              :label="item.name" 
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Capacity" prop="capacity">
          <div class="capacity-input-container">
            <el-input-number 
              v-model="form.capacityValue" 
              :min="1" 
              :step="1"
              @keydown.tab.native.prevent="iterateCapacity"
            ></el-input-number>
            <el-select v-model="form.capacityUnit" style="width: 80px; margin-left: 10px;">
              <el-option label="Gi" value="Gi"></el-option>
              <el-option label="Mi" value="Mi"></el-option>
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="Access Modes" prop="accessModes">
          <el-checkbox-group v-model="form.accessModes">
            <el-checkbox label="ReadWriteOnce">ReadWriteOnce</el-checkbox>
            <el-checkbox label="ReadOnlyMany">ReadOnlyMany</el-checkbox>
            <el-checkbox label="ReadWriteMany">ReadWriteMany</el-checkbox>
            <el-checkbox label="ReadWriteOncePod">ReadWriteOncePod</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Storage Class" prop="storageClass">
          <el-input v-model="form.storageClass" placeholder="Storage class name"></el-input>
        </el-form-item>

        <el-form-item label="Volume Mode" prop="volumeMode">
          <el-radio-group v-model="form.volumeMode">
            <el-radio label="Filesystem">Filesystem</el-radio>
            <el-radio label="Block">Block</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="Volume Name" prop="volumeName">
          <el-input v-model="form.volumeName" placeholder="Optional: bind to a specific PV"></el-input>
        </el-form-item>

        <el-form-item label="Selector">
          <dynamic-item v-model="form.selector" item-key="key" item-value="value"></dynamic-item>
          <div class="help-text" style="font-size: 12px; color: #909399; margin-top: 5px;">
            Optional: Select PersistentVolumes with matching labels
          </div>
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
import { mapState } from 'vuex'

export default {
  name: 'CreatePVC',
  components: { DynamicItem },
  data() {
    return {
      submitting: false,
      currentNamespace: '',
      form: {
        name: '',
        namespace: 'default',
        capacityValue: 1,
        capacityUnit: 'Gi',
        accessModes: ['ReadWriteOnce'],
        storageClass: '',
        volumeMode: 'Filesystem',
        volumeName: '',
        labels: [],
        selector: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input PVC name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ],
        accessModes: [
          { required: true, message: 'Please select at least one access mode', trigger: 'change', type: 'array' }
        ],
        volumeMode: [
          { required: true, message: 'Please select volume mode', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  watch: {
    currentNamespace(newVal) {
      this.form.namespace = newVal
    }
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
          this.form.namespace = this.currentNamespace
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        Message.error('Failed to get namespace list')
      }
    },
    goBack() {
      this.$router.push({
        path: '/volume/pvcs',
        query: { namespace: this.currentNamespace }
      })
    },
    
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // 根据 swagger.json 中的定义构建 PVC 数据
        const pvcData = {
          name: this.form.name,
          namespace: this.currentNamespace,
          capacity: `${this.form.capacityValue}${this.form.capacityUnit}`,
          accessModes: this.form.accessModes,
          storageClassName: this.form.storageClass || '',
          // selector 是一个标签数组，按照 Item 结构
          selector: this.form.selector,
          // labels 是一个标签数组，按照 Item 结构
          labels: this.form.labels
        }
        
        await this.$store.dispatch('pvc/createPVC', pvcData)
        Message.success('Persistent Volume Claim created successfully')
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          Message.error('Failed to create Persistent Volume Claim')
          console.error(error)
        }
      } finally {
        this.submitting = false
      }
    },
    iterateCapacity() {
      const commonSizes = [1, 2, 5, 10, 20, 50, 100];
      const currentValue = this.form.capacityValue;
      
      // Find the next value in the sequence
      const nextValue = commonSizes.find(size => size > currentValue);
      
      // If current value is larger than all in the sequence, wrap around to the first value
      this.form.capacityValue = nextValue || commonSizes[0];
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.capacity-input-container {
  display: flex;
  align-items: center;
}
</style>