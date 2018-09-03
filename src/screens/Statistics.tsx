import React, { Component } from 'react'
import { Content, ListItem, Text } from 'native-base'
import { SalesQueryProp, createWithSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationInjectedProps, withNavigation } from 'react-navigation'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import { getTheSixBestSellingProducts, getTotalNumberOfSales } from '../stats'
import { BarChart } from 'react-native-chart-kit'
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native'
import { ActionSheet } from 'antd-mobile-rn'
import { TimeLapse } from '../types'

type StatisticsProps = NavigationInjectedProps &
  SalesQueryProp &
  IsOnlineInjectProps

type StatisticsState = {
  showLast: TimeLapse
}

class Statistics extends Component<StatisticsProps, StatisticsState> {
  // Use subscription to update the sales instead of re-rendering on focus
  state = {
    showLast: TimeLapse.lastWeek,
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () =>
      this.props.feedSales.refetch()
    )
    Dimensions.addEventListener('change', () => {
      this.forceUpdate()
    })
  }

  showActionSheet = () => {
    const options = [TimeLapse.lastWeek, TimeLapse.lastYear, 'Cancelar']
    const destructiveButtonIndex = options.indexOf('Cancelar')

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
      },
      indexSelected => {
        if (indexSelected < 0) {
          return
        }
        if (indexSelected === destructiveButtonIndex) {
          return
        }
        this.setState({ showLast: options[indexSelected] as TimeLapse })
      }
    )
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
        {this._renderDatePick()}
        {this._renderBestSellingProducts()}
        {this._renderNumberOfSalesStats()}
      </Content>
    )
  }

  _renderDatePick = () => {
    const { showLast } = this.state
    return (
      <TouchableWithoutFeedback onPress={() => this.showActionSheet()}>
        <Text note style={{ padding: 15 }}>
          Mostrar: {showLast}
        </Text>
      </TouchableWithoutFeedback>
    )
  }

  _renderBestSellingProducts = () => {
    const { showLast } = this.state
    const {
      feedSales: { sales },
    } = this.props

    if (!sales) {
      return null
    }

    const pieColor = '#553D36'
    const bestSelling = getTheSixBestSellingProducts(sales, showLast)

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
    const { showLast } = this.state
    const {
      feedSales: { sales },
    } = this.props

    if (!sales) {
      return null
    }

    const chartColorOne = '#3D373D'
    const chartColorTwo = '#4B576F'

    const { labels, data } = getTotalNumberOfSales(sales, showLast)
    const numberOfSales = { data: data.map(s => s.unitsSold), labels }
    const incomes = { data: data.map(s => s.money), labels }

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

// TODO: add lots of predefined colors instead of generating them here
// const randomColor = () =>
//   ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7)

const unity = (u: number) => (u === 0 ? '' : u === 1 ? 'unidad' : 'unidades')
