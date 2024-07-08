<script setup lang="ts">
import type { EChartsOption, ECElementEvent } from 'echarts'
import { useThemeStore } from '@/stores/theme'
import { getCssVariable } from '@/utils'
import { storeToRefs } from 'pinia'
import { nextTick, ref, watch } from 'vue'
import { merge } from 'lodash-es'

export interface Props {
  options: EChartsOption
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', data: ECElementEvent): void
}>()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const defineOption = () => {
  const option: EChartsOption = {
    backgroundColor: getCssVariable('--el-bg-color-overlay'),
    tooltip: {
      show: false,
      backgroundColor: getCssVariable('--el-bg-color-overlay'),
      borderColor: getCssVariable('--el-border-color-light'),
      textStyle: {
        color: getCssVariable('--el-text-color-primary')
      }
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: getCssVariable('--el-text-color-primary')
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: getCssVariable('--el-border-color-light')
        }
      },
      axisTick: {
        show: false
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [getCssVariable('--el-fill-color-light'), getCssVariable('--el-fill-color')]
        }
      }
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        color: getCssVariable('--el-text-color-primary')
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: getCssVariable('--el-border-color-light')
        }
      },
      axisTick: {
        show: false
      },
      splitArea: {
        show: false
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: 10,
      inRange: {
        color: [getCssVariable('--el-color-primary-light-9'), getCssVariable('--el-color-primary')]
      }
    },
    grid: {
      left: 15,
      top: 15,
      right: 15,
      bottom: 15,
      containLabel: true
    },
    series: {
      type: 'heatmap',
      label: {
        show: true
      }
    }
  }

  return merge(option, props.options)
}

const handleClick = (e: ECElementEvent) => {
  emit('click', e)
}

const chartRef = ref()
watch(isDark, async () => {
  await nextTick()
  chartRef.value.setOption(defineOption())
})
</script>

<template>
  <v-chart
    ref="chartRef"
    class="chart-heatmap-cartesian"
    :option="defineOption()"
    autoresize
    @click="handleClick"
  />
</template>
