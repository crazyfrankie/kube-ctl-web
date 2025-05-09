<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px" class="form-container">
      <h3>{{ isEdit ? 'Edit Ingress' : 'Create Ingress' }}</h3>
      
      <el-divider content-position="left">Basic Information</el-divider>
      
      <!-- Basic Info -->
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" :disabled="isEdit" placeholder="Ingress Name"></el-input>
      </el-form-item>
      
      <el-form-item label="Namespace" prop="namespace">
        <el-select v-model="form.namespace" style="width: 100%" :disabled="isEdit">
          <el-option
            v-for="item in namespaces"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      
      <!-- Labels -->
      <el-divider content-position="left">Labels</el-divider>
      <div v-for="(label, index) in form.labels" :key="'label-'+index" class="dynamic-item">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-form-item 
              :label="index === 0 ? 'Label Key' : ''" 
              :prop="'labels.' + index + '.key'"
              :rules="{ required: true, message: 'Key is required', trigger: 'blur' }">
              <el-input v-model="label.key" placeholder="Key"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item 
              :label="index === 0 ? 'Label Value' : ''" 
              :prop="'labels.' + index + '.value'"
              :rules="{ required: true, message: 'Value is required', trigger: 'blur' }">
              <el-input v-model="label.value" placeholder="Value"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" style="display: flex; align-items: center;">
            <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(form.labels, index)"></el-button>
          </el-col>
        </el-row>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="addLabel">Add Label</el-button>
      
      <!-- Rules -->
      <el-divider content-position="left">Rules</el-divider>
      <div v-for="(rule, ruleIndex) in form.rules" :key="'rule-'+ruleIndex" class="rule-item" style="margin-bottom: 20px; padding: 20px; border: 1px solid #DCDFE6; border-radius: 4px;">
        <el-form-item :label="'Host ' + (ruleIndex + 1)" :prop="'rules.' + ruleIndex + '.host'">
          <div class="flex-row">
            <el-input v-model="rule.host" placeholder="Host e.g. example.com" style="flex-grow: 1;"></el-input>
            <el-button type="danger" icon="el-icon-delete" @click="removeRule(ruleIndex)" style="margin-left: 10px;"></el-button>
          </div>
        </el-form-item>
        
        <div v-if="rule.value && rule.value.http && rule.value.http.paths">
          <div v-for="(path, pathIndex) in rule.value.http.paths" :key="'path-'+ruleIndex+'-'+pathIndex" class="path-item" style="margin-left: 50px; margin-bottom: 15px; padding: 15px; border: 1px dashed #DCDFE6; border-radius: 4px;">
            <el-form-item :label="'Path'" :prop="'rules.' + ruleIndex + '.value.http.paths.' + pathIndex + '.path'">
              <el-input v-model="path.path" placeholder="Path e.g. /app"></el-input>
            </el-form-item>
            
            <el-form-item label="Path Type">
              <el-select v-model="path.pathType" placeholder="Select path type">
                <el-option label="Prefix" value="Prefix"></el-option>
                <el-option label="Exact" value="Exact"></el-option>
                <el-option label="ImplementationSpecific" value="ImplementationSpecific"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="Service Name">
              <el-input v-model="path.backend.service.name" placeholder="Service name"></el-input>
            </el-form-item>
            
            <el-form-item label="Service Port">
              <el-input-number v-model="path.backend.service.port.number" :min="1" :max="65535" placeholder="Port"></el-input-number>
            </el-form-item>
            
            <el-button type="danger" size="small" @click="removePath(ruleIndex, pathIndex)" style="margin-top: 10px;">Remove Path</el-button>
          </div>
          
          <el-button type="primary" size="small" icon="el-icon-plus" @click="addPath(ruleIndex)" style="margin-left: 50px;">Add Path</el-button>
        </div>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="addRule">Add Rule</el-button>

      <div style="margin-top: 20px;">
        <el-button type="primary" @click="onSubmit" :loading="submitting">{{ isEdit ? 'Update' : 'Create' }}</el-button>
        <el-button @click="goBack">Cancel</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'IngressEdit',
  data() {
    return {
      isEdit: false,
      submitting: false,
      form: {
        name: '',
        namespace: '',
        labels: [],
        rules: []
      },
      rules: {
        name: [
          { required: true, message: 'Please enter name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces,
      currentIngress: state => state.ingress.currentIngress
    })
  },
  created() {
    this.isEdit = this.$route.path.includes('ingress-edit')
    this.initForm()
  },
  methods: {
    async initForm() {
      // Get namespaces
      await this.$store.dispatch('pod/getNamespaces')
      
      if (this.namespaces && this.namespaces.length > 0 && !this.form.namespace) {
        this.form.namespace = this.namespaces[0].name
      }
      
      // Check URL params for namespace
      if (this.$route.query.namespace) {
        this.form.namespace = this.$route.query.namespace
      }
      
      if (this.isEdit) {
        await this.loadIngressDetail()
      } else {
        // Initialize with empty rule
        this.addRule()
      }
    },
    async loadIngressDetail() {
      try {
        const { name, namespace } = this.$route.query
        if (!name || !namespace) {
          this.$message.error('Missing name or namespace parameters')
          this.goBack()
          return
        }
        
        await this.$store.dispatch('ingress/getIngressDetail', {
          name,
          namespace
        })
        
        // Map API data to form
        const ingress = this.currentIngress
        if (ingress) {
          this.form = {
            name: ingress.name || '',
            namespace: ingress.namespace || '',
            labels: Array.isArray(ingress.labels) ? [...ingress.labels] : [],
            rules: Array.isArray(ingress.rules) ? [...ingress.rules] : []
          }
          
          // Initialize rules structure if needed
          this.form.rules.forEach(rule => {
            if (!rule.value) {
              rule.value = { http: { paths: [] } }
            }
            if (!rule.value.http) {
              rule.value.http = { paths: [] }
            }
            if (!rule.value.http.paths) {
              rule.value.http.paths = []
            }
            
            // Initialize path backends
            rule.value.http.paths.forEach(path => {
              if (!path.backend) {
                path.backend = { service: { name: '', port: { number: 80 } } }
              }
              if (!path.backend.service) {
                path.backend.service = { name: '', port: { number: 80 } }
              }
              if (!path.backend.service.port) {
                path.backend.service.port = { number: 80 }
              }
              if (!path.pathType) {
                path.pathType = 'Prefix'
              }
            })
          })
        }
      } catch (error) {
        console.error('Failed to get ingress details:', error)
        this.$message.error('Failed to load ingress details')
        this.goBack()
      }
    },
    addLabel() {
      this.form.labels.push({
        key: '',
        value: ''
      })
    },
    addRule() {
      this.form.rules.push({
        host: '',
        value: {
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: '',
                    port: {
                      number: 80
                    }
                  }
                }
              }
            ]
          }
        }
      })
    },
    addPath(ruleIndex) {
      if (!this.form.rules[ruleIndex].value.http.paths) {
        this.form.rules[ruleIndex].value.http.paths = []
      }
      
      this.form.rules[ruleIndex].value.http.paths.push({
        path: '/',
        pathType: 'Prefix',
        backend: {
          service: {
            name: '',
            port: {
              number: 80
            }
          }
        }
      })
    },
    removeItem(items, index) {
      items.splice(index, 1)
    },
    removeRule(index) {
      this.form.rules.splice(index, 1)
    },
    removePath(ruleIndex, pathIndex) {
      this.form.rules[ruleIndex].value.http.paths.splice(pathIndex, 1)
    },
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        const ingressData = { ...this.form }
        
        await this.$store.dispatch('ingress/createOrUpdateIngress', ingressData)
        this.$message.success(`Ingress ${this.isEdit ? 'updated' : 'created'} successfully`)
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          this.$message.error(`Failed to ${this.isEdit ? 'update' : 'create'} Ingress`)
          console.error(error)
        }
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push('/network/ingresses')
    }
  }
}
</script>

<style scoped>
.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.dynamic-item {
  margin-bottom: 15px;
}
.flex-row {
  display: flex;
  align-items: center;
}
</style>