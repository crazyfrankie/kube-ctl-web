<template>
  <div class="box" :style="{height: '240px', background:'rgba('+data.color+',0.2)'}" ref="chart"></div>
</template>
<script>
import echarts from 'echarts'
// import resize from './mixins/resize'

export default {
  name: 'DashRangeCard',
  props: {
    data: {
      type: Object
    }
  },
  computed: {
    chartColor() {
      // 提供默认颜色，使用相同的 rgb 格式
      const defaultColor = '103,194,58'; // #67C23A 的 RGB 值
      if (!this.data || !this.data.color) {
        return `rgb(${defaultColor})`;
      }
      // 移除末尾的逗号（如果存在）
      const color = this.data.color.replace(/,\s*$/, '');
      return `rgb(${color})`;
    }
  },
  data() {
    return {
      chart: null,
      option: {
        title: {
          x: 'center',
          y: 'top',
          text: "",//主标题文本
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false
          }
        },
        series: [
          {
            data: [],
            type: 'line',
            areaStyle: {
              color: "#67C23A"
            },
            smooth: true,
            symbol: "none",
            lineStyle: {
              color: '#67C23A',
              width: 0
            }
          }
        ],
        grid: {
          x: 40,
          y: 10,
          x2: 40,
          y2: 40
        },
      }
    }
  },
  mounted() {
    // alert("xxx")
    this.getPage()
  },
  methods: {
    getPage() {
      // 引用chart并初始化
      console.log(this.data)
      let newValue = JSON.parse(this.data.value);
      this.option.title.text = this.data.title
      this.option.xAxis.data = newValue.x
      this.option.series[0].data = newValue.y
      // Update chart colors based on data.color
      this.option.series[0].areaStyle.color = this.chartColor
      this.option.series[0].lineStyle.color = this.chartColor
      this.chart = this.$echarts.init(this.$refs.chart);
      // 使用刚指定的配置项和数据显示图表。
      this.chart.setOption(this.option);
    }
  }
}
</script>
<style scoped>
.box {
  background: #eee;
  border-radius: 5px;
}
</style>
