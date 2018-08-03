import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink, Observable, Operation } from 'apollo-link'
import { RootNavigator } from './routes'
import { AsyncStorage, NetInfo } from 'react-native'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createOfflineLink } from './offlineLink'
import { CachePersistor } from 'apollo-cache-persist'
import { PendingMutationsProvider } from './Providers/PendingMutations'
import { Auth, AUTH_TOKEN } from './Providers/Auth'
import { CurrentUserProvider } from './Providers/CurrentUser'
import { IsOnlineProvider } from './Providers/IsOnline'
import RegisterPushNotification from './components/RegisterPushNotification'
import { alert } from './components/alert'
import { HTTP_ENDPOINT, WS_ENDPOINT } from 'react-native-dotenv'
import { isWeb } from './utils'
import { FontLoading } from './components/FontLoading'

const NETWORK_ERROR_MESSAGE =
  'Ops! Al parecer algo malo esta pasando en el backend.\nIntenta de nuevo más tarde o ponte en contacto con el proveedor de la aplicación.'

if (!HTTP_ENDPOINT || !WS_ENDPOINT) {
  throw new Error('Invalidad endpoints')
}

const cache = new InMemoryCache()

const offlineLink = createOfflineLink()

export const persistor = new CachePersistor({
  cache,
  storage: AsyncStorage as any,
})

const wsLink = new WebSocketLink({
  uri: WS_ENDPOINT,
  options: {
    reconnect: true,
  },
})

const httpLink = new HttpLink({
  uri: HTTP_ENDPOINT,
  credentials: 'same-origin',
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const request = async (operation: Operation) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN)
  operation.setContext({
    headers: {
      authorization: token,
    },
  })
}

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle: ZenObservable.Subscription
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          if (!forward) {
            return
          }
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          })
        })
        .catch(observer.error.bind(observer))

      return () => {
        if (handle) handle.unsubscribe()
      }
    })
)

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        const message = graphQLErrors.reduce((prev, curr) => {
          return prev + curr.message + '. '
        }, '')
        alert('Error', message)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        )
      }
      if (networkError) {
        if (isWeb) {
          if (window.navigator.onLine) {
            throw new Error(NETWORK_ERROR_MESSAGE)
          }
        } else {
          NetInfo.isConnected.fetch().then(connected => {
            if (connected) {
              throw new Error(NETWORK_ERROR_MESSAGE)
            }
          })
        }
        console.log(`[Network error]: ${networkError}`)
      }
    }),
    offlineLink,
    requestLink,
    link,
  ]),
  cache,
})

export default () => (
  <FontLoading>
    <ApolloProvider client={client}>
      <IsOnlineProvider>
        <PendingMutationsProvider>
          <Auth>
            {({ isSignedIn, signOut }) =>
              isSignedIn ? (
                <CurrentUserProvider signOut={signOut}>
                  {isWeb ? null : <RegisterPushNotification />}
                  <RootNavigator isSignedIn={isSignedIn} />
                </CurrentUserProvider>
              ) : (
                <RootNavigator isSignedIn={isSignedIn} />
              )
            }
          </Auth>
        </PendingMutationsProvider>
      </IsOnlineProvider>
    </ApolloProvider>
  </FontLoading>
)
