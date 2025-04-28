<template>
  <span>{{ formattedTime }}</span>
</template>

<script>
export default {
  name: 'Timestamp',
  props: {
    data: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    formattedTime() {
      if (!this.data) return '-'
      
      // 将Unix时间戳（秒）转换为毫秒
      const timeInMs = typeof this.data === 'string' ? 
        parseInt(this.data) * 1000 : 
        Number(this.data) * 1000
      
      if (isNaN(timeInMs)) return '-'
      
      const time = new Date(timeInMs)
      const now = new Date()
      const diff = now - time
      
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const weeks = Math.floor(days / 7)
      
      if (weeks > 0) return `${weeks}w`
      if (days > 0) return `${days}d`
      if (hours > 0) return `${hours}h`
      if (minutes > 0) return `${minutes}m`
      return seconds <= 0 ? '0s' : `${seconds}s`
    }
  }
}
</script>