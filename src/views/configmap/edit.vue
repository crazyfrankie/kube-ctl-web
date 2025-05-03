<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? 'Edit ConfigMap' : 'Create ConfigMap'" />
    </div>

    <el-card class="box-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>Basic Information</span>
      </div>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Namespace" prop="namespace" v-if="!isEdit">
          <el-select v-model="form.namespace" placeholder="Select namespace">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Name" prop="name" v-if="!isEdit">
          <el-input v-model="form.name" placeholder="Enter ConfigMap name"></el-input>
        </el-form-item>
        <el-form-item label="Labels">
          <el-button size="small" type="primary" @click="addLabel">Add Label</el-button>
          <div v-for="(label, index) in form.labels" :key="index" style="margin-top: 10px">
            <el-input v-model="label.key" placeholder="Key" style="width: 200px" />
            <el-input v-model="label.value" placeholder="Value" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeLabel(index)">Delete</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="box-card" style="margin-top: 20px" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>Data Configuration</span>
        <el-button style="float: right" type="primary" size="small" @click="addData">Add Data Item</el-button>
      </div>
      
      <div v-if="form.data.length === 0" class="empty-block">
        No data configuration. Please click the "Add Data Item" button to add configuration
      </div>
      
      <div v-for="(item, index) in form.data" :key="index" class="data-item">
        <el-form-item :label="'Data Item ' + (index + 1)">
          <el-input v-model="item.key" placeholder="Key" style="width: 200px; margin-right: 10px;" />
          <el-button type="danger" size="small" @click="removeData(index)">Delete</el-button>
        </el-form-item>
        <el-form-item label="Value">
          <el-input
            type="textarea"
            v-model="item.value"
            placeholder="Value"
            :rows="5"
            style="width: 100%"
          />
        </el-form-item>
        <div class="divider-line" v-if="index < form.data.length - 1"></div>
      </div>
      
      <div style="margin-top: 20px; text-align: right;">
        <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Save' : 'Create' }}</el-button>
        <el-button @click="goBack">Cancel</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'ConfigMapEdit',
  data() {
    return {
      loading: false,
      isEdit: false,
      form: {
        namespace: '',
        name: '',
        labels: [],
        data: []
      },
      rules: {
        namespace: [
          { required: true, message: 'Please select a namespace', trigger: 'change' }
        ],
        name: [
          { required: true, message: 'Please enter a name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, 
            message: 'Name can only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number', 
            trigger: 'blur' 
          }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces || []
    })
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      const { namespace, name } = this.$route.query
      
      // Get namespace list
      try {
        await this.$store.dispatch('pod/getNamespaces')
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        Message.error('Failed to get namespace list')
      }
      
      if (name) {
        // Edit mode
        this.isEdit = true
        this.form.namespace = namespace || ''
        this.form.name = name
        this.fetchData()
      } else {
        // Create mode
        this.form.namespace = namespace || (this.namespaces.length > 0 ? this.namespaces[0].name : '')
      }
    },
    async fetchData() {
      if (!this.form.namespace || !this.form.name) return
      
      this.loading = true
      try {
        const response = await this.$store.dispatch('configmap/getConfigMapDetail', {
          namespace: this.form.namespace,
          name: this.form.name
        })
        const detail = response.data
        
        // Initialize data
        this.form.labels = Array.isArray(detail.labels) ? [...detail.labels] : []
        
        // Process configmap data
        this.form.data = Array.isArray(detail.data) 
          ? [...detail.data] 
          : []
        
      } catch (error) {
        console.error('Failed to get ConfigMap details:', error)
        Message.error('Failed to get ConfigMap details')
      } finally {
        this.loading = false
      }
    },
    addLabel() {
      this.form.labels.push({ key: '', value: '' })
    },
    removeLabel(index) {
      this.form.labels.splice(index, 1)
    },
    addData() {
      this.form.data.push({ key: '', value: '' })
    },
    removeData(index) {
      this.form.data.splice(index, 1)
    },
    async onSubmit() {
      // Form validation
      this.$refs.form.validate(async valid => {
        if (!valid && !this.isEdit) return
        
        // Validate data items
        if (this.form.data.length === 0) {
          Message.warning('Please add at least one data item')
          return
        }
        
        // Validate key and value of data items
        for (const item of this.form.data) {
          if (!item.key || !item.value) {
            Message.warning('Please fill in complete data item information')
            return
          }
          
          // Validate key format
          if (!/^[a-zA-Z0-9.-_]+$/.test(item.key)) {
            Message.warning('Data item key can only contain letters, numbers, dots, hyphens, and underscores')
            return
          }
        }
        
        // Check for duplicate keys
        const keys = this.form.data.map(item => item.key)
        if (new Set(keys).size !== keys.length) {
          Message.warning('Data item keys cannot be duplicated')
          return
        }
        
        const configMapData = {
          name: this.form.name,
          namespace: this.form.namespace,
          labels: this.form.labels.filter(label => label.key && label.value),
          data: this.form.data.filter(item => item.key && item.value)
        }
        
        try {
          this.loading = true
          await this.$store.dispatch('configmap/createOrUpdateConfigMap', configMapData)
          Message.success(this.isEdit ? 'Updated successfully' : 'Created successfully')
          this.goBack()
        } catch (error) {
          console.error('Failed to submit ConfigMap:', error)
          Message.error(this.isEdit ? 'Update failed' : 'Creation failed')
        } finally {
          this.loading = false
        }
      })
    },
    goBack() {
      this.$router.push('/volume/configmaps')
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-header {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.data-item {
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 4px;
}
.divider-line {
  height: 1px;
  background-color: #EBEEF5;
  margin: 20px 0;
}
.empty-block {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>