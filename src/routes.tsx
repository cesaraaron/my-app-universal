import React from 'react'
import {
  StackNavigator,
  TabNavigator,
  TabBarBottom,
  SwitchNavigator,
  Header,
  StackNavigatorConfig,
} from 'react-navigation'
import { Platform } from 'react-native'
import { Icon, View } from 'native-base'
import Login from './screens/Login'
import Database from './screens/Database'
import AddProduct from './screens/AddProduct'
import Settings from './screens/Settings'
import Users from './screens/Users'
import AddUser from './screens/AddUser'
import AddSale from './screens/AddSale'
import Sales from './screens/Sales'
import Statistics from './screens/Statistics'
import { IsOnlineConsumer, OfflineBanner } from './Providers/IsOnline'
import { isWeb } from './utils'

type IconType = 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome' | 'Entypo'

const androidNavigationOptions =
  Platform.OS === 'android'
    ? {
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#3F51B5',
        },
      }
    : {}

const stackOptions = {
  navigationOptions: {
    header: props => {
      return (
        <IsOnlineConsumer>
          {({ isOnline }) => (
            <View style={{ display: 'flex' }}>
              <Header {...props} />
              <OfflineBanner isOnline={isOnline} />
            </View>
          )}
        </IsOnlineConsumer>
      )
    },
    ...androidNavigationOptions,
  },
} as StackNavigatorConfig

const Home = TabNavigator(
  {
    Sales: StackNavigator({ Sales, AddSale }, stackOptions),
    Database: StackNavigator({ Database, AddProduct }, stackOptions),
    Statistics: StackNavigator({ Statistics }, stackOptions),
    Settings: StackNavigator({ Settings, Users, AddUser }, stackOptions),
  },
  {
    initialRouteName: 'Sales',
    swipeEnabled: isWeb ? false : true,
    tabBarPosition: 'bottom',
    tabBarOptions:
      Platform.OS === 'android'
        ? {
            activeTintColor: '#fff',
            inactiveTintColor: '#fff8',
            style: {
              backgroundColor: '#3F51B5',
            },
          }
        : undefined,
    tabBarComponent: TabBarBottom,

    navigationOptions: ({ navigation }) => {
      const { routeName } = navigation.state

      let label = ''
      let iconName = ''
      let iconType: IconType

      switch (routeName) {
        case 'Sales':
          label = 'Ventas'
          iconType = 'Ionicons'
          iconName = 'ios-cart'
          break
        case 'Database':
          label = 'Base de datos'
          iconName = 'database'
          iconType = 'Entypo'
          break
        case 'Statistics':
          label = 'Estadisticas'
          iconName = 'bar-chart'
          iconType = 'FontAwesome'
          break
        case 'Settings':
          label = 'Opciones'
          iconName = 'ios-settings'
          iconType = 'Ionicons'
          break
        default:
          break
      }

      return {
        tabBarLabel: label,
        tabBarIcon: ({ tintColor, focused }) => (
          <Icon
            name={iconName}
            type={iconType}
            active={focused}
            style={{ color: tintColor }}
            fontSize={25}
          />
        ),
      }
    },
  }
)

export const HomeRoute = 'Home'

export const RootNavigator = (props: { isSignedIn: boolean }) => {
  const Routes = SwitchNavigator(
    { Login, Home },
    { initialRouteName: props.isSignedIn ? 'Home' : 'Login' }
  )

  return <Routes />
}
