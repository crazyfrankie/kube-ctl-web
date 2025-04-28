<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="nodeList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="名称" prop="name" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="角色" prop="roles" />
      <el-table-column label="版本" prop="version" />
      <el-table-column label="内部IP" prop="internalIP" />
      <el-table-column label="CPU" prop="cpu" />
      <el-table-column label="内存" prop="memory" />
      <el-table-column label="操作" width="200">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'NodeList',
  data() {
    return {
      nodeList: [],
      listLoading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('node/getNodeList')
        this.nodeList = response.data || []
      } catch (error) {
        Message.error('获取节点列表失败')
      }
      this.listLoading = false
    },
    handleEdit(row) {
      this.$router.push({
        path: '/node/edit',
        query: { name: row.name }
      })
    }
  }
}
</script>