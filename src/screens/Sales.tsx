import React, { Component } from 'react'
import { Platform, RefreshControl } from 'react-native'
import { List, ListItem, Body, Text, Button, Icon, View } from 'native-base'
import { SaleType, SalesQueryProp, withSales } from '../HOCs'
import {
  NavigationScreenProps,
  NavigationInjectedProps,
  withNavigation,
} from 'react-navigation'
import { compose } from 'react-apollo'
import { FetchError } from '../components/FetchError'
import { moment, getSaleStatistics, isWeb } from '../utils'
import sortBy from 'lodash/sortBy'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import { SALE_SUBSCRIPTION } from '../queries'
import {
  SaleSubscription,
  MutationType,
  getSalesQuery,
} from '../__generated__/types'
import { Notifications } from 'expo'
import { EventSubscription } from 'fbemitter'
import { NotificationData } from '../types'

type SalesProps = NavigationInjectedProps & SalesQueryProp & IsOnlineInjectProps

class Sales extends Component<SalesProps> {
  listen?: EventSubscription

  componentDidMount() {
    if (!isWeb) {
      this.listen = Notifications.addListener(this.listenToNotifications)
    }
    this._subscribeToMore()
  }

  componentWillUnmount() {
    this.listen && this.listen.remove()
  }

  listenToNotifications = (payload: Notifications.Notification) => {
    const { navigation } = this.props
    const { data, origin } = payload
    const { fireWhenProductIds } = data as NotificationData

    if (origin === 'received') {
      return
    }

    if (!fireWhenProductIds) {
      return
    }

    navigation.navigate('NotificationCenter', { fireWhenProductIds })
  }

  render() {
    const {
      feedSales: { error, loading, sales, refetch },
      navigation,
      isOnline,
    } = this.props

    if (error) {
      return <FetchError error={error} refetch={refetch} />
    }

    const sortedSales: SaleType[] = sortBy(sales, 'createdAt').reverse()

    return (
      <View style={{ flex: 1 }}>
        <List
          refreshControl={
            <RefreshControl
              refreshing={loading && isOnline}
              onRefresh={refetch}
            />
          }
          dataArray={sortedSales}
          renderRow={(sale: SaleType) => {
            const { soldBy } = sale
            const { totalMoney, totalUnits } = getSaleStatistics([sale])

            return (
              <ListItem
                button
                key={sale.id}
                onPress={() =>
                  navigation.navigate('AddSale', {
                    sale,
                  })
                }
              >
                <Body>
                  <Text>
                    Vendido por {soldBy.name || 'anonimo'},{' '}
                    {moment(sale.createdAt).calendar()}
                  </Text>
                  <Text note>{`${totalUnits} ${
                    totalUnits === 1 ? 'producto vendido' : 'productos vendidos'
                  }, Lps. ${totalMoney}`}</Text>
                </Body>
              </ListItem>
            )
          }}
        />
      </View>
    )
  }

  _subscribeToMore = () => {
    const {
      feedSales: { subscribeToMore },
    } = this.props

    subscribeToMore({
      document: SALE_SUBSCRIPTION,
      updateQuery: (
        prev: getSalesQuery,
        {
          subscriptionData: { data },
        }: { subscriptionData: { data: SaleSubscription } }
      ): getSalesQuery => {
        if (!data.sale) {
          return prev
        }

        const { node, mutation, previousValues } = data.sale

        if (mutation === MutationType.DELETED) {
          if (!previousValues) {
            return prev
          }
          const deletedSaleId = previousValues.id

          return {
            ...prev,
            sales: prev.sales.filter(s => !deletedSaleId.includes(s.id)),
          }
        }

        if (mutation === MutationType.CREATED) {
          if (!node) {
            return prev
          }
          return {
            sales: prev.sales.some(s => s.id === node.id)
              ? prev.sales
              : [node, ...prev.sales],
          }
        }

        return prev
      },
    })
  }
}

const EnhancedSales = compose(
  withNavigation,
  withSales,
  withIsOnline
)(Sales)

EnhancedSales.navigationOptions = ({ navigation }: NavigationScreenProps) => {
  return {
    headerTitle: 'Ventas',
    headerRight: (
      <Button transparent onPress={() => navigation.navigate('AddSale')}>
        <Icon
          name="plus"
          type="Entypo"
          style={Platform.OS === 'android' ? { color: 'white' } : null}
        />
      </Button>
    ),
  }
}

export default EnhancedSales
