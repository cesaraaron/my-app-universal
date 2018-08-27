import React from 'react'
import { UserType } from '../HOCs'
import Loading from '../components/Loading'
import { ChildDataProps, graphql } from 'react-apollo'
import { ME_QUERY } from '../queries'
import { FetchError } from '../components/FetchError'
import { MeQuery } from '../__generated__/types'

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

type CurrentUserExternalProps = {
  signOut(): Promise<void>
  children: JSX.Element | (JSX.Element | null)[]
}

type MeDataProps = ChildDataProps<CurrentUserExternalProps, MeQuery, {}>

const withMe = graphql<CurrentUserExternalProps, MeQuery, {}, MeDataProps>(
  ME_QUERY,
  {
    options: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  }
)

type CurrentUserInternalProps = CurrentUserExternalProps & MeDataProps

export const CurrentUserProvider = withMe(
  class CurrentUser extends React.Component<CurrentUserInternalProps> {
    render() {
      const {
        children,
        signOut,
        data: { error, loading, refetch, me },
      } = this.props

      if (loading) {
        return <Loading />
      }

      // The token of the logged user is saved in AsyncStorage but if it is
      // an invalid token then the server won't return a user, so logout
      if (!me) {
        return <SignOut signOut={signOut} />
      }

      if (error) {
        return <FetchError error={error} refetch={refetch} />
      }

      return (
        <UserContext.Provider value={{ currentUser: me }}>
          {children}
        </UserContext.Provider>
      )
    }
  }
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
