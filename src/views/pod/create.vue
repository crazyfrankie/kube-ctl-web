<template>
  <div class="app-container">
    <el-form ref="form" :model="podForm" label-width="120px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>基本信息</span>
        </div>
        <el-form-item label="名称" prop="base.name">
          <el-input v-model="podForm.base.name" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="命名空间" prop="base.namespace">
          <el-select v-model="podForm.base.namespace" placeholder="请选择命名空间" :disabled="isEdit">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="重启策略" prop="base.restartPolicy">
          <el-select v-model="podForm.base.restartPolicy">
            <el-option label="Always" value="Always" />
            <el-option label="Never" value="Never" />
            <el-option label="On-Failure" value="On-Failure" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-button size="small" type="primary" @click="addLabel('base')">添加标签</el-button>
          <div v-for="(label, index) in podForm.base.labels" :key="index" style="margin-top: 10px">
            <el-input v-model="label.key" placeholder="键" style="width: 200px" />
            <el-input v-model="label.value" placeholder="值" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeLabel('base', index)">删除</el-button>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>网络配置</span>
        </div>
        <el-form-item label="主机名" prop="network.hostName">
          <el-input v-model="podForm.network.hostName" />
        </el-form-item>
        <el-form-item label="使用主机网络">
          <el-switch v-model="podForm.network.hostNetwork" />
        </el-form-item>
        <el-form-item label="DNS策略" prop="network.dnsPolicy">
          <el-select v-model="podForm.network.dnsPolicy">
            <el-option label="ClusterFirst" value="ClusterFirst" />
            <el-option label="None" value="None" />
            <el-option label="Default" value="Default" />
          </el-select>
        </el-form-item>
        <el-form-item label="DNS服务器">
          <el-button size="small" type="primary" @click="addDNSServer">添加DNS服务器</el-button>
          <div v-for="(server, index) in podForm.network.dnsConfig.nameservers" :key="index" style="margin-top: 10px">
            <el-input v-model="podForm.network.dnsConfig.nameservers[index]" style="width: 200px" />
            <el-button type="danger" size="small" @click="removeDNSServer(index)">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item label="主机别名">
          <el-button size="small" type="primary" @click="addHostAlias">添加主机别名</el-button>
          <div v-for="(alias, index) in podForm.network.hostAliases" :key="index" style="margin-top: 10px">
            <el-input v-model="alias.key" placeholder="IP" style="width: 200px" />
            <el-input v-model="alias.value" placeholder="主机名" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeHostAlias(index)">删除</el-button>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>存储卷</span>
          <el-button style="float: right" type="primary" size="small" @click="addVolume">添加存储卷</el-button>
        </div>
        <div v-for="(vol, index) in podForm.volume" :key="index" class="volume-item">
          <el-form-item :label="'存储卷 ' + (index + 1)">
            <el-input v-model="vol.name" placeholder="名称" style="width: 200px" />
            <el-select v-model="vol.type" placeholder="类型" style="width: 200px; margin: 0 10px">
              <el-option label="emptyDir" value="emptyDir" />
              <el-option label="hostPath" value="hostPath" />
              <el-option label="configMap" value="configMap" />
            </el-select>
            <el-button type="danger" size="small" @click="removeVolume(index)">删除</el-button>
          </el-form-item>
        </div>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>容器配置</span>
        </div>
        <div class="container-section">
          <h4>初始化容器</h4>
          <el-button type="primary" size="small" @click="addContainer('init')">添加初始化容器</el-button>
          <container-form
            v-for="(container, index) in podForm.initContainers"
            :key="'init-' + index"
            :container="container"
            @remove="removeContainer('init', index)"
          />
        </div>
        <div class="container-section" style="margin-top: 20px">
          <h4>主容器</h4>
          <el-button type="primary" size="small" @click="addContainer('main')">添加主容器</el-button>
          <container-form
            v-for="(container, index) in podForm.containers"
            :key="'main-' + index"
            :container="container"
            @remove="removeContainer('main', index)"
          />
        </div>
      </el-card>

      <div style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContainerForm from './components/container-form'
import { Message } from 'element-ui'

export default {
  name: 'PodCreate',
  components: {
    ContainerForm
  },
  data() {
    return {
      isEdit: false,
      podForm: {
        base: {
          name: '',
          namespace: '',
          restartPolicy: 'Always',
          labels: []
        },
        network: {
          hostName: '',
          hostNetwork: false,
          dnsPolicy: 'ClusterFirst',
          dnsConfig: {
            nameservers: []
          },
          hostAliases: []
        },
        volume: [],
        initContainers: [],
        containers: []
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  created() {
    this.getNamespaces()
    this.initForm()
  },
  methods: {
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        if (this.$route.query.namespace) {
          this.podForm.base.namespace = this.$route.query.namespace
        } else if (this.namespaces.length > 0) {
          this.podForm.base.namespace = this.namespaces[0].name
        }
      } catch (error) {
        Message.error('获取命名空间列表失败')
      }
    },
    async initForm() {
      const { name, namespace, isEdit } = this.$route.query
      this.isEdit = isEdit === 'true'

      if (this.isEdit && name && namespace) {
        try {
          const response = await this.$store.dispatch('pod/getPodDetail', { name, namespace })
          this.podForm = response.data
        } catch (error) {
          Message.error('获取Pod详情失败')
        }
      }
    },
    addLabel(type) {
      this.podForm[type].labels.push({ key: '', value: '' })
    },
    removeLabel(type, index) {
      this.podForm[type].labels.splice(index, 1)
    },
    addDNSServer() {
      this.podForm.network.dnsConfig.nameservers.push('')
    },
    removeDNSServer(index) {
      this.podForm.network.dnsConfig.nameservers.splice(index, 1)
    },
    addHostAlias() {
      this.podForm.network.hostAliases.push({ key: '', value: '' })
    },
    removeHostAlias(index) {
      this.podForm.network.hostAliases.splice(index, 1)
    },
    addVolume() {
      this.podForm.volume.push({ name: '', type: 'emptyDir' })
    },
    removeVolume(index) {
      this.podForm.volume.splice(index, 1)
    },
    addContainer(type) {
      const container = {
        name: '',
        image: '',
        imagePullPolicy: 'IfNotPresent',
        ports: [],
        env: [],
        volumeMounts: [],
        resources: {
          enable: false,
          CPUReq: 100,
          CPULimit: 200,
          memory: 128,
          memoryLimit: 256
        }
      }
      if (type === 'init') {
        this.podForm.initContainers.push(container)
      } else {
        this.podForm.containers.push(container)
      }
    },
    removeContainer(type, index) {
      if (type === 'init') {
        this.podForm.initContainers.splice(index, 1)
      } else {
        this.podForm.containers.splice(index, 1)
      }
    },
    async submitForm() {
      try {
        await this.$store.dispatch('pod/createPod', this.podForm)
        Message.success(this.isEdit ? '更新成功' : '创建成功')
        this.goBack()
      } catch (error) {
        Message.error(this.isEdit ? '更新失败' : '创建失败')
      }
    },
    goBack() {
      this.$router.push('/pod/list')
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
.container-section {
  margin-bottom: 20px;
}
.volume-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
</style>
