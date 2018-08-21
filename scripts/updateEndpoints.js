const fs = require('fs')
const { join } = require('path')
const ip = require('ip')
const dotenv = require('dotenv')

const envPath = join(process.cwd(), '.env.development')

const httpEndpointKey = 'HTTP_ENDPOINT'
const wsEndpointKey = 'WS_ENDPOINT'

let envFileString = ''

try {
  envFileString = fs.readFileSync(envPath, {
    encoding: 'utf8',
  })
} catch (e) {}

let envConfig = dotenv.parse(envFileString)

envConfig[httpEndpointKey] = `http://${ip.address()}:4000/`
envConfig[wsEndpointKey] = `ws://${ip.address()}:4000/`

let newConfig = Object.entries(envConfig).reduce(
  (prev, [key, value]) => `${prev}${key}="${value}"\n`,
  ''
)

fs.writeFileSync(envPath, newConfig, { encoding: 'utf8' })
