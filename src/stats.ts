import { SaleType } from './HOCs'
import { moment } from './utils'

const sortSalesByDate = (sales: SaleType[]): SaleType[] => {
  const newSales = [...sales]
  return newSales.sort(
    (a, b) => moment(a.createdAt).seconds() - moment(b.createdAt).seconds()
  )
}

const getSalesDateDiffInDays = (sales: SaleType[]): number => {
  const sortedSales = sortSalesByDate(sales)

  if (sortedSales.length === 0) {
    return 0
  }

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
    const saleDate = moment(sale.createdAt).format('YYYY/MM/DD')
    const currentSalesPerDate = salesPerDate[saleDate] || []
    salesPerDate[saleDate] = [...currentSalesPerDate, sale]
  })

  return salesPerDate
}

const getSalesPerDay = (sales: SaleType[]) => {
  const perDate = groupSalesPerDate(sales)

  type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

  const salesPerDay: { [k in WeekDay]: [string, number] } = {
    0: ['Domingo', 0],
    1: ['Lunes', 0],
    2: ['Martes', 0],
    3: ['Miercoles', 0],
    4: ['Jueves', 0],
    5: ['Viernes', 0],
    6: ['Sabado', 0],
  }

  Object.entries(perDate).forEach(([dateString, sales]) => {
    const day = moment(dateString).day() as WeekDay
    salesPerDay[day][0] = moment(dateString).format('ddd D [de] MMM')
    salesPerDay[day][1] = sales.length
  })

  return salesPerDay
}

const getSalesPerMonth = (sales: SaleType[]) => {
  const perDate = groupSalesPerDate(sales)

  type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

  const salesPerMonth: { [k in MonthNumber]: [string, number] } = {
    0: ['Enero', 0],
    1: ['Febrero', 0],
    2: ['Marzo', 0],
    3: ['Abril', 0],
    4: ['Mayo', 0],
    5: ['Junio', 0],
    6: ['Julio', 0],
    7: ['Agosto', 0],
    8: ['Septiembre', 0],
    9: ['Octubre', 0],
    10: ['Noviembre', 0],
    11: ['Diciembre', 0],
  }

  Object.entries(perDate).forEach(([dateString, sales]) => {
    const month = moment(dateString).month() as MonthNumber
    salesPerMonth[month][1] = sales.length
  })

  return salesPerMonth
}

type BarCharts = {
  labels: string[]
  data: number[]
}

export const getTotalNumberOfSales = (sales: SaleType[]): BarCharts => {
  // Show only sales of the last year
  const filteredSales = sales.filter(({ createdAt }) => {
    return moment(createdAt).diff(moment(), 'years') === 0
  })

  const salesDateDiff = getSalesDateDiffInDays(filteredSales)

  if (salesDateDiff === 0) {
    return {
      labels: [],
      data: [],
    }
  }

  if (salesDateDiff <= 7) {
    const perDay = getSalesPerDay(filteredSales)
    const perDayValues = Object.values(perDay)

    return {
      labels: perDayValues.map(dayData => dayData[0]),
      data: perDayValues.map(dayData => dayData[1]),
    }
  }

  const perMonth = getSalesPerMonth(filteredSales)
  const perMonthValues = Object.values(perMonth)

  return {
    labels: perMonthValues.map(monthData => monthData[0]),
    data: perMonthValues.map(monthData => monthData[1]),
  }
}
