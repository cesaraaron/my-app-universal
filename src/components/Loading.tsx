import React, { Component } from 'react'
import { View, Spinner } from 'native-base'
import { Text } from 'react-native'

export default class Loading extends Component {
  timeout?: NodeJS.Timer
  takingTooMuchTimer?: NodeJS.Timer

  state = {
    loading: true,
    takingTooMuch: false,
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ loading: false })
    }, 2000)

    this.takingTooMuchTimer = setTimeout(() => {
      this.setState({ takingTooMuch: true })
    }, 20000)
  }

  componentWillUnmount() {
    clearTimeout(this.timeout as NodeJS.Timer)
    clearTimeout(this.takingTooMuchTimer as NodeJS.Timer)
  }

  render() {
    const { loading, takingTooMuch } = this.state

    const component = (
      <View
        style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}
      >
        <Spinner color="gray" />
        {takingTooMuch ? (
          <Text style={{ alignSelf: 'center' }}>
            Esto esta tardando más de lo debido 🤔
          </Text>
        ) : null}
      </View>
    )

    if (takingTooMuch) {
      return component
    }

    if (loading) {
      return null
    }

    return component
  }
}
