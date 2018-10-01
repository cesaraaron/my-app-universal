import React from 'react'

type BarCodeScannerState = {
  hasCameraPermission: null | boolean
  barCodeData: null | string
}

type BarCodeScannerProps = {
  handleBarCodeRead(data: string): void
}

export default class extends React.Component<
  BarCodeScannerProps,
  BarCodeScannerState
> {
  render() {
    return null
  }
}
