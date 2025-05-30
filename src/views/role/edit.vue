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
      
      <el-form-item label="Namespace" prop="namespace" v-if="!isClusterRole">
        <el-select v-model="roleForm.namespace" placeholder="Please select namespace" :disabled="isEdit">
          <el-option
            v-for="item in namespaces"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
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
import { mapState } from 'vuex'

export default {
  name: 'RoleEdit',
  props: {
    isClusterRole: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEdit: false,
      roleForm: {
        name: '',
        namespace: '',
        rules: []
      },
      namespaces: [],
      listLoading: false,
      rules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' },
          { min: 2, max: 64, message: 'Length should be 2 to 64 characters', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getNamespaceList()
    if (this.$route.query.name) {
      this.isEdit = true
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      const params = {
        name: this.$route.query.name
      }
      if (!this.isClusterRole) {
        params.namespace = this.$route.query.namespace
      }
      getRole(params).then(response => {
        const { data } = response
        this.roleForm = {
          name: data.name,
          namespace: data.namespace,
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
          const data = { ...this.roleForm }
          if (this.isClusterRole) {
            data.namespace = ''
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
      const path = this.isClusterRole ? '/authority/clusterroles' : '/authority/roles'
      const query = {}
      // Keep the previous namespace when returning
      const previousNamespace = this.$route.query.previousNamespace
      if (previousNamespace) {
        query.namespace = previousNamespace
      } else if (this.roleForm.namespace) {
        // If no previous namespace but we have a current one, use that
        query.namespace = this.roleForm.namespace
      }
      this.$router.push({ path, query })
    },
    async getNamespaceList() {
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('pod/getNamespaces')
        this.namespaces = (response.data || []).map(ns => ns.name)
        
        // If we're not in edit mode and have namespaces, set the first one as default
        if (!this.isEdit && this.namespaces.length > 0) {
          this.roleForm.namespace = this.namespaces[0]
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
      } finally {
        this.listLoading = false
      }
    }
  }
}
</script>
