<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="currentNamespace" placeholder="请选择命名空间" @change="handleNamespaceChange">
        <el-option
          v-for="item in namespaces"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        创建Pod
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="podList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="名称" prop="name">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/pod/detail', query: { namespace: currentNamespace, name: row.name }}">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="就绪状态" prop="ready" />
      <el-table-column label="状态" prop="status">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)" size="medium">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="重启次数" prop="restarts" />
      <el-table-column label="IP" prop="ip" />
      <el-table-column label="Node" prop="node" />
      <el-table-column label="运行时长">
        <template slot-scope="{row}">
          <timestamp :data="row.age" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Timestamp from '@/components/Timestamp'
import { Message } from 'element-ui'

export default {
  name: 'PodIndex',
  components: {
    Timestamp
  },
  data() {
    return {
      currentNamespace: '',
      podList: [],
      listLoading: false
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces
    })
  },
  created() {
    this.getNamespaces()
  },
  methods: {
    async getNamespaces() {
      try {
        await this.$store.dispatch('pod/getNamespaces')
        if (this.namespaces.length > 0) {
          this.currentNamespace = this.namespaces[0].name
          this.getPodList()
        }
      } catch (error) {
        Message.error('获取命名空间列表失败')
      }
    },
    async getPodList() {
      if (!this.currentNamespace) return
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('pod/getPodList', {
          namespace: this.currentNamespace
        })
        this.podList = response.data || []
      } catch (error) {
        Message.error('获取Pod列表失败')
      }
      this.listLoading = false
    },
    handleNamespaceChange() {
      this.getPodList()
    },
    handleCreate() {
      this.$router.push({
        path: '/pod/create',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/pod/create',
        query: {
          namespace: this.currentNamespace,
          name: row.name,
          isEdit: true
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('此操作将永久删除该Pod, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.listLoading = true
        await this.$store.dispatch('pod/deletePod', {
          namespace: this.currentNamespace,
          name: row.name
        })
        
        // 开始轮询检查Pod是否已经被删除
        let retryCount = 0
        const maxRetries = 10 // 最多重试10次
        
        const checkPodDeleted = async () => {
          try {
            const response = await this.$store.dispatch('pod/getPodList', {
              namespace: this.currentNamespace
            })
            const podStillExists = (response.data || []).some(pod => pod.name === row.name)
            
            if (!podStillExists) {
              this.listLoading = false
              Message.success('删除成功')
              this.podList = response.data || []
              return
            }
            
            retryCount++
            if (retryCount < maxRetries) {
              setTimeout(checkPodDeleted, 2000) // 每2秒检查一次
            } else {
              this.listLoading = false
              Message.warning('Pod正在删除中，请稍后刷新查看')
              await this.getPodList() // 最后再刷新一次列表
            }
          } catch (error) {
            this.listLoading = false
            Message.error('获取Pod列表失败')
          }
        }
        
        await checkPodDeleted()
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('删除失败')
        }
        this.listLoading = false
      }
    },
    getStatusType(status) {
      const statusMap = {
        'Running': 'success',
        'Pending': 'warning',
        'Failed': 'danger',
        'Unknown': 'info',
        'Succeeded': 'success',
        'CrashLoopBackOff': 'danger',
        'Error': 'danger',
        'Terminating': 'warning'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  padding-bottom: 20px;
}

.el-tag {
  text-align: center;
  width: 100px;
}
</style>
