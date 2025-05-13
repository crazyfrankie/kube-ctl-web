<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? 'Edit Role' : 'Create Role' }}</span>
      </div>
      <el-form ref="form" :model="form" label-width="150px" :rules="rules" v-loading="loading">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" placeholder="Role name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" :disabled="isEdit" style="width: 100%" placeholder="Please select namespace">
            <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">Rules</el-divider>
        
        <div v-for="(rule, ruleIndex) in form.rules" :key="'rule-'+ruleIndex" class="rule-item">
          <el-card class="rule-card">
            <!-- API Groups -->
            <el-form-item :label="'API Groups'" :prop="'rules.' + ruleIndex + '.apiGroups'">
              <el-select
                v-model="rule.apiGroups"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="API Groups (e.g. '', 'apps', 'batch')"
                style="width: 100%"
              >
                <el-option label="core ('') - Pods, Services, ConfigMaps, etc." value=""></el-option>
                <el-option label="apps - Deployments, StatefulSets, DaemonSets" value="apps"></el-option>
                <el-option label="batch - Jobs, CronJobs" value="batch"></el-option>
                <el-option label="extensions - Ingresses, NetworkPolicies" value="extensions"></el-option>
                <el-option label="networking.k8s.io - Ingresses, NetworkPolicies" value="networking.k8s.io"></el-option>
                <el-option label="rbac.authorization.k8s.io - Roles, RoleBindings" value="rbac.authorization.k8s.io"></el-option>
              </el-select>
              <div class="form-help-text">API groups this rule applies to. Use empty string ('') for core API group.</div>
            </el-form-item>

            <!-- Resources -->
            <el-form-item :label="'Resources'" :prop="'rules.' + ruleIndex + '.resources'">
              <el-select
                v-model="rule.resources"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Resources (e.g. 'pods', 'deployments', 'services')"
                style="width: 100%"
              >
                <el-option label="pods" value="pods"></el-option>
                <el-option label="services" value="services"></el-option>
                <el-option label="deployments" value="deployments"></el-option>
                <el-option label="statefulsets" value="statefulsets"></el-option>
                <el-option label="daemonsets" value="daemonsets"></el-option>
                <el-option label="configmaps" value="configmaps"></el-option>
                <el-option label="secrets" value="secrets"></el-option>
                <el-option label="persistentvolumes" value="persistentvolumes"></el-option>
                <el-option label="persistentvolumeclaims" value="persistentvolumeclaims"></el-option>
                <el-option label="jobs" value="jobs"></el-option>
                <el-option label="cronjobs" value="cronjobs"></el-option>
                <el-option label="ingresses" value="ingresses"></el-option>
                <el-option label="roles" value="roles"></el-option>
                <el-option label="rolebindings" value="rolebindings"></el-option>
              </el-select>
              <div class="form-help-text">Resources this rule applies to. Use '*' for all resources in the API group.</div>
            </el-form-item>

            <!-- Resource Names -->
            <el-form-item :label="'Resource Names'" :prop="'rules.' + ruleIndex + '.resourceNames'">
              <el-select
                v-model="rule.resourceNames"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Optional: Specific resource names this rule applies to"
                style="width: 100%"
              >
              </el-select>
              <div class="form-help-text">Optional: Specific resource names this rule applies to. Leave empty to apply to all resource instances.</div>
            </el-form-item>

            <!-- Verbs -->
            <el-form-item :label="'Verbs'" :prop="'rules.' + ruleIndex + '.verbs'" :rules="{ required: true, message: 'At least one verb is required', trigger: 'change' }">
              <el-select
                v-model="rule.verbs"
                multiple
                placeholder="Actions allowed (e.g. 'get', 'list', 'watch')"
                style="width: 100%"
              >
                <el-option label="get - Read a single resource" value="get"></el-option>
                <el-option label="list - Read a collection of resources" value="list"></el-option>
                <el-option label="watch - Watch for changes to resources" value="watch"></el-option>
                <el-option label="create - Create new resources" value="create"></el-option>
                <el-option label="update - Update existing resources" value="update"></el-option>
                <el-option label="patch - Partially update resources" value="patch"></el-option>
                <el-option label="delete - Delete resources" value="delete"></el-option>
                <el-option label="deletecollection - Delete collections of resources" value="deletecollection"></el-option>
                <el-option label="* - All verbs" value="*"></el-option>
              </el-select>
              <div class="form-help-text">Actions allowed on these resources. Common patterns: 'get,list,watch' for read-only, or '*' for all actions.</div>
            </el-form-item>

            <div class="rule-actions">
              <el-button type="danger" @click="removeRule(ruleIndex)">Remove Rule</el-button>
            </div>
          </el-card>
        </div>

        <div style="margin: 20px 0;">
          <el-button type="primary" @click="addRule">Add Rule</el-button>
        </div>
        
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
  name: 'RoleEdit',
  data() {
    return {
      isEdit: false,
      loading: false,
      submitting: false,
      form: {
        namespace: '',
        name: '',
        rules: [
          {
            apiGroups: [],
            resources: [],
            resourceNames: [],
            verbs: []
          }
        ]
      },
      rules: {
        name: [
          { required: true, message: 'Please enter a name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Name can only contain lowercase letters, numbers and hyphens, and must start and end with a letter or number', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select a namespace', trigger: 'change' }
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
    init() {
      // Load namespaces
      this.getNamespaces()
      
      // Check if we're in edit mode and load the role if needed
      const { namespace, name } = this.$route.query
      if (name && namespace) {
        this.isEdit = true
        this.fetchRoleDetails(namespace, name)
      } else if (this.$route.query.namespace) {
        // Pre-select namespace if provided in URL
        this.form.namespace = this.$route.query.namespace
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
    async fetchRoleDetails(namespace, name) {
      this.loading = true
      try {
        const response = await this.$store.dispatch('role/getRoleDetail', { namespace, name })
        if (response && response.data) {
          this.form = this.transformApiResponseToForm(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch role details:', error)
        Message.error('Failed to fetch role details')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    transformApiResponseToForm(data) {
      // Transform API response to form data
      return {
        namespace: data.namespace,
        name: data.name,
        rules: data.rules || [{ apiGroups: [], resources: [], resourceNames: [], verbs: [] }]
      }
    },
    addRule() {
      this.form.rules.push({
        apiGroups: [],
        resources: [],
        resourceNames: [],
        verbs: []
      })
    },
    removeRule(index) {
      if (this.form.rules.length > 1) {
        this.form.rules.splice(index, 1)
      } else {
        Message.warning('Role must have at least one rule')
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // Prepare form data for API
        const formData = {
          ...this.form
        }
        
        // Send to API
        await this.$store.dispatch('role/createOrUpdateRole', formData)
        
        // Display success message
        Message.success(this.isEdit ? 'Role updated successfully' : 'Role created successfully')
        
        // Navigate back to roles list
        this.goBack()
      } catch (error) {
        console.error('Failed to submit form:', error)
        Message.error(this.isEdit ? 'Failed to update role' : 'Failed to create role')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/authority/roles',
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.rule-item {
  margin-bottom: 20px;
}

.rule-card {
  margin-bottom: 20px;
  position: relative;
}

.rule-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.form-help-text {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}
</style>