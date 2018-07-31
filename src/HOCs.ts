import {
  graphql,
  ChildMutateProps,
  ChildDataProps,
  OperationOption,
} from 'react-apollo'
import {
  LOGIN_MUTATION,
  GET_PRODUCTS,
  UPDATE_USER_MUTATION,
  GET_USERS,
  CREATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  CREATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  CREATE_SALE_MUTATION,
  DELETE_SALE_MUTATION,
  GET_SALES,
  ME_QUERY,
  SAVE_DEVICE_TOKEN_MUTATION,
  REMOVE_DEVICE_TOKEN,
} from './queries'
import {
  LoginMutation,
  LoginMutationVariables,
  getProductsQuery,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  getUsersQuery,
  CreateUserMutation,
  CreateUserMutationVariables,
  DeleteUserMutation,
  DeleteUserMutationVariables,
  CreateProductMutation,
  CreateProductMutationVariables,
  DeleteProductMutation,
  DeleteProductMutationVariables,
  UpdateProductMutation,
  UpdateProductMutationVariables,
  CreateSaleMutation,
  CreateSaleMutationVariables,
  DeleteSaleMutation,
  DeleteSaleMutationVariables,
  getSalesQuery,
  CreateLogMutation,
  CreateLogMutationVariables,
  MeQuery,
  SaveDeviceTokenMutation,
  SaveDeviceTokenMutationVariables,
  RemoveDeviceTokenMutation,
  RemoveDeviceTokenMutationVariables,
} from './__generated__/types'

// Me
type MeDataProps = ChildDataProps<{}, MeQuery, {}>

export const withMe = graphql<MeDataProps>(ME_QUERY, {
  options: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    pollInterval: 30000,
  },
})

export type MeProps = MeDataProps

// Login
type withLoginProps = ChildMutateProps<
  {},
  LoginMutation,
  LoginMutationVariables
>

export type LoginMutationProps = {
  loginMutation: withLoginProps['mutate']
}

export const withLogin = graphql<withLoginProps>(LOGIN_MUTATION, {
  name: 'loginMutation',
})

// Products
export type ProductType = getProductsQuery['products'][0]

type withProductsProps = ChildDataProps<{}, getProductsQuery, {}>

export const createWithProducts = (
  opts: OperationOption<{}, withProductsProps>['options']
) =>
  graphql<withProductsProps>(GET_PRODUCTS, {
    name: 'feedProducts',
    options: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      ...opts,
    },
  })

export const withProducts = createWithProducts({ pollInterval: 30000 })

export type ProductsQueryProps = {
  feedProducts: withProductsProps['data']
}

type withCreateProductProps = ChildMutateProps<
  {},
  CreateProductMutation,
  CreateProductMutationVariables
>
export const withCreateProduct = graphql<withCreateProductProps>(
  CREATE_PRODUCT_MUTATION,
  {
    name: 'createProduct',
  }
)

export type CreateProductMutationProp = {
  createProduct: withCreateProductProps['mutate']
}

type withUpdateProductProps = ChildMutateProps<
  {},
  UpdateProductMutation,
  UpdateProductMutationVariables
>
export const withUpdateProduct = graphql<withUpdateProductProps>(
  UPDATE_PRODUCT_MUTATION,
  {
    name: 'updateProduct',
  }
)

export type UpdateProductMutationProp = {
  updateProduct: withUpdateProductProps['mutate']
}

type withDeleteProductProps = ChildMutateProps<
  {},
  DeleteProductMutation,
  DeleteProductMutationVariables
>
export const withDeleteProduct = graphql<withDeleteProductProps>(
  DELETE_PRODUCT_MUTATION,
  {
    name: 'deleteProduct',
  }
)

export type DeleteProductMutationProp = {
  deleteProduct: withDeleteProductProps['mutate']
}

// Sales
export type SaleType = getSalesQuery['sales'][0]

export const createWithSales = (
  opts: OperationOption<{}, withSalesProps>['options']
) =>
  graphql<withSalesProps>(GET_SALES, {
    name: 'feedSales',
    options: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      ...opts,
    },
  })

type withSalesProps = ChildDataProps<{}, getSalesQuery, {}>
export const withSales = createWithSales({ pollInterval: 30000 })

export type SalesQueryProp = {
  feedSales: withSalesProps['data']
}

type withCreateSaleProps = ChildMutateProps<
  {},
  CreateSaleMutation,
  CreateSaleMutationVariables
>
export const withCreateSale = graphql<withCreateSaleProps>(
  CREATE_SALE_MUTATION,
  {
    name: 'createSale',
  }
)

export type CreateSaleMutationProp = {
  createSale: withCreateSaleProps['mutate']
}

type withDeleteSaleProps = ChildMutateProps<
  {},
  DeleteSaleMutation,
  DeleteSaleMutationVariables
>
export const withDeleteSale = graphql<withDeleteSaleProps>(
  DELETE_SALE_MUTATION,
  {
    name: 'deleteSale',
  }
)

export type DeleteSaleMutationProp = {
  deleteSale: withDeleteSaleProps['mutate']
}

// Users
export type UserType = getUsersQuery['users'][0]

type withUpdateUserProps = ChildMutateProps<
  {},
  UpdateUserMutation,
  UpdateUserMutationVariables
>
export type UpdateUserMutationProps = {
  updateUser: withUpdateUserProps['mutate']
}

export const withUpdateUser = graphql<withUpdateUserProps>(
  UPDATE_USER_MUTATION,
  {
    name: 'updateUser',
  }
)

type withUsersProps = ChildDataProps<{}, getUsersQuery, {}>
export const withUsers = graphql<withUsersProps>(GET_USERS, {
  name: 'usersFeed',
  options: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    pollInterval: 30000,
  },
})

export type UsersQueryProps = {
  usersFeed: withUsersProps['data']
}

type withCreateUserProps = ChildMutateProps<
  {},
  CreateUserMutation,
  CreateUserMutationVariables
>

export type CreateUserMutationProps = {
  createUser: withCreateUserProps['mutate']
}

export const withCreateUser = graphql<withCreateUserProps>(
  CREATE_USER_MUTATION,
  {
    name: 'createUser',
  }
)

type withDeleteUserProps = ChildMutateProps<
  {},
  DeleteUserMutation,
  DeleteUserMutationVariables
>

export type DeleteUserMutationProps = {
  deleteUser: withDeleteUserProps['mutate']
}

export const withDeleteUser = graphql<withDeleteUserProps>(
  DELETE_USER_MUTATION,
  {
    name: 'deleteUser',
  }
)

// Logs
type withCreateLog = ChildMutateProps<
  {},
  CreateLogMutation,
  CreateLogMutationVariables
>

export const withCreateLog = graphql<withCreateLog>(CREATE_USER_MUTATION, {
  name: 'createLog',
})

export type CreateLogMutationProps = {
  createLog: withCreateLog['mutate']
}

// device tokens
// save
type withSaveDeviceToken = ChildMutateProps<
  {},
  SaveDeviceTokenMutation,
  SaveDeviceTokenMutationVariables
>

export const withSaveDeviceToken = graphql<withSaveDeviceToken>(
  SAVE_DEVICE_TOKEN_MUTATION,
  {
    name: 'saveDeviceToken',
  }
)

export type SaveDeviceTokenMutationProps = {
  saveDeviceToken: withSaveDeviceToken['mutate']
}

// delete
type withRemoveDeviceToken = ChildMutateProps<
  {},
  RemoveDeviceTokenMutation,
  RemoveDeviceTokenMutationVariables
>

export const withRemoveDeviceToken = graphql<withRemoveDeviceToken>(
  REMOVE_DEVICE_TOKEN,
  {
    name: 'removeDeviceToken',
  }
)

export type RemoveDeviceTokenMutationProps = {
  removeDeviceToken: withRemoveDeviceToken['mutate']
}
