<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? 'Edit Secret' : 'Create Secret'" />
    </div>

    <el-form ref="mainForm" :model="form" :rules="rules" label-width="120px">
      <el-card class="box-card" v-loading="loading">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
          <el-tooltip class="item" effect="dark" content="Secrets let you store and manage sensitive information like passwords, tokens, and keys" placement="top">
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
          <div class="form-help">Select the namespace where you want to create the Secret</div>
        </el-form-item>

        <el-form-item label="Name" prop="name" v-if="!isEdit">
          <el-input v-model="form.name" placeholder="Enter Secret name"></el-input>
          <div class="form-help">Name must be unique within the namespace</div>
        </el-form-item>

        <el-form-item label="Type" prop="type" v-if="!isEdit">
          <el-select v-model="form.type" placeholder="Select Secret type" style="width: 100%">
            <el-option label="Opaque (Generic Secret)" value="Opaque"></el-option>
            <el-option label="Docker Registry" value="kubernetes.io/dockerconfigjson"></el-option>
            <el-option label="TLS" value="kubernetes.io/tls"></el-option>
            <el-option label="Service Account Token" value="kubernetes.io/service-account-token"></el-option>
          </el-select>
          <div class="form-help">
            <template v-if="form.type === 'Opaque'">Use Opaque type for arbitrary user-defined data</template>
            <template v-else-if="form.type === 'kubernetes.io/dockerconfigjson'">Use for storing Docker registry credentials</template>
            <template v-else-if="form.type === 'kubernetes.io/tls'">Use for storing TLS certificates</template>
            <template v-else-if="form.type === 'kubernetes.io/service-account-token'">Use for storing service account tokens</template>
          </div>
        </el-form-item>
      </el-card>
      
      <el-card class="box-card" style="margin-top: 20px" v-loading="loading">
        <div slot="header" class="clearfix">
          <span>Secret Data</span>
          <el-tooltip class="item" effect="dark" content="Secret data is stored as key-value pairs and automatically encoded in base64" placement="top">
            <i class="el-icon-info" style="margin-left: 8px"></i>
          </el-tooltip>
          <el-button style="float: right" type="primary" size="small" @click="addData">Add Data Item</el-button>
        </div>
        
        <div v-if="form.data.length === 0" class="empty-block">
          No data items. Click "Add Data Item" to add key-value pairs
        </div>
        
        <div v-for="(item, index) in form.data" :key="index" class="data-item">
          <el-form-item :label="'Data Item ' + (index + 1)" :prop="'data.' + index + '.key'" :rules="dataKeyRules">
            <el-input 
              v-model="item.key" 
              placeholder="Key (e.g., username, password, config.json)" 
              style="width: 300px; margin-right: 10px"
              @blur="validateDataKey(item)" 
            />
            <el-button type="danger" size="small" @click="removeData(index)">Delete</el-button>
            <div class="form-help">Key must consist of alphanumeric characters, dots, dashes, or underscores</div>
          </el-form-item>
          <el-form-item :label="'Value'" :prop="'data.' + index + '.value'" :rules="dataValueRules">
            <el-input
              type="textarea"
              v-model="item.value"
              placeholder="Enter secret value"
              :rows="3"
              style="width: 100%; font-family: monospace;"
            />
            <div class="form-help">Value will be automatically encoded in base64 when stored</div>
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
  name: 'SecretEdit',
  data() {
    return {
      loading: false,
      isEdit: false,
      form: {
        namespace: '',
        name: '',
        type: 'Opaque',
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
        ],
        type: [
          { required: true, message: 'Please select a type', trigger: 'change' }
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
    init() {
      const { namespace, name } = this.$route.query
      if (name) {
        this.isEdit = true
        this.form.namespace = namespace
        this.form.name = name
        this.fetchData()
      } else {
        this.form.namespace = namespace
        this.getNamespaces()
      }
    },
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        Message.error('Failed to get namespace list')
      }
    },
    async fetchData() {
      this.loading = true
      try {
        const response = await this.$store.dispatch('secret/getSecretDetail', {
          namespace: this.form.namespace,
          name: this.form.name
        })
        const detail = response.data
        this.form.type = detail.type
        this.form.data = Object.entries(detail.data || {}).map(([key, value]) => ({
          key,
          value: Buffer.from(value, 'base64').toString()
        }))
      } catch (error) {
        console.error('Failed to get Secret details:', error)
        Message.error('Failed to get Secret details')
      } finally {
        this.loading = false
      }
    },
    validateDataKey(item) {
      if (!item.key) return
      if (!/^[a-zA-Z0-9.-_]+$/.test(item.key)) {
        Message.warning('Key can only contain letters, numbers, dots, hyphens, and underscores')
        item.key = item.key.replace(/[^a-zA-Z0-9.-_]/g, '')
      }
    },
    addData() {
      this.form.data.push({ key: '', value: '' })
    },
    removeData(index) {
      this.form.data.splice(index, 1)
    },
    async onSubmit() {
      try {
        await this.$refs.mainForm.validate()
        
        this.loading = true
        
        // Convert data to base64
        const data = {}
        this.form.data.forEach(item => {
          if (item.key && item.value) {
            data[item.key] = Buffer.from(item.value).toString('base64')
          }
        })

        await this.$store.dispatch('secret/createOrUpdateSecret', {
          namespace: this.form.namespace,
          name: this.form.name,
          type: this.form.type,
          data
        })
        
        Message.success(this.isEdit ? 'Secret updated successfully' : 'Secret created successfully')
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          console.error('Failed to save Secret:', error)
          Message.error(this.isEdit ? 'Update failed' : 'Creation failed')
        }
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/volume/secrets',
        query: { namespace: this.form.namespace }
      })
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