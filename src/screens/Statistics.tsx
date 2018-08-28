import React, { Component } from 'react'
import { Content, ListItem, Text } from 'native-base'
import { SalesQueryProp, createWithSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import {
  getTheSixBestSellingProducts,
  getTotalNumberOfSales,
  getIncomes,
} from '../stats'
import { BarChart } from 'react-native-chart-kit'
import { Dimensions, View, StyleSheet } from 'react-native'

type StatisticsProps = NavigationScreenProps &
  SalesQueryProp &
  IsOnlineInjectProps

class Statistics extends Component<StatisticsProps> {
  // Use subscription to update the sales instead of re-rendering on focus
  componentDidMount() {
    this.props.navigation.addListener('willFocus', () =>
      this.props.feedSales.refetch()
    )
    Dimensions.addEventListener('change', () => {
      this.forceUpdate()
    })
  }

  render() {
    const {
      feedSales: { refetch, loading, error },
      isOnline,
    } = this.props

    if (loading && isOnline) {
      return <Loading />
    }
    if (error) {
      return <FetchError error={error} refetch={refetch} />
    }

    return (
      <Content style={{ backgroundColor: '#f4f4f4' }}>
        {this._renderBestSellingProducts()}
        {this._renderNumberOfSalesStats()}
      </Content>
    )
  }

  _renderBestSellingProducts = () => {
    const {
      feedSales: { sales },
    } = this.props

    if (!sales) {
      return null
    }

    const pieColor = randomColor()
    const bestSelling = getTheSixBestSellingProducts(sales)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={marginTop}>Productos mas vendidos</Text>
        </ListItem>

        <BarChart
          width={Dimensions.get('window').width}
          height={220}
          data={{
            labels: bestSelling.map(p => p.name),
            datasets: [
              {
                data: bestSelling.map(p => p.unitsSold),
              },
            ],
          }}
          chartConfig={{
            backgroundGradientFrom: pieColor,
            backgroundGradientTo: pieColor,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
        <View style={styles.statsTextContainer}>
          <Text note style={styles.textStats}>
            {bestSelling.map(
              p => ` - ${p.name}: ${p.unitsSold} ${unity(p.unitsSold)}`
            )}
          </Text>
        </View>
      </React.Fragment>
    )
  }

  _renderNumberOfSalesStats = () => {
    const {
      feedSales: { sales },
    } = this.props

    if (!sales) {
      return null
    }

    const chartColorOne = randomColor()
    const chartColorTwo = randomColor()

    const numberOfSales = getTotalNumberOfSales(sales)
    const incomes = getIncomes(sales)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={marginTop}>Ventas</Text>
        </ListItem>
        <BarChart
          width={Dimensions.get('window').width}
          height={220}
          data={{
            labels: numberOfSales.labels,
            datasets: [
              {
                data: numberOfSales.data,
              },
            ],
          }}
          chartConfig={{
            backgroundGradientFrom: chartColorOne,
            backgroundGradientTo: chartColorOne,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
        <View style={styles.statsTextContainer}>
          <Text note style={styles.textStats}>
            {numberOfSales.data
              .map(
                (n, index) =>
                  ` — ${numberOfSales.labels[index]}: ${n} ${
                    n === 1 ? 'venta' : 'ventas'
                  }`
              )
              .filter((_, idx) => numberOfSales.data[idx] !== 0)}
          </Text>
        </View>
        <BarChart
          width={Dimensions.get('window').width}
          height={220}
          data={{
            labels: incomes.labels,
            datasets: [
              {
                data: incomes.data,
              },
            ],
          }}
          chartConfig={{
            backgroundGradientFrom: chartColorTwo,
            backgroundGradientTo: chartColorTwo,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
        <Text note style={styles.textStats}>
          {incomes.data
            .map(
              (money, index) =>
                ` — ${incomes.labels[index]}: Lps. ${money.toLocaleString(
                  'es-HN',
                  { minimumFractionDigits: 2 }
                )}`
            )
            .filter((_, idx) => incomes.data[idx] !== 0)}
        </Text>
      </React.Fragment>
    )
  }
}

const EnhancedStatistics = compose(
  createWithSales({}),
  withNavigation,
  withIsOnline
)(Statistics)

EnhancedStatistics.navigationOptions = {
  headerTitle: 'Estadisticas',
}

export default EnhancedStatistics

// const formatter = Intl.NumberFormat('es-HN', { minimumFractionDigits: 2 })

const marginTop = {
  marginTop: 10,
}

const styles = StyleSheet.create({
  statsTextContainer: { justifyContent: 'center', marginBottom: 15 },
  textStats: { padding: 10 },
})

const randomColor = () =>
  ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7)

const unity = (u: number) => (u === 0 ? '' : u === 1 ? 'unidad' : 'unidades')
