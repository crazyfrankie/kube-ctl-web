<template>
  <div class="app-container">
    <el-form 
      ref="form" 
      :model="clusterRoleBindingForm" 
      :rules="rules" 
      label-width="140px"
    >
      <el-form-item label="Name" prop="name">
        <el-input v-model="clusterRoleBindingForm.name" :disabled="isEdit"/>
      </el-form-item>

      <el-form-item label="Role Reference" prop="roleRef">
        <el-input v-model="clusterRoleBindingForm.roleRef" placeholder="Name of the ClusterRole to bind to"/>
      </el-form-item>

      <el-form-item label="Labels">
        <el-table :data="clusterRoleBindingForm.labels" border style="width: 100%">
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
      
      <el-form-item label="Subjects" prop="subjects">
        <el-table :data="clusterRoleBindingForm.subjects" border style="width: 100%">
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
  name: 'ClusterRoleBindingEdit',
  data() {
    return {
      isEdit: false,
      clusterRoleBindingForm: {
        name: '',
        roleRef: '',
        labels: [],
        subjects: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format', trigger: 'blur' }
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
      return true // Always show namespace for subjects in ClusterRoleBinding
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // Get namespaces for ServiceAccount namespace selection
      this.$store.dispatch('pod/getNamespaces')

      const name = this.$route.params.name
      if (name) {
        this.isEdit = true
        this.getClusterRoleBindingDetail(name)
      }
    },
    getClusterRoleBindingDetail(name) {
      this.$store.dispatch('clusterrolebinding/getClusterRoleBindingDetail', {
        name,
        namespace: ''
      }).then(() => {
        const detail = this.$store.state.clusterrolebinding.currentClusterRoleBinding
        if (detail) {
          this.clusterRoleBindingForm = {
            name: detail.name,
            roleRef: detail.roleRef,
            labels: detail.labels || [],
            subjects: detail.subjects || []
          }
        }
      })
    },
    addLabel() {
      this.clusterRoleBindingForm.labels.push({
        key: '',
        value: ''  
      })
    },
    removeLabel(index) {
      this.clusterRoleBindingForm.labels.splice(index, 1)
    },
    addSubject() {
      this.clusterRoleBindingForm.subjects.push({
        kind: 'ServiceAccount',
        name: '',
        namespace: ''
      })
    },
    removeSubject(index) {
      this.clusterRoleBindingForm.subjects.splice(index, 1)
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const operation = this.isEdit ? 'Update' : 'Create'
          this.$store.dispatch('clusterrolebinding/createOrUpdateClusterRoleBinding', this.clusterRoleBindingForm)
            .then(() => {
              this.$message({
                message: `${operation} successful!`,
                type: 'success'
              })
              this.$router.push('/authority/clusterrolebindings')
            })
        }
      })
    },
    onCancel() {
      this.$router.push('/authority/clusterrolebindings')
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
</style>
