import React, { Component } from 'react'
import { NetInfo, View, Text } from 'react-native'
import { isWeb } from '../utils'

type IsOnlineState = {
  isOnline: boolean
}

type IsOnlineProps = {
  children: JSX.Element
}

type IsOnlineContextValue = {
  isOnline: boolean
}

const IsOnlineContext = React.createContext<IsOnlineContextValue>({
  isOnline: true,
})

export class IsOnlineProvider extends Component<IsOnlineProps, IsOnlineState> {
  state = {
    isOnline: true,
  }

  componentDidMount() {
    if (isWeb) {
      window.addEventListener('offline', () =>
        this.setState({ isOnline: false })
      )
      window.addEventListener('online', () => this.setState({ isOnline: true }))
      this.setState({ isOnline: window.navigator.onLine })
    } else {
      NetInfo.getConnectionInfo().then(info => {
        this._onConnectionChange(info)
        NetInfo.addEventListener('connectionChange', this._onConnectionChange)
      })
    }
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this._onConnectionChange)
  }

  render(): JSX.Element {
    const { isOnline } = this.state

    return (
      <IsOnlineContext.Provider value={{ isOnline }}>
        {this.props.children}
      </IsOnlineContext.Provider>
    )
  }

  _onConnectionChange = (event: any) => {
    const isOnline = event.type !== 'none' && event.type !== 'unknown'

    this.setState({ isOnline })
  }
}

export const IsOnlineConsumer = IsOnlineContext.Consumer

export type IsOnlineInjectProps = IsOnlineContextValue

export const withIsOnline = <EProps extends {}>(
  WrappedComponent: React.ComponentType<EProps & IsOnlineInjectProps>
) => (props: {}) => (
  <IsOnlineContext.Consumer>
    {({ isOnline }) => <WrappedComponent {...props} isOnline={isOnline} />}
  </IsOnlineContext.Consumer>
)

export const OfflineBanner = ({ isOnline }: { isOnline: boolean }) => {
  return isOnline ? null : (
    <View
      style={{
        backgroundColor: 'red',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white' }}>Sin conección a internet.</Text>
    </View>
  )
}
