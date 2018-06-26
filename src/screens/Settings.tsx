import React, { Component } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Content, List, ListItem, Text, Body, Right, Icon } from 'native-base'
import { withNavigation, NavigationScreenProps } from 'react-navigation'
import { compose } from 'react-apollo'
import {
  withUpdateUser,
  UpdateUserMutationProps,
  withRemoveDeviceToken,
  RemoveDeviceTokenMutationProps,
} from '../HOCs'
// import { Prompt } from '../components/Prompt'
import { withCurrentUser, WithCurrentUserProps } from '../Providers/CurrentUser'
import { withAuth, WithAuthProps } from '../Providers/Auth'
import { Notifications } from 'expo'
import { withIsOnline, WithIsOnlineProps } from '../Providers/IsOnline'
import { alert } from '../components/alert'

type SettingsProps = WithCurrentUserProps &
  NavigationScreenProps<{}> &
  WithAuthProps &
  UpdateUserMutationProps &
  WithIsOnlineProps &
  RemoveDeviceTokenMutationProps

type SettingsState = {
  promptVisible: boolean
}

const defaultFireWhen = 0

class Settings extends Component<SettingsProps, SettingsState> {
  state = {
    promptVisible: false,
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Content style={{ backgroundColor: '#f4f4f4' }}>
          <List style={styles.bgWhite}>
            {this._renderNotification()}
            {this._renderCurrentUser()}
            {this._renderSignOut()}
            {this._renderPrompt()}
          </List>
        </Content>
      </View>
    )
  }

  _renderNotification = () => {
    if (!this.props.currentUser) {
      return
    }
    const {
      currentUser: { notifications },
    } = this.props
    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={styles.marginTop}>Notificaciones</Text>
        </ListItem>
        <ListItem onPress={() => this.setState({ promptVisible: true })}>
          <Body>
            <Text>Avisar cuando un producto tenga menos de: </Text>
          </Body>
          <Right>
            <Text note>
              {String(notifications ? notifications.fireWhen : defaultFireWhen)}
            </Text>
          </Right>
        </ListItem>
      </React.Fragment>
    )
  }

  _renderCurrentUser = () => {
    const { navigation, currentUser } = this.props

    if (currentUser && !currentUser.isAdmin) {
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

  _renderPrompt = () => {
    if (!this.props.currentUser) {
      return
    }

    const {
      currentUser: { notifications },
    } = this.props
    const { promptVisible } = this.state

    return null
    // <Prompt
    //   visible={promptVisible}
    //   value={notifications ? notifications.fireWhen : defaultFireWhen}
    //   submitText="Actualizar"
    //   close={() => this.setState({ promptVisible: false })}
    //   onSubmit={value => this._onPromptSubmit(value)}
    // />
  }

  _onPromptSubmit = (quantity: string) => {
    // const { updateUser, currentUser } = this.props
    // const fireWhen = Number(quantity) || 0
    // updateUser({
    //   variables: {
    //     userId: currentUser.id,
    //     notifications: {
    //       fireWhen,
    //     },
    //   },
    //   optimisticResponse: {
    //     updateUser: {
    //       ...currentUser,
    //       notifications: {
    //         __typename: 'Notifications',
    //         devices: currentUser.notifications.devices,
    //         fireWhen,
    //       },
    //     },
    //   },
    //   update(proxy) {
    //     const { notifications } = currentUser
    //     currentUser.notifications = {
    //       __typename: 'Notifications',
    //       fireWhen,
    //       devices: notifications ? notifications.devices : [],
    //     }
    //   },
    // })
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

    if (!token) {
      return
    }

    await removeDeviceToken({
      variables: {
        token,
      },
    })

    signOut()
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
