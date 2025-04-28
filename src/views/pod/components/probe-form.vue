<template>
  <div class="probe-form">
    <el-form ref="form" :model="probeForm" label-width="120px" size="small">
      <el-form-item label="Check Type">
        <el-radio-group v-model="probeForm.type">
          <el-radio label="exec">Execute Command</el-radio>
          <el-radio label="httpGet">HTTP Request</el-radio>
          <el-radio label="tcpSocket">TCP Connection</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="probeForm.type === 'exec'">
        <el-form-item label="Commands">
          <el-tag
            v-for="(cmd, index) in probeForm.exec.command"
            :key="index"
            closable
            @close="removeCommand(index)"
            style="margin-right: 5px"
          >
            {{ cmd }}
          </el-tag>
          <el-input
            v-if="showCommandInput"
            v-model="newCommand"
            size="small"
            style="width: 200px"
            @keyup.enter.native="addCommand"
            @blur="handleCommandBlur"
          >
            <el-button slot="append" @click="addCommand">Add</el-button>
          </el-input>
          <el-button v-else type="text" @click="showCommandInput = true">
            + Add Command
          </el-button>
        </el-form-item>
      </template>

      <template v-if="probeForm.type === 'httpGet'">
        <el-form-item label="HTTP Path" required>
          <el-input v-model="probeForm.httpGet.path" placeholder="/health" />
        </el-form-item>
        <el-form-item label="Port" required>
          <el-input-number v-model="probeForm.httpGet.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="Scheme">
          <el-select v-model="probeForm.httpGet.scheme">
            <el-option label="HTTP" value="HTTP" />
            <el-option label="HTTPS" value="HTTPS" />
          </el-select>
        </el-form-item>
        <el-form-item label="Headers">
          <el-table :data="probeForm.httpGet.httpHeaders" border size="small">
            <el-table-column label="Name">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" size="small" placeholder="Header name" />
              </template>
            </el-table-column>
            <el-table-column label="Value">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" size="small" placeholder="Header value" />
              </template>
            </el-table-column>
            <el-table-column width="60">
              <template slot-scope="scope">
                <el-button type="text" @click.prevent="removeHeader(scope.$index)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addHeader" style="margin-top: 5px">
            + Add Header
          </el-button>
        </el-form-item>
      </template>

      <template v-if="probeForm.type === 'tcpSocket'">
        <el-form-item label="Port" required>
          <el-input-number v-model="probeForm.tcpSocket.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="Host">
          <el-input v-model="probeForm.tcpSocket.host" placeholder="Optional" />
        </el-form-item>
      </template>

      <el-form-item label="Initial Delay">
        <el-input-number v-model="probeForm.initialDelaySeconds" :min="0" />
        <span class="unit">seconds</span>
      </el-form-item>
      <el-form-item label="Period">
        <el-input-number v-model="probeForm.periodSeconds" :min="1" />
        <span class="unit">seconds</span>
      </el-form-item>
      <el-form-item label="Timeout">
        <el-input-number v-model="probeForm.timeoutSeconds" :min="1" />
        <span class="unit">seconds</span>
      </el-form-item>
      <el-form-item label="Success Threshold">
        <el-input-number v-model="probeForm.successThreshold" :min="1" />
      </el-form-item>
      <el-form-item label="Failure Threshold">
        <el-input-number v-model="probeForm.failureThreshold" :min="1" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ProbeForm',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showCommandInput: false,
      newCommand: '',
      probeForm: {
        type: 'exec',
        initialDelaySeconds: 0,
        periodSeconds: 10,
        timeoutSeconds: 1,
        successThreshold: 1,
        failureThreshold: 3,
        exec: {
          command: []
        },
        httpGet: {
          path: '/',
          port: 80,
          scheme: 'HTTP',
          httpHeaders: []
        },
        tcpSocket: {
          port: 80,
          host: ''
        }
      }
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.initForm(val)
        }
      },
      immediate: true
    },
    probeForm: {
      handler(val) {
        const result = { ...val }
        delete result.type
        // 根据类型只保留相关配置
        if (val.type !== 'exec') delete result.exec
        if (val.type !== 'httpGet') delete result.httpGet
        if (val.type !== 'tcpSocket') delete result.tcpSocket
        this.$emit('input', result)
      },
      deep: true
    }
  },
  methods: {
    initForm(probe) {
      if (!probe || Object.keys(probe).length === 0) {
        return
      }

      this.probeForm.initialDelaySeconds = probe.initialDelaySeconds || 0
      this.probeForm.periodSeconds = probe.periodSeconds || 10
      this.probeForm.timeoutSeconds = probe.timeoutSeconds || 1
      this.probeForm.successThreshold = probe.successThreshold || 1
      this.probeForm.failureThreshold = probe.failureThreshold || 3

      if (probe.exec && probe.exec.command) {
        this.probeForm.type = 'exec'
        this.probeForm.exec.command = [...probe.exec.command]
      } else if (probe.httpGet) {
        this.probeForm.type = 'httpGet'
        this.probeForm.httpGet = {
          path: probe.httpGet.path || '/',
          port: probe.httpGet.port || 80,
          scheme: probe.httpGet.scheme || 'HTTP',
          httpHeaders: Array.isArray(probe.httpGet.httpHeaders) ? [...probe.httpGet.httpHeaders] : []
        }
      } else if (probe.tcpSocket) {
        this.probeForm.type = 'tcpSocket'
        this.probeForm.tcpSocket = {
          port: probe.tcpSocket.port || 80,
          host: probe.tcpSocket.host || ''
        }
      }
    },
    addCommand() {
      if (this.newCommand.trim()) {
        this.probeForm.exec.command.push(this.newCommand.trim())
        this.newCommand = ''
      }
    },
    removeCommand(index) {
      this.probeForm.exec.command.splice(index, 1)
    },
    handleCommandBlur() {
      if (!this.newCommand.trim()) {
        this.showCommandInput = false
      }
    },
    addHeader() {
      this.probeForm.httpGet.httpHeaders.push({
        name: '',
        value: ''
      })
    },
    removeHeader(index) {
      this.probeForm.httpGet.httpHeaders.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.probe-form {
  padding: 20px;
}
</style>