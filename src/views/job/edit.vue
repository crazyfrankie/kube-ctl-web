<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="Namespace">
        <el-select v-model="form.namespace" placeholder="Namespace">
          <el-option
            v-for="item in namespaceList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="form.name" />
      </el-form-item>
      
      <el-form-item label="Completions">
        <el-input-number v-model="form.completions" :min="1" :max="1000" />
      </el-form-item>
      
      <el-form-item label="Parallelism">
        <el-input-number v-model="form.parallelism" :min="1" :max="1000" />
      </el-form-item>

      <el-form-item label="Labels">
        <dynamic-item v-model="form.labels" :allow-empty="false" />
      </el-form-item>

      <el-form-item label="Selectors">
        <dynamic-item v-model="form.selector" :allow-empty="false" />
      </el-form-item>
      
      <el-form-item label="Active Deadline (seconds)">
        <el-input-number v-model="form.activeDeadlineSeconds" :min="0" />
      </el-form-item>
      
      <el-form-item label="Backoff Limit">
        <el-input-number v-model="form.backoffLimit" :min="0" :max="10" />
        <div class="form-help-text">Number of retries before marking the job as failed</div>
      </el-form-item>

      <h3>Pod Template</h3>
      <el-alert type="info" show-icon>
        Pod template configuration defines the containers to run in this job
      </el-alert>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Basic" name="basic">
          <el-form-item label="Labels">
            <dynamic-item v-model="form.template.base.labels" :allow-empty="false" />
          </el-form-item>
          <el-form-item label="Restart Policy">
            <el-select v-model="form.template.base.restartPolicy" placeholder="Restart Policy">
              <el-option label="OnFailure" value="OnFailure" />
              <el-option label="Never" value="Never" />
            </el-select>
            <div class="form-help-text">For jobs, RestartPolicy must be OnFailure or Never</div>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="Containers" name="containers">
          <el-alert type="info" show-icon>
            Define the containers for this job
          </el-alert>

          <el-table
            :data="form.template.containers"
            style="width: 100%">
            <el-table-column
              label="Name"
              width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name"></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="Image"
              width="280">
              <template slot-scope="scope">
                <el-input v-model="scope.row.image"></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="Pull Policy"
              width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.imagePullPolicy" placeholder="Pull Policy">
                  <el-option label="IfNotPresent" value="IfNotPresent" />
                  <el-option label="Always" value="Always" />
                  <el-option label="Never" value="Never" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="Operations"
              width="120">
              <template slot-scope="scope">
                <el-button
                  @click.prevent="handleDeleteContainer(scope.$index)"
                  type="danger"
                  size="small">
                  Delete
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-button @click="addContainer" type="primary">Add Container</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Env" name="env" v-if="form.template.containers.length > 0">
          <el-alert type="info" show-icon>
            Define environment variables for containers
          </el-alert>
          
          <el-select v-model="currentContainer" placeholder="Select Container" style="width: 100%; margin-bottom: 20px;">
            <el-option
              v-for="container in form.template.containers"
              :key="container.name"
              :label="container.name || 'Unnamed Container'"
              :value="container.name"
              :disabled="!container.name"
            />
          </el-select>

          <div v-if="currentContainer">
            <dynamic-item v-model="getContainerByName(currentContainer).env" :allow-empty="true" keyName="name" valueName="value" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="Resources" name="resources" v-if="form.template.containers.length > 0">
          <el-alert type="info" show-icon>
            Define resource limits for containers
          </el-alert>
          
          <el-select v-model="currentContainer" placeholder="Select Container" style="width: 100%; margin-bottom: 20px;">
            <el-option
              v-for="container in form.template.containers"
              :key="container.name"
              :label="container.name || 'Unnamed Container'"
              :value="container.name"
              :disabled="!container.name"
            />
          </el-select>

          <div v-if="currentContainer">
            <el-form-item label="Enable Resource Limits">
              <el-switch v-model="getContainerByName(currentContainer).resources.enable" />
            </el-form-item>
            
            <template v-if="getContainerByName(currentContainer).resources.enable">
              <el-form-item label="CPU Request (millicores)">
                <el-input-number v-model="getContainerByName(currentContainer).resources.CPUReq" :min="10" :max="10000" />
              </el-form-item>
              <el-form-item label="CPU Limit (millicores)">
                <el-input-number v-model="getContainerByName(currentContainer).resources.CPULimit" :min="10" :max="10000" />
              </el-form-item>
              <el-form-item label="Memory Request (MB)">
                <el-input-number v-model="getContainerByName(currentContainer).resources.memory" :min="1" :max="65536" />
              </el-form-item>
              <el-form-item label="Memory Limit (MB)">
                <el-input-number v-model="getContainerByName(currentContainer).resources.memoryLimit" :min="1" :max="65536" />
              </el-form-item>
            </template>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Node Scheduling" name="nodeSchedule">
          <el-alert type="info" show-icon>
            Configure node scheduling options for the job
          </el-alert>
          
          <el-form-item label="Schedule Type">
            <el-radio-group v-model="form.template.nodeScheduling.type">
              <el-radio label="nodeName">By Node Name</el-radio>
              <el-radio label="nodeSelector">By Node Selector</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item v-if="form.template.nodeScheduling.type === 'nodeName'" label="Node Name">
            <el-input v-model="form.template.nodeScheduling.nodeName" placeholder="Node name" />
          </el-form-item>
          
          <el-form-item v-if="form.template.nodeScheduling.type === 'nodeSelector'" label="Node Selector">
            <dynamic-item v-model="form.template.nodeScheduling.nodeSelector" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <div style="margin-top: 20px">
        <el-button type="primary" @click="onSubmit" :loading="loading">{{ isEdit ? 'Update' : 'Create' }}</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import DynamicItem from '@/components/DynamicItem'

export default {
  name: 'JobEdit',
  components: { DynamicItem },
  data() {
    return {
      activeTab: 'basic',
      currentContainer: '',
      form: {
        namespace: '',
        name: '',
        completions: 1,
        parallelism: 1,
        backoffLimit: 6,
        activeDeadlineSeconds: null,
        labels: [{ key: 'app', value: '' }],
        selector: [{ key: 'app', value: '' }],
        template: {
          base: {
            namespace: '',
            name: '',
            labels: [{ key: 'app', value: '' }],
            restartPolicy: 'OnFailure'
          },
          containers: [{
            name: '',
            image: '',
            imagePullPolicy: 'IfNotPresent',
            env: [],
            resources: {
              enable: false,
              CPUReq: 100,
              CPULimit: 200,
              memory: 128,
              memoryLimit: 256
            }
          }],
          nodeScheduling: {
            type: 'nodeName',
            nodeName: '',
            nodeSelector: []
          }
        }
      },
      namespaceList: [],
      loading: false,
      isEdit: false
    }
  },
  async created() {
    await this.getNamespaceList()

    if (this.$route.query.name && this.$route.query.namespace) {
      this.isEdit = true
      await this.getJobDetail()
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
          this.form.template.base.namespace = urlNamespace
        } else if (this.namespaceList.length > 0 && !this.form.namespace) {
          this.form.namespace = this.namespaceList[0].name
          this.form.template.base.namespace = this.namespaceList[0].name
        }
      } catch (error) {
        console.error('Failed to get namespace list:', error)
        this.$message.error('Failed to get namespace list')
      }
    },
    async getJobDetail() {
      this.loading = true
      try {
        const response = await this.$store.dispatch('job/getJobDetail', this.$route.query)
        if (response && response.data) {
          this.form = response.data
          // Make sure namespace is properly set
          if (this.form.namespace && this.namespaceList.some(item => item.name === this.form.namespace)) {
            this.form.template.base.namespace = this.form.namespace
          }
          // Set current container for env tab
          if (this.form.template && this.form.template.containers && this.form.template.containers.length > 0) {
            this.currentContainer = this.form.template.containers[0].name
          }
        } else {
          this.$message.error('Failed to get job details: Empty response')
        }
      } catch (error) {
        console.error('Failed to get job details:', error)
        this.$message.error('Failed to get job details')
      } finally {
        this.loading = false
      }
    },
    handleDeleteContainer(index) {
      this.form.template.containers.splice(index, 1)
      if (this.form.template.containers.length === 0) {
        this.form.template.containers.push({
          name: '',
          image: '',
          imagePullPolicy: 'IfNotPresent',
          env: [],
          resources: {
            enable: false,
            CPUReq: 100,
            CPULimit: 200,
            memory: 128,
            memoryLimit: 256
          }
        })
      }
    },
    addContainer() {
      this.form.template.containers.push({
        name: '',
        image: '',
        imagePullPolicy: 'IfNotPresent',
        env: [],
        resources: {
          enable: false,
          CPUReq: 100,
          CPULimit: 200,
          memory: 128,
          memoryLimit: 256
        }
      })
    },
    getContainerByName(name) {
      return this.form.template.containers.find(c => c.name === name) || {}
    },
    onSubmit() {
      if (!this.form.name) {
        this.$message.error('Please enter a job name')
        return
      }

      if (!this.form.template.containers[0].name || !this.form.template.containers[0].image) {
        this.$message.error('Container name and image are required')
        return
      }

      this.loading = true
      this.$store.dispatch('job/createOrUpdateJob', this.form)
        .then(() => {
          this.$notify({
            title: 'Success',
            message: this.isEdit ? 'Job updated successfully' : 'Job created successfully',
            type: 'success',
            duration: 2000
          })
          this.$router.push({
            path: '/workload/jobs',
            query: { namespace: this.form.namespace }
          })
          this.loading = false
        })
        .catch(error => {
          this.$notify({
            title: 'Error',
            message: 'Failed: ' + error.message,
            type: 'error',
            duration: 5000
          })
          this.loading = false
        })
    },
    onCancel() {
      this.$router.push({
        path: '/workload/jobs', 
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>

<style scoped>
.form-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>