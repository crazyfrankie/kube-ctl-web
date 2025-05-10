<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="140px" v-loading="loading">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" placeholder="Enter IngressRoute name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" :disabled="isEdit" placeholder="Select namespace" style="width: 100%">
            <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">Labels</el-divider>
        <div v-for="(label, index) in form.labels" :key="'label-'+index" class="dynamic-input-group">
          <el-row :gutter="10">
            <el-col :span="9">
              <el-form-item :prop="'labels.' + index + '.key'" :rules="keyRules" label-width="0">
                <el-input v-model="label.key" placeholder="Label Key"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="9">
              <el-form-item :prop="'labels.' + index + '.value'" :rules="valueRules" label-width="0">
                <el-input v-model="label.value" placeholder="Label Value"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" style="display: flex; align-items: center;">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(form.labels, index)" />
            </el-col>
          </el-row>
        </div>
        
        <el-button type="primary" icon="el-icon-plus" @click="addLabel">Add Label</el-button>
      </el-card>
      
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>IngressRoute Specification</span>
        </div>
        
        <!-- Entry Points -->
        <el-form-item label="Entry Points">
          <el-select 
            v-model="form.ingressRouteSpec.entryPoints" 
            multiple 
            placeholder="Select entry points" 
            style="width: 100%"
          >
            <el-option label="web" value="web"></el-option>
            <el-option label="websecure" value="websecure"></el-option>
          </el-select>
          <div class="form-help-text">Common values are "web" (HTTP) and "websecure" (HTTPS)</div>
        </el-form-item>
        
        <!-- TLS Secret -->
        <el-form-item label="TLS Secret">
          <el-input 
            v-model="form.ingressRouteSpec.tls.secretName" 
            placeholder="TLS Secret name (optional)"
          ></el-input>
          <div class="form-help-text">The name of the Secret containing the TLS certificate</div>
        </el-form-item>
        
        <!-- Routes -->
        <div class="section-title">Routes</div>
        
        <div v-for="(route, routeIndex) in form.ingressRouteSpec.routes" :key="'route-'+routeIndex" class="route-container">
          <div class="route-header">Route #{{ routeIndex + 1 }}</div>
          
          <el-form-item :label="'Match'">
            <el-input v-model="route.match" placeholder="Route match rule, e.g., Host(`example.com`)"></el-input>
            <div class="form-help-text">Example: "Host(`example.com`) && PathPrefix(`/api`)"</div>
          </el-form-item>
          
          <el-form-item :label="'Kind'">
            <el-input v-model="route.kind" placeholder="Route kind (optional)"></el-input>
            <div class="form-help-text">Usually "Rule" by default if left empty</div>
          </el-form-item>
          
          <!-- Route Middlewares -->
          <div class="subsection-title">Middlewares</div>
          <div v-for="(middleware, mwIndex) in route.middlewares" :key="'mw-'+routeIndex+'-'+mwIndex" class="dynamic-input-group">
            <el-row :gutter="10">
              <el-col :span="18">
                <el-form-item :prop="'ingressRouteSpec.routes.' + routeIndex + '.middlewares.' + mwIndex + '.name'" label-width="0">
                  <el-select 
                    v-model="middleware.name"
                    filterable
                    placeholder="Select middleware"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="mw in middlewares"
                      :key="mw"
                      :label="mw"
                      :value="mw"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="display: flex; align-items: center;">
                <el-button type="danger" icon="el-icon-delete" circle @click="removeMiddleware(routeIndex, mwIndex)" />
              </el-col>
            </el-row>
          </div>
          
          <el-button type="success" size="small" icon="el-icon-plus" @click="addMiddleware(routeIndex)">Add Middleware</el-button>
          
          <!-- Route Services -->
          <div class="subsection-title">Services</div>
          <div v-for="(service, svcIndex) in route.services" :key="'svc-'+routeIndex+'-'+svcIndex" class="dynamic-input-group">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item :prop="'ingressRouteSpec.routes.' + routeIndex + '.services.' + svcIndex + '.name'" label-width="0">
                  <el-input v-model="service.name" placeholder="Service name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :prop="'ingressRouteSpec.routes.' + routeIndex + '.services.' + svcIndex + '.port'" label-width="0">
                  <el-input-number v-model="service.port" :min="1" :max="65535" placeholder="Port"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="display: flex; align-items: center;">
                <el-button type="danger" icon="el-icon-delete" circle @click="removeService(routeIndex, svcIndex)" />
              </el-col>
            </el-row>
          </div>
          
          <div class="button-group">
            <el-button type="success" size="small" icon="el-icon-plus" @click="addService(routeIndex)">Add Service</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="removeRoute(routeIndex)" style="margin-left: 10px;">Remove Route</el-button>
          </div>

          <el-divider v-if="routeIndex < form.ingressRouteSpec.routes.length - 1"></el-divider>
        </div>
        
        <el-button type="primary" icon="el-icon-plus" @click="addRoute">Add Route</el-button>
      </el-card>

      <div class="form-action-buttons">
        <el-button @click="goBack">Cancel</el-button>
        <el-button type="primary" @click="onSubmit" :loading="submitting">{{ isEdit ? 'Update' : 'Create' }}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'IngressRouteEdit',
  data() {
    return {
      isEdit: false,
      loading: false,
      submitting: false,
      form: {
        name: '',
        namespace: '',
        labels: [],
        ingressRouteSpec: {
          entryPoints: [],
          routes: [],
          tls: {
            secretName: ''
          }
        }
      },
      rules: {
        name: [
          { required: true, message: 'Please enter name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ]
      },
      keyRules: [
        { required: true, message: 'Key is required', trigger: 'blur' }
      ],
      valueRules: [
        { required: true, message: 'Value is required', trigger: 'blur' }
      ]
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces,
      currentIngressRoute: state => state.ingressroute.currentIngressRoute,
      middlewares: state => state.ingressroute.middlewares
    })
  },
  created() {
    this.isEdit = this.$route.path.includes('ingressroute-edit')
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
        await this.loadIngressRouteDetail()
        // Only load middlewares in edit mode, after loading the IngressRoute details
        await this.loadMiddlewares()
      } else {
        // Initialize with empty route
        this.addRoute()
      }
    },
    async loadMiddlewares() {
      try {
        if (this.form.namespace) {
          await this.$store.dispatch('ingressroute/getAvailableMiddlewares', {
            namespace: this.form.namespace
          })
        }
      } catch (error) {
        console.error('Failed to load middlewares:', error)
      }
    },
    async loadIngressRouteDetail() {
      try {
        const { name, namespace } = this.$route.query
        if (!name || !namespace) {
          this.$message.error('Missing name or namespace parameters')
          this.goBack()
          return
        }
        
        await this.$store.dispatch('ingressroute/getIngressRouteDetail', {
          name,
          namespace
        })
        
        // Map API data to form
        const ingressRoute = this.currentIngressRoute
        if (ingressRoute) {
          this.form = {
            name: ingressRoute.name || '',
            namespace: ingressRoute.namespace || '',
            labels: Array.isArray(ingressRoute.labels) ? [...ingressRoute.labels] : [],
            ingressRouteSpec: ingressRoute.ingressRouteSpec ? { ...ingressRoute.ingressRouteSpec } : {
              entryPoints: [],
              routes: [],
              tls: { secretName: '' }
            }
          }
          
          // Initialize empty arrays if not provided
          if (!this.form.ingressRouteSpec.entryPoints) {
            this.form.ingressRouteSpec.entryPoints = []
          }
          
          if (!this.form.ingressRouteSpec.routes) {
            this.form.ingressRouteSpec.routes = []
          }
          
          if (!this.form.ingressRouteSpec.tls) {
            this.form.ingressRouteSpec.tls = { secretName: '' }
          }
          
          // Make sure routes have required properties
          this.form.ingressRouteSpec.routes.forEach(route => {
            if (!route.middlewares) {
              route.middlewares = []
            }
            
            if (!route.services) {
              route.services = []
            }
          })
        }
      } catch (error) {
        console.error('Failed to get IngressRoute details:', error)
        this.$message.error('Failed to load IngressRoute details')
        this.goBack()
      }
    },
    addLabel() {
      this.form.labels.push({
        key: '',
        value: ''
      })
    },
    addRoute() {
      this.form.ingressRouteSpec.routes.push({
        match: '',
        kind: '',
        middlewares: [],
        services: []
      })
    },
    addMiddleware(routeIndex) {
      this.form.ingressRouteSpec.routes[routeIndex].middlewares.push({
        name: ''
      })
    },
    addService(routeIndex) {
      this.form.ingressRouteSpec.routes[routeIndex].services.push({
        name: '',
        port: 80
      })
    },
    removeItem(items, index) {
      items.splice(index, 1)
    },
    removeRoute(index) {
      this.form.ingressRouteSpec.routes.splice(index, 1)
    },
    removeMiddleware(routeIndex, mwIndex) {
      this.form.ingressRouteSpec.routes[routeIndex].middlewares.splice(mwIndex, 1)
    },
    removeService(routeIndex, serviceIndex) {
      this.form.ingressRouteSpec.routes[routeIndex].services.splice(serviceIndex, 1)
    },
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // Clean up empty middlewares
        for (const route of this.form.ingressRouteSpec.routes) {
          route.middlewares = route.middlewares.filter(mw => mw.name)
        }
        
        // Remove empty TLS if not specified
        if (!this.form.ingressRouteSpec.tls.secretName) {
          delete this.form.ingressRouteSpec.tls
        }
        
        // Submit form
        await this.$store.dispatch('ingressroute/createOrUpdateIngressRoute', this.form)
        
        this.$message.success(`IngressRoute ${this.isEdit ? 'updated' : 'created'} successfully`)
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          this.$message.error(`Failed to ${this.isEdit ? 'update' : 'create'} IngressRoute`)
          console.error(error)
        }
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push('/network/ingressroutes')
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin-bottom: 20px;
}

.dynamic-input-group {
  margin-bottom: 15px;
}

.form-action-buttons {
  margin-top: 20px;
  text-align: right;
}

.form-help-text {
  color: #909399;
  font-size: 12px;
  line-height: 1.3;
  margin-top: 5px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 20px 0;
  color: #409EFF;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.subsection-title {
  font-size: 15px;
  font-weight: 500;
  margin: 20px 0 15px;
  color: #606266;
}

.route-container {
  background-color: #f9fafb;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px dashed #e6e6e6;
  
  .route-header {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    color: #409EFF;
  }
}

.button-group {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
}
</style>