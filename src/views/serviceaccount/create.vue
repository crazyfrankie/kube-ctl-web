<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Create Service Account</span>
      </div>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px" v-loading="loading">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="ServiceAccount name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" style="width: 100%" placeholder="Please select namespace">
            <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Labels">
          <div v-for="(label, index) in form.labels" :key="index" style="display: flex; margin-bottom: 10px;">
            <el-input v-model="label.key" placeholder="Key" style="width: 200px; margin-right: 10px;"></el-input>
            <el-input v-model="label.value" placeholder="Value" style="width: 200px; margin-right: 10px;"></el-input>
            <el-button @click.prevent="removeLabel(index)" type="danger" icon="el-icon-delete" circle></el-button>
          </div>
          <el-button @click="addLabel" type="primary" size="small" icon="el-icon-plus">Add Label</el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">Create</el-button>
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
  name: 'ServiceAccountCreate',
  data() {
    return {
      loading: false,
      submitting: false,
      form: {
        namespace: '',
        name: '',
        labels: []
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
      
      // Pre-select namespace if provided in URL
      if (this.$route.query.namespace) {
        this.form.namespace = this.$route.query.namespace
      }
    },
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        if (!this.form.namespace && this.namespaces.length > 0) {
          this.form.namespace = this.namespaces[0].name
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        Message.error('Failed to get namespace list')
      }
    },
    addLabel() {
      this.form.labels.push({ key: '', value: '' })
    },
    removeLabel(index) {
      this.form.labels.splice(index, 1)
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // Prepare form data
        const formData = {
          namespace: this.form.namespace,
          name: this.form.name,
          labels: this.form.labels.filter(label => label.key && label.value)
        }
        
        // Send to API
        await this.$store.dispatch('serviceaccount/createServiceAccount', formData)
        
        // Display success message
        Message.success('ServiceAccount created successfully')
        
        // Navigate back to list
        this.goBack()
      } catch (error) {
        console.error('Failed to submit form:', error)
        Message.error('Failed to create ServiceAccount')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/authority/serviceaccounts',
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-help-text {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}
</style>