import React, { Component } from 'react'
import { Platform, RefreshControl } from 'react-native'
import { List, ListItem, Body, Text, Button, Icon, View } from 'native-base'
import { SaleType, SalesQueryProp, withSales } from '../HOCs'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import { compose } from 'react-apollo'
import { FetchError } from '../components/FetchError'
import { moment, getSaleStatistics } from '../utils'
import sortBy from 'lodash/sortBy'
import { WithIsOnlineProps, withIsOnline } from '../Providers/IsOnline'
import { SALE_SUBSCRIPTION } from '../queries'
import {
  getSalesQuery,
  SaleSubscription,
  MutationType,
} from '../__generated__/types'

type SalesProps = NavigationScreenProps & SalesQueryProp & WithIsOnlineProps

class Sales extends Component<SalesProps> {
  componentDidMount() {
    this._subscribeTorMore()
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
                  {/* <Text note style={{ paddingLeft: 5 }}>{`${totalProducts} ${
                      totalProducts === 1
                        ? 'producto vendido'
                        : 'productos vendidos'
                    }`}</Text> */}
                </Body>
              </ListItem>
            )
          }}
        />
      </View>
    )
  }

  _subscribeTorMore = () => {
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

        const { node, mutation } = data.sale

        // If there is no node sent it is probably a deleted mutation
        // primsa does not send currently a node when deleting an entry.
        if (!node) {
          return prev
        }

        switch (mutation) {
          case MutationType.CREATED:
            return {
              ...prev,
              sales: [node, ...prev.sales],
            }
          // this does not work, prisma does not send a node when deleting a mutation
          case MutationType.DELETED:
            return {
              ...prev,
              sales: prev.sales.filter(sale => sale.id !== node.id),
            }
          default:
            return prev
        }
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
          style={
            Platform.OS === 'android' || Platform.OS === 'web'
              ? { color: 'white' }
              : null
          }
        />
      </Button>
    ),
  }
}

export default EnhancedSales
