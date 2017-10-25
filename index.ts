require('dotenv').config()

import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { graphqlExpress } from 'apollo-server-express'
import { makeRemoteExecutableSchema, introspectSchema, mergeSchemas } from 'graphql-tools'
import { express as playground } from 'graphql-playground/middleware'
import { request } from 'graphql-request'

async function run() {

  const fetcher = endpoint => ({ query, variables, operationName, context }) => {
    return request(endpoint, query, variables).then(data => { return { data } })
  };

  // Create schemas from remote endpoints
  const addressEndpoint = process.env.GRAPHCOOL_ADDRESS_ENDPOINT || 'https://api.graph.cool/simple/v1/cj97mysum1jyi01363osr460n'
  const addressLink = fetcher(addressEndpoint)
  const addressSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(addressLink),
    fetcher: addressLink,
  });

  const weatherEndpoint = process.env.GRAPHCOOL_WEATHER_ENDPOINT || 'https://api.graph.cool/simple/v1/cj97mrhgb1jta01369lzb0tam'
  const weatherLink = fetcher(weatherEndpoint)
  const weatherSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(weatherLink),
    fetcher: weatherLink,
  })

  // Extend the schemas to link them together
  const linkTypeDefs = `
  extend type Address {
    weather: WeatherPayload
  }
`;

  const schema = mergeSchemas({
    schemas: [addressSchema, weatherSchema, linkTypeDefs],
    resolvers: mergeInfo => ({
      Address: {
        weather: {
          fragment: `fragment AddressFragment on Address { city }`,
          resolve(parent, args, context, info) {
            const city = parent.city;
            return mergeInfo.delegate(
              'query', 'getWeatherByCity', { city }, context, info
            )
          }
        }
      }
    })
  });

  const app = express()
  app.use('/graphql', cors(), bodyParser.json(), graphqlExpress({ schema: schema }))
  app.use('/playground', playground({ endpoint: '/graphql' }))

  app.listen(3000, () => console.log('Server running. Open http://localhost:3000/playground to run queries.'))
}

run().catch(console.error.bind(console))
