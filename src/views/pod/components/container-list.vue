<template>
  <div class="container-list">
    <el-table :data="containers" border style="width: 100%">
      <el-table-column prop="name" label="Container Name" min-width="120" />
      <el-table-column label="Image" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.image }}
          <el-tag size="mini" style="margin-left: 5px">{{ scope.row.imagePullPolicy || 'IfNotPresent' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Resource Quotas" min-width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.resources && scope.row.resources.enable">
            <div>CPU: {{ scope.row.resources.CPUReq }}m / {{ scope.row.resources.CPULimit }}m</div>
            <div>Memory: {{ scope.row.resources.memory }}Mi / {{ scope.row.resources.memoryLimit }}Mi</div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Probes" min-width="120">
        <template slot-scope="scope">
          <div>
            <el-popover v-if="scope.row.livenessProbe && scope.row.livenessProbe.enable" placement="top" trigger="hover">
              <probe-info :probe="scope.row.livenessProbe" />
              <el-tag slot="reference" type="success" size="small">Liveness</el-tag>
            </el-popover>
            <el-popover v-if="scope.row.readyProbe && scope.row.readyProbe.enable" placement="top" trigger="hover">
              <probe-info :probe="scope.row.readyProbe" />
              <el-tag slot="reference" type="warning" size="small" style="margin-left: 5px">Readiness</el-tag>
            </el-popover>
            <el-popover v-if="scope.row.startUpProbe && scope.row.startUpProbe.enable" placement="top" trigger="hover">
              <probe-info :probe="scope.row.startUpProbe" />
              <el-tag slot="reference" type="info" size="small" style="margin-left: 5px">Startup</el-tag>
            </el-popover>
            <span v-if="!hasProbes(scope.row)">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Environment" min-width="200">
        <template slot-scope="scope">
          <div>
            <!-- Individual Environment Variables -->
            <div v-if="scope.row.env && scope.row.env.length">
              <el-button type="text" @click="showEnvDialog(scope.row)" class="detail-btn">
                {{ scope.row.env.length }} Environment Variables
              </el-button>
            </div>

            <!-- EnvsFrom - Environment from ConfigMaps/Secrets -->
            <div v-if="scope.row.envsFrom && scope.row.envsFrom.length" style="margin-top: 5px">
              <el-button type="text" @click="showEnvFromDialog(scope.row)" class="detail-btn">
                {{ scope.row.envsFrom.length }} EnvFrom Resources
              </el-button>
            </div>

            <span v-if="(!scope.row.env || !scope.row.env.length) && 
                        (!scope.row.envsFrom || !scope.row.envsFrom.length)">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Volumes" min-width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.volumeMounts && scope.row.volumeMounts.length">
            <el-button type="text" @click="showVolumeMountsDialog(scope.row)" class="detail-btn">
              {{ scope.row.volumeMounts.length }} Volume Mounts
            </el-button>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Commands" min-width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.command && scope.row.command.length">
            <el-button type="text" @click="showCommandDialog(scope.row)" class="detail-btn">
              View Command
            </el-button>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- Environment Variables Dialog -->
    <el-dialog title="Environment Variables" :visible.sync="envDialogVisible" width="800px" class="detail-dialog">
      <el-table :data="currentContainer.env" border style="width: 100%">
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column label="Type" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getEnvTypeTag(scope.row.type)" size="small">
              {{ scope.row.type === 'configMap' ? 'ConfigMap' : 
                scope.row.type === 'secret' ? 'Secret' : 'Value' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Value/Reference" min-width="200">
          <template slot-scope="scope">
            <div class="copyable-content">
              {{ scope.row.type === 'default' ? scope.row.value : scope.row.refName }}
              <el-button v-if="scope.row.type === 'default' && scope.row.value" 
                        type="text" 
                        size="mini"
                        icon="el-icon-document-copy"
                        class="copy-btn"
                        @click="copyToClipboard(scope.row.value)">
              </el-button>
              <el-button v-else-if="scope.row.refName" 
                        type="text" 
                        size="mini"
                        icon="el-icon-document-copy"
                        class="copy-btn"
                        @click="copyToClipboard(scope.row.refName)">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- EnvFrom Dialog -->
    <el-dialog title="EnvFrom Resources" :visible.sync="envFromDialogVisible" width="800px" class="detail-dialog">
      <el-table :data="currentContainer.envsFrom" border style="width: 100%">
        <el-table-column label="Type" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getEnvTypeTag(scope.row.refType)" size="small">
              {{ scope.row.refType === 'configMap' ? 'ConfigMap' : 'Secret' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column label="Prefix" min-width="150">
          <template slot-scope="scope">
            <div class="copyable-content">
              {{ scope.row.prefix || '-' }}
              <el-button v-if="scope.row.prefix" 
                        type="text" 
                        size="mini"
                        icon="el-icon-document-copy"
                        class="copy-btn"
                        @click="copyToClipboard(scope.row.prefix)">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Volume Mounts Dialog -->
    <el-dialog title="Volume Mounts" :visible.sync="volumeMountsDialogVisible" width="800px" class="detail-dialog">
      <el-table :data="currentContainer.volumeMounts" border style="width: 100%">
        <el-table-column prop="mountName" label="Name" min-width="120" />
        <el-table-column label="Mount Path" min-width="300">
          <template slot-scope="scope">
            <div class="copyable-content">
              {{ scope.row.mountPath }}
              <el-button
                type="text" 
                size="mini"
                icon="el-icon-document-copy"
                class="copy-btn"
                @click="copyToClipboard(scope.row.mountPath)">
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Read Only" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.readOnly ? 'warning' : 'success'" size="small">
              {{ scope.row.readOnly ? 'Yes' : 'No' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Command Dialog -->
    <el-dialog title="Container Command" :visible.sync="commandDialogVisible" width="800px" class="detail-dialog">
      <div v-if="currentContainer.command && currentContainer.command.length">
        <div class="command-block">
          <div class="command-label">Command:</div>
          <div class="command-value">
            {{ currentContainer.command.join(' ') }}
            <el-button
              type="text" 
              size="mini"
              icon="el-icon-document-copy"
              class="copy-btn-block"
              @click="copyToClipboard(currentContainer.command.join(' '))">
              Copy
            </el-button>
          </div>
        </div>

        <div class="command-block" v-if="currentContainer.args && currentContainer.args.length">
          <div class="command-label">Args:</div>
          <div class="command-value">
            {{ currentContainer.args.join(' ') }}
            <el-button
              type="text" 
              size="mini"
              icon="el-icon-document-copy"
              class="copy-btn-block"
              @click="copyToClipboard(currentContainer.args.join(' '))">
              Copy
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ProbeInfo from './probe-info'
import { Message } from 'element-ui'

export default {
  name: 'ContainerList',
  components: {
    ProbeInfo
  },
  props: {
    containers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentContainer: {},
      envDialogVisible: false,
      envFromDialogVisible: false,
      volumeMountsDialogVisible: false,
      commandDialogVisible: false
    }
  },
  methods: {
    hasProbes(container) {
      return (container.livenessProbe && container.livenessProbe.enable) ||
             (container.readyProbe && container.readyProbe.enable) ||
             (container.startUpProbe && container.startUpProbe.enable)
    },
    getEnvTypeTag(type) {
      if (type === 'configMap') return 'success'
      if (type === 'secret') return 'danger'
      return 'info' // default value type
    },
    showEnvDialog(container) {
      this.currentContainer = container
      this.envDialogVisible = true
    },
    showEnvFromDialog(container) {
      this.currentContainer = container
      this.envFromDialogVisible = true
    },
    showVolumeMountsDialog(container) {
      this.currentContainer = container
      this.volumeMountsDialogVisible = true
    },
    showCommandDialog(container) {
      this.currentContainer = container
      this.commandDialogVisible = true
    },
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          Message.success('Copied to clipboard')
        }).catch(() => {
          this.fallbackCopyToClipboard(text)
        })
      } else {
        this.fallbackCopyToClipboard(text)
      }
    },
    fallbackCopyToClipboard(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          Message.success('Copied to clipboard')
        } else {
          Message.warning('Failed to copy')
        }
      } catch (err) {
        Message.error('Failed to copy text')
      }
      
      document.body.removeChild(textArea)
    }
  }
}
</script>

<style lang="scss" scoped>
.container-list {
  width: 100%;
}

.detail-btn {
  padding: 0;
  color: #409EFF;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}

.command-block {
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .command-label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #606266;
  }
  
  .command-value {
    font-family: monospace;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    word-break: break-all;
    position: relative;
    border: 1px solid #e6e9f0;
    min-height: 24px;
  }
}

.copyable-content {
  position: relative;
  padding-right: 30px;
  word-break: break-all;
}

.copy-btn {
  position: absolute;
  top: 0;
  right: 0;
}

.copy-btn-block {
  position: absolute;
  top: 8px;
  right: 8px;
}

::v-deep .el-table {
  .el-tag {
    &.el-tag--mini {
      height: 18px;
      line-height: 16px;
      padding: 0 4px;
    }
  }
}

::v-deep .detail-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>