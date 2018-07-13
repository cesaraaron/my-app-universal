import React from 'react'
import { AppRegistry } from 'react-native'
import App from './App'
import { FontLoading } from './components/FontLoading'

AppRegistry.registerComponent('App', () => () => (
  <FontLoading>
    <App />
  </FontLoading>
))

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
})
