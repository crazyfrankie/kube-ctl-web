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
      
      // Convert timestamp (seconds) to time ago format
      const timestamp = typeof this.data === 'string' ? 
        parseInt(this.data) : Number(this.data)
      
      if (isNaN(timestamp)) return '-'
      
      // Calculate difference in seconds
      const now = Math.floor(Date.now() / 1000)
      const seconds = now - timestamp
      
      if (seconds < 0) return '-' // Future timestamp, shouldn't happen
      
      if (seconds < 60) return `${seconds}s`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
      if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`
      if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo`
      
      return `${Math.floor(seconds / 31536000)}y`
    }
  }
}
</script>