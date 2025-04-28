<template>
  <div class="app-container">
    <div class="detail-header">
      <el-page-header @back="goBack" :content="nodeName" />
    </div>
    
    <el-card class="box-card" v-loading="loading">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="标签">
          <el-tag
            v-for="(label, index) in form.labels"
            :key="index"
            closable
            @close="removeLabel(index)"
            style="margin-right: 10px"
          >
            {{ label.key }}: {{ label.value }}
          </el-tag>
          <el-button size="small" type="primary" @click="addLabel">添加标签</el-button>
        </el-form-item>
        <el-form-item label="污点">
          <el-tag
            v-for="(taint, index) in form.taints"
            :key="index"
            closable
            @close="removeTaint(index)"
            style="margin-right: 10px"
          >
            {{ taint.key }}: {{ taint.value }} [{{ taint.effect }}]
          </el-tag>
          <el-button size="small" type="primary" @click="addTaint">添加污点</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog title="添加标签" :visible.sync="labelDialogVisible">
      <el-form :model="labelForm">
        <el-form-item label="Key">
          <el-input v-model="labelForm.key"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="labelForm.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="labelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddLabel">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="添加污点" :visible.sync="taintDialogVisible">
      <el-form :model="taintForm">
        <el-form-item label="Key">
          <el-input v-model="taintForm.key"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="taintForm.value"></el-input>
        </el-form-item>
        <el-form-item label="Effect">
          <el-select v-model="taintForm.effect">
            <el-option label="NoSchedule" value="NoSchedule"></el-option>
            <el-option label="PreferNoSchedule" value="PreferNoSchedule"></el-option>
            <el-option label="NoExecute" value="NoExecute"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="taintDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTaint">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'NodeEdit',
  data() {
    return {
      loading: false,
      nodeName: '',
      form: {
        labels: [],
        taints: []
      },
      labelDialogVisible: false,
      taintDialogVisible: false,
      labelForm: {
        key: '',
        value: ''
      },
      taintForm: {
        key: '',
        value: '',
        effect: 'NoSchedule'
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const name = this.$route.query.name
      if (!name) {
        Message.error('参数错误')
        return
      }
      this.nodeName = name
      this.loading = true
      try {
        const response = await this.$store.dispatch('node/getNodeDetail', { name })
        this.form = response.data
      } catch (error) {
        Message.error('获取节点详情失败')
      }
      this.loading = false
    },
    addLabel() {
      this.labelForm = { key: '', value: '' }
      this.labelDialogVisible = true
    },
    confirmAddLabel() {
      if (!this.labelForm.key || !this.labelForm.value) {
        Message.warning('请填写完整的标签信息')
        return
      }
      this.form.labels.push({ ...this.labelForm })
      this.labelDialogVisible = false
    },
    removeLabel(index) {
      this.form.labels.splice(index, 1)
    },
    addTaint() {
      this.taintForm = { key: '', value: '', effect: 'NoSchedule' }
      this.taintDialogVisible = true
    },
    confirmAddTaint() {
      if (!this.taintForm.key) {
        Message.warning('请填写完整的污点信息')
        return
      }
      this.form.taints.push({ ...this.taintForm })
      this.taintDialogVisible = false
    },
    removeTaint(index) {
      this.form.taints.splice(index, 1)
    },
    async onSubmit() {
      try {
        await this.$store.dispatch('node/updateNode', {
          name: this.nodeName,
          ...this.form
        })
        Message.success('保存成功')
        this.goBack()
      } catch (error) {
        Message.error('保存失败')
      }
    },
    goBack() {
      this.$router.push('/node/list')
    }
  }
}
</script>

<style scoped>
.detail-header {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>