import React, { Component } from 'react'
import {
  Text,
  List,
  ListItem,
  Body,
  Right,
  Icon,
  Button,
  View,
} from 'native-base'
import { TextInput, Platform, RefreshControl } from 'react-native'
import { compose } from 'react-apollo'
import {
  getProductsQuery,
  ProductSubscription,
  MutationType,
} from '../__generated__/types'
import { FetchError } from '../components/FetchError'
import {
  withNavigation,
  NavigationScreenProps,
  NavigationInjectedProps,
} from 'react-navigation'
import { ProductsQueryProps, withProducts, ProductType } from '../HOCs'
import { searchProductWithQuery } from '../utils'
import sortBy from 'lodash/sortBy'
import { PRODUCT_SUBSCRIPTION } from '../queries'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import {
  PendingMutationsInjectProps,
  withPendingMutations,
} from '../Providers/PendingMutations'

type DatabaseProps = ProductsQueryProps &
  NavigationInjectedProps &
  IsOnlineInjectProps &
  PendingMutationsInjectProps

type DatabaseState = {
  query: string
}

class Database extends Component<DatabaseProps, DatabaseState> {
  componentDidMount() {
    this._subscribeToMore()
  }

  state = {
    query: '',
  }

  render() {
    const {
      feedProducts: { loading, error, products = [] },
      navigation,
      isOnline,
    } = this.props
    const { query } = this.state

    if (error) {
      return <FetchError refetch={this._refetch} error={error} />
    }

    const sortedProducts: ProductType[] = sortBy(products, 'createdAt')
    let results = searchProductWithQuery(sortedProducts, query)

    if (!query) {
      results = products
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
        <TextInput
          value={query}
          style={{
            fontSize: 17,
            padding: 10,
            paddingVertical: 15,
            marginBottom: 10,
          }}
          autoCapitalize="none"
          placeholder="Buscar..."
          onChangeText={query => this.setState({ query })}
        />
        <List
          style={{ backgroundColor: 'white' }}
          refreshControl={
            <RefreshControl
              refreshing={loading && isOnline}
              onRefresh={this._refetch}
            />
          }
          dataArray={results}
          renderRow={(product: ProductType) => {
            return (
              <ListItem
                button
                key={product.id}
                onPress={() => navigation.navigate('AddProduct', { product })}
              >
                <Body>
                  <Text>{product.name}</Text>
                </Body>
                <Right>
                  <Icon name="ios-arrow-forward" type="Ionicons" />
                </Right>
              </ListItem>
            )
          }}
        />
      </View>
    )
  }

  _refetch = () => {
    this.props.feedProducts.refetch()
  }

  _subscribeToMore = () => {
    const {
      feedProducts: { subscribeToMore },
    } = this.props

    subscribeToMore({
      document: PRODUCT_SUBSCRIPTION,
      updateQuery: (
        prev: getProductsQuery,
        {
          subscriptionData: { data },
        }: { subscriptionData: { data: ProductSubscription } }
      ): getProductsQuery => {
        if (!data.product) {
          return prev
        }

        const { mutation, node, previousValues } = data.product

        if (mutation === MutationType.DELETED) {
          if (!previousValues) {
            return prev
          }
          const deletedProductId = previousValues.id
          return {
            ...prev,
            products: prev.products.filter(
              s => !deletedProductId.includes(s.id)
            ),
          }
        }

        if (mutation === MutationType.UPDATED) {
          if (!node) {
            return prev
          }

          return {
            ...prev,
            products: prev.products.map(p => {
              if (p.id === node.id) {
                return node
              } else {
                return p
              }
            }),
          }
        }

        if (mutation === MutationType.CREATED) {
          if (!node) {
            return prev
          }
          return {
            ...prev,
            products: prev.products.some(p => p.id === node.id)
              ? prev.products
              : [node, ...prev.products],
          }
        }

        return prev
      },
    })
  }
}

const EnhancedDatabase = compose(
  withProducts,
  withNavigation,
  withIsOnline,
  withPendingMutations
)(Database)

EnhancedDatabase.navigationOptions = ({
  navigation,
}: NavigationScreenProps) => {
  return {
    headerTitle: 'Base de datos',

    headerRight: (
      <Button transparent onPress={() => navigation.navigate('AddProduct')}>
        <Icon
          name="plus"
          type="Entypo"
          style={Platform.OS === 'android' ? { color: 'white' } : null}
        />
      </Button>
    ),
  }
}

export default EnhancedDatabase
