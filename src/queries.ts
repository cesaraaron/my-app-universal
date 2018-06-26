import gql from 'graphql-tag'

const UserFragments = gql`
  fragment User on User {
    id
    name
    phoneNumber
    createdAt
    updatedAt
    notifications {
      fireWhen
      devices
    }
    permissions
    isAdmin
  }
`

const ProductFragments = gql`
  fragment Product on Product {
    id
    name
    createdAt
    updatedAt
    quantity
    price
  }
`

const SaleFragments = gql`
  fragment Sale on Sale {
    id
    createdAt
    updatedAt
    products {
      productId
      name
      price
      quantitySold
    }
    soldBy {
      id
      name
      lastName
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      ...User
    }
  }
  ${UserFragments}
`

export const LOGIN_MUTATION = gql`
  mutation Login($phoneNumber: String!, $password: String!) {
    login(phoneNumber: $phoneNumber, password: $password) {
      token
      user {
        ...User
      }
    }
  }
  ${UserFragments}
`

export const GET_PRODUCTS = gql`
  query getProducts {
    products {
      ...Product
    }
  }
  ${ProductFragments}
`

export const PRODUCT_SUBSCRIPTION = gql`
  subscription Product {
    product {
      mutation
      node {
        id
        name
        createdAt
        updatedAt
        quantity
        price
      }
    }
  }
`

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($name: String!, $price: Float!, $quantity: Int!) {
    createProduct(name: $name, price: $price, quantity: $quantity) {
      ...Product
    }
  }
  ${ProductFragments}
`

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct(
    $productId: String!
    $name: String
    $price: Float
    $quantity: Int
  ) {
    updateProduct(
      productId: $productId
      name: $name
      price: $price
      quantity: $quantity
    ) {
      ...Product
    }
  }
  ${ProductFragments}
`

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($productId: String!) {
    deleteProduct(productId: $productId) {
      id
    }
  }
`

export const GET_SALES = gql`
  query getSales {
    sales {
      ...Sale
    }
  }
  ${SaleFragments}
`

export const SALE_SUBSCRIPTION = gql`
  subscription Sale {
    sale {
      mutation
      node {
        id
        createdAt
        updatedAt
        products {
          productId
          name
          price
          quantitySold
        }
        soldBy {
          id
          name
          lastName
        }
      }
    }
  }
`

export const CREATE_SALE_MUTATION = gql`
  mutation CreateSale($cartProducts: [CartProductCreateInput!]!) {
    createSale(cartProducts: $cartProducts) {
      ...Sale
    }
  }
  ${SaleFragments}
`

export const DELETE_SALE_MUTATION = gql`
  mutation DeleteSale($saleId: String!) {
    deleteSale(saleId: $saleId) {
      id
    }
  }
`

export const GET_USERS = gql`
  query getUsers {
    users {
      ...User
    }
  }
  ${UserFragments}
`

export const USER_SUBSCRIPTION = gql`
  subscription User {
    user {
      mutation
      node {
        id
        name
        phoneNumber
        createdAt
        updatedAt
        notifications {
          fireWhen
          devices
        }
        permissions
        isAdmin
      }
    }
  }
`

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $name: String!
    $phoneNumber: String!
    $password: String!
    $notifications: NotificationsCreateInput
    $permissions: [UserPermissions]
  ) {
    createUser(
      name: $name
      phoneNumber: $phoneNumber
      password: $password
      notifications: $notifications
      permissions: $permissions
    ) {
      ...User
    }
  }
  ${UserFragments}
`

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $userId: String!
    $name: String
    $phoneNumber: String
    $password: String
    $notifications: NotificationsUpdateInput
    $permissions: [UserPermissions]
  ) {
    updateUser(
      userId: $userId
      name: $name
      phoneNumber: $phoneNumber
      password: $password
      notifications: $notifications
      permissions: $permissions
    ) {
      ...User
    }
  }
  ${UserFragments}
`

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId) {
      id
    }
  }
`

export const CREATE_LOG_MUTATION = gql`
  mutation CreateLog($message: String!, $type: LogType!) {
    createLog(message: $message, type: $type) {
      createdAt
      message
    }
  }
`

export const SAVE_DEVICE_TOKEN_MUTATION = gql`
  mutation SaveDeviceToken($token: String!) {
    saveDeviceToken(token: $token) {
      id
    }
  }
`

export const REMOVE_DEVICE_TOKEN = gql`
  mutation RemoveDeviceToken($token: String!) {
    removeDeviceToken(token: $token) {
      id
    }
  }
`
