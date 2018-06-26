import { ProductType, SaleType } from './HOCs'
import moment from 'moment'
import 'moment/locale/es'

moment.updateLocale('es', {
  calendar: {
    sameElse: 'lll',
  },
})

export { moment }

export const MUTATION_ERROR = 'Al parecer algo salio mal :(. Prueba mas tarde'

export const searchProductWithQuery = (
  products: ProductType[],
  query: string
): ProductType[] => {
  return products.filter(({ name }) => {
    const reg = new RegExp(query, 'i')

    return reg.test(name)
  })
}

type ProductStatistic = {
  productId: string
  name: string
  money: number
  unitsSold: number
}

export const getProductStatistics = (sales: SaleType[]): ProductStatistic[] => {
  let products: ProductStatistic[] = []

  sales.forEach(sale => {
    if (!sale.products) {
      return
    }

    sale.products.forEach(product => {
      const [currentProduct] = products.filter(
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

export const getBestsellingProduct = (
  sales: SaleType[]
): ProductStatistic[] => {
  const productStatistics = getProductStatistics(sales)
  let bestSelling: ProductStatistic[] = []

  productStatistics.forEach(product => {
    const [currentBest] = bestSelling

    if (!currentBest) {
      bestSelling.push(product)
    } else if (product.unitsSold >= currentBest.unitsSold) {
      bestSelling = [product]
    } else if (product.unitsSold === currentBest.unitsSold) {
      bestSelling.push(product)
    }
  })

  return bestSelling
}

type SaleStatistic = {
  totalMoney: number
  totalUnits: number
}

export const getSaleStatistics = (sales: SaleType[]): SaleStatistic => {
  const productStatistics = getProductStatistics(sales)

  let totalMoney = 0
  let totalUnits = 0

  productStatistics.forEach(product => {
    totalMoney += product.money
    totalUnits += product.unitsSold
  })

  return {
    totalMoney,
    totalUnits,
  }
}

export const ID = function() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  )
}
