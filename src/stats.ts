import { SaleType } from './HOCs'
import { moment } from './utils'

const dateFormat = 'YYYY-MM-DD'
const sortSalesByDate = (sales: SaleType[]): SaleType[] =>
  [...sales].sort((a, b) =>
    moment(b.createdAt).diff(a.createdAt, 'milliseconds')
  )

const getSalesDateDiffInDays = (sales: SaleType[]): number => {
  if (!sales.length) {
    return 0
  }

  const sortedSales = sortSalesByDate(sales)

  if (sortedSales.length === 1) {
    return 1
  }

  const [firstSale] = sortedSales
  const [lastSale] = sortedSales.reverse()

  return moment(firstSale.createdAt).diff(lastSale.createdAt, 'days')
}

type PerDate = {
  [key: string]: SaleType[]
}

const groupSalesPerDate = (sales: SaleType[]): PerDate => {
  let salesPerDate: PerDate = {}

  sales.forEach(sale => {
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
type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

type SalesPerDay = { [k in WeekDay]: [SaleDate, SalesPayload] }

const getPerDaySalesStats = (sales: SaleType[]): SalesPerDay => {
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
    const day = moment(dateString, dateFormat).day() as WeekDay
    const allMoney = sales.reduce((p, c) => {
      return p + c.products.reduce((p, c) => p + c.price * c.quantitySold, 0)
    }, 0)
    salesPerDay[day][0] = moment(dateString).format('ddd D [de] MMM')
    salesPerDay[day][1].money += allMoney
    salesPerDay[day][1].unitsSold += sales.length
  })

  return salesPerDay
}
type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
type SalesPerMonth = { [k in MonthNumber]: [SaleDate, SalesPayload] }

const getSalesPerMonth = (sales: SaleType[]) => {
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
    const month = moment(dateString, dateFormat).month() as MonthNumber
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
  data: number[]
}

type ProductStatistic = {
  productId: string
  name: string
  money: number
  unitsSold: number
}

const getProductStatistics = (sales: SaleType[]): ProductStatistic[] => {
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

export const getTotalNumberOfSales = (sales: SaleType[]): BarCharts => {
  // Show only sales of the last year
  const filteredSales = sales.filter(({ createdAt }) => {
    return moment(createdAt).diff(moment(), 'years') === 0
  })

  const salesDateDiff = getSalesDateDiffInDays(filteredSales)

  if (salesDateDiff <= 7) {
    const perDay = getPerDaySalesStats(filteredSales)
    const perDayValues = Object.values(perDay)

    return {
      labels: perDayValues.map(dayData => dayData[0]),
      data: perDayValues.map(dayData => dayData[1].unitsSold),
    }
  }

  const perMonth = getSalesPerMonth(filteredSales)
  const perMonthValues = Object.values(perMonth)

  return {
    labels: perMonthValues.map(monthData => monthData[0]),
    data: perMonthValues.map(monthData => monthData[1].unitsSold),
  }
}

export const getTheSixBestSellingProducts = (sales: SaleType[]) => {
  const productStatistics = getProductStatistics(sales)
  let bestSelling = productStatistics.sort((a, b) => b.unitsSold - a.unitsSold)

  return bestSelling.slice(0, 6)
}

export const getIncomes = (sales: SaleType[]): BarCharts => {
  // Show only sales of the last year
  const filteredSales = sales.filter(({ createdAt }) => {
    return moment(createdAt).diff(moment(), 'years') === 0
  })

  const salesDateDiff = getSalesDateDiffInDays(filteredSales)

  if (salesDateDiff <= 7) {
    const perDay = getPerDaySalesStats(filteredSales)
    const perDayValues = Object.values(perDay)

    return {
      labels: perDayValues.map(dayData => dayData[0]),
      data: perDayValues.map(dayData => dayData[1].money),
    }
  }

  const perMonth = getSalesPerMonth(filteredSales)
  const perMonthValues = Object.values(perMonth)

  return {
    labels: perMonthValues.map(monthData => monthData[0]),
    data: perMonthValues.map(monthData => monthData[1].money),
  }
}
