import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Constants, BarCodeScanner, Permissions } from 'expo'

function delay(time: number) {
  return new Promise(function(resolve) {
    setTimeout(() => resolve(), time)
  })
}

type BarCodeScannerState = {
  hasCameraPermission: null | boolean
  barCodeData: null | string
}

type BarCodeScannerProps = {
  handleBarCodeRead(data: string): void
}

export default class extends Component<
  BarCodeScannerProps,
  BarCodeScannerState
> {
  state = {
    barCodeData: null,
    hasCameraPermission: null,
  }

  componentDidMount() {
    this._requestCameraPermission()
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission: status === 'granted',
    })
  }

  _handleBarCodeRead = async ({ data }: { data: string }) => {
    await delay(500)
    this.props.handleBarCodeRead(data)
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.hasCameraPermission === null ? (
          <Text>Solicitando permiso para usar la camara...</Text>
        ) : this.state.hasCameraPermission === false ? (
          <Text>Permiso para usar la camara no fue concedido.</Text>
        ) : (
          <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            style={{ height: 200, width: 200 }}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
})
