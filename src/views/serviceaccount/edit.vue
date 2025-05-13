<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="Namespace" prop="namespace">
        <el-select v-model="form.namespace" placeholder="Select Namespace" style="width: 100%" :disabled="isEdit">
          <el-option
            v-for="item in namespaceList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" placeholder="ServiceAccount name" :disabled="isEdit" />
      </el-form-item>

      <!-- Labels -->
      <el-form-item label="Labels">
        <div v-for="(label, index) in form.labels" :key="index" class="label-item">
          <el-input v-model="label.key" placeholder="Key" style="width: 40%; margin-right: 10px" :rules="keyRules">
          </el-input>
          <el-input v-model="label.value" placeholder="Value" style="width: 40%">
          </el-input>
          <el-button type="danger" icon="el-icon-delete" circle size="mini" style="margin-left: 10px" @click="removeLabel(index)"></el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addLabel">Add Label</el-button>
      </el-form-item>

      <!-- Automount Service Account Token -->
      <el-form-item label="Automount Token">
        <el-switch v-model="form.automountServiceAccountToken" />
      </el-form-item>

      <!-- Image Pull Secrets -->
      <el-form-item label="Image Pull Secrets">
        <div v-for="(secret, index) in form.imagePullSecrets" :key="index" class="secret-item">
          <el-input v-model="secret.name" placeholder="Secret Name" style="width: 80%"></el-input>
          <el-button type="danger" icon="el-icon-delete" circle size="mini" style="margin-left: 10px" @click="removeImagePullSecret(index)"></el-button>
        </div>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addImagePullSecret">Add Image Pull Secret</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="submitting">Submit</el-button>
        <el-button @click="goBack">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'ServiceAccountEdit',
  data() {
    return {
      isEdit: false,
      form: {
        name: '',
        namespace: '',
        labels: [],
        automountServiceAccountToken: true,
        imagePullSecrets: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, 
            message: 'Name can only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number', 
            trigger: 'blur' 
          }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ]
      },
      keyRules: [
        { required: true, message: 'Key is required', trigger: 'blur' }
      ],
      submitting: false,
      namespaceList: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      // Get namespace list
      try {
        const response = await this.$store.dispatch('pod/getNamespaces')
        this.namespaceList = response.data || []
        
        // Check if we're in edit mode
        const { namespace, name } = this.$route.query
        if (name) {
          // Edit mode
          this.isEdit = true
          this.form.namespace = namespace
          this.form.name = name
          
          // Fetch service account details
          await this.getServiceAccountDetail()
        } else {
          // Create mode
          // Set namespace from query parameter or use first namespace
          const urlNamespace = this.$route.query.namespace
          if (urlNamespace) {
            this.form.namespace = urlNamespace
          } else if (this.namespaceList.length > 0) {
            this.form.namespace = this.namespaceList[0].name
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
        Message.error('Failed to initialize')
      }
    },
    
    addLabel() {
      this.form.labels.push({ key: '', value: '' })
    },
    
    removeLabel(index) {
      this.form.labels.splice(index, 1)
    },
    
    addImagePullSecret() {
      this.form.imagePullSecrets.push({ name: '' })
    },
    
    removeImagePullSecret(index) {
      this.form.imagePullSecrets.splice(index, 1)
    },
    
    goBack() {
      this.$router.push({
        path: '/authority/serviceaccounts',
        query: { namespace: this.form.namespace }
      })
    },
    
    async onSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return false
        }
        
        this.submitting = true
        
        try {
          // Convert labels from array to object
          const labels = {}
          this.form.labels.forEach(label => {
            if (label.key && label.key.trim() !== '') {
              labels[label.key] = label.value
            }
          })
          
          // Filter out empty image pull secrets
          const imagePullSecrets = this.form.imagePullSecrets.filter(secret => secret.name && secret.name.trim() !== '')
          
          // Prepare service account data
          const serviceAccountData = {
            name: this.form.name,
            namespace: this.form.namespace,
            labels,
            automountServiceAccountToken: this.form.automountServiceAccountToken,
            imagePullSecrets
          }
          
          // Create or update service account
          await this.$store.dispatch('serviceaccount/createServiceAccount', serviceAccountData)
          
          Message.success(this.isEdit ? 'Updated successfully' : 'Created successfully')
          this.goBack()
        } catch (error) {
          console.error('Failed to save service account:', error)
          Message.error('Failed to save service account')
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.label-item, .secret-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>