import { SaleType } from './HOCs'
import { moment } from './utils'
import { TimeLapse } from './types'

const dateFormat = 'YYYY-MM-DD'

function sortSalesByDate(sales: SaleType[]): SaleType[] {
  return [...sales].sort((a, b) =>
    moment(b.createdAt).diff(a.createdAt, 'milliseconds')
  )
}

function lastWeekSales(sales: SaleType[]) {
  return sales.filter(({ createdAt }) =>
    moment(createdAt, 'YYYY-MM-DD').isAfter(moment().subtract(7, 'days'))
  )
}

function lastYearSales(sales: SaleType[]) {
  return sales.filter(({ createdAt }) =>
    moment(createdAt, 'YYYY-MM-DD').isAfter(moment().subtract(1, 'year'))
  )
}

type PerDate = {
  [key: string]: SaleType[]
}

function groupSalesPerDate(sales: SaleType[]): PerDate {
  let salesPerDate: PerDate = {}

  const filteredSales = sortSalesByDate(sales)

  filteredSales.forEach(sale => {
    const saleDate = moment(sale.createdAt).format(dateFormat)
    const currentSalesPerDate = salesPerDate[saleDate] || []
    salesPerDate[saleDate] = [...currentSalesPerDate, sale]
  })

  return salesPerDate
}

type SaleDate = string

type SalesPayload = {
  money: number
  unitsSold: number
}

type SalesPerDay = { [key: number]: [SaleDate, SalesPayload] }

function getPerDaySalesStats(sales: SaleType[]): SalesPerDay {
  const perDate = groupSalesPerDate(sales)

  const salesPerDay: SalesPerDay = {
    0: ['Dom', { money: 0, unitsSold: 0 }],
    1: ['Lun', { money: 0, unitsSold: 0 }],
    2: ['Mar', { money: 0, unitsSold: 0 }],
    3: ['Mie', { money: 0, unitsSold: 0 }],
    4: ['Jue', { money: 0, unitsSold: 0 }],
    5: ['Vie', { money: 0, unitsSold: 0 }],
    6: ['Sab', { money: 0, unitsSold: 0 }],
  }

  Object.entries(perDate).forEach(([dateString, sales]) => {
    const day = moment(dateString, dateFormat).day()
    const allMoney = sales.reduce((p, c) => {
      return p + c.products.reduce((p, c) => p + c.price * c.quantitySold, 0)
    }, 0)

    if (moment(dateString, dateFormat).diff(moment(), 'days') === 0) {
      salesPerDay[day][0] = 'Hoy'
    }
    salesPerDay[day][1].money += allMoney
    salesPerDay[day][1].unitsSold += sales.length
  })

  return salesPerDay
}

type SalesPerMonth = { [key: string]: [SaleDate, SalesPayload] }

function getSalesPerMonth(sales: SaleType[]) {
  const perDate = groupSalesPerDate(sales)

  const salesPerMonth: SalesPerMonth = {
    0: ['Ene', { money: 0, unitsSold: 0 }],
    1: ['Feb', { money: 0, unitsSold: 0 }],
    2: ['Mar', { money: 0, unitsSold: 0 }],
    3: ['Abr', { money: 0, unitsSold: 0 }],
    4: ['Mayo', { money: 0, unitsSold: 0 }],
    5: ['Jun', { money: 0, unitsSold: 0 }],
    6: ['Jul', { money: 0, unitsSold: 0 }],
    7: ['Ago', { money: 0, unitsSold: 0 }],
    8: ['Sep', { money: 0, unitsSold: 0 }],
    9: ['Oct', { money: 0, unitsSold: 0 }],
    10: ['Nov', { money: 0, unitsSold: 0 }],
    11: ['Dic', { money: 0, unitsSold: 0 }],
  }

  Object.entries(perDate).forEach(([dateString, sales]) => {
    const month = moment(dateString, dateFormat).month()
    salesPerMonth[month][1].unitsSold += sales.length

    const allMoney = sales.reduce((p, c) => {
      return p + c.products.reduce((p, c) => p + c.price * c.quantitySold, 0)
    }, 0)
    salesPerMonth[month][1].money += allMoney
  })

  return salesPerMonth
}

type BarCharts = {
  labels: string[]
  data: SalesPayload[]
}

type ProductStatistic = {
  productId: string
  name: string
  money: number
  unitsSold: number
}

function getProductStatistics(sales: SaleType[]): ProductStatistic[] {
  let products: ProductStatistic[] = []

  sales.forEach(sale => {
    if (!sale.products) {
      return
    }

    sale.products.forEach(product => {
      const currentProduct = products.find(
        p => p.productId === product.productId
      )

      if (currentProduct) {
        currentProduct.money += product.price * product.quantitySold
        currentProduct.unitsSold += product.quantitySold
      } else {
        products.push({
          productId: product.productId,
          name: product.name,
          money: product.price * product.quantitySold,
          unitsSold: product.quantitySold,
        })
      }
    })
  })
  return products
}

export function getTotalNumberOfSales(
  sales: SaleType[],
  showLast: TimeLapse
): BarCharts {
  if (showLast === TimeLapse.lastWeek) {
    const filteredSales = lastWeekSales(sales)

    const perDay = getPerDaySalesStats(filteredSales)

    const lastWeekMoment = moment().subtract(6, 'days')

    const data: SalesPayload[] = []
    const labels: string[] = []

    for (let i = 0; i <= 6; i++) {
      const nextDay = lastWeekMoment.day()
      labels.push(perDay[nextDay][0])
      data.push(perDay[nextDay][1])
      lastWeekMoment.add(1, 'days')
    }

    return {
      labels,
      data,
    }
  } else if (showLast === TimeLapse.lastYear) {
    const filteredSales = lastYearSales(sales)

    const perMonth = getSalesPerMonth(filteredSales)

    let lastYearMoment = moment().subtract(11, 'months')

    const data: SalesPayload[] = []
    const labels: string[] = []

    for (let i = 0; i <= 11; i++) {
      const nextMonth = lastYearMoment.month()
      labels.push(perMonth[nextMonth][0])
      data.push(perMonth[nextMonth][1])
      lastYearMoment.add(1, 'month')
    }

    return {
      labels,
      data,
    }
  }

  return {
    labels: [],
    data: [],
  }
}

export function getTheSixBestSellingProducts(
  sales: SaleType[],
  showLast: TimeLapse
) {
  let filteredSales: SaleType[] = []

  if (showLast === TimeLapse.lastWeek) {
    filteredSales = lastWeekSales(sales)
    // console.log('last week sales:', filteredSales.map(({createdAt}) => moment(createdAt).calendar()))
  } else if (showLast === TimeLapse.lastYear) {
    filteredSales = lastYearSales(sales)
  }

  const productStatistics = getProductStatistics(filteredSales)
  let bestSelling = productStatistics.sort((a, b) => b.unitsSold - a.unitsSold)

  return bestSelling.slice(0, 6)
}
