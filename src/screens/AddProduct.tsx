import React, { Component } from 'react'
import {
  CreateProductMutationProp,
  ProductType,
  UpdateProductMutationProp,
  DeleteProductMutationProp,
  withCreateProduct,
  withUpdateProduct,
  withDeleteProduct,
} from '../HOCs'
import {
  withNavigation,
  NavigationScreenProps,
  NavigationInjectedProps,
} from 'react-navigation'
import {
  Container,
  Content,
  Form,
  Item,
  Label,
  Input,
  Button,
  Text,
  View,
  Body,
  Right,
  Switch,
  ListItem,
  List,
} from 'native-base'
import { Formik, FormikActions, FormikErrors } from 'formik'
import { Keyboard } from 'react-native'
import { ID } from '../utils'
import { compose } from 'react-apollo'
import { GET_PRODUCTS } from '../queries'
import {
  UpdateProductMutation,
  CreateProductMutation,
  getProductsQuery,
  UserPermissions,
} from '../__generated__/types'
import { withIsOnline, IsOnlineInjectProps } from '../Providers/IsOnline'
import { OptimisticProp } from '../types'
import {
  PendingMutationsInjectProps,
  withPendingMutations,
} from '../Providers/PendingMutations'
import { withCurrentUser, WithCurrentUserProps } from '../Providers/CurrentUser'
import { alert } from '../components/alert'
import { Toast } from 'antd-mobile-rn'
import BarCodeScanner from '../components/BarCodeScanner'

type AddProductProps = CreateProductMutationProp &
  UpdateProductMutationProp &
  DeleteProductMutationProp &
  NavigationInjectedProps<{ product: ProductType & OptimisticProp }> &
  IsOnlineInjectProps &
  WithCurrentUserProps &
  PendingMutationsInjectProps

type InitialValues = {
  name: string
  quantity: string
  price: string
  notifications: boolean
  barCodeData: string | null
}

type AddProductState = {
  showBarCodeScanner: boolean
  product?: ProductType & OptimisticProp
  productId?: string
  initialValues: InitialValues
}

class AddProduct extends Component<AddProductProps, AddProductState> {
  constructor(props: AddProductProps) {
    super(props)
    const product = props.navigation.getParam('product')

    let state: AddProductState = {
      showBarCodeScanner: false,
      initialValues: {
        name: '',
        price: '',
        quantity: '',
        notifications: true,
        barCodeData: null,
      },
    }

    if (!product) {
      this.state = state
      return
    }

    state = {
      showBarCodeScanner: false,
      product,
      productId: product.id,
      initialValues: {
        barCodeData: product.barCodeData,
        name: product.name + '',
        price: product.price + '',
        quantity: product.quantity + '',
        notifications: product.notifications,
      },
    }

    this.state = state
  }

  render() {
    const { entries } = this.props
    const { productId, initialValues, showBarCodeScanner } = this.state

    return (
      <Container style={{ backgroundColor: 'white' }}>
        <Content style={{ backgroundColor: '#f4f4f4' }}>
          <Formik
            initialValues={initialValues}
            validate={({ name, price, quantity }) => {
              let errors: FormikErrors<InitialValues> = {}

              if (!name) {
                errors.name = 'Ingresa el nombre del producto.'
              }
              if (!price) {
                errors.price = 'Ingresa el precio del producto'
              }
              if (!quantity) {
                errors.quantity = 'Ingresa la cantidad disponible del producto'
              }
              return errors
            }}
            onSubmit={(values, opts) => {
              Keyboard.dismiss()

              if (productId) {
                const entry = entries.find(e => e.id === productId)
                if (entry && entry.isOnlyInCache) {
                  alert(
                    'Error',
                    'Este producto no se puede editar aún por que no se ha guardado en la base de datos'
                  )
                  return
                }
                this._updateProduct(values)
              } else {
                this._createProduct(values, opts)
              }
            }}
          >
            {({
              errors,
              touched,
              values,
              submitForm,
              setFieldValue,
              setFieldTouched,
            }) => {
              return (
                <React.Fragment>
                  <Form style={{ backgroundColor: 'white', marginTop: 30 }}>
                    <Item stackedLabel error={errors.name && touched.name}>
                      {errors.name && touched.name ? (
                        <Label style={{ color: 'red' }}>{errors.name}</Label>
                      ) : (
                        <Label>Nombre</Label>
                      )}
                      <Input
                        value={values.name}
                        onBlur={() => setFieldTouched('name', true)}
                        onChangeText={text => setFieldValue('name', text)}
                      />
                    </Item>
                    <Item stackedLabel error={errors.price && touched.price}>
                      {errors.price && touched.price ? (
                        <Label style={{ color: 'red' }}>{errors.price}</Label>
                      ) : (
                        <Label>Precio</Label>
                      )}
                      <Input
                        keyboardType="numeric"
                        value={values.price}
                        onBlur={() => setFieldTouched('price', true)}
                        onChangeText={text => setFieldValue('price', text)}
                      />
                    </Item>
                    <Item
                      stackedLabel
                      error={errors.quantity && touched.quantity}
                    >
                      {errors.quantity && touched.quantity ? (
                        <Label style={{ color: 'red' }}>
                          {errors.quantity}
                        </Label>
                      ) : (
                        <Label>Cantidad disponible</Label>
                      )}
                      <Input
                        keyboardType="numeric"
                        value={values.quantity}
                        onBlur={() => setFieldTouched('quantity', true)}
                        onChangeText={text => setFieldValue('quantity', text)}
                      />
                    </Item>
                  </Form>

                  <List style={{ marginTop: 50, backgroundColor: 'white' }}>
                    <ListItem>
                      <Body>
                        {values.barCodeData ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <Button
                              style={{ paddingLeft: 0, marginLeft: 0 }}
                              danger
                              transparent
                              onPress={() => setFieldValue('barCodeData', null)}
                            >
                              <Text>Quitar codigo de barra:</Text>
                            </Button>
                            <Text>{values.barCodeData}</Text>
                          </View>
                        ) : (
                          <Button
                            transparent
                            onPress={() =>
                              this.setState({ showBarCodeScanner: true })
                            }
                          >
                            <Text>Agregar codigo de barra</Text>
                          </Button>
                        )}

                        {showBarCodeScanner ? (
                          <React.Fragment>
                            <BarCodeScanner
                              handleBarCodeRead={barCodeData => {
                                setFieldValue('barCodeData', barCodeData)
                                this.setState({ showBarCodeScanner: false })
                                return null
                              }}
                            />
                            <Button
                              danger
                              transparent
                              onPress={() =>
                                this.setState({ showBarCodeScanner: false })
                              }
                            >
                              <Text>Cancelar</Text>
                            </Button>
                          </React.Fragment>
                        ) : null}
                      </Body>
                    </ListItem>
                    <ListItem style={{ paddingVertical: 10 }}>
                      <Body>
                        <Text>Recibir notificationes de este producto:</Text>
                      </Body>
                      <Right>
                        <Switch
                          value={values.notifications}
                          onValueChange={val =>
                            setFieldValue('notifications', val)
                          }
                        />
                      </Right>
                    </ListItem>
                  </List>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 30,
                      justifyContent: 'space-around',
                    }}
                  >
                    {productId ? (
                      <React.Fragment>
                        <Button danger onPress={this._deleteProduct}>
                          <Text>Eliminar producto</Text>
                        </Button>
                        <Button onPress={submitForm}>
                          <Text>Guardar cambios</Text>
                        </Button>
                      </React.Fragment>
                    ) : (
                      <Button block onPress={submitForm}>
                        <Text>Crear producto</Text>
                      </Button>
                    )}
                  </View>
                </React.Fragment>
              )
            }}
          </Formik>
        </Content>
      </Container>
    )
  }

  _createProduct = (
    { name, price, quantity, notifications, barCodeData }: InitialValues,
    opts: FormikActions<InitialValues>
  ) => {
    const { createProduct, isOnline, addId, removeId, currentUser } = this.props

    if (
      !currentUser.isAdmin &&
      !currentUser.permissions.includes(UserPermissions.CREATE_PRODUCTS)
    ) {
      alert(
        'Acceso denegado',
        'Este usuario no tiene permisos para agregar productos.'
      )
      return
    }

    opts.resetForm()
    opts.setTouched({})
    opts.setErrors({})

    const optimisticId = ID()

    createProduct({
      variables: {
        name,
        notifications,
        barCodeData,
        quantity: parseInt(quantity),
        price: parseFloat(price),
      },
      optimisticResponse: {
        createProduct: {
          __typename: 'Product',
          id: optimisticId,
          name,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
          price: parseFloat(price),
          quantity: parseInt(quantity),
          __optimistic: true,
        } as CreateProductMutation['createProduct'] & OptimisticProp,
      },
      update(proxy, result) {
        const { createProduct } = result.data as CreateProductMutation & {
          createProduct: OptimisticProp
        }

        if (!isOnline && createProduct.__optimistic) {
          addId(optimisticId, true)

          alert(
            '',
            `Este producto se guardará hasta que la conneción a internet se restablezca.`
          )
        }

        if (!createProduct.__optimistic) {
          Toast.success('Exito')
          removeId(optimisticId)
        }

        let data = proxy.readQuery({
          query: GET_PRODUCTS,
        }) as getProductsQuery

        data.products = data.products.some(p => p.id === createProduct.id)
          ? data.products
          : [...data.products, createProduct]

        proxy.writeQuery({ query: GET_PRODUCTS, data })
      },
    })
  }

  _updateProduct = (values: InitialValues) => {
    const { updateProduct, isOnline, addId, removeId, currentUser } = this.props
    const { productId, product } = this.state

    if (!productId || !product) {
      return
    }

    if (
      !currentUser.isAdmin &&
      !currentUser.permissions.includes(UserPermissions.UPDATE_PRODUCTS)
    ) {
      alert(
        'Acceso denegado',
        'Este usuario no tiene permisos para editar productos.'
      )
      return
    }

    updateProduct({
      variables: {
        productId,
        name: values.name,
        notifications: values.notifications,
        price: parseFloat(values.price),
        quantity: parseInt(values.quantity),
        barCodeData: values.barCodeData,
      },
      optimisticResponse: {
        updateProduct: {
          __typename: 'Product',
          id: productId,
          createdAt: product.createdAt,
          updatedAt: new Date().toUTCString(),
          name: values.name,
          notifications: values.notifications,
          price: parseFloat(values.price),
          quantity: parseInt(values.quantity),
          __optimistic: true,
        } as UpdateProductMutation['updateProduct'] & OptimisticProp,
      },
      update: (store, result) => {
        const { updateProduct } = result.data as UpdateProductMutation & {
          updateProduct: OptimisticProp
        }

        if (!isOnline && updateProduct.__optimistic) {
          addId(productId)
          alert(
            '',
            '`Los cambios a este producto serán guardados hasta que la conneción se restablesca.`'
          )
        }

        if (!updateProduct.__optimistic) {
          removeId(productId)
        }

        let data = store.readQuery({
          query: GET_PRODUCTS,
        }) as getProductsQuery

        data.products = data.products.map(product => {
          if (product.id === productId) {
            return updateProduct
          }
          return product
        })

        store.writeQuery({
          query: GET_PRODUCTS,
          data,
        })
      },
    })
  }

  _deleteProduct = () => {
    const { navigation, deleteProduct, entries, currentUser } = this.props
    const { productId, product } = this.state

    if (!productId || !product) {
      return
    }

    if (
      !currentUser.isAdmin &&
      !currentUser.permissions.includes(UserPermissions.DELETE_PRODUCTS)
    ) {
      alert(
        'Acceso denegado',
        'Este usuario no tiene permisos para eliminar productos.'
      )
      return
    }

    const entry = entries.find(e => e.id === productId)
    if (entry && entry.isOnlyInCache) {
      alert(
        'Error',
        'Este producto no se puede eliminar aún por que no se ha guardado en la base de datos.'
      )
      return
    }

    const variables = {
      productId,
    }
    const confirmCb = () => {
      deleteProduct({
        variables,
        optimisticResponse: {
          deleteProduct: product,
        },
        update(proxy) {
          let data = proxy.readQuery({
            query: GET_PRODUCTS,
            variables,
          }) as getProductsQuery

          const newData = {
            ...data,
            products: data.products.filter(p => p.id !== productId),
          } as getProductsQuery

          proxy.writeQuery({ query: GET_PRODUCTS, data: newData })
          navigation.goBack()
        },
      })
    }

    alert(
      'Eliminar producto',
      '¿Estás seguro que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: confirmCb },
      ],
      { cancelable: false }
    )
  }
}

const EnhancedAddProduct = compose(
  withNavigation,
  withCurrentUser,
  withCreateProduct,
  withUpdateProduct,
  withDeleteProduct,
  withIsOnline,
  withPendingMutations
)(AddProduct)

EnhancedAddProduct.navigationOptions = ({
  navigation: {
    state: { params = {} },
  },
}: NavigationScreenProps) => ({
  title: params.productId ? 'Editar producto' : 'Agregar producto',
})

export default EnhancedAddProduct
