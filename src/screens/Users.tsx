import React, { Component } from 'react'
import {
  Content,
  Text,
  List,
  ListItem,
  Body,
  Right,
  View,
  Button,
  Icon,
} from 'native-base'
import { compose } from 'react-apollo'
import { withNavigation, NavigationInjectedProps } from 'react-navigation'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { UsersQueryProps, UserType, withUsers } from '../HOCs'
import { IsOnlineInjectProps, withIsOnline } from '../Providers/IsOnline'
import { withCurrentUser, WithCurrentUserProps } from '../Providers/CurrentUser'

type UsersProps = UsersQueryProps &
  WithCurrentUserProps &
  NavigationInjectedProps<{}> &
  IsOnlineInjectProps

class Users extends Component<UsersProps> {
  render() {
    const {
      usersFeed: { error, loading },
      isOnline,
    } = this.props

    if (loading && isOnline) {
      return <Loading />
    }

    if (error) {
      return <FetchError refetch={this._refetch} error={error} />
    }

    return (
      <Content style={{ backgroundColor: '#f4f4f4' }}>
        <List style={{ backgroundColor: 'white' }}>
          {this._renderUsersList()}
        </List>
        {this._renderFooter()}
      </Content>
    )
  }

  _renderUsersList = () => {
    const {
      usersFeed: { users = [] },
      currentUser,
    } = this.props

    const filteredUsers = users.filter(u => u.id !== currentUser.id)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text>Usando este dispositivo:</Text>
        </ListItem>
        <ListItem button onPress={() => this._editUser(currentUser)}>
          <Body>
            <Text>{currentUser.name}</Text>
            {currentUser.isAdmin ? <Text note>Administrador</Text> : null}
          </Body>
          <Right>
            <Icon name="ios-arrow-forward" type="Ionicons" />
          </Right>
        </ListItem>
        <ListItem itemDivider />
        {filteredUsers.map(user => (
          <ListItem key={user.id} button onPress={() => this._editUser(user)}>
            <Body>
              <Text>{user.name}</Text>
              {user.isAdmin ? <Text note>Administrador</Text> : null}
            </Body>
            <Right>
              <Icon name="ios-arrow-forward" type="Ionicons" />
            </Right>
          </ListItem>
        ))}
        <ListItem itemDivider>
          <Text note style={{ fontStyle: 'italic' }}>
            Presiona sobre el usuario para editarlo.
          </Text>
        </ListItem>
      </React.Fragment>
    )
  }

  _renderFooter = () => {
    const { navigation } = this.props

    return (
      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Button onPress={() => navigation.navigate('AddUser')}>
          <Text>Agregar usuario</Text>
        </Button>
      </View>
    )
  }

  _editUser = (user: UserType) => {
    this.props.navigation.navigate('AddUser', { user })
  }

  _refetch = () => {
    this.props.usersFeed.refetch()
  }
}

const EnhancedUsers = compose(
  withUsers,
  withCurrentUser,
  withNavigation,
  withIsOnline
)(Users)

EnhancedUsers.navigationOptions = {
  headerTitle: 'Control de acceso',
}

export default EnhancedUsers
