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
      <el-form-item label="Replicas">
        <el-input-number v-model="form.replicas" :min="1" :max="20" />
      </el-form-item>

      <el-form-item label="Labels">
        <dynamic-item v-model="form.labels" :allow-empty="false" />
      </el-form-item>

      <el-form-item label="Selectors">
        <dynamic-item v-model="form.selector" :allow-empty="false" />
      </el-form-item>

      <h3>Pod Template</h3>
      <el-alert type="info" show-icon>
        Pod template configuration defines the containers to run in this statefulset
      </el-alert>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Basic" name="basic">
          <el-form-item label="Labels">
            <dynamic-item v-model="form.template.base.labels" :allow-empty="false" />
          </el-form-item>
          <el-form-item label="Restart Policy">
            <el-select v-model="form.template.base.restartPolicy" placeholder="Restart Policy">
              <el-option label="Always" value="Always" />
              <el-option label="On-Failure" value="On-Failure" />
              <el-option label="Never" value="Never" />
            </el-select>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="Containers" name="containers">
          <el-alert type="info" show-icon>
            Define the main containers for this statefulset
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
              width="300">
              <template slot-scope="scope">
                <el-input v-model="scope.row.image"></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="Pull Policy"
              width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.imagePullPolicy" placeholder="Pull Policy">
                  <el-option label="Always" value="Always" />
                  <el-option label="IfNotPresent" value="IfNotPresent" />
                  <el-option label="Never" value="Never" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="Operations">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeleteContainer(scope.$index)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button type="primary" @click="addContainer">Add Container</el-button>
        </el-tab-pane>

        <el-tab-pane label="Env Variables" name="env">
          <el-alert type="info" show-icon>
            Configure environment variables for containers
          </el-alert>

          <el-select v-model="currentContainer" placeholder="Select Container" style="margin-bottom: 20px;">
            <el-option
              v-for="container in form.template.containers"
              :key="container.name"
              :label="container.name"
              :value="container.name"
            />
          </el-select>

          <div v-if="currentContainer">
            <dynamic-item v-model="getContainerByName(currentContainer).env" :allow-empty="false" key-label="Name" value-label="Value" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="Volume Claims" name="volumeClaims">
          <el-alert type="info" show-icon>
            Configure persistent volume claims for this statefulset
          </el-alert>
          
          <el-form-item label="Service Name">
            <el-input v-model="form.serviceName" placeholder="Service name for StatefulSet" />
          </el-form-item>

          <h4>Volume Claims Templates</h4>
          <el-table
            :data="form.volumeClaimTemplates"
            style="width: 100%">
            <el-table-column
              label="Name"
              width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name"></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="Storage Class"
              width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.storageClassName" placeholder="Storage Class">
                  <el-option
                    v-for="item in storageClassList"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="Size"
              width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.storage" placeholder="e.g. 1Gi"></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="Access Mode"
              width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.accessMode" placeholder="Access Mode">
                  <el-option label="ReadWriteOnce" value="ReadWriteOnce" />
                  <el-option label="ReadOnlyMany" value="ReadOnlyMany" />
                  <el-option label="ReadWriteMany" value="ReadWriteMany" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="Operations">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeleteVolumeClaim(scope.$index)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button type="primary" @click="addVolumeClaim">Add Volume Claim</el-button>
        </el-tab-pane>
        
        <el-tab-pane label="Node Scheduling" name="nodeScheduling">
          <el-form-item label="Node Selection Strategy">
            <el-select v-model="form.template.nodeScheduling.type" placeholder="Strategy">
              <el-option label="Node Name" value="nodeName" />
              <el-option label="Node Selector" value="nodeSelector" />
              <el-option label="Node Affinity" value="nodeAffinity" />
            </el-select>
          </el-form-item>

          <template v-if="form.template.nodeScheduling.type === 'nodeName'">
            <el-form-item label="Node Name">
              <el-input v-model="form.template.nodeScheduling.nodeName" />
            </el-form-item>
          </template>

          <template v-if="form.template.nodeScheduling.type === 'nodeSelector'">
            <el-form-item label="Node Selectors">
              <dynamic-item v-model="form.template.nodeScheduling.nodeSelector" :allow-empty="false" />
            </el-form-item>
          </template>
        </el-tab-pane>

        <el-tab-pane label="Resources" name="resources">
          <el-form-item label="Enable Resources">
            <el-switch v-model="form.template.containers[0].resources.enable" />
          </el-form-item>

          <template v-if="form.template.containers[0].resources.enable">
            <el-form-item label="CPU Request (m)">
              <el-input-number v-model="form.template.containers[0].resources.CPUReq" :min="1" :step="100" />
            </el-form-item>
            <el-form-item label="CPU Limit (m)">
              <el-input-number v-model="form.template.containers[0].resources.CPULimit" :min="1" :step="100" />
            </el-form-item>
            <el-form-item label="Memory Request (Mi)">
              <el-input-number v-model="form.template.containers[0].resources.memory" :min="1" :step="64" />
            </el-form-item>
            <el-form-item label="Memory Limit (Mi)">
              <el-input-number v-model="form.template.containers[0].resources.memoryLimit" :min="1" :step="64" />
            </el-form-item>
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Update' : 'Create' }}</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import DynamicItem from '@/components/DynamicItem'

export default {
  components: { DynamicItem },
  data() {
    return {
      activeTab: 'basic',
      currentContainer: '',
      form: {
        namespace: '',
        name: '',
        replicas: 1,
        serviceName: '',
        labels: [{ key: 'app', value: '' }],
        selector: [{ key: 'app', value: '' }],
        volumeClaimTemplates: [],
        template: {
          base: {
            namespace: '',
            name: '',
            labels: [{ key: 'app', value: '' }],
            restartPolicy: 'Always'
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
      storageClassList: [],
      loading: false,
      isEdit: false
    }
  },
  async created() {
    await this.getNamespaceList()
    await this.getStorageClassList()

    if (this.$route.query.name && this.$route.query.namespace) {
      this.isEdit = true
      await this.getStatefulSetDetail()
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
    async getStorageClassList() {
      try {
        const response = await this.$store.dispatch('storageclass/getStorageClassList')
        this.storageClassList = response.data || []
      } catch (error) {
        console.error('Failed to get storage class list:', error)
        this.$message.error('Failed to get storage class list')
      }
    },
    async getStatefulSetDetail() {
      this.loading = true
      try {
        const response = await this.$store.dispatch('statefulset/getStatefulSetDetail', this.$route.query)
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
          this.$message.error('Failed to get statefulset details: Empty response')
        }
      } catch (error) {
        console.error('Failed to get statefulset details:', error)
        this.$message.error('Failed to get statefulset details')
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
    handleDeleteVolumeClaim(index) {
      this.form.volumeClaimTemplates.splice(index, 1)
    },
    addVolumeClaim() {
      this.form.volumeClaimTemplates.push({
        name: '',
        storageClassName: this.storageClassList.length > 0 ? this.storageClassList[0].name : '',
        storage: '1Gi',
        accessMode: 'ReadWriteOnce'
      })
    },
    getContainerByName(name) {
      return this.form.template.containers.find(c => c.name === name) || {}
    },
    onSubmit() {
      if (!this.form.name) {
        this.$message.error('Please enter a statefulset name')
        return
      }

      if (!this.form.template.containers[0].name || !this.form.template.containers[0].image) {
        this.$message.error('Container name and image are required')
        return
      }

      if (!this.form.serviceName) {
        this.$message.error('Service name is required for StatefulSet')
        return
      }

      this.loading = true
      this.$store.dispatch('statefulset/createOrUpdateStatefulSet', this.form)
        .then(() => {
          this.$notify({
            title: 'Success',
            message: this.isEdit ? 'StatefulSet updated successfully' : 'StatefulSet created successfully',
            type: 'success',
            duration: 2000
          })
          this.$router.push({
            path: '/workload/statefulsets',
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
        path: '/workload/statefulsets', 
        query: { namespace: this.form.namespace }
      })
    }
  }
}
</script>