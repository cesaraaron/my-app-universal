import React, { Component } from 'react'
import { View, Spinner } from 'native-base'

export default class Loading extends Component {
  timeout?: NodeJS.Timer

  state = {
    loading: true,
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ loading: false })
    }, 2000)
  }

  componentWillUnmount() {
    clearTimeout(this.timeout as NodeJS.Timer)
  }

  render() {
    const { loading } = this.state

    if (loading) {
      return null
    }

    return (
      <View
        style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}
      >
        <Spinner color="gray" />
      </View>
    )
  }
}
