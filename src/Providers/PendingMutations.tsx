import React from 'react'
import { AsyncStorage } from 'react-native'
import { IsOnlineConsumer } from './IsOnline'

const PENDING_MUTATION_STORE_KEY = '@pending-mutation-store-key'

type Entry = {
  id: string
  isOnlyInCache: boolean
}

type Entries = Entry[]

export type PendingMutationsInjectProps = {
  addId(id: string, isOnlyInCache?: boolean): void
  removeId(id: string): void
  entries: Entries
}

type PendingMutationsProps = {
  children: JSX.Element
}

type PendingMutationsState = {
  entries: Entries
}

const pendingMutationsContext = React.createContext<
  PendingMutationsInjectProps
>({ addId() {}, removeId() {}, entries: [] })

export class PendingMutationsProvider extends React.Component<
  PendingMutationsProps,
  PendingMutationsState
> {
  timeout?: NodeJS.Timer

  state = {
    entries: [],
  }

  async componentDidMount() {
    const entriesString = await AsyncStorage.getItem(PENDING_MUTATION_STORE_KEY)

    if (entriesString) {
      const entries: Entries = JSON.parse(entriesString)
      this.setState({ entries })
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout as NodeJS.Timer)
  }

  addId: PendingMutationsInjectProps['addId'] = (
    id: string,
    isOnlyInCache = false
  ) => {
    this.setState(prevState => {
      const prevEntries = prevState.entries.filter(entry => entry.id !== id)
      const newEntries = [...prevEntries, { id, isOnlyInCache }]
      AsyncStorage.setItem(
        PENDING_MUTATION_STORE_KEY,
        JSON.stringify(newEntries)
      )

      return {
        entries: newEntries,
      }
    })
  }

  removeId: PendingMutationsInjectProps['removeId'] = (id: string) => {
    this.setState(prevState => {
      const newEntries = prevState.entries.filter(entry => entry.id !== id)
      AsyncStorage.setItem(
        PENDING_MUTATION_STORE_KEY,
        JSON.stringify(newEntries)
      )

      return {
        entries: newEntries,
      }
    })
  }

  flushEntries = () => {
    AsyncStorage.setItem(PENDING_MUTATION_STORE_KEY, '')
  }

  render() {
    const { entries } = this.state
    return (
      <React.Fragment>
        <IsOnlineConsumer>
          {({ isOnline }) => {
            if (isOnline) {
              this.timeout = setTimeout(
                this.flushEntries,
                10000
              ) as NodeJS.Timer
            }
            return null
          }}
        </IsOnlineConsumer>
        <pendingMutationsContext.Provider
          value={{
            addId: this.addId,
            removeId: this.removeId,
            entries,
          }}
        >
          {this.props.children}
        </pendingMutationsContext.Provider>
      </React.Fragment>
    )
  }
}

export const withPendingMutations = (
  WrappedComponent: React.ComponentType<PendingMutationsInjectProps>
) => (externalProps: {}) => (
  <pendingMutationsContext.Consumer>
    {state => <WrappedComponent {...externalProps} {...state} />}
  </pendingMutationsContext.Consumer>
)
