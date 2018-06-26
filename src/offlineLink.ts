// https://github.com/apollographql/apollo-link/issues/125#issuecomment-363851804
import { ApolloLink } from 'apollo-link'
import QueueLink from 'apollo-link-queue'
import { RetryLink } from 'apollo-link-retry'
import { NetInfo } from 'react-native'
import { isWeb } from './utils'

export function createOfflineLink() {
  const retryLink = new RetryLink({
    attempts: {
      max: Infinity,
      // retryIf(error, operation) {
      //   const cachedResponse = cache.readQuery({
      //     query: operation.query,
      //     variables: operation.variables,
      //   })
      //   return !!error && cachedResponse == null
      // },
    },
  })

  const offlineLink = new QueueLink()

  if (isWeb) {
    window.addEventListener('offline', () => offlineLink.close())
    window.addEventListener('online', () => offlineLink.open())
  } else {
    NetInfo.addEventListener('connectionChange', (event: any) => {
      if (isOnline(event.type)) {
        offlineLink.open()
      } else {
        offlineLink.close()
      }
    })
  }

  function isOnline(connectionType: any) {
    return connectionType !== 'none' && connectionType !== 'unknown'
  }

  // const optimisticFetchLink = new ApolloLink((operation, forward) => {
  //   return new Observable(observer => {
  //     forward(operation).subscribe({
  //       // Don't do anything with normal responses.
  //       next: response => observer.next(response),
  //       error: error => {
  //         if (error.message === 'Network request failed') {
  //           // The response may already be persisted in the cache - if so, there
  //           // is no need to throw. Instead, just resolve with the cached data.
  //           const cachedResponse = cache.readQuery({
  //             query: operation.query,
  //             variables: operation.variables,
  //           })
  //           if (cachedResponse != null) {
  //             observer.next({ data: cachedResponse })
  //           } else {
  //             observer.error(error)
  //           }
  //         } else {
  //           // Don't do anything with any other error.
  //           observer.error(error)
  //         }
  //       },
  //     })
  //   })
  // })

  return ApolloLink.from([retryLink, offlineLink as any])
}
