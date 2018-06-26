import * as React from 'react'
import { AppRegistry } from 'react-native'
import App from './App'
import { isWeb } from './utils'
import enUS from 'antd-mobile/lib/locale-provider/en_US'

let LocaleProvider = ({ children }: { children: JSX.Element; locale: any }) =>
  children

if (isWeb) {
  require('antd-mobile/dist/antd-mobile.css')
  LocaleProvider = require('antd-mobile').LocaleProvider
}

AppRegistry.registerComponent('App', () => () => (
  <LocaleProvider locale={enUS}>
    <App />
  </LocaleProvider>
))
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
})
