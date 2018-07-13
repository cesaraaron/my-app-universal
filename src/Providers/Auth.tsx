import React, { Component, ComponentType } from 'react'
import { AsyncStorage } from 'react-native'
import Loading from '../components/Loading'
import { persistor } from '../App'

export const AUTH_TOKEN = 'auth-token'

export type AuthContextValue = {
  isSignedIn: boolean
  signIn(token: string): Promise<void>
  signOut(): Promise<void>
}

const AuthContext = React.createContext<AuthContextValue>({
  isSignedIn: false,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
})

export type AuthState = {
  isSignedIn: boolean
  loading: boolean
}

type AuthChildrenPropArgs = AuthContextValue

type AuthProps = {
  children(args: AuthChildrenPropArgs): JSX.Element
}

export class Auth extends Component<AuthProps, AuthState> {
  state = {
    isSignedIn: false,
    loading: true,
  }

  componentDidMount() {
    this.isSignedIn()
  }

  isSignedIn = () =>
    AsyncStorage.getItem(AUTH_TOKEN).then(val => {
      this.setState({ isSignedIn: !!val, loading: false })
    })

  signIn = (token: string) => {
    return AsyncStorage.setItem(AUTH_TOKEN, token).then(this.isSignedIn)
  }

  signOut = () => {
    return Promise.all([
      persistor.purge(),
      AsyncStorage.setItem(AUTH_TOKEN, ''),
    ]).then(this.isSignedIn)
  }

  render() {
    const { loading, isSignedIn } = this.state

    return loading ? (
      <Loading />
    ) : (
      <AuthContext.Provider
        value={{ signIn: this.signIn, signOut: this.signOut, isSignedIn }}
      >
        {this.props.children({
          isSignedIn,
          signIn: this.signIn,
          signOut: this.signOut,
        })}
      </AuthContext.Provider>
    )
  }
}

export const AuthConsumer = AuthContext.Consumer

export type WithAuthProps = AuthContextValue

export const withAuth = <P extends {}>(
  WrappedComponent: ComponentType<P & AuthContextValue>
) => (props: {}) => (
  <AuthConsumer>{val => <WrappedComponent {...props} {...val} />}</AuthConsumer>
)
