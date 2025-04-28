<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? '编辑Secret' : '创建Secret'" />
    </div>

    <el-card class="box-card" v-loading="loading">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="命名空间" prop="namespace" v-if="!isEdit">
          <el-select v-model="form.namespace" placeholder="请选择命名空间">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name" v-if="!isEdit">
          <el-input v-model="form.name" placeholder="请输入Secret名称"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type" v-if="!isEdit">
          <el-select v-model="form.type" placeholder="请选择Secret类型">
            <el-option label="Opaque" value="Opaque"></el-option>
            <el-option label="kubernetes.io/service-account-token" value="kubernetes.io/service-account-token"></el-option>
            <el-option label="kubernetes.io/dockerconfigjson" value="kubernetes.io/dockerconfigjson"></el-option>
            <el-option label="kubernetes.io/tls" value="kubernetes.io/tls"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据">
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
          <el-button type="primary" icon="el-icon-plus" @click="addData">添加数据</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
          <el-button @click="goBack">取消</el-button>
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
          { required: true, message: '请选择命名空间', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
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
        Message.error('获取命名空间列表失败')
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
        Message.error('获取Secret详情失败')
      }
      this.loading = false
    },
    addData() {
      this.form.data.push({ key: '', value: '' })
    },
    removeData(index) {
      this.form.data.splice(index, 1)
    },
    async onSubmit() {
      if (this.form.data.some(item => !item.key || !item.value)) {
        Message.warning('请填写完整的数据信息')
        return
      }

      const data = {}
      this.form.data.forEach(item => {
        data[item.key] = Buffer.from(item.value).toString('base64')
      })

      try {
        if (this.isEdit) {
          await this.$store.dispatch('secret/updateSecret', {
            namespace: this.form.namespace,
            name: this.form.name,
            type: this.form.type,
            data
          })
          Message.success('更新成功')
        } else {
          await this.$store.dispatch('secret/createSecret', {
            namespace: this.form.namespace,
            name: this.form.name,
            type: this.form.type,
            data
          })
          Message.success('创建成功')
        }
        this.goBack()
      } catch (error) {
        Message.error(this.isEdit ? '更新失败' : '创建失败')
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