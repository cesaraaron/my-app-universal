import React, { Component } from 'react'
import { Content, List, ListItem, Text } from 'native-base'
import { SalesQueryProp, createWithSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import { getBestsellingProduct, getSaleStatistics } from '../utils'
import { WithIsOnlineProps, withIsOnline } from '../Providers/IsOnline'
import {
  getTheTenBestSellingProducts,
  getTotalNumberOfSales,
  getIncomes,
} from '../stats'
import { BarChart, PieChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'

type StatisticsProps = NavigationScreenProps &
  SalesQueryProp &
  WithIsOnlineProps

class Statistics extends Component<StatisticsProps> {
  // Use subscription to update the sales instead of re-rendering on focus
  componentDidMount() {
    this.props.navigation.addListener('willFocus', () =>
      this.props.feedSales.refetch()
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
        <List style={{ backgroundColor: 'white' }}>
          {this._renderBestSellingProducts()}
          {this._renderNumberOfSalesStats()}
        </List>
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

    const bestSelling = getTheTenBestSellingProducts(sales)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={marginTop}>Productos mas vendidos</Text>
        </ListItem>
        <PieChart
          data={bestSelling.map(p => ({ name: p.name, unidades: p.unitsSold }))}
          width={Dimensions.get('window').width}
          height={220}
          chartConfig={{
            // backgroundColor: randomColor(),
            backgroundGradientFrom: 'rgba(54, 162, 235, 1)',
            backgroundGradientTo: 'rgba(54, 162, 235, 1)',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="unidades"
        />
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

    const numberOfSales = getTotalNumberOfSales(sales)
    const incomes = getIncomes(sales)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={marginTop}>Ventas</Text>
        </ListItem>
        <ListItem>
          <BarChart
            width={Dimensions.get('window').width} // from react-native
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
              // backgroundColor: '#e26a00',
              backgroundGradientFrom: 'rgba(54, 162, 235, 1)',
              backgroundGradientTo: 'rgba(54, 162, 235, 1)',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              // style: {
              //   borderRadius: 16
              // }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </ListItem>
        <ListItem>
          <BarChart
            data={{
              labels: incomes.labels,
              datasets: [
                {
                  data: incomes.data,
                },
              ],
            }}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
          />
        </ListItem>
      </React.Fragment>
    )
  }

  _renderStatistics = () => {
    const {
      feedSales: { sales },
    } = this.props
    if (!sales) {
      return null
    }

    const bestSelling = getBestsellingProduct(sales)
    const { totalMoney, totalUnits } = getSaleStatistics(sales)

    return (
      <React.Fragment>
        {bestSelling.length ? (
          <ListItem itemDivider>
            <Text style={marginTop}>Producto mas vendido</Text>
          </ListItem>
        ) : null}
        {bestSelling.map(({ name, unitsSold }, idx) => {
          return (
            <ListItem key={idx}>
              <Text>{name}</Text>
              <Text note style={listItemNote}>{`${unitsSold} ${
                unitsSold === 1 ? 'unidad' : 'unidades'
              } vendidas`}</Text>
            </ListItem>
          )
        })}
        <ListItem itemDivider>
          <Text style={marginTop}>Unidades vendidas</Text>
        </ListItem>
        <ListItem>
          <Text>{totalUnits}</Text>
          <Text note style={listItemNote}>{`${
            Number(totalUnits) === 1 ? 'unidad vendida' : 'unidades vendidas'
          }`}</Text>
        </ListItem>
        <ListItem itemDivider>
          <Text style={marginTop}>Dinero total</Text>
        </ListItem>
        <ListItem>
          <Text>Lps. {totalMoney}</Text>
        </ListItem>
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

const listItemNote = {
  paddingLeft: 5,
}

const marginTop = {
  marginTop: 10,
}

const randomColor = () =>
  ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7)
