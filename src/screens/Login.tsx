import React, { Component } from 'react'
import {
  Container,
  Header,
  Content,
  Form,
  Item,
  Input,
  Button,
  Text,
} from 'native-base'
import { Keyboard } from 'react-native'
import { compose } from 'react-apollo'
import { LoginMutationProps, withLogin } from '../HOCs'
import { WithAuthProps, withAuth } from '../Providers/Auth'
import {
  withIsOnline,
  WithIsOnlineProps,
  OfflineBanner,
} from '../Providers/IsOnline'
import { alert } from '../components/alert'

type LoginState = {
  phoneNumber: string
  password: string
}

type LoginProps = LoginMutationProps & WithAuthProps & WithIsOnlineProps

class Login extends Component<LoginProps, LoginState> {
  state = {
    phoneNumber: '',
    password: '',
  }

  render() {
    const { isOnline } = this.props
    const { phoneNumber, password } = this.state

    return (
      <Container>
        <Header />
        <OfflineBanner isOnline={isOnline} />
        <Content padder>
          <Form>
            <Item>
              <Input
                autoCapitalize="none"
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={text => this.setState({ phoneNumber: text })}
                placeholder="Numero de telefono"
              />
            </Item>
            <Item last>
              <Input
                autoCapitalize="none"
                value={password}
                onChangeText={text => this.setState({ password: text })}
                placeholder="Contraseña"
                secureTextEntry
              />
            </Item>
          </Form>
          <Button
            block
            disabled={!phoneNumber || !password}
            style={{ marginTop: 10 }}
            onPress={this._signIn}
          >
            <Text>Entrar</Text>
          </Button>
        </Content>
      </Container>
    )
  }

  _signIn = () => {
    const { phoneNumber, password } = this.state
    const { loginMutation, signIn, isOnline } = this.props

    Keyboard.dismiss()

    if (!isOnline) {
      alert('Error', 'Se necesita conneción a internet para poder ingresar.')
      return
    }

    loginMutation({
      variables: {
        phoneNumber,
        password,
      },
    })
      .then(val => {
        signIn(val.data.login.token)
      })
      .catch(() => {})
  }
}

const EnhancedLogin = compose(
  withLogin,
  withAuth,
  withIsOnline
)(Login)

export default EnhancedLogin
