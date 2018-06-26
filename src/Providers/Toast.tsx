import * as React from 'react'
import { Toast as NBToast } from 'native-base'

const ToastContext = React.createContext(NBToast)

export type WithToastProps = {
  Toast: typeof NBToast
}

export const ToastProvider = ToastContext.Provider

export const withToast = (
  WrappedComponent: React.ComponentType<WithToastProps>
) => (props: {}) => (
  <ToastContext.Consumer>
    {Toast => <WrappedComponent {...props} Toast={Toast} />}
  </ToastContext.Consumer>
)
