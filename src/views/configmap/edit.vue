<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? 'Edit ConfigMap' : 'Create ConfigMap'" />
    </div>

    <el-form ref="mainForm" :model="form" :rules="rules" label-width="120px">
      <el-card class="box-card" v-loading="loading">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
          <el-tooltip class="item" effect="dark" content="ConfigMaps allow you to decouple configuration artifacts from image content" placement="top">
            <i class="el-icon-info" style="margin-left: 8px"></i>
          </el-tooltip>
        </div>

        <el-form-item label="Namespace" prop="namespace" v-if="!isEdit">
          <el-select v-model="form.namespace" placeholder="Select namespace" style="width: 100%">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
          <div class="form-help">Select the namespace where you want to create the ConfigMap</div>
        </el-form-item>
        <el-form-item label="Name" prop="name" v-if="!isEdit">
          <el-input v-model="form.name" placeholder="Enter ConfigMap name"></el-input>
          <div class="form-help">Name must be unique within the namespace</div>
        </el-form-item>
        <el-form-item label="Labels">
          <el-button size="small" type="primary" @click="addLabel">Add Label</el-button>
          <div class="form-help">Labels are key/value pairs that can be used to organize and categorize resources</div>
          <div v-for="(label, index) in form.labels" :key="index" style="margin-top: 10px">
            <el-input :value="label.key" @input="val => updateLabel(index, 'key', val)" placeholder="Key" style="width: 200px" />
            <el-input :value="label.value" @input="val => updateLabel(index, 'value', val)" placeholder="Value" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeLabel(index)">Delete</el-button>
          </div>
        </el-form-item>
      </el-card>
      
      <el-card class="box-card" style="margin-top: 20px" v-loading="loading">
        <div slot="header" class="clearfix">
          <span>Data Configuration</span>
          <el-tooltip class="item" effect="dark" content="ConfigMap data is stored as key-value pairs" placement="top">
            <i class="el-icon-info" style="margin-left: 8px"></i>
          </el-tooltip>
          <el-button style="float: right" type="primary" size="small" @click="addData">Add Data Item</el-button>
        </div>
        
        <div v-if="form.data.length === 0" class="empty-block">
          No data configuration. Click "Add Data Item" to add key-value pairs
        </div>
        
        <div v-for="(item, index) in form.data" :key="index" class="data-item">
          <el-form-item :label="'Data Item'" :prop="'data.' + index + '.key'" :rules="dataKeyRules">
            <el-input 
              v-model="item.key" 
              placeholder="Key (e.g., config.yaml, app.properties)" 
              style="width: 300px; margin-right: 10px;"
              @blur="validateDataKey(item)" 
            />
            <el-button type="danger" size="small" @click="removeData(index)">Delete</el-button>
            <div class="form-help">Key must consist of alphanumeric characters, dots, dashes, or underscores</div>
          </el-form-item>
          <el-form-item :label="'Value'" :prop="'data.' + index + '.value'" :rules="dataValueRules">
            <el-input
              type="textarea"
              v-model="item.value"
              placeholder="Enter configuration data"
              :rows="5"
              style="width: 100%; font-family: monospace;"
            />
          </el-form-item>
          <div class="divider-line" v-if="index < form.data.length - 1"></div>
        </div>
        
        <div style="margin-top: 20px; text-align: right;">
          <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Save' : 'Create' }}</el-button>
          <el-button @click="goBack">Cancel</el-button>
        </div>
      </el-card>
    </el-form>
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
      },
      dataKeyRules: [
        { required: true, message: 'Please enter a key', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9.-_]+$/, message: 'Key can only contain letters, numbers, dots, hyphens, and underscores', trigger: 'blur' }
      ],
      dataValueRules: [
        { required: true, message: 'Please enter a value', trigger: 'blur' }
      ]
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
        
        // Initialize labels
        this.form.labels = Array.isArray(detail.labels) 
          ? detail.labels.map(label => ({
              key: label.key || '',
              value: label.value || ''
            }))
          : []
        
        // Process configmap data
        this.form.data = Array.isArray(detail.data) 
          ? detail.data.map(item => ({
              key: item.key || '',
              value: item.value || ''
            }))
          : []
        
      } catch (error) {
        console.error('Failed to get ConfigMap details:', error)
        Message.error('Failed to get ConfigMap details')
      } finally {
        this.loading = false
      }
    },
    validateDataKey(item) {
      if (!item.key) return
      
      if (!/^[aA-Z0-9.-_]+$/.test(item.key)) {
        Message.warning('Key can only contain letters, numbers, dots, hyphens, and underscores')
        item.key = item.key.replace(/[^aA-Z0-9.-_]/g, '')
      }
      
      // Check for duplicate keys
      const keys = this.form.data.map(d => d.key)
      const duplicateIndex = keys.indexOf(item.key)
      if (duplicateIndex !== -1 && duplicateIndex !== this.form.data.indexOf(item)) {
        Message.warning('Duplicate key detected. Keys must be unique')
        item.key = ''
      }
    },
    updateLabel(index, field, value) {
      if (index >= 0 && index < this.form.labels.length) {
        this.form.labels[index][field] = value
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
          data: this.form.data.filter(item => item.key && item.value),
          dataNum: this.form.data.length
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

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.divider-line {
  border-bottom: 1px dashed #e6e6e6;
  margin: 20px 0;
}

.empty-block {
  text-align: center;
  color: #909399;
  padding: 30px 0;
  background: #f8f9fa;
  border-radius: 4px;
}

.data-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.box-card {
  margin-bottom: 20px;
  
  ::v-deep .el-card__header {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    
    .clearfix {
      display: flex;
      align-items: center;
      
      span {
        font-weight: 500;
      }
    }
  }
}
</style>