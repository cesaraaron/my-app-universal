import { Modal } from 'antd-mobile'
import { Action } from '../../node_modules/antd-mobile/lib/modal/PropsType'

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
