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
      const time = new Date(this.data)
      const now = new Date()
      const diff = now - time
      
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (days > 0) return `${days}d`
      if (hours > 0) return `${hours}h`
      if (minutes > 0) return `${minutes}m`
      return `${seconds}s`
    }
  }
}
</script>