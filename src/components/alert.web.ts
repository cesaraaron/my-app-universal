import { Modal } from 'antd-mobile-rn'
import { Action } from '../../node_modules/antd-mobile-rn/lib/modal/PropsType'

const { alert: rawAlert } = Modal

export const alert = (
  title: string,
  message: string,
  actions?: Action<React.CSSProperties>[] | undefined
) => {
  if (!actions) {
    actions = [{ text: 'Ok' }]
  }
  rawAlert(title, message, actions)
}
