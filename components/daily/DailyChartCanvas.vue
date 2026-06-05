<template>
  <div class="relative w-full" style="min-height: 320px">
    <!-- Custom HTML tooltip -->
    <Transition name="tooltip-fade">
      <div
        v-if="tooltipVisible"
        class="pointer-events-none absolute z-50 min-w-[200px] max-w-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg text-sm p-3"
        :style="tooltipStyle"
      >
        <div
          class="font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1.5 text-xs uppercase tracking-wide"
        >
          {{ tooltipTitle }}
        </div>
        <!-- Overall -->
        <div v-if="tooltipOverall" class="flex items-start gap-2 mb-2">
          <span class="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-sky-400/70" />
          <div class="leading-snug">
            <div class="text-gray-600 dark:text-gray-300">
              {{ tooltipOverall.label }}
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              {{ tooltipOverall.stats }}
            </div>
          </div>
        </div>
        <!-- Current day -->
        <div v-if="tooltipCurrent" class="flex items-start gap-2 mb-2">
          <span class="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-green-500" />
          <div class="leading-snug">
            <div class="font-medium text-gray-700 dark:text-gray-200">
              {{ tooltipCurrent.label }}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              {{ tooltipCurrent.stats }}
            </div>
            <div
              v-if="tooltipCurrent.lanes"
              class="text-blue-600 dark:text-blue-400 font-medium"
            >
              {{ tooltipCurrent.lanes }}
            </div>
          </div>
        </div>
        <!-- Previous day -->
        <div v-if="tooltipPrevious" class="flex items-start gap-2">
          <span
            class="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-orange-400/80"
          />
          <div class="leading-snug">
            <div class="font-medium text-gray-600 dark:text-gray-300">
              {{ tooltipPrevious.label }}
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              {{ tooltipPrevious.stats }}
            </div>
            <div
              v-if="tooltipPrevious.lanes"
              class="text-blue-600 dark:text-blue-400 font-medium"
            >
              {{ tooltipPrevious.lanes }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
import type { ChartData, ChartOptions } from 'chart.js'
import { addDays } from 'date-fns'
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
const { isDesktop } = useDesktopView()

const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-US'))

const currentDayLabel = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  const shortDate = new Intl.DateTimeFormat(localeStr.value, {
    month: 'numeric',
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
    month: 'numeric',
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

// ---- Custom HTML tooltip ----

interface TooltipDaySection {
  label: string
  stats: string
  lanes: string | null
}

const tooltipVisible = ref(false)
const tooltipStyle = ref<Record<string, string>>({})
const tooltipTitle = ref('')
const tooltipOverall = ref<TooltipDaySection | null>(null)
const tooltipCurrent = ref<TooltipDaySection | null>(null)
const tooltipPrevious = ref<TooltipDaySection | null>(null)

function buildDaySection(
  summary: NonNullable<(typeof hourlyData.value)[0]['currentDay']>,
  label: string
): TooltipDaySection {
  let stats: string | null = null
  if (
    summary.utilizationRate != null ||
    summary.averageOccupancy != null ||
    summary.minOccupancy != null ||
    summary.maxOccupancy != null
  ) {
    stats = t('heatmap.daily.tooltipStats', {
      percentage: summary.utilizationRate,
      average: summary.averageOccupancy,
      min: summary.minOccupancy,
      max: summary.maxOccupancy,
    })
  }
  let lanes: string | null = null
  if (
    summary.openLanes != null &&
    summary.totalLanes != null &&
    summary.totalLanes > 0
  ) {
    lanes = t('heatmap.daily.tooltipLanes', {
      open: summary.openLanes,
      total: summary.totalLanes,
    })
  }
  return { label, stats, lanes }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function externalTooltipHandler(context: { chart: any; tooltip: any }) {
  const { chart, tooltip } = context

  if (tooltip.opacity === 0 || !poolStore.showDailyTooltip) {
    tooltipVisible.value = false
    return
  }

  const dataPoints = tooltip.dataPoints as
    | Array<{ dataIndex: number }>
    | undefined
  if (!dataPoints || dataPoints.length === 0) {
    tooltipVisible.value = false
    return
  }

  const hourIndex = dataPoints[0].dataIndex
  const data = hourlyData.value[hourIndex]
  if (!data) {
    tooltipVisible.value = false
    return
  }

  // Title: time range
  const fromHour = hours[hourIndex]
  tooltipTitle.value =
    fromHour < 22 ? `${fromHour}:00 – ${fromHour + 1}:00` : `${fromHour}:00`

  // Overall line
  tooltipOverall.value = {
    label: t('heatmap.daily.tooltipOverall', {
      metric: metricLabel.value,
    }),
    stats: `${data.overallValue}%`,
    lanes: null,
  }

  // Current day
  tooltipCurrent.value = data.currentDay
    ? buildDaySection(data.currentDay, currentDayLabel.value)
    : null

  // Previous day
  tooltipPrevious.value = data.previousDay
    ? buildDaySection(data.previousDay, previousDayLabel.value)
    : null

  // Position relative to the chart wrapper div (parent of canvas)
  const canvasEl = chart.canvas as HTMLCanvasElement
  const wrapper = canvasEl.parentElement as HTMLElement
  const canvasRect = canvasEl.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()
  const offsetX = canvasRect.left - wrapperRect.left
  const offsetY = canvasRect.top - wrapperRect.top

  const rawX = tooltip.caretX + offsetX
  const rawY = tooltip.caretY + offsetY

  const tooltipWidth = 240
  const left =
    rawX + tooltipWidth + 16 > wrapperRect.width
      ? rawX - tooltipWidth - 8
      : rawX + 12

  tooltipStyle.value = {
    top: `${Math.max(0, rawY - 16)}px`,
    left: `${Math.max(0, left)}px`,
  }

  tooltipVisible.value = true
}

// ---- Chart config ----

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
          boxHeight: isDesktop.value ? 16 : 8,
        },
      },
      tooltip: {
        enabled: false,
        mode: 'index',
        intersect: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        external: externalTooltipHandler as any,
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

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.1s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
