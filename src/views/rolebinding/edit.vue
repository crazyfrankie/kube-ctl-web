<template>
  <div class="app-container">
    <el-form 
      ref="form" 
      :model="roleBindingForm" 
      :rules="rules" 
      label-width="140px"
    >
      <el-form-item label="Name" prop="name">
        <el-input v-model="roleBindingForm.name" :disabled="isEdit"/>
      </el-form-item>
      
      <el-form-item label="Namespace" prop="namespace" v-if="!isClusterRoleBinding">
        <el-select v-model="roleBindingForm.namespace" placeholder="Please select namespace" :disabled="isEdit">
          <el-option 
            v-for="item in namespaces" 
            :key="item.name"
            :label="item.name" 
            :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Labels">
        <el-table :data="roleBindingForm.labels" border style="width: 100%">
          <el-table-column label="Key" prop="key">
            <template slot-scope="{row}">
              <el-input v-model="row.key" placeholder="Label Key"/>
            </template>
          </el-table-column>
          <el-table-column label="Value" prop="value">
            <template slot-scope="{row}">
              <el-input v-model="row.value" placeholder="Label Value"/>
            </template>
          </el-table-column>
          <el-table-column width="80">
            <template slot="header">
              <el-button type="primary" size="mini" @click="addLabel">Add</el-button>
            </template>
            <template slot-scope="{$index}">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeLabel($index)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="Role Reference" prop="roleRef">
        <el-input v-model="roleBindingForm.roleRef" placeholder="Name of the Role or ClusterRole to bind to"/>
      </el-form-item>

      <el-form-item label="Subjects" prop="subjects">
        <el-table :data="roleBindingForm.subjects" border style="width: 100%">
          <el-table-column label="Kind" width="180">
            <template slot-scope="{row}">
              <el-select v-model="row.kind" placeholder="Select Kind">
                <el-option label="ServiceAccount" value="ServiceAccount"/>
                <el-option label="User" value="User"/>
                <el-option label="Group" value="Group"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Name">
            <template slot-scope="{row}">
              <el-input v-model="row.name" placeholder="Subject Name"/>
            </template>
          </el-table-column>
          <el-table-column label="Namespace" v-if="showSubjectNamespace">
            <template slot-scope="{row}">
              <el-select v-model="row.namespace" placeholder="Select Namespace" v-if="row.kind === 'ServiceAccount'">
                <el-option
                  v-for="item in namespaces"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="120">
            <template slot="header">
              <el-button type="primary" size="mini" @click="addSubject">Add Subject</el-button>
            </template>
            <template slot-scope="{$index}">
              <el-button 
                type="danger" 
                size="mini" 
                icon="el-icon-delete"
                @click="removeSubject($index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">Submit</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RoleBindingEdit',
  props: {
    isClusterRoleBinding: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEdit: false,
      roleBindingForm: {
        name: '',
        namespace: '',
        roleRef: '',
        labels: [],
        subjects: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ],
        roleRef: [
          { required: true, message: 'Please input role reference', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    }),
    showSubjectNamespace() {
      return !this.isClusterRoleBinding
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // Get namespaces
      this.$store.dispatch('pod/getNamespaces')

      const name = this.$route.params.name
      if (name) {
        this.isEdit = true
        this.getRoleBindingDetail(name)
      } else {
        // For create, initialize with namespace from query params
        if (this.$route.query.namespace) {
          this.roleBindingForm.namespace = this.$route.query.namespace
        }
      }
    },
    getRoleBindingDetail(name) {
      this.$store.dispatch('rolebinding/getRoleBindingDetail', {
        name,
        namespace: this.$route.query.namespace
      }).then(() => {
        const detail = this.$store.state.rolebinding.currentRoleBinding
        if (detail) {
          this.roleBindingForm = {
            name: detail.name,
            namespace: detail.namespace,
            roleRef: detail.roleRef,
            labels: detail.labels || [],
            subjects: detail.subjects || []
          }
        }
      })
    },
    addLabel() {
      this.roleBindingForm.labels.push({
        key: '',
        value: ''  
      })
    },
    removeLabel(index) {
      this.roleBindingForm.labels.splice(index, 1)
    },
    addSubject() {
      this.roleBindingForm.subjects.push({
        kind: 'ServiceAccount',
        name: '',
        namespace: this.roleBindingForm.namespace
      })
    },
    removeSubject(index) {
      this.roleBindingForm.subjects.splice(index, 1)
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const operation = this.isEdit ? 'Update' : 'Create'
          this.$store.dispatch('rolebinding/createOrUpdateRoleBinding', this.roleBindingForm)
            .then(() => {
              this.$message({
                message: `${operation} successful!`,
                type: 'success'
              })
              this.$router.push({
                path: '/authority/rolebindings',
                query: { namespace: this.roleBindingForm.namespace }
              })
            })
        }
      })
    },
    onCancel() {
      // Return to list view preserving the current namespace context
      this.$router.push({ 
        path: '/authority/rolebindings',
        query: { namespace: this.roleBindingForm.namespace }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>
