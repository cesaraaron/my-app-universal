import React, { Component } from 'react'
import { Content, List, ListItem, Text } from 'native-base'
import { SalesQueryProp, createWithSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationInjectedProps, withNavigation } from 'react-navigation'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import { Bar, Doughnut, defaults } from 'react-chartjs-2'
import { getTotalNumberOfSales, getTheSixBestSellingProducts } from '../stats'
import { TimeLapse } from '../types'
import { ActionSheet } from 'antd-mobile-rn'

// @ts-ignore
defaults.global.legend.position = 'bottom'

type StatisticsProps = NavigationInjectedProps &
  SalesQueryProp &
  IsOnlineInjectProps

type StatisticsState = {
  showLast: TimeLapse
}

class Statistics extends Component<StatisticsProps, StatisticsState> {
  state = {
    showLast: TimeLapse.lastWeek,
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
          {this._renderDatePick()}
          {this._renderBestSellingProducts()}
          {this._renderNumberOfSalesStats()}
        </List>
      </Content>
    )
  }

  _renderDatePick = () => {
    const { showLast } = this.state
    return (
      <ListItem itemDivider onPress={() => this.showActionSheet()}>
        <Text note>Mostrar: {showLast}</Text>
      </ListItem>
    )
  }

  _renderNumberOfSalesStats = () => {
    const {
      feedSales: { sales },
    } = this.props
    const { showLast } = this.state

    if (!sales) {
      return null
    }

    const { labels, data } = getTotalNumberOfSales(sales, showLast)
    const numberOfSales = { data: data.map(s => s.unitsSold), labels }
    const incomes = { data: data.map(s => s.money), labels }

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
    const { showLast } = this.state

    if (!sales) {
      return null
    }

    const bestSelling = getTheSixBestSellingProducts(sales, showLast)

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
