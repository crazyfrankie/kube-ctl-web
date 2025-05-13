<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? 'Edit RoleBinding' : 'Create RoleBinding' }}</span>
      </div>
      <el-form ref="form" :model="form" label-width="150px" :rules="rules" v-loading="loading">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" placeholder="RoleBinding name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" :disabled="isEdit" style="width: 100%" placeholder="Please select namespace">
            <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">Role Reference</el-divider>
        
        <el-form-item label="Role Kind" prop="roleRef.kind">
          <el-select v-model="form.roleRef.kind" style="width: 100%" placeholder="Select role kind">
            <el-option label="Role" value="Role"></el-option>
            <el-option label="ClusterRole" value="ClusterRole"></el-option>
          </el-select>
          <div class="form-help-text">ClusterRole is a cluster-wide role. Role is namespace-scoped.</div>
        </el-form-item>
        
        <el-form-item label="Role Name" prop="roleRef.name">
          <el-input v-model="form.roleRef.name" placeholder="Enter role name"></el-input>
          <div class="form-help-text">The name of the Role or ClusterRole to bind to.</div>
        </el-form-item>
        
        <el-divider content-position="left">Subjects</el-divider>
        <p class="section-description">Subjects are users, groups, or service accounts that will gain the permissions defined in the role.</p>
        
        <div v-for="(subject, subjectIndex) in form.subjects" :key="'subject-'+subjectIndex" class="subject-item">
          <el-card class="subject-card">
            <el-form-item :label="'Subject Kind'" :prop="'subjects.' + subjectIndex + '.kind'" :rules="{ required: true, message: 'Subject kind is required', trigger: 'change' }">
              <el-select v-model="subject.kind" style="width: 100%">
                <el-option label="User" value="User"></el-option>
                <el-option label="Group" value="Group"></el-option>
                <el-option label="ServiceAccount" value="ServiceAccount"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item :label="'Name'" :prop="'subjects.' + subjectIndex + '.name'" :rules="{ required: true, message: 'Subject name is required', trigger: 'blur' }">
              <el-input v-model="subject.name" placeholder="Enter subject name"></el-input>
              <div class="form-help-text">
                <template v-if="subject.kind === 'ServiceAccount'">
                  The name of the service account
                </template>
                <template v-else-if="subject.kind === 'User'">
                  The username (e.g., 'alice')
                </template>
                <template v-else-if="subject.kind === 'Group'">
                  The group name (e.g., 'system:masters')
                </template>
              </div>
            </el-form-item>
            
            <el-form-item v-if="subject.kind === 'ServiceAccount'" :label="'Namespace'" :prop="'subjects.' + subjectIndex + '.namespace'" :rules="{ required: subject.kind === 'ServiceAccount', message: 'Namespace is required for ServiceAccount', trigger: 'change' }">
              <el-select v-model="subject.namespace" style="width: 100%" placeholder="Select namespace">
                <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
              </el-select>
              <div class="form-help-text">The namespace of the service account.</div>
            </el-form-item>
            
            <div class="subject-actions">
              <el-button type="danger" @click="removeSubject(subjectIndex)">Remove Subject</el-button>
            </div>
          </el-card>
        </div>
        
        <div style="margin: 20px 0;">
          <el-button type="primary" @click="addSubject">Add Subject</el-button>
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
  name: 'RoleBindingEdit',
  data() {
    return {
      isEdit: false,
      loading: false,
      submitting: false,
      form: {
        namespace: '',
        name: '',
        roleRef: {
          kind: 'Role',
          name: '',
          apiGroup: 'rbac.authorization.k8s.io'
        },
        subjects: [
          {
            kind: 'ServiceAccount',
            name: '',
            namespace: ''
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
        ],
        'roleRef.kind': [
          { required: true, message: 'Please select a role kind', trigger: 'change' }
        ],
        'roleRef.name': [
          { required: true, message: 'Please enter a role name', trigger: 'blur' }
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
      
      // Check if we're in edit mode and load the rolebinding if needed
      const { namespace, name } = this.$route.query
      if (name && namespace) {
        this.isEdit = true
        this.fetchRoleBindingDetails(namespace, name)
      } else if (this.$route.query.namespace) {
        // Pre-select namespace if provided in URL
        this.form.namespace = this.$route.query.namespace
        // Also set the subject namespace to match selected namespace by default
        if (this.form.subjects && this.form.subjects.length > 0) {
          this.form.subjects[0].namespace = this.$route.query.namespace
        }
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
    async fetchRoleBindingDetails(namespace, name) {
      this.loading = true
      try {
        const response = await this.$store.dispatch('rolebinding/getRoleBindingDetail', { namespace, name })
        if (response && response.data) {
          this.form = this.transformApiResponseToForm(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch rolebinding details:', error)
        Message.error('Failed to fetch rolebinding details')
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
        roleRef: data.roleRef || {
          kind: 'Role',
          name: '',
          apiGroup: 'rbac.authorization.k8s.io'
        },
        subjects: data.subjects || [{ kind: 'ServiceAccount', name: '', namespace: data.namespace }]
      }
    },
    addSubject() {
      this.form.subjects.push({
        kind: 'ServiceAccount',
        name: '',
        namespace: this.form.namespace
      })
    },
    removeSubject(index) {
      if (this.form.subjects.length > 1) {
        this.form.subjects.splice(index, 1)
      } else {
        Message.warning('RoleBinding must have at least one subject')
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // Ensure apiGroup is set on roleRef
        if (!this.form.roleRef.apiGroup) {
          this.form.roleRef.apiGroup = 'rbac.authorization.k8s.io'
        }
        
        // Filter out unnecessary namespace field for User and Group subjects
        const formData = {
          ...this.form,
          subjects: this.form.subjects.map(subject => {
            const newSubject = { ...subject }
            if (subject.kind !== 'ServiceAccount') {
              delete newSubject.namespace
            }
            return newSubject
          })
        }
        
        // Send to API
        await this.$store.dispatch('rolebinding/createOrUpdateRoleBinding', formData)
        
        // Display success message
        Message.success(this.isEdit ? 'RoleBinding updated successfully' : 'RoleBinding created successfully')
        
        // Navigate back
        this.goBack()
      } catch (error) {
        console.error('Failed to submit form:', error)
        Message.error(this.isEdit ? 'Failed to update rolebinding' : 'Failed to create rolebinding')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/authority/rolebindings',
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.subject-item {
  margin-bottom: 20px;
}

.subject-card {
  margin-bottom: 20px;
  position: relative;
}

.subject-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.form-help-text {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.section-description {
  color: #606266;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 20px;
}
</style>