interface WeeklyOccupancyAccumulator {
  sum: number
  count: number
  min: number
  max: number
}

interface OverallOccupancyAccumulator {
  [day: string]: {
    [hour: number]: {
      average: {
        sum: number
        count: number
      }
      weightedAverage: {
        sum: number
        count: number
      }
      median: {
        weeklyItems: number[]
      }
    }
  }
}

export default class OccupancyDataAccumulator {
  private overallAccumulator: OverallOccupancyAccumulator = {}
  private weeklyAccumulator: WeeklyOccupancyAccumulator = {
    sum: 0,
    count: 0,
    min: Infinity,
    max: -Infinity,
  }

  private formatNumber(value: number): number {
    if (value < 1) {
      return Number(value.toFixed(1))
    }
    return Math.round(value)
  }

  private getWeightForWeightedAverage(
    utilizationRateInPercentage: number
  ): number {
    if (utilizationRateInPercentage === 0) {
      return 0
    }
    const thresholds = [
      { limit: 1, weight: 0.1 },
      { limit: 10, weight: 0.5 },
      { limit: 100, weight: 1 },
    ]
    for (const threshold of thresholds) {
      if (utilizationRateInPercentage < threshold.limit) {
        return threshold.weight
      }
    }
    return 1
  }

  public initializeOverallAccumulator(day: string, hour: number): void {
    if (!this.overallAccumulator[day]) {
      this.overallAccumulator[day] = {}
    }
    if (!this.overallAccumulator[day][hour]) {
      this.overallAccumulator[day][hour] = {
        average: {
          sum: 0,
          count: 0,
        },
        weightedAverage: {
          sum: 0,
          count: 0,
        },
        median: {
          weeklyItems: [],
        },
      }
    }
  }

  public resetWeeklyAccumulator(): void {
    this.weeklyAccumulator = {
      sum: 0,
      count: 0,
      min: Infinity,
      max: -Infinity,
    }
  }

  public updateWeeklyAccumulator(hourlyOccupancy: number): void {
    if (hourlyOccupancy > 0) {
      this.weeklyAccumulator.sum += hourlyOccupancy
      this.weeklyAccumulator.count += 1
    }
    this.weeklyAccumulator.min = Math.min(
      hourlyOccupancy,
      this.weeklyAccumulator.min
    )
    this.weeklyAccumulator.max = Math.max(
      hourlyOccupancy,
      this.weeklyAccumulator.max
    )
  }

  public processWeeklyOccupancy(hourlyMaxCapacity: number): {
    minOccupancy: number
    maxOccupancy: number
    averageOccupancy: number
    utilizationRate: number
    remainingCapacity: number
  } {
    const minOccupancy = this.weeklyAccumulator.min
    const maxOccupancy = this.weeklyAccumulator.max
    const averageOccupancy = this.formatNumber(
      this.weeklyAccumulator.count > 0
        ? this.weeklyAccumulator.sum / this.weeklyAccumulator.count
        : 0
    )
    const utilizationRate = this.formatNumber(
      (averageOccupancy / hourlyMaxCapacity) * 100
    )
    const remainingCapacity = hourlyMaxCapacity - averageOccupancy

    return {
      minOccupancy,
      maxOccupancy,
      averageOccupancy,
      utilizationRate,
      remainingCapacity,
    }
  }

  public processOverallAverageOccupancy(
    hourlyUtilizationRate: number,
    day: string,
    hour: number
  ): {
    averageUtilizationRate: number
    weightedAverageUtilizationRate: number
  } {
    const { median, average, weightedAverage } =
      this.overallAccumulator[day][hour]
    median.weeklyItems.push(hourlyUtilizationRate)

    average.sum += hourlyUtilizationRate
    average.count += 1

    const weight = this.getWeightForWeightedAverage(hourlyUtilizationRate)
    weightedAverage.sum += hourlyUtilizationRate * weight
    weightedAverage.count += weight

    const averageUtilizationRate = this.formatNumber(
      average.count > 0 ? average.sum / average.count : 0
    )
    const weightedAverageUtilizationRate = this.formatNumber(
      weightedAverage.count > 0
        ? weightedAverage.sum / weightedAverage.count
        : 0
    )
    return { averageUtilizationRate, weightedAverageUtilizationRate }
  }

  public processOverallMedianOccupancy(day: string, hour: number): number {
    const { weeklyItems } = this.overallAccumulator[day][hour].median

    if (!weeklyItems || weeklyItems.length === 0) return 0
    weeklyItems.sort((a, b) => a - b)

    const len = weeklyItems.length
    const mid = Math.floor(len / 2)

    if (len % 2 === 0) {
      // If even, return the average of the two middle numbers
      return Math.round((weeklyItems[mid - 1] + weeklyItems[mid]) / 2)
    } else {
      // If odd, return the middle number
      return Math.round(weeklyItems[mid])
    }
  }
}
