import React from 'react'
import { View, Button, Text } from 'native-base'

type FetchErrorProps = {
  refetch(): void
  error: { message: string }
}

export const FetchError = ({
  refetch,
  error: { message },
}: FetchErrorProps) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    }}
  >
    <Text>{message}</Text>
    <Button
      light
      style={{ alignSelf: 'center', marginTop: 10 }}
      onPress={() => refetch()}
    >
      <Text>Refrescar</Text>
    </Button>
  </View>
)
