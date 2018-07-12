import React from 'react'
import { Font, AppLoading } from 'expo'
import { isWeb } from '../utils'

type FontLoadingProps = {
  children: JSX.Element
}
type FontLoadingState = {
  loading: boolean
}

export class FontLoading extends React.Component<
  FontLoadingProps,
  FontLoadingState
> {
  state = { loading: true }

  async componentDidMount() {
    if (isWeb) {
      this.setState({ loading: false })
    } else {
      await Font.loadAsync({
        Roboto: require('native-base/Fonts/Roboto.ttf'),
        Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      })
      this.setState({ loading: false })
    }
  }

  render() {
    if (this.state.loading) {
      return <AppLoading />
    }
    return this.props.children
  }
}
