export type OptimisticProp = {
  __optimistic: boolean
}

export type PartialProduct = {
  id: string
  name: string
  quantity: number
}

export type NotificationData = {
  products?: PartialProduct[]
}
