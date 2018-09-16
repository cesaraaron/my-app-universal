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
  Spinner,
} from 'native-base'
import { Keyboard } from 'react-native'
import { compose } from 'react-apollo'
import { LoginMutationProps, withLogin } from '../HOCs'
import { WithAuthProps, withAuth } from '../Providers/Auth'
import {
  withIsOnline,
  IsOnlineInjectProps,
  OfflineBanner,
} from '../Providers/IsOnline'
import { alert } from '../components/alert'

type LoginState = {
  phoneNumber: string
  password: string
  authenticating: boolean
}

type LoginProps = LoginMutationProps & WithAuthProps & IsOnlineInjectProps

class Login extends Component<LoginProps, LoginState> {
  state = {
    phoneNumber: '',
    password: '',
    authenticating: false,
  }

  render() {
    const { isOnline } = this.props
    const { phoneNumber, password, authenticating } = this.state

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
            disabled={!phoneNumber || !password || authenticating}
            style={{ marginTop: 10 }}
            onPress={this._signIn}
          >
            <Text>Entrar</Text>
            {authenticating ? <Spinner color="gray" /> : null}
          </Button>
        </Content>
      </Container>
    )
  }

  _signIn = async () => {
    const { phoneNumber, password } = this.state
    const { loginMutation, signIn, isOnline } = this.props

    Keyboard.dismiss()

    if (!isOnline) {
      alert('Error', 'Se necesita conneción a internet para poder ingresar.')
      return
    }

    this.setState({ authenticating: true })

    try {
      const result = await loginMutation({
        variables: {
          phoneNumber,
          password,
        },
      })

      signIn(result.data.login.token)
    } catch {
      this.setState({ authenticating: false })
    }
  }
}

const EnhancedLogin = compose(
  withLogin,
  withAuth,
  withIsOnline
)(Login)

export default EnhancedLogin
