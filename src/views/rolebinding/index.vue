<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.namespace" placeholder="Namespace" clearable class="filter-item" style="width: 200px" @change="handleNamespaceChange">
        <el-option v-for="item in namespaces" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      
      <el-input v-model="listQuery.keyword" placeholder="Search by name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-plus" @click="handleCreate">
        Create
      </el-button>
    </div>
    
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="Name" min-width="180" align="center">
        <template slot-scope="{row}">
          <router-link
            :to="{
              path: `/authority/rolebinding/detail/${row.name}`,
              query: { namespace: row.namespace }
            }"
            class="link-type"
          >
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      
      <el-table-column label="Namespace" min-width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.namespace }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Age" min-width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ formatKubeTimestamp(row.age) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" fixed="right" min-width="230" align="center">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import waves from '@/directive/waves'
import { formatKubeTimestamp } from '@/utils'

export default {
  name: 'RoleBindingList',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      listLoading: true,
      listQuery: {
        namespace: '',
        keyword: ''
      }
    }
  },
  computed: {
    ...mapState({
      namespaces: state => state.pod.namespaces,
      roleBindings: state => state.rolebinding.roleBindings || []
    })
  },
  created() {
    this.initData()
  },
  watch: {
    roleBindings: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true
    },
    // Watch for route changes to handle returning from edit/create and namespace changes
    '$route'(to, from) {
      const toPath = to.path
      const fromPath = from ? from.path : ''
      const toNamespace = to.query.namespace
      const fromNamespace = from ? from.query.namespace : ''
      
      if (toPath === '/authority/rolebindings') {
        if (fromPath.includes('/authority/rolebinding/edit') || fromPath.includes('/authority/rolebinding/create')) {
          if (toNamespace && toNamespace !== this.listQuery.namespace) {
            // Update namespace and refresh list when returning with a different namespace
            this.listQuery.namespace = toNamespace
          }
          this.getList()
        } else if (toNamespace && toNamespace !== fromNamespace) {
          // Handle direct namespace changes through URL
          this.listQuery.namespace = toNamespace
          this.getList()
        }
      }
    }
  },
  methods: {
    initData() {
      this.$store.dispatch('pod/getNamespaces').then(() => {
        // 优先使用URL中的namespace参数
        const urlNamespace = this.$route.query.namespace
        if (urlNamespace) {
          this.listQuery.namespace = urlNamespace
        } else if (this.namespaces.length > 0) {
          // 如果URL中没有namespace参数,则使用第一个namespace
          this.listQuery.namespace = this.namespaces[0].name
        }
        this.getList()
      })
    },
    getList() {
      this.listLoading = true
      this.$store.dispatch('rolebinding/getRoleBindingList', this.listQuery).then(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },
    handleNamespaceChange() {
      // 当命名空间改变时,更新URL中的namespace参数
      this.$router.replace({
        query: { namespace: this.listQuery.namespace }
      })
      this.getList()
    },
    handleCreate() {
      this.$router.push({
        path: '/authority/rolebinding/create',
        query: { namespace: this.listQuery.namespace }
      })
    },
    handleUpdate(row) {
      this.$router.push({
        path: `/authority/rolebinding/edit/${row.name}`,
        query: { namespace: row.namespace }
      })
    },
    handleDetail(row) {
      this.$router.push({
        path: `/authority/rolebinding/detail/${row.name}`,
        query: { namespace: row.namespace }
      })
    },
    handleDelete(row) {
      const { name, namespace } = row
      this.$confirm('This will permanently delete the role binding. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('rolebinding/deleteRoleBinding', { name, namespace }).then(() => {
          this.$message({
            type: 'success',
            message: 'Delete successful!'
          })
          this.getList()
        })
      })
    },
    formatKubeTimestamp
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 20px;
  display: flex;
  align-items: center;
}

.filter-item {
  margin-right: 10px;
}

.link-type {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}
</style>
