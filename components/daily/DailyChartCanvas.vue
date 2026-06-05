<template>
  <div class="relative w-full" style="min-height: 320px">
    <Line v-if="hasData" :data="chartData" :options="chartOptions" />
    <div
      v-else
      class="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400"
    >
      {{ $t('heatmap.daily.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import { addDays } from 'date-fns'
import { METRIC_TYPES } from '~/types'
import { useDailyChartData } from '~/composables/useDailyChartData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const { t, locale } = useI18n()
const poolStore = usePoolStore()

const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-US'))

const currentDayLabel = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  const shortDate = new Intl.DateTimeFormat(localeStr.value, {
    month: 'long',
    day: 'numeric',
  }).format(date)
  const dayName = poolStore.selectedDailyDayName
  const localizedDay = dayName ? t(`common.days.${dayName.toLowerCase()}`) : ''
  return localizedDay ? `${localizedDay} (${shortDate})` : shortDate
})

const previousDayLabel = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const prevDate = addDays(
    new Date(poolStore.selectedDailyDate + 'T12:00:00'),
    -7
  )
  const shortDate = new Intl.DateTimeFormat(localeStr.value, {
    month: 'long',
    day: 'numeric',
  }).format(prevDate)
  const dayName = poolStore.selectedDailyDayName
  const localizedDay = dayName ? t(`common.days.${dayName.toLowerCase()}`) : ''
  return `${t('heatmap.daily.previousDayLabel')} ${localizedDay} (${shortDate})`
})

const {
  hours,
  hourlyData,
  areaChartValues,
  currentDayValues,
  previousDayValues,
  hasCurrentDayData,
  hasPreviousDayData,
} = useDailyChartData()

const hasData = computed(() => {
  return (
    areaChartValues.value.some((v) => v > 0) ||
    hasCurrentDayData.value ||
    hasPreviousDayData.value
  )
})

const metricLabel = computed(() => {
  return t(`heatmap.selection.${poolStore.metricType}`)
})

const chartData = computed((): ChartData<'line'> => {
  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: t('heatmap.daily.overallLabel', { metric: metricLabel.value }),
      data: areaChartValues.value,
      fill: true,
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'rgba(56, 189, 248, 0.6)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      order: 3,
    },
    {
      label: currentDayLabel.value,
      data: currentDayValues.value as (number | null)[],
      fill: false,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgb(34, 197, 94)',
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 1.5,
      tension: 0.2,
      spanGaps: true,
      order: 1,
    },
    {
      label: previousDayLabel.value,
      data: previousDayValues.value as (number | null)[],
      fill: false,
      borderColor: 'rgba(251, 146, 60, 0.5)',
      backgroundColor: 'rgba(251, 146, 60, 0.5)',
      borderWidth: 1,
      borderDash: [6, 3],
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: 'rgb(251, 146, 60)',
      pointBorderColor: '#fff',
      pointBorderWidth: 1.5,
      tension: 0.2,
      spanGaps: true,
      order: 2,
    },
  ]

  return {
    labels: hours.map((h) => `${h}:00`),
    datasets,
  }
})

const chartOptions = computed(
  (): ChartOptions<'line'> => ({
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (items.length === 0) return ''
            const fromHour = items[0].label
            const hour = Number(fromHour.split(':')[0])
            if (hour >= 22) return fromHour
            const toHour = `${hour + 1}:00`
            return `${fromHour}-${toHour}`
          },
          label: (item: TooltipItem<'line'>) => {
            const hourIndex = item.dataIndex
            const data = hourlyData.value[hourIndex]
            if (!data) return ''

            if (item.datasetIndex === 0) {
              return t('heatmap.daily.tooltipOverall', {
                metric: metricLabel.value,
                value: data.overallValue,
              })
            } else if (item.datasetIndex === 1) {
              if (!data.currentDay) return ''
              return t('heatmap.daily.tooltipCurrent', {
                date: currentDayLabel.value,
                percentage: data.currentDay.utilizationRate,
                average: data.currentDay.averageOccupancy,
                min: data.currentDay.minOccupancy,
                max: data.currentDay.maxOccupancy,
              })
            } else if (item.datasetIndex === 2) {
              if (!data.previousDay) return ''
              return t('heatmap.daily.tooltipPrevious', {
                date: previousDayLabel.value,
                percentage: data.previousDay.utilizationRate,
                average: data.previousDay.averageOccupancy,
                min: data.previousDay.minOccupancy,
                max: data.previousDay.maxOccupancy,
              })
            }
            return ''
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
          stepSize: 20,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
  })
)
</script>
