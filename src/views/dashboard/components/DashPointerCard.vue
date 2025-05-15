<template>
  <div class="box" :style="{height:'200px',background:getColor(data.value),width:'100%'}" ref="chart"></div>
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
  data() {
    return {
      timer: "",
      chart: null,
      // 配置可视化图形
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
              // color: 'red'
              normal: {
                color: function (params) {
                  // alert(params.value)
                  if (params.value > 0 && params.value < 50) {
                    return "#67C23A";
                  } else if (params.value >= 50 && params.value <= 80) {
                    return "#E6A23C";
                  } else {
                    return "#F56C6C";
                  }

                }
              }
            },
            axisLine: {
              lineStyle: {
                width: 10,
                // color:"red",
                color: [
                  [100, "#eee"],
                  // [70, '#37a2da'],
                  // [100, '#fd666d']
                ]
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
            grid: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 0,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            },
            data: [
              {
                value: 0.7,
                name: 'Grade Rating'
              }
            ]
          }
        ]
      },
    }
  },
  mounted() {
    this.getPage()
    // this.timer = setInterval(() => {
    //   if (this.chart) {
    //     // this.chart.style.width = "458px"
    //     this.chart.resize({
    //       width: "458px",
    //       height: "200px"
    //     });
    //   }
    // }, 1000)
  },
  methods: {
    getColor(value) {
      if (value < 50) {
        return "#F2F6FC"
      }
      if (value < 80) {
        return "#F2F6FC"
      }
      return "#F2F6FC"
    },
    getPage() {
      // 引用chart并初始化
      this.option.series[0].data[0].name = this.data.title
      this.option.series[0].data[0].value = this.data.value
      // console.log(this.$refs.chart.offsetWidth)
      this.chart = this.$echarts.init(this.$refs.chart);
      // 使用刚指定的配置项和数据显示图表。
      this.chart.setOption(this.option);
    },
    beforeDestroy() {
      /* 页面组件销毁的时候，别忘了移除绑定的监听resize事件，否则的话，多渲染几次
      容易导致内存泄漏和额外CPU或GPU占用哦*/
      window.removeEventListener("resize", () => {
        this.chart.resize();
      });
    },
  }
}
</script>
<style scoped>
.box {
  border-radius: 5px;
  position: relative;
}
</style>
