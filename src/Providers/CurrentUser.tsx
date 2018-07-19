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

class SignOut extends React.Component<{ signOut: () => {} }> {
  componentDidMount() {
    this.props.signOut()
  }
  render() {
    return null
  }
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
      if (loading) {
        return <Loading />
      }

      // The token of the logged user is saved in AsyncStorage but if it is
      // an invalid token then the server won't return the user, so logout
      if (!data || !data.me) {
        return <SignOut signOut={signOut} />
      }

      if (error) {
        return <FetchError error={error} refetch={refetch} />
      }

      return (
        <UserContext.Provider value={{ currentUser: data.me }}>
          {children}
        </UserContext.Provider>
      )
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
