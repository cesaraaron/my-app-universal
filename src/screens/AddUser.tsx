import React, { Component } from 'react'
import { Alert, Keyboard } from 'react-native'
import { compose } from 'react-apollo'
import { withNavigation, NavigationScreenProps } from 'react-navigation'
import {
  Content,
  Item,
  Input,
  View,
  Button,
  Text,
  Switch,
  Body,
  List,
  ListItem,
  Right,
  Label,
} from 'native-base'
import { Formik, FieldArray, FormikActions, FormikErrors } from 'formik'
import {
  UpdateUserMutationProps,
  withUpdateUser,
  UserType,
  CreateUserMutationProps,
  withCreateUser,
  withDeleteUser,
  DeleteUserMutationProps,
} from '../HOCs'
import {
  UserPermissions,
  CreateUserMutation,
  getUsersQuery,
  UpdateUserMutation,
} from '../__generated__/types'
import { ID } from '../utils'
import { GET_USERS } from '../queries'
import { OptimisticProp } from '../types'
import { withIsOnline, IsOnlineInjectProps } from '../Providers/IsOnline'
import {
  PendingMutationsInjectProps,
  withPendingMutations,
} from '../Providers/PendingMutations'
import { alert } from '../components/alert'

const {
  CREATE_PRODUCTS,
  UPDATE_PRODUCTS,
  DELETE_PRODUCTS,
  CREATE_SALES,
  DELETE_SALES,
} = UserPermissions

type AddUserProps = NavigationScreenProps<{
  user?: UserType & OptimisticProp
}> &
  UpdateUserMutationProps &
  CreateUserMutationProps &
  DeleteUserMutationProps &
  IsOnlineInjectProps &
  PendingMutationsInjectProps

type InitialValues = {
  name: UserType['name']
  phoneNumber: UserType['phoneNumber']
  permissions: UserType['permissions']
  password: string
}

type AddUserState = {
  user?: UserType & OptimisticProp
  userId?: string
  initialValues: InitialValues
}

class AddUser extends Component<AddUserProps, AddUserState> {
  constructor(props: AddUserProps) {
    super(props)
    const user = props.navigation.getParam('user')

    let state: AddUserState = {
      initialValues: {
        name: '',
        phoneNumber: '',
        permissions: [CREATE_SALES],
        password: '',
      },
    }

    if (!user) {
      this.state = state
      return
    }

    state = {
      user,
      userId: user.id,
      initialValues: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        permissions: user.permissions,
        password: '',
      },
    }

    this.state = state
  }

  render() {
    const { initialValues, userId, user } = this.state

    return (
      <Content style={{ backgroundColor: '#f4f4f4' }}>
        <Formik
          onSubmit={(values, opts) => {
            Keyboard.dismiss()

            if (userId) {
              this._updateUser(values)
            } else {
              this._createUser(values, opts)
            }
          }}
          initialValues={initialValues}
          validate={({ name, password, phoneNumber }) => {
            let errors: FormikErrors<InitialValues> = {}
            if (!name) {
              errors.name = 'El nombre de usuario es requerido.'
            }
            if (!userId && (!password || (password && password.length < 6))) {
              errors.password = 'Ingresa una contraseña de al menos 6 letras.'
            }
            if (!phoneNumber) {
              errors.phoneNumber = 'El numero de telefono es requerido.'
            }
            return errors
          }}
        >
          {({
            values: { name, password, phoneNumber, permissions },
            errors,
            touched,
            setFieldTouched,
            setFieldValue,
            submitForm,
          }) => (
            <React.Fragment>
              <List style={{ backgroundColor: 'white' }}>
                <View style={{ paddingLeft: 20 }}>
                  <Item stackedLabel error={errors.name && touched.name}>
                    {errors.name && touched.name ? (
                      <Label style={{ color: 'red' }}>{errors.name}</Label>
                    ) : (
                      <Label>Nombre</Label>
                    )}

                    <Input
                      value={name}
                      onChangeText={text => setFieldValue('name', text)}
                      onBlur={() => setFieldTouched('name', true)}
                    />
                  </Item>
                  <Item
                    stackedLabel
                    error={errors.password && touched.password}
                  >
                    {errors.password && touched.password ? (
                      <Label style={{ color: 'red' }}>{errors.password}</Label>
                    ) : (
                      <Label>Nueva contraseña</Label>
                    )}
                    <Input
                      secureTextEntry
                      value={password}
                      onChangeText={text => setFieldValue('password', text)}
                      onBlur={() => setFieldTouched('password', true)}
                    />
                  </Item>
                  <Item
                    stackedLabel
                    error={errors.phoneNumber && touched.phoneNumber}
                  >
                    {errors.phoneNumber && touched.phoneNumber ? (
                      <Label style={{ color: 'red' }}>
                        {errors.phoneNumber}
                      </Label>
                    ) : (
                      <Label>Numero de telefono</Label>
                    )}
                    <Input
                      value={phoneNumber}
                      keyboardType="number-pad"
                      onChangeText={text => setFieldValue('phoneNumber', text)}
                      onBlur={() => setFieldTouched('phoneNumber', true)}
                    />
                  </Item>
                </View>
                {user && user.isAdmin ? null : (
                  <React.Fragment>
                    <ListItem itemDivider>
                      <Text style={{ marginTop: 20 }}>Permisos</Text>
                    </ListItem>
                    <FieldArray name="permissions">
                      {helper => (
                        <React.Fragment>
                          <ListItem>
                            <Body>
                              <Text>Agregar ventas:</Text>
                            </Body>
                            <Right>
                              <Switch
                                value={permissions.includes(CREATE_SALES)}
                                onValueChange={val => {
                                  if (val) {
                                    helper.push(CREATE_SALES)
                                  } else {
                                    helper.remove(
                                      permissions.indexOf(CREATE_SALES)
                                    )
                                  }
                                }}
                              />
                            </Right>
                          </ListItem>
                          <ListItem>
                            <Body>
                              <Text>Eliminar ventas:</Text>
                            </Body>
                            <Right>
                              <Switch
                                value={permissions.includes(DELETE_SALES)}
                                onValueChange={val => {
                                  if (val) {
                                    helper.push(DELETE_SALES)
                                  } else {
                                    helper.remove(
                                      permissions.indexOf(DELETE_SALES)
                                    )
                                  }
                                }}
                              />
                            </Right>
                          </ListItem>
                          <ListItem>
                            <Body>
                              <Text>Agregar productos:</Text>
                            </Body>
                            <Right>
                              <Switch
                                value={permissions.includes(CREATE_PRODUCTS)}
                                onValueChange={val => {
                                  if (val) {
                                    helper.push(CREATE_PRODUCTS)
                                  } else {
                                    helper.remove(
                                      permissions.indexOf(CREATE_PRODUCTS)
                                    )
                                  }
                                }}
                              />
                            </Right>
                          </ListItem>
                          <ListItem>
                            <Body>
                              <Text>Editar productos:</Text>
                            </Body>
                            <Right>
                              <Switch
                                value={permissions.includes(UPDATE_PRODUCTS)}
                                onValueChange={val => {
                                  if (val) {
                                    helper.push(UPDATE_PRODUCTS)
                                  } else {
                                    helper.remove(
                                      permissions.indexOf(UPDATE_PRODUCTS)
                                    )
                                  }
                                }}
                              />
                            </Right>
                          </ListItem>
                          <ListItem>
                            <Body>
                              <Text>Eliminar products:</Text>
                            </Body>
                            <Right>
                              <Switch
                                value={permissions.includes(DELETE_PRODUCTS)}
                                onValueChange={val => {
                                  if (val) {
                                    helper.push(DELETE_PRODUCTS)
                                  } else {
                                    helper.remove(
                                      permissions.indexOf(DELETE_PRODUCTS)
                                    )
                                  }
                                }}
                              />
                            </Right>
                          </ListItem>
                        </React.Fragment>
                      )}
                    </FieldArray>
                  </React.Fragment>
                )}
              </List>
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 30,
                  justifyContent: 'space-around',
                }}
              >
                {user ? (
                  <React.Fragment>
                    {user.isAdmin ? null : (
                      <Button danger onPress={this._deleteUser}>
                        <Text>Eliminar usuario</Text>
                      </Button>
                    )}
                    <Button onPress={submitForm}>
                      <Text>Guardar cambios</Text>
                    </Button>
                  </React.Fragment>
                ) : (
                  <Button block onPress={submitForm}>
                    <Text>Crear usuario</Text>
                  </Button>
                )}
              </View>
            </React.Fragment>
          )}
        </Formik>
      </Content>
    )
  }

  _createUser = (
    variables: InitialValues,
    opts: FormikActions<InitialValues>
  ) => {
    const { createUser, isOnline, addId, removeId } = this.props

    opts.resetForm()
    opts.setTouched({})
    opts.setErrors({})

    const optimisticId = ID()

    createUser({
      variables,
      optimisticResponse: {
        createUser: {
          __typename: 'User',
          id: optimisticId,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
          name: variables.name,
          phoneNumber: variables.phoneNumber,
          notifications: {
            __typename: 'Notifications',
            fireWhen: 5,
            devices: [],
          },
          permissions: variables.permissions,
          isAdmin: false,
          __optimistic: true,
        } as CreateUserMutation['createUser'] & OptimisticProp,
      },
      update(proxy, result) {
        const { createUser } = result.data as CreateUserMutation & {
          createUser: OptimisticProp
        }

        if (!isOnline && createUser.__optimistic) {
          addId(optimisticId, true)

          alert(
            '',
            `Este usuario se guardará hasta que la conneción a internet se restablezca.`
          )
        }

        if (!createUser.__optimistic) {
          removeId(optimisticId)
        }
        const data = proxy.readQuery({
          query: GET_USERS,
        }) as getUsersQuery

        data.users = [...data.users, createUser]
        proxy.writeQuery({ query: GET_USERS, data })
      },
    })
  }

  _updateUser = (values: InitialValues) => {
    const { updateUser, isOnline, addId, removeId, entries } = this.props
    const { userId, user } = this.state

    if (!userId || !user) {
      return
    }
    const entry = entries.find(e => e.id === userId)

    if (entry && entry.isOnlyInCache) {
      Alert.alert(
        'Error',
        'Este usuario no se puede eliminar aún por que no se ha guardado en la base de datos.'
      )
      return
    }

    updateUser({
      variables: {
        ...values,
        userId,
      },
      optimisticResponse: {
        updateUser: {
          __typename: 'User',
          id: userId,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
          name: values.name,
          notifications: user.notifications,
          permissions: values.permissions,
          phoneNumber: values.phoneNumber,
          isAdmin: false,
          __optimistic: true,
        } as UpdateUserMutation['updateUser'] & OptimisticProp,
      },
      update(proxy, result) {
        const { updateUser } = result.data as UpdateUserMutation & {
          updateUser: OptimisticProp
        }
        if (!isOnline && updateUser.__optimistic) {
          addId(userId)

          alert(
            '',
            `Los cambios a este usuario se guardarán hasta que la conneción a internet se restablezca.`
          )
        }

        if (!updateUser.__optimistic) {
          removeId(userId)
        }

        const data = proxy.readQuery({
          query: GET_USERS,
        }) as getUsersQuery

        data.users = data.users.map(user => {
          if (user.id === updateUser.id) {
            return updateUser
          }
          return user
        })

        proxy.writeQuery({ query: GET_USERS, data })
      },
    })
  }

  _deleteUser = async () => {
    const { navigation, deleteUser, entries } = this.props
    const { userId, user } = this.state

    if (!userId || !user) {
      return
    }
    if (entries.find(e => e.id === userId)) {
      Alert.alert(
        'Error',
        'Este usuario no se puede eliminar aún por queno se ha guardado en la base de datos.'
      )
      return
    }

    const confirmCb = () => {
      deleteUser({
        variables: {
          userId,
        },
        optimisticResponse: {
          deleteUser: user,
        },
        update(proxy) {
          const data = proxy.readQuery({ query: GET_USERS }) as getUsersQuery

          const newData = {
            ...data,
            users: data.users.filter(user => user.id !== userId),
          } as getUsersQuery

          proxy.writeQuery({ query: GET_USERS, data: newData })
          navigation.goBack()
        },
      })
    }

    Alert.alert(
      'Eliminar usuario',
      '¿Estás seguro que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: confirmCb },
      ],
      { cancelable: false }
    )
  }
}

export default compose(
  withNavigation,
  withUpdateUser,
  withCreateUser,
  withDeleteUser,
  withIsOnline,
  withPendingMutations
)(AddUser)
