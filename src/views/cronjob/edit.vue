<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Info</span>
        </div>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" placeholder="Please enter cronjob name"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-select v-model="form.namespace" :disabled="isEdit" placeholder="Please select namespace" style="width: 100%">
            <el-option v-for="item in namespaceList" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Schedule Settings</span>
        </div>
        <el-form-item label="Schedule" prop="schedule">
          <el-input v-model="form.schedule" placeholder="Enter cron expression (e.g. '*/1 * * * *')"></el-input>
        </el-form-item>
        <el-form-item label="Suspend">
          <el-switch v-model="form.suspend"></el-switch>
        </el-form-item>
        <el-form-item label="Concurrency Policy" prop="concurrencyPolicy">
          <el-select v-model="form.concurrencyPolicy" placeholder="Select concurrency policy" style="width: 100%">
            <el-option label="Allow" value="Allow"></el-option>
            <el-option label="Forbid" value="Forbid"></el-option>
            <el-option label="Replace" value="Replace"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Starting Deadline (seconds)">
          <el-input-number v-model="form.startingDeadlineSeconds" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="Successful Jobs History Limit">
          <el-input-number v-model="form.successfulJobsHistoryLimit" :min="0" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="Failed Jobs History Limit">
          <el-input-number v-model="form.failedJobsHistoryLimit" :min="0" :max="100"></el-input-number>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Job Template</span>
        </div>
        <el-form-item label="Restart Policy" prop="restartPolicy">
          <el-select v-model="form.template.restartPolicy" placeholder="Select restart policy" style="width: 100%">
            <el-option label="OnFailure" value="OnFailure"></el-option>
            <el-option label="Never" value="Never"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Container Settings">
          <div v-for="(container, index) in form.template.containers" :key="index" class="container-item">
            <el-divider v-if="index > 0" content-position="left">Container {{index + 1}}</el-divider>
            <el-form-item label="Name" :prop="'template.containers.' + index + '.name'" :rules="containerRules.name">
              <el-input v-model="container.name" placeholder="Container name"></el-input>
            </el-form-item>
            <el-form-item label="Image" :prop="'template.containers.' + index + '.image'" :rules="containerRules.image">
              <el-input v-model="container.image" placeholder="Container image"></el-input>
            </el-form-item>
            <el-form-item label="Image Pull Policy">
              <el-select v-model="container.imagePullPolicy" placeholder="Select pull policy">
                <el-option label="IfNotPresent" value="IfNotPresent"></el-option>
                <el-option label="Always" value="Always"></el-option>
                <el-option label="Never" value="Never"></el-option>
              </el-select>
            </el-form-item>

            <!-- Command and args -->
            <el-form-item label="Command">
              <el-input
                type="textarea"
                v-model="container.command"
                placeholder="Enter command (one per line)"
                :autosize="{ minRows: 2, maxRows: 4 }"
              ></el-input>
            </el-form-item>
            <el-form-item label="Arguments">
              <el-input
                type="textarea"
                v-model="container.args"
                placeholder="Enter arguments (one per line)"
                :autosize="{ minRows: 2, maxRows: 4 }"
              ></el-input>
            </el-form-item>

            <!-- Resources -->
            <el-form-item label="Enable Resources">
              <el-switch v-model="container.resources.enable"></el-switch>
            </el-form-item>
            <template v-if="container.resources.enable">
              <el-form-item label="CPU Request (m)">
                <el-input-number v-model="container.resources.CPUReq" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="CPU Limit (m)">
                <el-input-number v-model="container.resources.CPULimit" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="Memory Request (Mi)">
                <el-input-number v-model="container.resources.memory" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="Memory Limit (Mi)">
                <el-input-number v-model="container.resources.memoryLimit" :min="0"></el-input-number>
              </el-form-item>
            </template>

            <el-button v-if="index > 0" type="danger" @click.prevent="removeContainer(index)">Remove Container</el-button>
          </div>
          <el-button type="primary" @click="addContainer">Add Container</el-button>
        </el-form-item>
      </el-card>

      <div style="margin-top: 20px">
        <el-button type="primary" @click="submitForm">{{ isEdit ? 'Update' : 'Create' }}</el-button>
        <el-button @click="goBack">Cancel</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CronJobEdit',
  data() {
    return {
      isEdit: false,
      loading: false,
      namespaceList: [],
      form: {
        name: '',
        namespace: '',
        schedule: '*/1 * * * *',
        suspend: false,
        concurrencyPolicy: 'Allow',
        startingDeadlineSeconds: 0,
        successfulJobsHistoryLimit: 3,
        failedJobsHistoryLimit: 1,
        template: {
          restartPolicy: 'Never',
          containers: [{
            name: '',
            image: '',
            imagePullPolicy: 'IfNotPresent',
            command: '',
            args: '',
            resources: {
              enable: false,
              CPUReq: 100,
              CPULimit: 200,
              memory: 128,
              memoryLimit: 256
            }
          }]
        }
      },
      rules: {
        name: [
          { required: true, message: 'Please input cronjob name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please select namespace', trigger: 'change' }
        ],
        schedule: [
          { required: true, message: 'Please input schedule expression', trigger: 'blur' }
        ],
        concurrencyPolicy: [
          { required: true, message: 'Please select concurrency policy', trigger: 'change' }
        ]
      },
      containerRules: {
        name: [{ required: true, message: 'Please input container name', trigger: 'blur' }],
        image: [{ required: true, message: 'Please input container image', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState({
      currentCronJob: state => state.cronjob.currentCronJob || {}
    })
  },
  async created() {
    await this.getNamespaceList()

    if (this.$route.query.name && this.$route.query.namespace) {
      this.isEdit = true
      await this.getCronJobDetail()
    }
  },
  methods: {
    async getNamespaceList() {
      try {
        const response = await this.$store.dispatch('pod/getNamespaces')
        this.namespaceList = response.data || []
        
        // If we have a namespace from URL params, use it first
        const urlNamespace = this.$route.query.namespace
        if (urlNamespace) {
          this.form.namespace = urlNamespace
        } else if (this.namespaceList.length > 0) {
          this.form.namespace = this.namespaceList[0].name
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
      }
    },
    async getCronJobDetail() {
      try {
        await this.$store.dispatch('cronjob/getCronJobDetail', {
          namespace: this.$route.query.namespace,
          name: this.$route.query.name
        })
        
        // Map the cronjob data to form
        const cronJob = this.currentCronJob
        this.form = {
          name: cronJob.name || '',
          namespace: cronJob.namespace || '',
          schedule: cronJob.schedule || '*/1 * * * *',
          suspend: cronJob.suspend || false,
          concurrencyPolicy: cronJob.concurrencyPolicy || 'Allow',
          startingDeadlineSeconds: cronJob.startingDeadlineSeconds || 0,
          successfulJobsHistoryLimit: cronJob.successfulJobsHistoryLimit || 3,
          failedJobsHistoryLimit: cronJob.failedJobsHistoryLimit || 1,
          template: {
            restartPolicy: cronJob.template?.restartPolicy || 'Never',
            containers: Array.isArray(cronJob.template?.containers)
              ? cronJob.template.containers.map(container => ({
                  name: container.name || '',
                  image: container.image || '',
                  imagePullPolicy: container.imagePullPolicy || 'IfNotPresent',
                  command: Array.isArray(container.command) ? container.command.join('\n') : '',
                  args: Array.isArray(container.args) ? container.args.join('\n') : '',
                  resources: {
                    enable: container.resources?.enable || false,
                    CPUReq: container.resources?.CPUReq || 100,
                    CPULimit: container.resources?.CPULimit || 200,
                    memory: container.resources?.memory || 128,
                    memoryLimit: container.resources?.memoryLimit || 256
                  }
                }))
              : [this.getDefaultContainer()]
          }
        }
      } catch (error) {
        console.error('Failed to get cronjob details:', error)
        this.$message.error('Failed to get cronjob details')
      }
    },
    getDefaultContainer() {
      return {
        name: '',
        image: '',
        imagePullPolicy: 'IfNotPresent',
        command: '',
        args: '',
        resources: {
          enable: false,
          CPUReq: 100,
          CPULimit: 200,
          memory: 128,
          memoryLimit: 256
        }
      }
    },
    addContainer() {
      this.form.template.containers.push(this.getDefaultContainer())
    },
    removeContainer(index) {
      this.form.template.containers.splice(index, 1)
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        const data = {
          ...this.form,
          template: {
            ...this.form.template,
            containers: this.form.template.containers.map(container => ({
              ...container,
              command: container.command ? container.command.split('\n').filter(Boolean) : [],
              args: container.args ? container.args.split('\n').filter(Boolean) : []
            }))
          }
        }

        this.loading = true
        await this.$store.dispatch('cronjob/createOrUpdateCronJob', data)
        
        this.$notify({
          title: 'Success',
          message: `Successfully ${this.isEdit ? 'updated' : 'created'} cronjob`,
          type: 'success',
          duration: 2000
        })
        
        this.goBack()
      } catch (error) {
        console.error('Failed to submit form:', error)
        this.$message.error(`Failed to ${this.isEdit ? 'update' : 'create'} cronjob`)
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({
        path: '/workload/cronjobs',
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style scoped>
.container-item {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
}
.box-card {
  margin-bottom: 20px;
}
</style>