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
        创建ConfigMap
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="configMapList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="名称" prop="name">
        <template slot-scope="{row}">
          <router-link :to="{ path: '/volume/configmap-edit', query: { namespace: currentNamespace, name: row.name }}">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="命名空间" prop="namespace" />
      <el-table-column label="数据量" prop="dataCount" />
      <el-table-column label="创建时间">
        <template slot-scope="{row}">
          <timestamp :data="row.creationTimestamp" />
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
  name: 'ConfigMapList',
  components: {
    Timestamp
  },
  data() {
    return {
      currentNamespace: '',
      configMapList: [],
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
          this.fetchData()
        }
      } catch (error) {
        Message.error('获取命名空间列表失败')
      }
    },
    async fetchData() {
      if (!this.currentNamespace) return
      this.listLoading = true
      try {
        const response = await this.$store.dispatch('configmap/getConfigMapList', {
          namespace: this.currentNamespace
        })
        this.configMapList = response.data || []
      } catch (error) {
        Message.error('获取ConfigMap列表失败')
      }
      this.listLoading = false
    },
    handleNamespaceChange() {
      this.fetchData()
    },
    handleCreate() {
      this.$router.push({
        path: '/volume/configmap-edit',
        query: { namespace: this.currentNamespace }
      })
    },
    handleEdit(row) {
      this.$router.push({
        path: '/volume/configmap-edit',
        query: {
          namespace: this.currentNamespace,
          name: row.name
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm('此操作将永久删除该ConfigMap, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('configmap/deleteConfigMap', {
          namespace: this.currentNamespace,
          name: row.name
        })
        Message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          Message.error('删除失败')
        }
      }
    }
  }
}
</script>