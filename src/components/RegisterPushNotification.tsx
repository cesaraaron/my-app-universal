import React from 'react'
import { Permissions, Notifications } from 'expo'
import { withSaveDeviceToken, SaveDeviceTokenMutationProps } from '../HOCs'
import { compose } from 'react-apollo'

type RegisterPushNotificationProps = SaveDeviceTokenMutationProps

class RegisterPushNotification extends React.Component<
  RegisterPushNotificationProps
> {
  async componentDidMount() {
    const token = await registerForPushNotificationsAsync()

    this.saveUserToken(token)
  }

  saveUserToken = (token?: string) => {
    const { saveDeviceToken } = this.props

    if (!token) {
      return
    }
    saveDeviceToken({
      variables: { token },
    })
  }

  render() {
    return null
  }
}

export default compose(withSaveDeviceToken)(RegisterPushNotification)

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  )
  let finalStatus = existingStatus

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
    finalStatus = status
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync()

  return token
}
