import React from 'react'
import { View } from 'react-native'
import { Content, List, ListItem, Text, Body } from 'native-base'
import { NavigationScreenProps } from 'react-navigation'
import { NotificationData } from '../types'

type NotificationCenterProps = NavigationScreenProps<NotificationData>

// TODO: on pressing the partial product item it should navigate to AddProduct
export class NotificationCenter extends React.Component<
  NotificationCenterProps
> {
  render() {
    const { navigation } = this.props
    const products = navigation.getParam('products')

    if (!products) {
      return null
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
            {products.map(({ id, name, quantity }) => (
              <ListItem key={id}>
                <Body>
                  <Text>{name}</Text>
                  <Text note>
                    {quantity}{' '}
                    {quantity === 1
                      ? 'unidad disponible'
                      : 'unidades disponibles'}
                  </Text>
                </Body>
              </ListItem>
            ))}
          </List>
        </Content>
      </View>
    )
  }
}
