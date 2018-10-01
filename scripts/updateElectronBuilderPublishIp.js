const fs = require('fs')
const path = require('path')
const electronBuilderConfig = require('../electron-builder')
const argv = require('yargs').argv

if (!argv.ip) {
  throw new Error(
    'You need to pass the --ip argument to the command. E.g: `yarn update-ip --ip=52.33.444.3454`'
  )
}

electronBuilderConfig.publish.url = `http://${argv.ip}:3333/`

fs.writeFileSync(
  path.join(process.cwd(), 'electron-builder.json'),
  JSON.stringify(electronBuilderConfig, undefined, '  ')
)
