<template>
  <div>
    <div v-for="(item, index) in internalItems" :key="index" class="dynamic-item">
      <el-input 
        v-model="item.key" 
        class="item-input" 
        placeholder="Key"
        :disabled="item.keyDisabled"
        @change="updateItem(index)"
      ></el-input>
      <el-input 
        v-model="item.value" 
        class="item-input" 
        placeholder="Value"
        @change="updateItem(index)"
      ></el-input>
      <el-button 
        type="danger" 
        icon="el-icon-delete" 
        circle 
        @click="removeItem(index)" 
        class="delete-btn"
      ></el-button>
    </div>
    <el-button 
      type="primary" 
      icon="el-icon-plus" 
      @click="addItem" 
      size="small"
    >Add Item</el-button>
  </div>
</template>

<script>
export default {
  name: 'DynamicItem',
  props: {
    value: {
      type: Array,
      required: true
    },
    itemKey: {
      type: String,
      default: 'key'
    },
    itemValue: {
      type: String,
      default: 'value'
    },
    disableKey: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalItems: []
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (!newVal || newVal.length === 0) {
          this.initItems()
        } else {
          // Only update if the arrays are different to avoid infinite loops
          if (!this.areArraysEqual(this.mapInternalToExternal(), newVal)) {
            this.initFromProps()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initFromProps() {
      if (this.value && this.value.length) {
        this.internalItems = this.value.map(item => ({
          key: item[this.itemKey] || '',
          value: item[this.itemValue] || '',
          keyDisabled: this.disableKey
        }))
      } else {
        this.initItems()
      }
    },
    initItems() {
      this.internalItems = [{
        key: '',
        value: '',
        keyDisabled: this.disableKey
      }]
    },
    addItem() {
      this.internalItems.push({
        key: '',
        value: '',
        keyDisabled: this.disableKey
      })
      this.emitChange()
    },
    removeItem(index) {
      this.internalItems.splice(index, 1)
      if (this.internalItems.length === 0) {
        this.initItems()
      }
      this.emitChange()
    },
    updateItem() {
      this.emitChange()
    },
    emitChange() {
      const result = this.mapInternalToExternal()
      this.$emit('input', result)
    },
    mapInternalToExternal() {
      return this.internalItems
        .filter(item => item.key.trim() !== '') // Only include items with non-empty keys
        .map(item => {
          const result = {}
          result[this.itemKey] = item.key
          result[this.itemValue] = item.value
          return result
        })
    },
    areArraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false
      
      for (let i = 0; i < arr1.length; i++) {
        const item1 = arr1[i]
        const item2 = arr2[i]
        
        if (item1[this.itemKey] !== item2[this.itemKey] || 
            item1[this.itemValue] !== item2[this.itemValue]) {
          return false
        }
      }
      
      return true
    }
  }
}
</script>

<style scoped>
.dynamic-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.item-input {
  margin-right: 10px;
  width: 200px;
}

.delete-btn {
  margin-left: 5px;
}
</style>