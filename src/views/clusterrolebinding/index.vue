<template>
  <div class="app-container">
    <div class="filter-container">
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
            :to="`/authority/clusterrolebinding-detail/${row.name}`"
            class="link-type"
          >
            {{ row.name }}
          </router-link>
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
  name: 'ClusterRoleBindingList',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      listLoading: true,
      listQuery: {
        keyword: ''
      }
    }
  },
  computed: {
    ...mapState({
      clusterRoleBindings: state => state.clusterrolebinding.clusterRoleBindings || []
    })
  },
  created() {
    this.getList()
  },
  watch: {
    clusterRoleBindings: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true
    }
  },
  methods: {
    getList() {
      this.listLoading = true
      this.$store.dispatch('clusterrolebinding/getClusterRoleBindingList', this.listQuery).then(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.$router.push('/authority/clusterrolebinding-create')
    },
    handleUpdate(row) {
      this.$router.push(`/authority/clusterrolebinding-edit/${row.name}`)
    },
    handleDelete(row) {
      this.$confirm('This will permanently delete the cluster role binding. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('clusterrolebinding/deleteClusterRoleBinding', {
          name: row.name
        }).then(() => {
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
