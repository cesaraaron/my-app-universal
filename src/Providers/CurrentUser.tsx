import React from 'react'
import { UserType } from '../HOCs'
import Loading from '../components/Loading'
import { Query } from 'react-apollo'
import { MeQuery as MeQueryData } from '../__generated__/types'
import { ME_QUERY } from '../queries'

class MeQuery extends Query<MeQueryData> {}

type UserContextValue = {
  currentUser: UserType | null
}

const UserContext = React.createContext<UserContextValue>({ currentUser: null })

type CurrentUserProps = {
  children: JSX.Element | JSX.Element[]
}

export const CurrentUserProvider = ({ children }: CurrentUserProps) => (
  <MeQuery query={ME_QUERY} errorPolicy="all">
    {({ loading, data }) => {
      if (loading || !data) {
        return <Loading />
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
