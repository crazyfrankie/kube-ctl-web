<template>
  <div class="box" :style="{height:'200px',width:'100%'}" ref="chart"></div>
</template>

<script>
import resize from './mixins/resize'

export default {
  name: 'UsageChart',
  mixins: [resize],
  props: {
    data: {
      type: Object,
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
      timer: "",
      chart: null,
      option: {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '80%'],
            radius: '150%',
            min: 0,
            max: 100,
            splitNumber: 1,
            progress: {
              show: true,
              roundCap: true,
              width: 20
            },
            itemStyle: {
              color: params => this.chartColor
            },
            axisLine: {
              lineStyle: {
                width: 10,
                color: [[100, "#eee"]]
              }
            },
            pointer: {
              show: false,
            },
            axisTick: {
              length: 0,
              lineStyle: {
                color: 'inherit',
                width: 2
              }
            },
            splitLine: {
              length: 0,
              lineStyle: {
                color: 'inherit',
                width: 5
              }
            },
            axisLabel: {
              show: false,
            },
            title: {
              offsetCenter: [0, '-10%'],
              fontSize: 20
            },
            detail: {
              fontSize: 30,
              offsetCenter: [0, '-35%'],
              valueAnimation: true,
              formatter: function (value) {
                return Math.round(value) + '%';
              },
              color: 'inherit'
            },
            data: [{
              value: 0.7,
              name: 'Grade Rating'
            }]
          }
        ]
      }
    }
  },
  mounted() {
    this.getPage()
  },
  methods: {
    getPage() {
      this.option.series[0].data[0].name = this.data.title
      this.option.series[0].data[0].value = this.data.value
      this.chart = this.$echarts.init(this.$refs.chart);
      this.chart.setOption(this.option);
    },
    beforeDestroy() {
      window.removeEventListener("resize", () => {
        this.chart.resize();
      });
    }
  }
}
</script>

<style scoped>
.box {
  border-radius: 5px;
  position: relative;
}
</style>
