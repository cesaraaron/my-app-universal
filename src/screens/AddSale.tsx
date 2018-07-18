import React, { Component } from 'react'
import {
  Container,
  Content,
  List,
  Text,
  ListItem,
  Body,
  Right,
  View,
  Button,
} from 'native-base'
import { TextInput, Keyboard } from 'react-native'
import { NavigationScreenProps, withNavigation } from 'react-navigation'
import {
  ProductsQueryProps,
  SaleType,
  ProductType,
  CreateSaleMutationProp,
  withCreateSale,
  DeleteSaleMutationProp,
  withDeleteSale,
  createWithProducts,
} from '../HOCs'
import { searchProductWithQuery, ID, isWeb } from '../utils'
import Loading from '../components/Loading'
import { FetchError } from '../components/FetchError'
import { compose } from 'react-apollo'
import {
  UserPermissions,
  getSalesQuery,
  CreateSaleMutation,
  getProductsQuery,
} from '../__generated__/types'
import { GET_SALES, GET_PRODUCTS } from '../queries'
import { withIsOnline, WithIsOnlineProps } from '../Providers/IsOnline'
import { OptimisticProp } from '../types'
import {
  withPendingMutations,
  PendingMutationsInjectProps,
} from '../Providers/PendingMutations'
import { withCurrentUser, WithCurrentUserProps } from '../Providers/CurrentUser'
import { Modal } from 'antd-mobile-rn'
import { alert } from '../components/alert'

const { prompt } = Modal

type Partial<T> = { [P in keyof T]?: T[P] }

type addProductToCart = {
  productId: string
  quantity: number
  initialQuantity?: number
}

type AddSaleProps = NavigationScreenProps<{ sale: SaleType & OptimisticProp }> &
  ProductsQueryProps &
  WithCurrentUserProps &
  CreateSaleMutationProp &
  DeleteSaleMutationProp &
  WithIsOnlineProps &
  PendingMutationsInjectProps

type CartProductWithTypeName = SaleType['products'][0]

type CartProduct = {
  productId: string
  name: string
  price: number
  quantitySold: number
}

type AddSaleState = {
  sale?: SaleType & OptimisticProp
  saleId?: string
  cartProducts: CartProduct[]
  products: ProductType[]
  query: string
}

class AddSale extends Component<AddSaleProps, AddSaleState> {
  static getDerivedStateFromProps(
    { feedProducts: { error, loading, products } }: AddSaleProps,
    { products: prevProducts }: AddSaleState
  ): Partial<AddSaleState> | null {
    if (prevProducts.length > 0 || error || loading) {
      return null
    }

    if (products) {
      return {
        products,
      }
    }

    return null
  }

  constructor(props: AddSaleProps) {
    super(props)
    const sale = props.navigation.getParam('sale')

    if (sale && sale.products) {
      this.state = {
        sale,
        saleId: sale.id,
        cartProducts: sale.products,
        query: '',
        products: [],
      }
    } else {
      this.state = {
        cartProducts: [],
        query: '',
        products: [],
      }
    }
  }

  render() {
    const {
      feedProducts: { error, loading, refetch },
      isOnline,
    } = this.props
    const { saleId, query } = this.state

    if (loading && isOnline) {
      return <Loading />
    }

    if (error) {
      return <FetchError refetch={refetch} error={error} />
    }

    return (
      <Container>
        {saleId ? null : (
          <TextInput
            ref={node => {
              if (!node) {
                return
              }
            }}
            value={query}
            style={{ fontSize: 17, padding: 10, paddingVertical: 20 }}
            autoCapitalize="none"
            placeholder="Buscar producto por nombre, marca etc."
            onChangeText={text => this.setState({ query: text })}
          />
        )}

        <Content style={{ backgroundColor: '#f4f4f4' }}>
          <List style={{ backgroundColor: 'white' }}>
            {this._renderSearchResults()}
            {this._renderCar()}
            {this._renderTotal()}
          </List>
          {this._renderFooterButtons()}
        </Content>
      </Container>
    )
  }

  _renderSearchResults = () => {
    const { query, cartProducts, products } = this.state
    const cartProductIds = cartProducts.map(c => c.productId)

    // The cart list and the search list cannot have the same product
    const productsToShow = products.filter(p => !cartProductIds.includes(p.id))
    let searchResults = searchProductWithQuery(productsToShow, query)

    if (!query) {
      searchResults = []
    }

    return (
      <React.Fragment>
        {searchResults.length ? (
          <ListItem itemDivider>
            <Text style={{ marginTop: 20 }}>Resultados de la busqueda:</Text>
          </ListItem>
        ) : null}

        {searchResults.map(product => {
          return (
            <ListItem
              key={product.id}
              onPress={() => {
                if (!isWeb) {
                  Keyboard.dismiss()
                }
                prompt(
                  'Cantidad a vender',
                  '',
                  [
                    {
                      text: 'Cancelar',
                    },
                    {
                      text: 'Agregar',
                      onPress: (quantity: string) =>
                        this._addProductToCart({
                          productId: product.id,
                          quantity: parseInt(quantity),
                        }),
                    },
                  ],
                  null
                )
              }}
            >
              <Text>{product.name || 'Sin nombre'}</Text>
            </ListItem>
          )
        })}
      </React.Fragment>
    )
  }

  _renderCar = () => {
    const { cartProducts, saleId } = this.state

    return (
      <React.Fragment>
        {cartProducts.length ? (
          <ListItem itemDivider>
            <Text style={{ marginTop: 20 }}>Carrito</Text>
          </ListItem>
        ) : null}

        {cartProducts.map(cartProduct => {
          return (
            <ListItem
              key={cartProduct.productId}
              onPress={() => {
                if (saleId) {
                  return
                }
                if (!isWeb) {
                  Keyboard.dismiss()
                }

                prompt(
                  'Modificar cantidad',
                  '',
                  [
                    {
                      text: 'Eliminar',
                      onPress: () =>
                        this._deleteProductFromCart(cartProduct.productId),
                    },
                    {
                      text: 'Actualizar',
                      onPress: (quantity: string) =>
                        this._addProductToCart({
                          productId: cartProduct.productId,
                          quantity: parseInt(quantity),
                          initialQuantity: cartProduct.quantitySold,
                        }),
                    },
                  ],
                  null,
                  String(cartProduct.quantitySold)
                )
              }}
            >
              <Body>
                <Text>{cartProduct.name}</Text>
                <Text note>Lps. {cartProduct.price} c/u</Text>
              </Body>
              <Right>
                <Text note>{`${cartProduct.quantitySold} ${
                  cartProduct.quantitySold === 1 ? 'unidad' : 'unidades'
                }`}</Text>
              </Right>
            </ListItem>
          )
        })}
      </React.Fragment>
    )
  }

  _renderTotal = () => {
    const { cartProducts } = this.state

    const total = cartProducts.reduce((prev, current) => {
      return prev + current.price * current.quantitySold
    }, 0)

    return (
      <React.Fragment>
        <ListItem itemDivider>
          <Text style={{ marginTop: 20 }}>Total</Text>
        </ListItem>
        <ListItem>
          <Body>
            <Text>Total:</Text>
          </Body>
          <Right>
            <Text note>Lps. {total}</Text>
          </Right>
        </ListItem>
      </React.Fragment>
    )
  }

  _renderFooterButtons = () => {
    const { navigation } = this.props
    const { saleId } = this.state
    return (
      <View
        style={{
          flexDirection: 'row',
          marginTop: 30,
          justifyContent: 'space-around',
        }}
      >
        <Button
          danger
          onPress={() => {
            if (saleId) {
              this._deleteSale()
            } else {
              navigation.goBack()
            }
          }}
        >
          <Text>{saleId ? 'Eliminar venta' : 'Cancelar'}</Text>
        </Button>
        {saleId ? null : (
          <Button onPress={() => this._createSale()}>
            <Text>Agregar venta</Text>
          </Button>
        )}
      </View>
    )
  }

  _addProductToCart = ({
    productId,
    quantity,
    initialQuantity = 0,
  }: addProductToCart) => {
    const { cartProducts, products } = this.state

    const quantityToAdd = quantity || 1

    let [productToAdd] = products.filter(p => p.id === productId)

    let quantityAvailable = productToAdd.quantity + initialQuantity

    if (quantityToAdd > quantityAvailable) {
      setTimeout(() => {
        alert(
          '',
          quantityAvailable === 0
            ? `El producto "${productToAdd.name}" tiene 0 unidades disponibles`
            : `El producto "${
                productToAdd.name
              }" solo tiene "${quantityAvailable}" unidades disponibles en el inventario. Usted esta intentado agregar "${quantityToAdd}".`
        )
      }, 1000)
      return
    }

    quantityAvailable -= quantityToAdd

    const cartProductToAdd: CartProduct = {
      productId: productToAdd.id,
      name: productToAdd.name,
      quantitySold: quantityToAdd,
      price: productToAdd.price,
    }

    const currentProductExists = cartProducts.find(
      p => p.productId === productId
    )

    this.setState(({ products }) => ({
      cartProducts: currentProductExists
        ? cartProducts.map(cartProduct => {
            if (cartProduct.productId === productId) {
              return cartProductToAdd
            }
            return cartProduct
          })
        : [...cartProducts, cartProductToAdd],
      products: products.map(product => {
        if (product.id === productId) {
          return { ...product, quantity: quantityAvailable }
        }
        return product
      }),
    }))
  }

  _deleteProductFromCart = (productId: string) => {
    const { cartProducts } = this.state

    this.setState({
      cartProducts: cartProducts.filter(p => p.productId !== productId),
    })
  }

  _createSale = () => {
    const {
      createSale,
      currentUser,
      navigation,
      isOnline,
      addId,
      removeId,
    } = this.props
    const { cartProducts, products } = this.state

    if (!cartProducts.length) {
      alert(
        'Error',
        'Agrega un producto o mas al carrito para poder hacer la venta.'
      )
      return
    }

    if (
      !currentUser.isAdmin &&
      !currentUser.permissions.includes(UserPermissions.CREATE_SALES)
    ) {
      alert(
        'Acceso denegado',
        'Este usuario no tiene permisos para agregar ventas.'
      )
      return
    }
    const optimisticId = ID()
    createSale({
      variables: {
        cartProducts,
      },
      optimisticResponse: {
        createSale: {
          __optimistic: true,
          __typename: 'Sale',
          id: optimisticId,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
          products: cartProducts.map(p => ({
            ...p,
            __typename: 'CartProduct' as CartProductWithTypeName['__typename'],
          })),
          soldBy: {
            __typename: 'User',
            id: currentUser.id,
            name: currentUser.name,
            lastName: '',
          },
        } as CreateSaleMutation['createSale'] & OptimisticProp,
      },
      update: (proxy, result) => {
        const { createSale } = result.data as CreateSaleMutation & {
          createSale: OptimisticProp
        }

        if (!isOnline && createSale.__optimistic) {
          addId(optimisticId, true)
          alert(
            '',
            'Esta venta se guardara hasta que la conneción a internet se restablesca'
          )
        }

        if (!createSale.__optimistic) {
          removeId(optimisticId)
        }

        const data = proxy.readQuery({ query: GET_SALES }) as getSalesQuery

        data.sales = [createSale, ...data.sales]

        proxy.writeQuery({ query: GET_SALES, data })
        proxy.writeQuery({
          query: GET_PRODUCTS,
          data: { products } as getProductsQuery,
        })
        navigation.goBack()
      },
    })
  }

  _deleteSale = () => {
    const { deleteSale, currentUser, navigation, entries } = this.props
    const { sale } = this.state

    if (!sale) {
      return
    }

    if (entries.find(e => e.id === sale.id)) {
      alert(
        'Error',
        'Esta venta no se puede eliminar aún por que no se ha guardado en la base de datos.'
      )
      return
    }

    if (
      !currentUser.isAdmin &&
      !currentUser.permissions.includes(UserPermissions.DELETE_SALES)
    ) {
      alert(
        'Acceso denegado',
        'Este usuario no tiene permisos para eliminar ventas.'
      )
      return
    }

    const confirmCb = () => {
      deleteSale({
        variables: {
          saleId: sale.id,
        },
        optimisticResponse: {
          deleteSale: sale,
        },
        update(proxy) {
          const data = proxy.readQuery({ query: GET_SALES }) as getSalesQuery

          const newData = {
            ...data,
            sales: data.sales.filter(s => s.id !== sale.id),
          } as getSalesQuery

          proxy.writeQuery({
            query: GET_SALES,
            data: newData,
          })

          navigation.goBack()
        },
      })
    }

    alert(
      'Eliminar venta',
      '¿Estás seguro que deseas eliminar esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: confirmCb },
      ],
      { cancelable: false }
    )
  }
}

const EnhancedAddSale = compose(
  withNavigation,
  withCurrentUser,
  createWithProducts({}),
  withCreateSale,
  withDeleteSale,
  withIsOnline,
  withPendingMutations
)(AddSale)

export default EnhancedAddSale
