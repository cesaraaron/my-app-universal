# my-app-universal
An example of an inventory app to administrate small business that runs in ios, android, linux, mac & windows.

# Getting started
### Prerequisites
- Node >= 8
- Yarn
- Install the graphql-yoga server [from here.][1]


### Installing

```sh
$ git clone https://github.com/cesaraaron/my-app-universal
$ cd my-app-universal
$ yarn install
```

# Scripts
### `yarn start:mobile`
Runs the mobile app in development mode, open it in the [Expo app](https://expo.io) on your phone to view it.

### `yarn start:desktop`
Runs the desktop app in development mode using [electron](https://electronjs.org/).

> In the login screen use '123456' for user & password if you haven't added a user in the graphql-yoga server.

### `yarn generate`
You should run this command when changing the graphql schema in the server or adding a query in the `src/queries.ts` file to regenerate the `src/__generated__/types.ts`

> Before running this command run 'yarn dev' in the [graphql server][1]


# Deployment
1. Deploy first the [server][1].
2. Create a `.env.production` file on the root directory with the ip of your server. E.g:

```
HTTP_ENDPOINT="http://54.210.243.224:4000/"
WS_ENDPOINT="ws://54.210.243.224:4000/"
```

3. Build the apps

```sh
# Ios app
$ npx exp build:ios

# Android app
$ npx exp build:android

# Desktop apps
$ yarn electron-pack
```

If you need to build the desktop app for a specific platform:
```sh
$ yarn electron-pack --win
$ yarn electron-pack --mac
$ yarn electron-pack --linux
```


### Auto updating
The mobile app can auto update outside the box through [OTA updates](https://docs.expo.io/versions/latest/guides/configuring-ota-updates).

For the desktop updates you need configure either your own generic server or use a custom provider like github. We are gonna be configuring the former.

First off, connect to your server using ssh and run:

```sh
$ git clone https://github.com/cesaraaron/my-app-universal && cd my-app-universal
$ yarn install
```

Now you need to get the ip of your server and update the [./electron-builder.json](./electron-builder.json) [publish.url field](https://www.electron.build/configuration/publish) with your server ip.

To do it automatically:


```sh
$ yarn update-ip ip=${your server ip here}
```

> The express server for auto updates runs on port `3333` so If you're gonna add it manually make sure to add the `3333` port to the ip.

Then:

```sh
# Build the binaries
$ yarn electron-pack

# Build the auto update server
$ yarn updates-server

# Run the auto update server in the background with pm2
$ npx pm2 start electron-builder-server.prod.js

```

Now you can download your binaries under `http://${your ip}:3333/${name of the binary}`.


# Built with
- [react](https://github.com/facebook/react)
- [react-native](https://github.com/facebook/react-native)
- [react-native-web](https://github.com/necolas/react-native-web)
- [react-navigation](https://github.com/react-navigation/react-navigation)
- [native-base](https://github.com/GeekyAnts/NativeBase)
- [ant-design](https://github.com/ant-design/ant-design)
- [apollo-client](https://github.com/apollographql/apollo-client)
- [expo](https://github.com/expo/expo)
- [electron](https://github.com/electron/electron)


# License
This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details


[1]: https://github.com/cesaraaron/my-app-server
