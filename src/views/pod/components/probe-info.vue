<template>
  <div class="probe-info">
    <div>类型: {{ probe.type }}</div>
    <div v-if="probe.type === 'http'">
      <div>路径: {{ probe.httpGet && probe.httpGet.path }}</div>
      <div>端口: {{ probe.httpGet && probe.httpGet.port }}</div>
      <div>协议: {{ probe.httpGet && probe.httpGet.scheme }}</div>
    </div>
    <div v-if="probe.type === 'tcp'">
      <div>主机: {{ probe.tcpSocket && probe.tcpSocket.host }}</div>
      <div>端口: {{ probe.tcpSocket && probe.tcpSocket.port }}</div>
    </div>
    <div v-if="probe.type === 'command'">
      <div>命令: {{ probe.command && probe.command.command && probe.command.command.join(' ') }}</div>
    </div>
    <div>延迟: {{ probe.initialDelaySeconds }}秒</div>
    <div>间隔: {{ probe.periodSeconds }}秒</div>
    <div>超时: {{ probe.timeoutSeconds }}秒</div>
    <div>成功次数: {{ probe.successThreshold }}</div>
    <div>失败次数: {{ probe.failureThreshold }}</div>
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
  }
}
</script>

<style scoped>
.probe-info {
  font-size: 12px;
  color: #666;
}
</style>