<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? 'Edit Secret' : 'Create Secret'" />
    </div>

    <el-card class="box-card" v-loading="loading">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Namespace" prop="namespace" v-if="!isEdit">
          <el-select v-model="form.namespace" placeholder="Select namespace">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Name" prop="name" v-if="!isEdit">
          <el-input v-model="form.name" placeholder="Enter Secret name"></el-input>
        </el-form-item>
        <el-form-item label="Type" prop="type" v-if="!isEdit">
          <el-select v-model="form.type" placeholder="Select Secret type">
            <el-option label="Opaque" value="Opaque"></el-option>
            <el-option label="kubernetes.io/service-account-token" value="kubernetes.io/service-account-token"></el-option>
            <el-option label="kubernetes.io/dockerconfigjson" value="kubernetes.io/dockerconfigjson"></el-option>
            <el-option label="kubernetes.io/tls" value="kubernetes.io/tls"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Data">
          <div v-for="(item, index) in form.data" :key="index" class="data-item">
            <el-input v-model="item.key" placeholder="Key" style="width: 200px; margin-right: 10px;"></el-input>
            <el-input
              type="textarea"
              v-model="item.value"
              placeholder="Value"
              :rows="3"
              style="width: 400px; margin-right: 10px;"
            ></el-input>
            <el-button type="danger" icon="el-icon-delete" circle @click="removeData(index)"></el-button>
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addData">Add Data</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Save' : 'Create' }}</el-button>
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
  name: 'SecretEdit',
  data() {
    return {
      loading: false,
      isEdit: false,
      form: {
        namespace: '',
        name: '',
        type: 'Opaque',
        data: []
      },
      rules: {
        namespace: [
          { required: true, message: 'Please select a namespace', trigger: 'change' }
        ],
        name: [
          { required: true, message: 'Please enter a name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, 
            message: 'Name can only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number', 
            trigger: 'blur' 
          }
        ],
        type: [
          { required: true, message: 'Please select a type', trigger: 'change' }
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
      const { namespace, name } = this.$route.query
      if (name) {
        this.isEdit = true
        this.form.namespace = namespace
        this.form.name = name
        this.fetchData()
      } else {
        this.form.namespace = namespace
        this.getNamespaces()
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
    async fetchData() {
      this.loading = true
      try {
        const response = await this.$store.dispatch('secret/getSecretDetail', {
          namespace: this.form.namespace,
          name: this.form.name
        })
        const detail = response.data
        this.form.type = detail.type
        this.form.data = Object.entries(detail.data || {}).map(([key, value]) => ({
          key,
          value: Buffer.from(value, 'base64').toString()
        }))
      } catch (error) {
        console.error('Failed to get Secret details:', error)
        Message.error('Failed to get Secret details')
      } finally {
        this.loading = false
      }
    },
    addData() {
      this.form.data.push({ key: '', value: '' })
    },
    removeData(index) {
      this.form.data.splice(index, 1)
    },
    async onSubmit() {
      if (this.form.data.some(item => !item.key || !item.value)) {
        Message.warning('Please fill in complete data information')
        return
      }

      const data = {}
      this.form.data.forEach(item => {
        data[item.key] = Buffer.from(item.value).toString('base64')
      })

      try {
        this.loading = true
        if (this.isEdit) {
          await this.$store.dispatch('secret/createOrUpdateSecret', {
            namespace: this.form.namespace,
            name: this.form.name,
            type: this.form.type,
            data
          })
          Message.success('Updated successfully')
        } else {
          await this.$store.dispatch('secret/createOrUpdateSecret', {
            namespace: this.form.namespace,
            name: this.form.name,
            type: this.form.type,
            data
          })
          Message.success('Created successfully')
        }
        this.goBack()
      } catch (error) {
        console.error('Failed to save Secret:', error)
        Message.error(this.isEdit ? 'Update failed' : 'Creation failed')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/volume/secrets')
    }
  }
}
</script>

<style scoped>
.detail-header {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.data-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
</style>