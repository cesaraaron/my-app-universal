/* tslint:disable */
//  This file was automatically generated and should not be edited.

export enum UserPermissions {
  CREATE_PRODUCTS = 'CREATE_PRODUCTS',
  CREATE_SALES = 'CREATE_SALES',
  DELETE_PRODUCTS = 'DELETE_PRODUCTS',
  DELETE_SALES = 'DELETE_SALES',
  UPDATE_PRODUCTS = 'UPDATE_PRODUCTS',
}

export enum MutationType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED',
}

export interface CartProductCreateInput {
  productId: string
  name: string
  price: number
  quantitySold: number
}

export interface NotificationsCreateInput {
  fireWhen?: number | null
  devices?: NotificationsCreatedevicesInput | null
}

export interface NotificationsCreatedevicesInput {
  set?: Array<string> | null
}

export interface NotificationsUpdateInput {
  fireWhen?: number | null
  devices?: NotificationsUpdatedevicesInput | null
}

export interface NotificationsUpdatedevicesInput {
  set?: Array<string> | null
}

export enum LogType {
  ERROR = 'ERROR',
}

export interface MeQuery {
  me: {
    __typename: 'User'
    id: string
    name: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
    notifications: {
      __typename: 'Notifications'
      fireWhen: number
      devices: Array<string>
    }
    permissions: Array<UserPermissions>
    isAdmin: boolean | null
  } | null
}

export interface LoginMutationVariables {
  phoneNumber: string
  password: string
}

export interface LoginMutation {
  login: {
    __typename: 'AuthPayload'
    token: string
    user: {
      __typename: 'User'
      id: string
      name: string
      phoneNumber: string
      createdAt: string
      updatedAt: string
      notifications: {
        __typename: 'Notifications'
        fireWhen: number
        devices: Array<string>
      }
      permissions: Array<UserPermissions>
      isAdmin: boolean | null
    } | null
  }
}

export interface getProductsQuery {
  products: Array<{
    __typename: 'Product'
    id: string
    name: string
    createdAt: string
    updatedAt: string
    quantity: number
    price: number
  }>
}

export interface ProductSubscription {
  product: {
    __typename: 'ProductSubscriptionPayload'
    mutation: MutationType
    node: {
      __typename: 'Product'
      id: string
      name: string
      createdAt: string
      updatedAt: string
      quantity: number
      price: number
    } | null
  } | null
}

export interface CreateProductMutationVariables {
  name: string
  price: number
  quantity: number
}

export interface CreateProductMutation {
  createProduct: {
    __typename: 'Product'
    id: string
    name: string
    createdAt: string
    updatedAt: string
    quantity: number
    price: number
  } | null
}

export interface UpdateProductMutationVariables {
  productId: string
  name?: string | null
  price?: number | null
  quantity?: number | null
}

export interface UpdateProductMutation {
  updateProduct: {
    __typename: 'Product'
    id: string
    name: string
    createdAt: string
    updatedAt: string
    quantity: number
    price: number
  } | null
}

export interface DeleteProductMutationVariables {
  productId: string
}

export interface DeleteProductMutation {
  deleteProduct: {
    __typename: 'Product'
    id: string
  } | null
}

export interface getSalesQuery {
  sales: Array<{
    __typename: 'Sale'
    id: string
    createdAt: string
    updatedAt: string
    products: Array<{
      __typename: 'CartProduct'
      productId: string
      name: string
      price: number
      quantitySold: number
    }>
    soldBy: {
      __typename: 'User'
      id: string
      name: string
      lastName: string | null
    }
  }>
}

export interface SaleSubscription {
  sale: {
    __typename: 'SaleSubscriptionPayload'
    mutation: MutationType
    node: {
      __typename: 'Sale'
      id: string
      createdAt: string
      updatedAt: string
      products: Array<{
        __typename: 'CartProduct'
        productId: string
        name: string
        price: number
        quantitySold: number
      }>
      soldBy: {
        __typename: 'User'
        id: string
        name: string
        lastName: string | null
      }
    } | null
  } | null
}

export interface CreateSaleMutationVariables {
  cartProducts: Array<CartProductCreateInput>
}

export interface CreateSaleMutation {
  createSale: {
    __typename: 'Sale'
    id: string
    createdAt: string
    updatedAt: string
    products: Array<{
      __typename: 'CartProduct'
      productId: string
      name: string
      price: number
      quantitySold: number
    }>
    soldBy: {
      __typename: 'User'
      id: string
      name: string
      lastName: string | null
    }
  } | null
}

export interface DeleteSaleMutationVariables {
  saleId: string
}

export interface DeleteSaleMutation {
  deleteSale: {
    __typename: 'Sale'
    id: string
  } | null
}

export interface getUsersQuery {
  users: Array<{
    __typename: 'User'
    id: string
    name: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
    notifications: {
      __typename: 'Notifications'
      fireWhen: number
      devices: Array<string>
    }
    permissions: Array<UserPermissions>
    isAdmin: boolean | null
  }>
}

export interface UserSubscription {
  user: {
    __typename: 'UserSubscriptionPayload'
    mutation: MutationType
    node: {
      __typename: 'User'
      id: string
      name: string
      phoneNumber: string
      createdAt: string
      updatedAt: string
      notifications: {
        __typename: 'Notifications'
        fireWhen: number
        devices: Array<string>
      }
      permissions: Array<UserPermissions>
      isAdmin: boolean | null
    } | null
  } | null
}

export interface CreateUserMutationVariables {
  name: string
  phoneNumber: string
  password: string
  notifications?: NotificationsCreateInput | null
  permissions?: Array<UserPermissions | null> | null
}

export interface CreateUserMutation {
  createUser: {
    __typename: 'User'
    id: string
    name: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
    notifications: {
      __typename: 'Notifications'
      fireWhen: number
      devices: Array<string>
    }
    permissions: Array<UserPermissions>
    isAdmin: boolean | null
  } | null
}

export interface UpdateUserMutationVariables {
  userId: string
  name?: string | null
  phoneNumber?: string | null
  password?: string | null
  notifications?: NotificationsUpdateInput | null
  permissions?: Array<UserPermissions | null> | null
}

export interface UpdateUserMutation {
  updateUser: {
    __typename: 'User'
    id: string
    name: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
    notifications: {
      __typename: 'Notifications'
      fireWhen: number
      devices: Array<string>
    }
    permissions: Array<UserPermissions>
    isAdmin: boolean | null
  } | null
}

export interface DeleteUserMutationVariables {
  userId: string
}

export interface DeleteUserMutation {
  deleteUser: {
    __typename: 'User'
    id: string
  } | null
}

export interface CreateLogMutationVariables {
  message: string
  type: LogType
}

export interface CreateLogMutation {
  createLog: {
    __typename: 'Log'
    createdAt: string
    message: string
  } | null
}

export interface SaveDeviceTokenMutationVariables {
  token: string
}

export interface SaveDeviceTokenMutation {
  saveDeviceToken: {
    __typename: 'User'
    id: string
  } | null
}

export interface RemoveDeviceTokenMutationVariables {
  token: string
}

export interface RemoveDeviceTokenMutation {
  removeDeviceToken: {
    __typename: 'User'
    id: string
  } | null
}

export interface UpdateNotisMutationVariables {
  fireWhen: number
}

export interface UpdateNotisMutation {
  updateNotis: {
    __typename: 'User'
    notifications: {
      __typename: 'Notifications'
      fireWhen: number
    }
  } | null
}

export interface UserFragment {
  __typename: 'User'
  id: string
  name: string
  phoneNumber: string
  createdAt: string
  updatedAt: string
  notifications: {
    __typename: 'Notifications'
    fireWhen: number
    devices: Array<string>
  }
  permissions: Array<UserPermissions>
  isAdmin: boolean | null
}

export interface ProductFragment {
  __typename: 'Product'
  id: string
  name: string
  createdAt: string
  updatedAt: string
  quantity: number
  price: number
}

export interface SaleFragment {
  __typename: 'Sale'
  id: string
  createdAt: string
  updatedAt: string
  products: Array<{
    __typename: 'CartProduct'
    productId: string
    name: string
    price: number
    quantitySold: number
  }>
  soldBy: {
    __typename: 'User'
    id: string
    name: string
    lastName: string | null
  }
}
