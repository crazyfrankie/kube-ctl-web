<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Create Persistent Volume</span>
      </div>
      <el-form ref="form" :model="form" label-width="150px" :rules="rules">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="PV name"></el-input>
        </el-form-item>
        
        <el-form-item label="Capacity" prop="capacity">
          <div class="capacity-input-container">
            <el-input-number 
              v-model="form.capacityValue" 
              :min="1" 
              :step="1"
              @keydown.tab.native.prevent="iterateCapacity"
            ></el-input-number>
            <el-select v-model="form.capacityUnit" style="width: 80px; margin-left: 10px;">
              <el-option label="Gi" value="Gi"></el-option>
              <el-option label="Mi" value="Mi"></el-option>
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="Access Modes" prop="accessModes">
          <el-checkbox-group v-model="form.accessModes">
            <el-checkbox label="ReadWriteOnce">ReadWriteOnce</el-checkbox>
            <el-checkbox label="ReadOnlyMany">ReadOnlyMany</el-checkbox>
            <el-checkbox label="ReadWriteMany">ReadWriteMany</el-checkbox>
            <el-checkbox label="ReadWriteOncePod">ReadWriteOncePod</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="Reclaim Policy" prop="reclaimPolicy">
          <el-select v-model="form.reclaimPolicy" placeholder="Select reclaim policy">
            <el-option label="Retain" value="Retain"></el-option>
            <el-option label="Delete" value="Delete"></el-option>
            <el-option label="Recycle" value="Recycle"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Storage Class" prop="storageClass">
          <el-input v-model="form.storageClass" placeholder="Storage class name"></el-input>
        </el-form-item>
        
        <el-form-item label="Volume Source" prop="volumeSourceType">
          <el-select v-model="form.volumeSourceType" placeholder="Select volume source type">
            <el-option 
              v-for="type in volumeSourceTypes" 
              :key="type.value" 
              :label="type.label" 
              :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 动态渲染对应类型的卷源配置表单 -->
        <div v-if="form.volumeSourceType">
          <component 
            :is="volumeSourceComponents[form.volumeSourceType]" 
            v-model="form.volumeSourceConfig" 
            :rules="volumeSourceRules">
          </component>
        </div>
        
        <el-form-item label="Labels">
          <dynamic-item v-model="form.labels" item-key="key" item-value="value"></dynamic-item>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="submitting">Create</el-button>
          <el-button @click="goBack">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import DynamicItem from '@/components/DynamicItem'

// 主机路径卷源配置组件
const HostPathConfig = {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      config: {
        path: this.value.path || ''
      }
    }
  },
  watch: {
    config: {
      deep: true,
      handler(val) {
        this.$emit('input', val)
      }
    }
  },
  render(h) {
    return h('el-form-item', {
      props: {
        label: 'Host Path',
        prop: 'volumeSourceConfig.path',
        rules: this.rules.path
      }
    }, [
      h('el-input', {
        props: {
          value: this.config.path,
          placeholder: 'Path on the host'
        },
        on: {
          input: (val) => {
            this.config.path = val
          }
        }
      })
    ])
  }
}

// NFS卷源配置组件
const NFSConfig = {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      config: {
        server: this.value.server || '',
        path: this.value.path || ''
      }
    }
  },
  watch: {
    config: {
      deep: true,
      handler(val) {
        this.$emit('input', val)
      }
    }
  },
  render(h) {
    return h('div', [
      h('el-form-item', {
        props: {
          label: 'NFS Server',
          prop: 'volumeSourceConfig.server',
          rules: this.rules.server
        }
      }, [
        h('el-input', {
          props: {
            value: this.config.server,
            placeholder: 'NFS server address'
          },
          on: {
            input: (val) => {
              this.config.server = val
            }
          }
        })
      ]),
      h('el-form-item', {
        props: {
          label: 'NFS Path',
          prop: 'volumeSourceConfig.path',
          rules: this.rules.path
        }
      }, [
        h('el-input', {
          props: {
            value: this.config.path,
            placeholder: 'Path on NFS server'
          },
          on: {
            input: (val) => {
              this.config.path = val
            }
          }
        })
      ])
    ])
  }
}

export default {
  name: 'CreatePV',
  components: { 
    DynamicItem,
    HostPathConfig,
    NFSConfig
  },
  data() {
    return {
      submitting: false,
      // 卷源类型配置
      volumeSourceTypes: [
        { label: 'HostPath', value: 'hostPath' },
        { label: 'NFS', value: 'nfs' }
        // 可以在这里添加更多的存储类型
        // { label: 'CSI', value: 'csi' },
        // { label: 'GlusterFS', value: 'glusterfs' },
        // 等等
      ],
      // 卷源类型对应的组件
      volumeSourceComponents: {
        hostPath: 'HostPathConfig',
        nfs: 'NFSConfig'
        // 可以在这里添加更多的组件映射
      },
      // 卷源类型的验证规则
      volumeSourceRules: {
        hostPath: {
          path: [{ required: true, message: 'Please input host path', trigger: 'blur' }]
        },
        nfs: {
          server: [{ required: true, message: 'Please input NFS server', trigger: 'blur' }],
          path: [{ required: true, message: 'Please input NFS path', trigger: 'blur' }]
        }
        // 可以在这里添加更多类型的验证规则
      },
      form: {
        name: '',
        capacityValue: 1,
        capacityUnit: 'Gi',
        accessModes: ['ReadWriteOnce'],
        reclaimPolicy: 'Retain',
        storageClass: '',
        volumeSourceType: 'nfs', // 默认使用 NFS 类型
        volumeSourceConfig: {}, // 存储卷源的具体配置
        labels: []
      },
      rules: {
        name: [
          { required: true, message: 'Please input PV name', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: 'Invalid name format. Use lowercase letters, numbers and hyphens. Must start and end with alphanumeric character.', trigger: 'blur' }
        ],
        accessModes: [
          { required: true, message: 'Please select at least one access mode', trigger: 'change', type: 'array' }
        ],
        reclaimPolicy: [
          { required: true, message: 'Please select reclaim policy', trigger: 'change' }
        ],
        volumeSourceType: [
          { required: true, message: 'Please select volume source type', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    // 当卷源类型变化时，重置卷源配置
    'form.volumeSourceType': {
      handler(newType) {
        this.form.volumeSourceConfig = {}
      },
      immediate: true
    }
  },
  methods: {
    goBack() {
      this.$router.push('/volume/pvs')
    },
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        const pvData = {
          name: this.form.name,
          capacity: `${this.form.capacityValue}${this.form.capacityUnit}`,
          accessModes: this.form.accessModes,
          reclaimPolicy: this.form.reclaimPolicy,
          storageClass: this.form.storageClass || '',
          labels: this.form.labels.length > 0 ? this.form.labels : [],
          volumeSource: this.buildVolumeSource()
        }
        
        await this.$store.dispatch('pv/createPV', pvData)
        Message.success('Persistent Volume created successfully')
        this.goBack()
      } catch (error) {
        if (error !== 'error') { // Form validation error is 'error'
          Message.error('Failed to create Persistent Volume')
          console.error(error)
        }
      } finally {
        this.submitting = false
      }
    },
    // 构建卷源数据
    buildVolumeSource() {
      const type = this.form.volumeSourceType
      const config = this.form.volumeSourceConfig
      
      const volumeSource = { type }
      
      switch (type) {
        case 'hostPath':
          volumeSource.hostPath = config.path
          break
        case 'nfs':
          volumeSource.nfs = {
            nfsServer: config.server,
            nfsPath: config.path
          }
          break
        // 可以在这里添加更多类型的处理
        // case 'csi':
        //   volumeSource.csi = { ... }
        //   break
      }
      
      return volumeSource
    },
    iterateCapacity() {
      const commonSizes = [1, 2, 5, 10, 20, 50, 100];
      const currentValue = this.form.capacityValue;
      
      // Find the next value in the sequence
      const nextValue = commonSizes.find(size => size > currentValue);
      
      // If current value is larger than all in the sequence, wrap around to the first value
      this.form.capacityValue = nextValue || commonSizes[0];
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.capacity-input-container {
  display: flex;
  align-items: center;
}
</style>