<template>
  <div class="app-container">
    <el-form 
      ref="form" 
      :model="roleForm" 
      :rules="rules" 
      label-width="120px"
    >
      <el-form-item label="Name" prop="name">
        <el-input v-model="roleForm.name" :disabled="isEdit"/>
      </el-form-item>

      <el-form-item label="Rules" prop="rules">
        <el-table :data="roleForm.rules" border style="width: 100%">
          <el-table-column label="API Groups">
            <template slot-scope="{row, $index}">
              <el-select v-model="row.apiGroups" multiple placeholder="Select API Groups">
                <el-option label="*" value="*"/>
                <el-option label="apps" value="apps"/>
                <el-option label="batch" value="batch"/>
                <el-option label="networking.k8s.io" value="networking.k8s.io"/>
                <el-option label="rbac.authorization.k8s.io" value="rbac.authorization.k8s.io"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Resources">
            <template slot-scope="{row}">
              <el-select v-model="row.resources" multiple placeholder="Select Resources">
                <el-option label="*" value="*"/>
                <el-option label="pods" value="pods"/>
                <el-option label="deployments" value="deployments"/>
                <el-option label="services" value="services"/>
                <el-option label="configmaps" value="configmaps"/>
                <el-option label="secrets" value="secrets"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Verbs">
            <template slot-scope="{row}">
              <el-select v-model="row.verbs" multiple placeholder="Select Verbs">
                <el-option label="*" value="*"/>
                <el-option label="get" value="get"/>
                <el-option label="list" value="list"/>
                <el-option label="watch" value="watch"/>
                <el-option label="create" value="create"/>
                <el-option label="update" value="update"/>
                <el-option label="patch" value="patch"/>
                <el-option label="delete" value="delete"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="120">
            <template slot="header">
              <el-button type="primary" size="mini" @click="addRule">Add Rule</el-button>
            </template>
            <template slot-scope="{$index}">
              <el-button 
                type="danger" 
                size="mini" 
                icon="el-icon-delete"
                @click="removeRule($index)"
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
import { getRole, createOrUpdateRole } from '@/api/role'

export default {
  name: 'ClusterRoleEdit',
  data() {
    return {
      isEdit: false,
      roleForm: {
        name: '',
        namespace: '',
        rules: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' },
          { min: 2, max: 64, message: 'Length should be 2 to 64 characters', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    if (this.$route.query.name) {
      this.isEdit = true
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      getRole({
        name: this.$route.query.name,
        namespace: ''
      }).then(response => {
        const { data } = response
        this.roleForm = {
          name: data.name,
          namespace: '',
          rules: data.rules || []
        }
      })
    },
    addRule() {
      this.roleForm.rules.push({
        apiGroups: [],
        resources: [],
        verbs: []
      })
    },
    removeRule(index) {
      this.roleForm.rules.splice(index, 1)
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const data = {
            ...this.roleForm,
            namespace: ''
          }
          createOrUpdateRole(data).then(() => {
            this.$notify({
              title: 'Success',
              message: 'Operation completed successfully',
              type: 'success',
              duration: 2000
            })
            this.onCancel()
          })
        }
      })
    },
    onCancel() {
      this.$router.push('/authority/clusterroles')
    }
  }
}
</script>
