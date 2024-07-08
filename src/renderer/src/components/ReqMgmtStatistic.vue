<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { ECElementEvent, EChartsOption } from 'echarts'
import { useReqMgmtStore } from '@/stores/req-mgmt'
import { reqMgmt } from '@/constants'
import { bus } from '@/utils'
import ChartTreemap from './ChartTreemap.vue'
import ChartHeatmapCartesian from './ChartHeatmapCartesian.vue'
import { open } from '@/utils'

const reqMgmtStore = useReqMgmtStore()
const { total, archivesTotal, todoTotal, projectList, projectsTotal, dateGroupedList } =
  storeToRefs(reqMgmtStore)

const heatmapChartOptions = computed(() => {
  const formatDay = (d: number | string) => `${d} 月`
  const yAxisData: number[] = []

  const xAxisData = Array.from({ length: 12 }, (_, i) => formatDay(i + 1))

  const result: any = []

  Object.keys(dateGroupedList.value).forEach((date) => {
    const [_year, _month] = date.split('-')

    const year = Number(_year)
    const month = formatDay(Number(_month))
    const len = dateGroupedList.value[date].length

    result.push([month, year.toString(), len])

    if (!yAxisData.includes(year)) {
      yAxisData.push(year)
    }
  })
  yAxisData.sort((a, b) => b - a)

  return {
    xAxis: {
      data: xAxisData
    },
    yAxis: {
      data: yAxisData
    },
    series: {
      data: result
    }
  } as EChartsOption
})
const chartHeatmapCartesianHeight = computed(() => {
  // @ts-ignore
  return `${heatmapChartOptions.value.yAxis?.data?.length * 3 * 15}px`
})

const chartData = computed(() => {
  return projectList.value.map((item) => {
    const { id, records, name } = item
    const value = records.length

    return {
      name,
      value,
      id
    }
  })
})

const handleClick = (e: ECElementEvent) => {
  const item = e.data as { id: string }
  bus.emit('on-mgmt-statistic-bar-click', item.id)
}

const dialogVisible = ref(false)
const dialogTitle = ref()
const dialogData = ref<[ProjectItem, Project][]>(dateGroupedList.value['2023-05'])
const handleHeatmapChartClick = (e: ECElementEvent) => {
  // @ts-ignore
  const [_month, year] = e.data || []

  let month = _month.split(' ')[0]
  if (month.length === 1) month = `0${month}`
  const date = `${year}-${month}`

  dialogTitle.value = date + ' 需求列表'
  dialogVisible.value = true

  dialogData.value = dateGroupedList.value[date]
}
</script>

<template>
  <el-row
    :id="reqMgmt.REQ_MGMT_STATISTIC_ID"
    style="text-align: center; padding-top: var(--main-padding)"
    :gutter="10"
  >
    <el-col :span="6">
      <el-card shadow="never">
        <el-statistic title="已统计项目（个）" :value="projectsTotal" />
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card shadow="never">
        <el-statistic title="已统计需求（批）" :value="total" />
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card shadow="never">
        <el-statistic title="已完成需求（批）" :value="archivesTotal" />
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card shadow="never">
        <el-statistic title="待完成需求（批）" :value="todoTotal" />
      </el-card>
    </el-col>
  </el-row>

  <el-card style="margin-top: 10px" shadow="never" body-style="padding: 0;">
    <ChartHeatmapCartesian
      :options="heatmapChartOptions"
      :style="{
        height: chartHeatmapCartesianHeight
      }"
      @click="handleHeatmapChartClick"
    />
  </el-card>

  <el-card style="margin-top: 10px; border: 0" shadow="never" body-style="padding: 0;">
    <ChartTreemap :data="chartData" style="height: 170px" @click="handleClick" />
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="70%" draggable>
    <p v-for="[item, project] in dialogData" class="dialog-item" @click="open(item.path)">
      {{ project.name }} / {{ item.name }}
    </p>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-item {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
