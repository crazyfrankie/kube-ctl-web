<template>
  <div class="probe-info">
    <template v-if="probe.enable">
      <div class="probe-section">
        <div class="probe-label">Type:</div>
        <div class="probe-value">{{ probe.type || 'Not Set' }}</div>
      </div>
      
      <!-- TCP Socket -->
      <template v-if="probe.type === 'tcpSocket' && probe.tcpSocket">
        <div class="probe-section">
          <div class="probe-label">Host:</div>
          <div class="probe-value">{{ probe.tcpSocket.host || '-' }}</div>
        </div>
        <div class="probe-section">
          <div class="probe-label">Port:</div>
          <div class="probe-value">{{ probe.tcpSocket.port || '-' }}</div>
        </div>
      </template>
      
      <!-- HTTP Get -->
      <template v-if="probe.type === 'httpGet' && probe.httpGet">
        <div class="probe-section">
          <div class="probe-label">Path:</div>
          <div class="probe-value">{{ probe.httpGet.path || '-' }}</div>
        </div>
        <div class="probe-section">
          <div class="probe-label">Port:</div>
          <div class="probe-value">{{ probe.httpGet.port || '-' }}</div>
        </div>
        <div class="probe-section">
          <div class="probe-label">Host:</div>
          <div class="probe-value">{{ probe.httpGet.host || '-' }}</div>
        </div>
        <div class="probe-section">
          <div class="probe-label">Scheme:</div>
          <div class="probe-value">{{ probe.httpGet.scheme || 'HTTP' }}</div>
        </div>
        <div v-if="probe.httpGet.headers && probe.httpGet.headers.length" class="probe-section">
          <div class="probe-label">Headers:</div>
          <div class="probe-value headers">
            <div v-for="header in probe.httpGet.headers" :key="header.name" class="header-item">
              {{ header.name }}: {{ header.value }}
            </div>
          </div>
        </div>
      </template>
      
      <!-- Command -->
      <template v-if="probe.type === 'exec' && probe.exec">
        <div class="probe-section">
          <div class="probe-label">Command:</div>
          <div class="probe-value command">{{ formatCommand }}</div>
        </div>
      </template>
      
      <!-- Common Settings -->
      <div class="probe-section">
        <div class="probe-label">Initial Delay:</div>
        <div class="probe-value">{{ probe.initialDelaySeconds || '0' }}s</div>
      </div>
      <div class="probe-section">
        <div class="probe-label">Period:</div>
        <div class="probe-value">{{ probe.periodSeconds || '10' }}s</div>
      </div>
      <div class="probe-section">
        <div class="probe-label">Timeout:</div>
        <div class="probe-value">{{ probe.timeoutSeconds || '1' }}s</div>
      </div>
      <div class="probe-section">
        <div class="probe-label">Success Threshold:</div>
        <div class="probe-value">{{ probe.successThreshold || '1' }}</div>
      </div>
      <div class="probe-section">
        <div class="probe-label">Failure Threshold:</div>
        <div class="probe-value">{{ probe.failureThreshold || '3' }}</div>
      </div>
    </template>
    <div v-else class="probe-disabled">
      Probe not enabled
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProbeInfo',
  props: {
    probe: {
      type: Object,
      required: true
    }
  },
  computed: {
    formatCommand() {
      if (!this.probe.exec || !this.probe.exec.command) {
        return '-'
      }
      return Array.isArray(this.probe.exec.command) ? this.probe.exec.command.join(' ') : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.probe-info {
  padding: 10px;
}

.probe-section {
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .probe-label {
    font-weight: bold;
    font-size: 12px;
    color: #606266;
    margin-bottom: 4px;
  }
  
  .probe-value {
    font-size: 12px;
    color: #303133;
    
    &.headers {
      .header-item {
        margin-bottom: 2px;
        font-family: monospace;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    &.command {
      font-family: monospace;
      background: #f5f7fa;
      padding: 4px 8px;
      border-radius: 4px;
      word-break: break-all;
    }
  }
}

.probe-disabled {
  color: #909399;
  font-size: 12px;
  text-align: center;
  padding: 10px;
}
</style>