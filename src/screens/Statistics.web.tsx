import React, { Component } from 'react'
import { Content, List, ListItem, Text } from 'native-base'
import { SalesQueryProp, createWithSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import { WithIsOnlineProps, withIsOnline } from '../Providers/IsOnline'
import { Bar, Doughnut, defaults } from 'react-chartjs-2'
import {
  getTotalNumberOfSales,
  getTheTenBestSellingProducts,
  getIncomes,
} from '../stats'

// @ts-ignore
defaults.global.legend.position = 'bottom'

type StatisticsProps = NavigationScreenProps &
  SalesQueryProp &
  WithIsOnlineProps

class Statistics extends Component<StatisticsProps> {
  componentDidMount() {
    this.props.navigation.addListener('willFocus', () =>
      this.props.feedSales.refetch()
    )
  }

  render() {
    const {
      feedSales: { refetch, loading, error, sales },
      isOnline,
    } = this.props

    if (loading && isOnline) {
      return <Loading />
    }
    if (error) {
      return <FetchError error={error} refetch={refetch} />
    }

    if (!sales) {
      return null
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
          <Bar
            options={{
              title: {
                display: true,
                text:
                  'Ventas totales: ' +
                  numberOfSales.data.reduce((a, b) => a + b),
                position: 'left',
              },
            }}
            data={{
              labels: numberOfSales.labels,
              datasets: [
                {
                  label: 'Numero de ventas',
                  data: numberOfSales.data,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(88, 159, 64, 0.2)',
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(88, 159, 64, 1)',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </ListItem>
        <ListItem>
          <Bar
            options={{
              title: {
                display: true,
                text:
                  'Dinero total: ' +
                  incomes.data.reduce((a, b) => a + b).toLocaleString(),
                position: 'left',
              },
            }}
            data={{
              labels: incomes.labels,
              datasets: [
                {
                  label: 'Dinero en ventas',
                  data: incomes.data,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(88, 159, 64, 0.2)',
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(88, 159, 64, 1)',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </ListItem>
      </React.Fragment>
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
        <Doughnut
          data={{
            labels: bestSelling.map(p => p.name),
            datasets: [
              {
                label: '# de ventas',
                data: bestSelling.map(p => p.unitsSold),
                backgroundColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(88, 159, 64, 1)',
                ],
              },
            ],
          }}
        />
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
