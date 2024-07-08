<script setup lang="ts">
import { graphic } from 'echarts'
import type { EChartsOption, ECElementEvent, TreemapSeriesOption } from 'echarts'
import { useThemeStore } from '@/stores/theme'
import { getCssVariable } from '@/utils'
import { storeToRefs } from 'pinia'
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  data: TreemapSeriesOption['data']
}>()

const emit = defineEmits<{
  (e: 'click', data: ECElementEvent): void
}>()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const defineOption = () => {
  const colors = [
    { color1: 'rgb(88,128,242)', color2: 'rgb(19,88,252)' },
    { color1: 'rgb(107,236,234)', color2: 'rgb(0,205,233)' },
    { color1: 'rgb(186,109,225)', color2: 'rgb(111,52,247)' },
    { color1: 'rgb(253,200,76)', color2: 'rgb(255,128,7)' },
    { color1: 'rgb(0,247,166)', color2: 'rgb(1,246,232)' },
    { color1: 'rgb(251,228,38)', color2: 'rgb(250,186,49)' },
    { color1: 'rgb(251,201,107)', color2: 'rgb(249,124,178)' },
    { color1: 'rgb(25,229,223)', color2: 'rgb(177,139,249)' }
  ]

  const opacity = isDark.value ? 0.3 : 1

  const data: TreemapSeriesOption['data'] = (props.data || []).map((item, index) => {
    const colorIdx = index % colors.length

    return {
      ...item,
      itemStyle: {
        color: new graphic.LinearGradient(0, 0, 0.5, 1, [
          {
            offset: 0,
            color: colors[colorIdx].color1.replace(')', `, ${opacity})`)
          },
          {
            offset: 1,
            color: colors[colorIdx].color2.replace(')', `, ${opacity})`)
          }
        ])
      }
    }
  })

  const option: EChartsOption = {
    backgroundColor: getCssVariable('--main-bg-color'),
    tooltip: {
      show: true,
      backgroundColor: getCssVariable('--el-bg-color-overlay'),
      borderColor: getCssVariable('--el-border-color-light'),
      textStyle: {
        color: getCssVariable('--el-text-color-primary')
      }
    },
    series: [
      {
        type: 'treemap',
        width: '100%',
        height: '100%',
        roam: false,
        data,
        nodeClick: false,
        breadcrumb: {
          show: false
        },
        itemStyle: {
          gapWidth: 1,
          borderColor: getCssVariable('--main-bg-color')
        },
        label: {
          color: `rgb(255,255,255, ${opacity + 0.2})`
        }
      }
    ]
  }

  return option
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
    class="chart-treemap"
    :option="defineOption()"
    autoresize
    @click="handleClick"
  />
</template>
