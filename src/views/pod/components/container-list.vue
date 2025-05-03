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
              <el-popover placement="right" width="500" trigger="hover">
                <el-tabs>
                  <el-tab-pane label="Environment Variables">
                    <el-table :data="scope.row.env" size="mini" border>
                      <el-table-column prop="name" label="Name" min-width="140" show-overflow-tooltip />
                      <el-table-column label="Type" min-width="100">
                        <template slot-scope="props">
                          <el-tag size="mini" :type="getEnvTypeTag(props.row.type)">
                            {{ props.row.type === 'configMap' ? 'ConfigMap' : 
                              props.row.type === 'secret' ? 'Secret' : 'Value' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="Value/Reference" min-width="160" show-overflow-tooltip>
                        <template slot-scope="props">
                          {{ props.row.type === 'default' ? props.row.value : props.row.refName }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
                <div slot="reference" class="env-preview">
                  {{ scope.row.env.length }} Environment Variables
                </div>
              </el-popover>
            </div>

            <!-- EnvsFrom - Environment from ConfigMaps/Secrets -->
            <div v-if="scope.row.envsFrom && scope.row.envsFrom.length" style="margin-top: 5px">
              <el-popover placement="right" width="400" trigger="hover">
                <el-table :data="scope.row.envsFrom" size="mini" border>
                  <el-table-column label="Type" min-width="100">
                    <template slot-scope="props">
                      <el-tag size="mini" :type="getEnvTypeTag(props.row.refType)">
                        {{ props.row.refType === 'configMap' ? 'ConfigMap' : 'Secret' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="Name" min-width="150" show-overflow-tooltip />
                  <el-table-column prop="prefix" label="Prefix" min-width="100" show-overflow-tooltip />
                </el-table>
                <div slot="reference" class="env-preview">
                  {{ scope.row.envsFrom.length }} EnvFrom Resources
                </div>
              </el-popover>
            </div>

            <span v-if="(!scope.row.env || !scope.row.env.length) && 
                        (!scope.row.envsFrom || !scope.row.envsFrom.length)">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Volumes" min-width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.volumeMounts && scope.row.volumeMounts.length">
            <el-popover placement="right" width="400" trigger="hover">
              <el-table :data="scope.row.volumeMounts" size="mini" border>
                <el-table-column prop="mountName" label="Name" min-width="120" show-overflow-tooltip />
                <el-table-column prop="mountPath" label="Mount Path" min-width="150" show-overflow-tooltip />
                <el-table-column label="Read Only" width="100" align="center">
                  <template slot-scope="props">
                    <el-tag size="mini" :type="props.row.readOnly ? 'warning' : 'success'">
                      {{ props.row.readOnly ? 'Yes' : 'No' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <div slot="reference" class="volume-preview">
                {{ scope.row.volumeMounts.length }} Volume Mounts
              </div>
            </el-popover>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Commands" min-width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.command && scope.row.command.length">
            <el-popover placement="left" width="300" trigger="hover">
              <div>
                <div class="command-section">
                  <div class="command-label">Command:</div>
                  <div class="command-value">{{ scope.row.command.join(' ') }}</div>
                </div>
                <div v-if="scope.row.args && scope.row.args.length" class="command-section">
                  <div class="command-label">Args:</div>
                  <div class="command-value">{{ scope.row.args.join(' ') }}</div>
                </div>
              </div>
              <div slot="reference" class="command-preview">View Command</div>
            </el-popover>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ProbeInfo from './probe-info'

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
    }
  }
}
</script>

<style lang="scss" scoped>
.container-list {
  width: 100%;
}

.env-preview,
.volume-preview,
.command-preview {
  color: #409EFF;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.command-section {
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .command-label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .command-value {
    font-family: monospace;
    background: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
    word-break: break-all;
  }
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
</style>