import React from 'react'
import { View } from 'react-native'
import { Content, List, ListItem, Text, Body, Right, Icon } from 'native-base'
import { withNavigation } from 'react-navigation'
import { withProductsWithIds } from '../HOCs'
import { FetchError } from '../components/FetchError'
import { withIsOnline } from '../Providers/IsOnline'
import Loading from '../components/Loading'

export default withIsOnline(
  withNavigation(
    withProductsWithIds(props => {
      const {
        isOnline,
        navigation,
        data: { error, loading, refetch, productsWithIds = [] },
      } = props

      if (isOnline && loading) {
        return <Loading />
      }
      if (error) {
        return <FetchError refetch={refetch} error={error} />
      }

      return (
        <View style={{ flex: 1 }}>
          <Content style={{ backgroundColor: '#f4f4f4' }}>
            <List style={{ backgroundColor: 'white' }}>
              <ListItem itemDivider>
                <Text note style={{ marginTop: 20 }}>
                  Los siguientes productos se estan acabando:
                </Text>
              </ListItem>
              {productsWithIds.map(p => (
                <ListItem
                  key={p.id}
                  button
                  onPress={() =>
                    navigation.navigate('AddProduct', { product: p })
                  }
                >
                  <Body>
                    <Text>{p.name}</Text>
                    <Text note>
                      {p.quantity}{' '}
                      {p.quantity === 1
                        ? 'unidad disponible'
                        : 'unidades disponibles'}
                    </Text>
                  </Body>
                  <Right>
                    <Icon name="ios-arrow-forward" type="Ionicons" />
                  </Right>
                </ListItem>
              ))}
            </List>
          </Content>
        </View>
      )
    })
  )
)
