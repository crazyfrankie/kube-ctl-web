<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="isEdit ? 'Edit Pod' : 'Create Pod'" />
    </div>

    <el-form ref="form" :model="podForm" label-width="120px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Basic Information</span>
        </div>
        <el-form-item label="Name" prop="base.name">
          <el-input v-model="podForm.base.name" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Namespace" prop="base.namespace">
          <el-select v-model="podForm.base.namespace" placeholder="Select namespace" :disabled="isEdit">
            <el-option
              v-for="item in namespaces"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Restart Policy" prop="base.restartPolicy">
          <el-select v-model="podForm.base.restartPolicy">
            <el-option label="Always" value="Always" />
            <el-option label="Never" value="Never" />
            <el-option label="On-Failure" value="On-Failure" />
          </el-select>
        </el-form-item>
        <el-form-item label="Labels">
          <el-button size="small" type="primary" @click="addLabel('base')">Add Label</el-button>
          <div v-for="(label, index) in podForm.base.labels" :key="index" style="margin-top: 10px">
            <el-input v-model="label.key" placeholder="Key" style="width: 200px" />
            <el-input v-model="label.value" placeholder="Value" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeLabel('base', index)">Delete</el-button>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Network Configuration</span>
        </div>
        <el-form-item label="Hostname" prop="network.hostName">
          <el-input v-model="podForm.network.hostName" />
        </el-form-item>
        <el-form-item label="Use Host Network">
          <el-switch v-model="podForm.network.hostNetwork" />
        </el-form-item>
        <el-form-item label="DNS Policy" prop="network.dnsPolicy">
          <el-select v-model="podForm.network.dnsPolicy">
            <el-option label="ClusterFirst" value="ClusterFirst" />
            <el-option label="None" value="None" />
            <el-option label="Default" value="Default" />
          </el-select>
        </el-form-item>
        <el-form-item label="DNS Servers">
          <el-button size="small" type="primary" @click="addDNSServer">Add DNS Server</el-button>
          <div v-for="(server, index) in podForm.network.dnsConfig.nameservers" :key="index" style="margin-top: 10px">
            <el-input v-model="podForm.network.dnsConfig.nameservers[index]" style="width: 200px" />
            <el-button type="danger" size="small" @click="removeDNSServer(index)">Delete</el-button>
          </div>
        </el-form-item>
        <el-form-item label="Host Aliases">
          <el-button size="small" type="primary" @click="addHostAlias">Add Host Alias</el-button>
          <div v-for="(alias, index) in podForm.network.hostAliases" :key="index" style="margin-top: 10px">
            <el-input v-model="alias.key" placeholder="IP" style="width: 200px" />
            <el-input v-model="alias.value" placeholder="Hostname" style="width: 200px; margin: 0 10px" />
            <el-button type="danger" size="small" @click="removeHostAlias(index)">Delete</el-button>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Volumes</span>
          <el-button style="float: right" type="primary" size="small" @click="addVolume">Add Volume</el-button>
        </div>
        <div v-for="(vol, index) in podForm.volume" :key="index" class="volume-item">
          <el-form-item :label="'Volume ' + (index + 1)" style="margin-bottom: 15px;">
            <el-input v-model="vol.name" placeholder="Volume Name" style="width: 200px" />
            <el-select v-model="vol.type" placeholder="Volume Type" style="width: 200px; margin: 0 10px">
              <el-option label="Empty Directory" value="emptyDir" />
              <el-option label="Host Path" value="hostPath" />
              <el-option label="ConfigMap" value="configMap" />
              <el-option label="Secret" value="secret" />
              <el-option label="PersistentVolumeClaim" value="pvc" />
              <el-option label="Downward API" value="downward" />
            </el-select>
            <el-button type="danger" size="small" @click="removeVolume(index)">Delete</el-button>
          </el-form-item>
          
          <!-- Volume type specific configuration -->
          <div class="volume-config" style="padding-left: 120px; margin-bottom: 15px;">
            <!-- Host Path Volume -->
            <template v-if="vol.type === 'hostPath'">
              <el-form-item label="Path" label-width="80px">
                <el-input v-model="vol.hostPathVolume.path" placeholder="Path on the host" style="width: 400px" />
              </el-form-item>
              <el-form-item label="Type" label-width="80px">
                <el-select v-model="vol.hostPathVolume.type" placeholder="Host Path Type" style="width: 400px">
                  <el-option label="Directory" value="Directory" />
                  <el-option label="DirectoryOrCreate" value="DirectoryOrCreate" />
                  <el-option label="File" value="File" />
                  <el-option label="FileOrCreate" value="FileOrCreate" />
                  <el-option label="Socket" value="Socket" />
                  <el-option label="CharDevice" value="CharDevice" />
                  <el-option label="BlockDevice" value="BlockDevice" />
                </el-select>
              </el-form-item>
            </template>
            
            <!-- ConfigMap Volume -->
            <template v-if="vol.type === 'configMap'">
              <el-form-item label="Name" label-width="80px">
                <el-input v-model="vol.configMapRefVolume.name" placeholder="ConfigMap Name" style="width: 400px" />
              </el-form-item>
              <el-form-item label="Optional" label-width="80px">
                <el-switch v-model="vol.configMapRefVolume.optional" />
              </el-form-item>
            </template>
            
            <!-- Secret Volume -->
            <template v-if="vol.type === 'secret'">
              <el-form-item label="Name" label-width="80px">
                <el-input v-model="vol.secretRefVolume.name" placeholder="Secret Name" style="width: 400px" />
              </el-form-item>
              <el-form-item label="Optional" label-width="80px">
                <el-switch v-model="vol.secretRefVolume.optional" />
              </el-form-item>
            </template>
            
            <!-- PersistentVolumeClaim Volume -->
            <template v-if="vol.type === 'pvc'">
              <el-form-item label="Claim Name" label-width="80px">
                <el-select v-model="vol.PVCVolume.claimName" placeholder="Select PVC" style="width: 400px" filterable>
                  <el-option 
                    v-for="pvc in pvcList" 
                    :key="pvc.name" 
                    :label="pvc.name" 
                    :value="pvc.name">
                    <span style="float: left">{{ pvc.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ pvc.capacity }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
            
            <!-- Downward API Volume -->
            <template v-if="vol.type === 'downward'">
              <el-button size="small" type="primary" @click="addDownwardAPIItem(index)" style="margin-left: 80px;">Add Field Reference</el-button>
              <div v-for="(item, itemIndex) in vol.downwardAPIVolume.items" :key="'downward-'+index+'-'+itemIndex" style="margin-top: 10px; padding-left: 80px;">
                <el-form-item label="Path" label-width="80px">
                  <el-input v-model="item.path" placeholder="Path (e.g. labels/app)" style="width: 200px" />
                </el-form-item>
                <el-form-item label="Field Path" label-width="80px">
                  <el-input v-model="item.fieldPath" placeholder="Field Path (e.g. metadata.labels.app)" style="width: 300px" />
                </el-form-item>
                <el-button type="danger" size="small" @click="removeDownwardAPIItem(index, itemIndex)">Delete</el-button>
              </div>
            </template>
          </div>
        </div>
        <div v-if="podForm.volume.length === 0" class="empty-hint" style="color: #909399; padding: 20px 0; text-align: center;">
          No volumes configured. Add volumes to share data between containers or with the host.
        </div>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Node Scheduling</span>
        </div>
        <el-form-item label="Schedule Type" prop="nodeScheduling.type">
          <el-radio-group v-model="podForm.nodeScheduling.type">
            <el-radio label="nodeName">Specific Node</el-radio>
            <el-radio label="nodeSelector">Node Selector</el-radio>
            <el-radio label="nodeAffinity">Node Affinity</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Specific Node Selection -->
        <el-form-item v-if="podForm.nodeScheduling.type === 'nodeName'" label="Node Name">
          <el-input v-model="podForm.nodeScheduling.nodeName" placeholder="Enter node name" />
        </el-form-item>

        <!-- Node Selector -->
        <template v-if="podForm.nodeScheduling.type === 'nodeSelector'">
          <el-form-item label="Node Labels">
            <el-button size="small" type="primary" @click="addNodeSelector">Add Label Selector</el-button>
            <div v-for="(selector, index) in podForm.nodeScheduling.nodeSelector" :key="index" style="margin-top: 10px">
              <el-input v-model="selector.key" placeholder="Label Key" style="width: 200px" />
              <el-input v-model="selector.value" placeholder="Label Value" style="width: 200px; margin: 0 10px" />
              <el-button type="danger" size="small" @click="removeNodeSelector(index)">Delete</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- Node Affinity -->
        <template v-if="podForm.nodeScheduling.type === 'nodeAffinity'">
          <el-form-item label="Affinity Rules">
            <el-button size="small" type="primary" @click="addNodeAffinity">Add Affinity Rule</el-button>
            <div v-for="(rule, index) in podForm.nodeScheduling.nodeAffinity" :key="index" 
                 class="affinity-item" style="margin-top: 10px; padding: 10px; border: 1px dashed #dcdfe6; border-radius: 4px;">
              <el-input v-model="rule.key" placeholder="Label Key" style="width: 200px" />
              <el-select v-model="rule.operator" placeholder="Operator" style="width: 150px; margin: 0 10px">
                <el-option label="In" value="In" />
                <el-option label="NotIn" value="NotIn" />
                <el-option label="Exists" value="Exists" />
                <el-option label="DoesNotExist" value="DoesNotExist" />
                <el-option label="Gt" value="Gt" />
                <el-option label="Lt" value="Lt" />
              </el-select>
              <el-input v-if="['In', 'NotIn', 'Gt', 'Lt'].includes(rule.operator)" 
                      v-model="rule.value" 
                      placeholder="Value" 
                      style="width: 200px" />
              <el-button type="danger" size="small" @click="removeNodeAffinity(index)" style="margin-left: 10px">Delete</el-button>
            </div>
          </el-form-item>
        </template>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Tolerations</span>
          <el-button style="float: right" type="primary" size="small" @click="addToleration">Add Toleration</el-button>
        </div>
        <div v-if="podForm.tolerations.length === 0" class="empty-hint">
          No tolerations configured. Add tolerations to allow this Pod to be scheduled onto nodes with matching taints.
        </div>
        <div v-for="(toleration, index) in podForm.tolerations" :key="index" 
             class="toleration-item" style="margin-bottom: 15px; padding: 15px; border: 1px dashed #dcdfe6; border-radius: 4px;">
          <el-form-item label="Key">
            <el-input v-model="toleration.key" placeholder="Taint Key (empty for all keys)" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Operator">
            <el-select v-model="toleration.operator" placeholder="Select operator" style="width: 100%">
              <el-option label="Equal" value="Equal" />
              <el-option label="Exists" value="Exists" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="toleration.operator === 'Equal'" label="Value">
            <el-input v-model="toleration.value" placeholder="Taint Value" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Effect">
            <el-select v-model="toleration.effect" placeholder="Select effect (empty for all effects)" style="width: 100%">
              <el-option label="All Effects" value="" />
              <el-option label="NoSchedule" value="NoSchedule" />
              <el-option label="PreferNoSchedule" value="PreferNoSchedule" />
              <el-option label="NoExecute" value="NoExecute" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="toleration.effect === 'NoExecute'" label="Toleration Seconds">
            <el-input-number v-model="toleration.tolerationSeconds" :min="0" placeholder="Toleration duration in seconds" style="width: 100%" />
          </el-form-item>
          <div style="text-align: right">
            <el-button type="danger" size="small" @click="removeToleration(index)">Delete Toleration</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px">
        <div slot="header" class="clearfix">
          <span>Container Configuration</span>
        </div>
        <div class="container-section">
          <h4>Init Containers</h4>
          <el-button type="primary" size="small" @click="addContainer('init')">Add Init Container</el-button>
          <container-form
            v-for="(container, index) in podForm.initContainers"
            :key="'init-' + index"
            :container="container"
            @remove="removeContainer('init', index)"
          />
        </div>
        <div class="container-section" style="margin-top: 20px">
          <h4>Main Containers</h4>
          <el-button type="primary" size="small" @click="addContainer('main')">Add Main Container</el-button>
          <container-form
            v-for="(container, index) in podForm.containers"
            :key="'main-' + index"
            :container="container"
            @remove="removeContainer('main', index)"
          />
        </div>
      </el-card>

      <div style="margin-top: 20px; text-align: right;">
        <el-button type="primary" @click="submitForm">Submit</el-button>
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
        initContainers: [],
        containers: [],
        volume: [],
        tolerations: [],
        nodeScheduling: {
          type: 'nodeName', // nodeName | nodeSelector | nodeAffinity
          nodeName: '',
          nodeSelector: [],
          nodeAffinity: []
        }
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces,
      pvcList: state => state.pod.pvcList
    })
  },
  created() {
    this.init()
  },
  watch: {
    'podForm.base.namespace': {
      handler(newNamespace) {
        if (newNamespace) {
          // 当命名空间改变时，加载该命名空间的 PVC 列表
          this.loadPVCsForNamespace(newNamespace)
        }
      },
      immediate: true
    },
    'podForm.volume': {
      handler(volumes) {
        // 监听卷数组的变化
        if (volumes && volumes.length > 0) {
          const pvcTypeVolumeExists = volumes.some(vol => vol.type === 'pvc')
          // 如果有 PVC 类型的卷且 PVC 列表还未加载，则加载 PVC 列表
          if (pvcTypeVolumeExists && this.pvcList.length === 0 && this.podForm.base.namespace) {
            this.loadPVCsForNamespace(this.podForm.base.namespace)
          }
        }
      },
      deep: true
    }
  },
  methods: {
    async initNamespace() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        if (this.$route.query.namespace) {
          this.podForm.base.namespace = this.$route.query.namespace
        } else if (this.namespaces.length > 0) {
          this.podForm.base.namespace = this.namespaces[0].name
        }
      } catch (error) {
        Message.error('Failed to fetch namespace list')
      }
    },
    async init() {
      const { namespace, name, edit } = this.$route.query
      this.isEdit = edit === 'true'

      await this.initNamespace()

      if (this.isEdit && name && namespace) {
        this.loading = true
        try {
          const response = await this.$store.dispatch('pod/getPodDetail', { name, namespace })
          const podData = response.data
          this.podForm = {
            base: {
              name: podData.base?.name || '',
              namespace: podData.base?.namespace || namespace,
              restartPolicy: podData.base?.restartPolicy || 'Always',
              labels: Array.isArray(podData.base?.labels) ? [...podData.base.labels] : []
            },
            network: {
              hostName: podData.network?.hostName || '',
              hostNetwork: podData.network?.hostNetwork || false,
              dnsPolicy: podData.network?.dnsPolicy || 'ClusterFirst',
              dnsConfig: {
                nameservers: Array.isArray(podData.network?.dnsConfig?.nameservers) 
                  ? [...podData.network.dnsConfig.nameservers]
                  : []
              },
              hostAliases: Array.isArray(podData.network?.hostAliases)
                ? [...podData.network.hostAliases]
                : []
            },
            initContainers: Array.isArray(podData.initContainers)
              ? podData.initContainers.map(container => this.mapContainerData(container))
              : [],
            containers: Array.isArray(podData.containers)
              ? podData.containers.map(container => this.mapContainerData(container))
              : [],
            volume: Array.isArray(podData.volume)
              ? [...podData.volume]
              : [],
            tolerations: Array.isArray(podData.tolerations)
              ? [...podData.tolerations]
              : [],
            nodeScheduling: {
              type: podData.nodeScheduling?.type || 'nodeName',
              nodeName: podData.nodeScheduling?.nodeName || '',
              nodeSelector: Array.isArray(podData.nodeScheduling?.nodeSelector)
                ? [...podData.nodeScheduling.nodeSelector]
                : [],
              nodeAffinity: Array.isArray(podData.nodeScheduling?.nodeAffinity)
                ? [...podData.nodeScheduling.nodeAffinity]
                : []
            }
          }
        } catch (error) {
          console.error('Error fetching Pod details:', error)
          this.$message.error('Failed to fetch Pod details')
        } finally {
          this.loading = false
        }
      }
    },
    mapContainerData(container) {
      return {
        name: container.name || '',
        image: container.image || '',
        imagePullPolicy: container.imagePullPolicy || 'IfNotPresent',
        workingDir: container.workingDir || '',
        privileged: container.privileged || false,
        tty: container.tty || false,
        command: Array.isArray(container.command) ? container.command : [],
        args: Array.isArray(container.args) ? container.args : [],
        ports: Array.isArray(container.ports) 
          ? container.ports.map(port => ({
              name: port.name || '',
              containerPort: port.containerPort,
              hostPort: port.hostPort
            }))
          : [],
        env: Array.isArray(container.env) 
          ? container.env.map(env => ({
              name: env.name || env.key || '', // Support both old key and new name format
              value: env.value || '',
              type: env.type || 'default',
              refName: env.refName || ''
            }))
          : [],
        envsFrom: Array.isArray(container.envsFrom) 
          ? container.envsFrom.map(envFrom => ({
              name: envFrom.name || '',
              refType: envFrom.refType || 'configMap',
              prefix: envFrom.prefix || ''
            }))
          : [],
        volumeMounts: Array.isArray(container.volumeMounts)
          ? container.volumeMounts.map(mount => ({
              mountName: mount.mountName || '',
              mountPath: mount.mountPath || '',
              readOnly: mount.readOnly || false
            }))
          : [],
        resources: container.resources || {
          enable: false,
          CPUReq: 100,
          CPULimit: 200,
          memory: 128,
          memoryLimit: 256
        },
        livenessProbe: this.mapProbeData(container.livenessProbe),
        readyProbe: this.mapProbeData(container.readyProbe),
        startUpProbe: this.mapProbeData(container.startUpProbe)
      }
    },
    mapProbeData(probe) {
      if (!probe) return null
      
      // 如果是编辑模式下的已有探针
      const probeType = probe.exec ? 'exec'
        : probe.httpGet ? 'httpGet'
        : probe.tcpSocket ? 'tcpSocket'
        : 'exec'

      return {
        enable: true, // 如果探针存在，说明是启用的
        type: probeType,
        initialDelaySeconds: probe.initialDelaySeconds || 0,
        periodSeconds: probe.periodSeconds || 10,
        timeoutSeconds: probe.timeoutSeconds || 1,
        successThreshold: probe.successThreshold || 1,
        failureThreshold: probe.failureThreshold || 3,
        exec: probe.exec ? {
          command: Array.isArray(probe.exec.command) ? [...probe.exec.command] : []
        } : { command: [] },
        httpGet: probe.httpGet ? {
          path: probe.httpGet.path || '/',
          port: probe.httpGet.port || 80,
          scheme: probe.httpGet.scheme || 'HTTP',
          headers: Array.isArray(probe.httpGet.headers) ? [...probe.httpGet.headers] : []
        } : {
          path: '/',
          port: 80,
          scheme: 'HTTP',
          headers: []
        },
        tcpSocket: probe.tcpSocket ? {
          port: probe.tcpSocket.port || 80,
          host: probe.tcpSocket.host || ''
        } : {
          port: 80,
          host: ''
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
      this.podForm.volume.push({
        name: '',
        type: 'emptyDir',
        // 预初始化各类型卷的配置
        hostPathVolume: { path: '', type: 'Directory' },
        configMapRefVolume: { name: '', optional: false },
        secretRefVolume: { name: '', optional: false },
        PVCVolume: { claimName: '' },
        downwardAPIVolume: { items: [] }
      })
    },
    removeVolume(index) {
      this.podForm.volume.splice(index, 1)
    },
    addDownwardAPIItem(volumeIndex) {
      if (!this.podForm.volume[volumeIndex].downwardAPIVolume) {
        this.podForm.volume[volumeIndex].downwardAPIVolume = { items: [] }
      }
      this.podForm.volume[volumeIndex].downwardAPIVolume.items.push({ path: '', fieldPath: '' })
    },
    removeDownwardAPIItem(volumeIndex, itemIndex) {
      this.podForm.volume[volumeIndex].downwardAPIVolume.items.splice(itemIndex, 1)
    },
    addContainer(type) {
      const container = {
        name: '',
        image: '',
        imagePullPolicy: 'IfNotPresent',
        ports: [],
        env: [],
        envsFrom: [],
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
    addNodeSelector() {
      this.podForm.nodeScheduling.nodeSelector.push({ key: '', value: '' })
    },
    removeNodeSelector(index) {
      this.podForm.nodeScheduling.nodeSelector.splice(index, 1)
    },
    addNodeAffinity() {
      this.podForm.nodeScheduling.nodeAffinity.push({ key: '', operator: 'In', value: '' })
    },
    removeNodeAffinity(index) {
      this.podForm.nodeScheduling.nodeAffinity.splice(index, 1)
    },
    addToleration() {
      this.podForm.tolerations.push({
        key: '',
        operator: 'Equal',
        value: '',
        effect: '',
        tolerationSeconds: null
      })
    },
    removeToleration(index) {
      this.podForm.tolerations.splice(index, 1)
    },
    async submitForm() {
      try {
        await this.$store.dispatch('pod/createPod', this.podForm)
        Message.success(this.isEdit ? 'Update successful' : 'Creation successful')
        this.goBack()
      } catch (error) {
        Message.error(this.isEdit ? 'Update failed' : 'Creation failed')
      }
    },
    goBack() {
      this.$router.push({
        path: '/pod/list',
        query: { namespace: this.podForm.base.namespace }
      })
    },
    async loadPVCsForNamespace(namespace) {
      try {
        await this.$store.dispatch('pod/getPVCsForNamespace', namespace)
      } catch (error) {
        console.error('Failed to fetch PVC list:', error)
        Message.error('Failed to fetch PVC list')
      }
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
.detail-header {
  margin-bottom: 20px;
}
</style>
