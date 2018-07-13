import React from 'react'
import { UserType } from '../HOCs'
import Loading from '../components/Loading'
import { Query } from 'react-apollo'
import { MeQuery as MeQueryData } from '../__generated__/types'
import { ME_QUERY } from '../queries'
import { FetchError } from '../components/FetchError'

class MeQuery extends Query<MeQueryData> {}

type UserContextValue = {
  currentUser: UserType
}

const UserContext = React.createContext<UserContextValue>({
  currentUser: {
    __typename: 'User',
    id: '',
    createdAt: '',
    updatedAt: '',
    isAdmin: false,
    name: '',
    notifications: { __typename: 'Notifications', devices: [], fireWhen: 0 },
    permissions: [],
    phoneNumber: '',
  },
})

type CurrentUserProps = {
  signOut(): Promise<void>
  children: JSX.Element | (JSX.Element | null)[]
}

export const CurrentUserProvider = ({
  children,
  signOut,
}: CurrentUserProps) => (
  <MeQuery query={ME_QUERY} errorPolicy="all">
    {({ loading, data, error, refetch }) => {
      class CurrentUser extends React.Component {
        componentDidMount() {
          if (loading) {
            return
          }
          if (!data || !data.me) {
            signOut()
          }
        }

        componentDidUpdate() {
          if (loading) {
            return
          }
          if (!data || !data.me) {
            signOut()
          }
        }

        render() {
          if (loading || !data || !data.me) {
            return <Loading />
          }

          if (error) {
            return <FetchError error={error} refetch={refetch} />
          }

          return (
            <UserContext.Provider value={{ currentUser: data.me }}>
              {children}
            </UserContext.Provider>
          )
        }
      }
      return <CurrentUser />
    }}
  </MeQuery>
)

export const CurrentUserConsumer = UserContext.Consumer

export type WithCurrentUserProps = UserContextValue

export const withCurrentUser = <P extends {}>(
  Component: React.ComponentType<P & WithCurrentUserProps>
) => (props: {}) => (
  <UserContext.Consumer>
    {({ currentUser }) => <Component {...props} currentUser={currentUser} />}
  </UserContext.Consumer>
)
