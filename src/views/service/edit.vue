<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? 'Edit Service' : 'Create Service' }}</span>
      </div>
      <el-form ref="form" :model="form" label-width="150px" :rules="rules" v-loading="loading">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" placeholder="Service name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" :disabled="isEdit" style="width: 100%" placeholder="Please select namespace">
            <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Service Type" prop="type">
          <el-select v-model="form.type" style="width: 100%" placeholder="Please select service type">
            <el-option label="ClusterIP" value="ClusterIP"></el-option>
            <el-option label="NodePort" value="NodePort"></el-option>
            <el-option label="LoadBalancer" value="LoadBalancer"></el-option>
            <el-option label="ExternalName" value="ExternalName"></el-option>
          </el-select>
        </el-form-item>

        <!-- Selector -->
        <el-divider content-position="left">Selector</el-divider>
        <div v-for="(selector, index) in form.selector" :key="'selector-' + index" class="dynamic-input-container">
          <el-row :gutter="10">
            <el-col :span="10">
              <el-form-item 
                :label="index === 0 ? 'Label Key' : ''" 
                :prop="'selector.' + index + '.key'"
                :rules="{ required: true, message: 'Key is required', trigger: 'blur' }">
                <el-input v-model="selector.key" placeholder="Key"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item 
                :label="index === 0 ? 'Label Value' : ''" 
                :prop="'selector.' + index + '.value'"
                :rules="{ required: true, message: 'Value is required', trigger: 'blur' }">
                <el-input v-model="selector.value" placeholder="Value"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" style="display: flex; align-items: center;">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(form.selector, index)"></el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="addSelector">Add Selector</el-button>

        <!-- Ports -->
        <el-divider content-position="left">Ports</el-divider>
        <div v-for="(port, index) in form.ports" :key="'port-' + index" class="dynamic-input-container">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item 
                :label="index === 0 ? 'Name' : ''" 
                :prop="'ports.' + index + '.name'"
                :rules="{ required: true, message: 'Name is required', trigger: 'blur' }">
                <el-input v-model="port.name" placeholder="Port name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item 
                :label="index === 0 ? 'Port' : ''" 
                :prop="'ports.' + index + '.port'"
                :rules="{ required: true, message: 'Port is required', trigger: 'change', type: 'number' }">
                <el-input-number v-model="port.port" :min="1" :max="65535" placeholder="Port"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item 
                :label="index === 0 ? 'Target Port' : ''" 
                :prop="'ports.' + index + '.targetPort'"
                :rules="{ required: true, message: 'Target port is required', trigger: 'change', type: 'number' }">
                <el-input-number v-model="port.targetPort" :min="1" :max="65535" placeholder="Target port"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item 
                :label="index === 0 ? 'Node Port' : ''" 
                :prop="'ports.' + index + '.nodePort'">
                <el-input-number 
                  v-model="port.nodePort" 
                  :min="30000" 
                  :max="32767"
                  :disabled="form.type !== 'NodePort' && form.type !== 'LoadBalancer'" 
                  placeholder="Node port">
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="3" style="display: flex; align-items: center;">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(form.ports, index)"></el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="addPort">Add Port</el-button>

        <!-- Labels -->
        <el-divider content-position="left">Labels</el-divider>
        <div v-for="(label, index) in form.labels" :key="'label-' + index" class="dynamic-input-container">
          <el-row :gutter="10">
            <el-col :span="10">
              <el-form-item 
                :label="index === 0 ? 'Key' : ''" 
                :prop="'labels.' + index + '.key'">
                <el-input v-model="label.key" placeholder="Key"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item 
                :label="index === 0 ? 'Value' : ''" 
                :prop="'labels.' + index + '.value'">
                <el-input v-model="label.value" placeholder="Value"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" style="display: flex; align-items: center;">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(form.labels, index)"></el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="addLabel">Add Label</el-button>

        <el-divider></el-divider>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">{{ isEdit ? 'Update' : 'Create' }}</el-button>
          <el-button @click="goBack">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'ServiceEdit',
  data() {
    return {
      isEdit: false,
      loading: false,
      submitting: false,
      form: {
        name: '',
        namespace: '',
        type: 'ClusterIP',
        selector: [],
        ports: [],
        labels: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input service name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ],
        type: [
          { required: true, message: 'Please select service type', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      const { name, namespace } = this.$route.query
      this.isEdit = !!name

      await this.getNamespaces()
      
      if (this.isEdit) {
        if (!namespace || !name) {
          Message.error('Invalid parameters')
          this.goBack()
          return
        }
        this.loading = true
        try {
          const response = await this.$store.dispatch('service/getServiceDetail', { 
            namespace, 
            name 
          })
          if (response.data) {
            this.form = this.convertResponseToForm(response.data)
          }
        } catch (error) {
          console.error('Failed to get service details:', error)
          Message.error('Failed to fetch service details')
          this.goBack()
        } finally {
          this.loading = false
        }
      } else {
        // Set default namespace from query parameters if creating new service
        const urlNamespace = this.$route.query.namespace
        if (urlNamespace) {
          this.form.namespace = urlNamespace
        } else if (this.namespaces && this.namespaces.length > 0) {
          this.form.namespace = this.namespaces[0].name
        }
        
        // Add empty port
        this.addPort()
        
        // Add empty selector
        this.addSelector()
      }
    },
    convertResponseToForm(data) {
      return {
        name: data.name || '',
        namespace: data.namespace || '',
        type: data.type || 'ClusterIP',
        selector: Array.isArray(data.selector) 
          ? [...data.selector] 
          : [],
        ports: Array.isArray(data.ports) 
          ? data.ports.map(port => ({
              name: port.name || '',
              port: port.port || 80,
              targetPort: port.targetPort || 80,
              nodePort: port.nodePort || null
            })) 
          : [],
        labels: Array.isArray(data.labels) 
          ? [...data.labels] 
          : []
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
    addPort() {
      this.form.ports.push({
        name: '',
        port: 80,
        targetPort: 80,
        nodePort: this.form.type === 'NodePort' || this.form.type === 'LoadBalancer' ? 30000 : null
      })
    },
    addSelector() {
      this.form.selector.push({
        key: '',
        value: ''
      })
    },
    addLabel() {
      this.form.labels.push({
        key: '',
        value: ''
      })
    },
    removeItem(array, index) {
      array.splice(index, 1)
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        await this.$store.dispatch('service/createOrUpdateService', this.form)
        
        Message.success(this.isEdit ? 'Service updated successfully' : 'Service created successfully')
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          console.error('Failed to submit service:', error)
          Message.error(this.isEdit ? 'Failed to update service' : 'Failed to create service')
        }
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/network/services',
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dynamic-input-container {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.el-divider {
  margin: 24px 0;
}
</style>