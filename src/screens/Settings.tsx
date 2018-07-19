import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { Content, List, ListItem, Text, Body, Right, Icon } from 'native-base'
import { withNavigation, NavigationScreenProps } from 'react-navigation'
import { compose } from 'react-apollo'
import {
  withUpdateUser,
  UpdateUserMutationProps,
  withRemoveDeviceToken,
  RemoveDeviceTokenMutationProps,
} from '../HOCs'
import { withCurrentUser, WithCurrentUserProps } from '../Providers/CurrentUser'
import { withAuth, WithAuthProps } from '../Providers/Auth'
import { Notifications } from 'expo'
import { withIsOnline, WithIsOnlineProps } from '../Providers/IsOnline'
import { alert } from '../components/alert'
import { Modal } from 'antd-mobile-rn'
import { UpdateUserMutation, MeQuery } from '../__generated__/types'
import { ME_QUERY } from '../queries'

const { prompt } = Modal

type SettingsProps = WithCurrentUserProps &
  NavigationScreenProps<{}> &
  WithAuthProps &
  UpdateUserMutationProps &
  WithIsOnlineProps &
  RemoveDeviceTokenMutationProps

const defaultFireWhen = 0

class Settings extends Component<SettingsProps> {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Content style={{ backgroundColor: '#f4f4f4' }}>
          <List style={styles.bgWhite}>
            {this._renderNotification()}
            {this._renderCurrentUser()}
            {this._renderSignOut()}
          </List>
        </Content>
      </View>
    )
  }

  _renderNotification = () => {
    const {
      currentUser: { notifications },
    } = this.props
    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={styles.marginTop}>Notificaciones</Text>
        </ListItem>
        <ListItem
          onPress={() =>
            prompt(
              'Notificaciones',
              '',
              [
                { text: 'Cancelar' },
                { text: 'Aceptar', onPress: this._onPromptSubmit },
              ],
              null,
              String(notifications.fireWhen)
            )
          }
        >
          <Body>
            <Text>Avisar cuando un producto tenga menos de: </Text>
          </Body>
          <Right>
            <Text note>
              {String(notifications ? notifications.fireWhen : defaultFireWhen)}
            </Text>
          </Right>
        </ListItem>
        <ListItem itemDivider>
          <Text note style={{ fontStyle: 'italic' }}>
            Si no quieres recibir notificaciones deja el valor en cero.
          </Text>
        </ListItem>
      </React.Fragment>
    )
  }

  _renderCurrentUser = () => {
    const { navigation, currentUser } = this.props

    if (!currentUser.isAdmin) {
      return null
    }

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={styles.marginTop}>Control de acceso</Text>
        </ListItem>
        <ListItem button onPress={() => navigation.navigate('Users')}>
          <Body>
            <Text>Usuarios</Text>
          </Body>
          <Right>
            <Icon type="Ionicons" name="ios-arrow-forward" />
          </Right>
        </ListItem>
        <ListItem itemDivider>
          <Text note style={{ fontStyle: 'italic' }}>
            Agrega o elimina usuarios que utilizan tu sistema.
          </Text>
        </ListItem>
      </React.Fragment>
    )
  }

  _renderSignOut = () => {
    return (
      <React.Fragment>
        <ListItem itemDivider itemHeader />
        <ListItem
          button
          style={{ justifyContent: 'center' }}
          onPress={this._signOut}
        >
          <Text style={{ color: 'red', marginTop: 10 }}>Salir</Text>
        </ListItem>
      </React.Fragment>
    )
  }

  _onPromptSubmit = (quantity: string) => {
    const { updateUser, currentUser } = this.props

    const fireWhen = Number(quantity) || 0

    updateUser({
      variables: {
        userId: currentUser.id,
        notifications: {
          fireWhen,
        },
      },
      optimisticResponse: {
        updateUser: {
          __typename: 'User',
          ...currentUser,
          notifications: {
            __typename: 'Notifications',
            devices: currentUser.notifications.devices,
            fireWhen,
          },
        },
      },
      update(proxy, result) {
        if (!result.data) {
          return
        }
        const { updateUser } = result.data as UpdateUserMutation

        if (!updateUser) {
          return
        }

        let data = proxy.readQuery({
          query: ME_QUERY,
        }) as MeQuery

        data.me = updateUser

        proxy.writeQuery({ query: ME_QUERY, data })
      },
    })
  }

  _signOut = async () => {
    const { removeDeviceToken, signOut, isOnline } = this.props

    if (!isOnline) {
      alert(
        'Error',
        'Solo puedes cerrar sesion cuando hay conneción a internet.'
      )
      return
    }
    const token = await Notifications.getExpoPushTokenAsync()

    if (token) {
      removeDeviceToken({
        variables: {
          token,
        },
      }).then(() => {
        signOut()
      })
    } else {
      signOut()
    }
  }
}

const EnhancedSettings = compose(
  withNavigation,
  withCurrentUser,
  withUpdateUser,
  withAuth,
  withIsOnline,
  withRemoveDeviceToken
)(Settings)

EnhancedSettings.navigationOptions = {
  headerTitle: 'Opciones',
}

export default EnhancedSettings

const styles = StyleSheet.create({
  marginTop: {
    marginTop: 20,
  },
  bgWhite: {
    backgroundColor: 'white',
  },
})
