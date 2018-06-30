import React, { Component } from 'react'
import { Content, List, ListItem, Text } from 'native-base'
import { SalesQueryProp, withSales } from '../HOCs'
import { compose } from 'react-apollo'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import { getBestsellingProduct, getSaleStatistics } from '../utils'
import { WithIsOnlineProps, withIsOnline } from '../Providers/IsOnline'

type StatisticsProps = NavigationScreenProps &
  SalesQueryProp &
  WithIsOnlineProps

// TODO: See if it updates after a sale is made
class Statistics extends Component<StatisticsProps> {
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
          {this._renderStatistics()}
        </List>
      </Content>
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
  withSales,
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
