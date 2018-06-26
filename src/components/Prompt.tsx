import React, { Component } from 'react'
import { View, TextInput, KeyboardTypeOptions } from 'react-native'
import { Button, Text } from 'native-base'
import Modal from 'react-native-modal'

export type PromptProps = {
  visible: boolean
  value: string | number
  submitText?: string
  keyboardType?: KeyboardTypeOptions
  cancelText?: string
  onCancel?: () => void
  close: () => void
  onSubmit: (value: string) => void
}

// TODO: Use render prop to pass the text input value
export class Prompt extends Component<PromptProps> {
  static defaultProps = {
    submitText: 'Ok',
    cancelText: 'Cancelar',
    onCancel: () => {},
  }

  state = {
    value: String(this.props.value),
  }

  render() {
    const {
      visible,
      close,
      submitText,
      cancelText,
      onSubmit,
      keyboardType,
      onCancel,
    } = this.props
    const { value } = this.state

    return (
      <Modal
        scrollTo={() => {}}
        scrollOffset={0}
        isVisible={visible}
        swipeDirection="up"
        onSwipe={close}
        onBackdropPress={close}
      >
        <View
          style={{
            padding: 20,
            borderRadius: 5,
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <TextInput
            autoFocus
            value={value}
            onChangeText={text => this.setState({ value: text })}
            style={{
              padding: 10,
              marginBottom: 10,
              borderColor: '#0002',
              borderWidth: 1,
              borderRadius: 5,
            }}
            placeholder="Cantidad"
            keyboardType={keyboardType || 'numeric'}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Button
              danger
              small
              transparent
              onPress={() => {
                onCancel && onCancel()
                close()
              }}
            >
              <Text>{cancelText}</Text>
            </Button>
            <Button
              transparent
              small
              onPress={() => {
                onSubmit(value)
                close()
              }}
            >
              <Text>{submitText}</Text>
            </Button>
          </View>
        </View>
      </Modal>
    )
  }
}
