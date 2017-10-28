# graphcool-gateway-common-features

This demo uses the Graphcool API Gateway pattern to reuse common functionality in multiple projects. It uses a common Graphcool service that provides weather information, and makes it available through schema stitching in another project that holds address information. This pattern is useful for all kinds of common features (weather, directions, mail sending etc.) that you can now easily reuse across projects.

### Architecture

One service holds information about users and their addresses according to this schema:
```graphql
type User @model {
  id: ID! @isUnique
  name: String!
  dateOfBirth: DateTime
  address: Address @relation(name: "UserAddress")
}

type Address @model {
  id: ID! @isUnique
  city: String!
  user: User @relation(name: "UserAddress")
}
```

The other service just contains one resolver function:
```graphql
type WeatherPayload {
  temperature: Float
}

extend type Query {
  getWeatherByCity(city: String): WeatherPayload
}
```

This application (the API Gateway) stitches them together, by extending the `Address` Type with a `weather` field.

### Running this example

The easiest way to run this example is to use the Apollo Launchpad: https://launchpad.graphql.com/9q0nxlk9r

### Local development

- Create a `.env` file in the root of your project folder with the following keys:
  - `GRAPHCOOL_ADDRESS_ENDPOINT`
  - `GRAPHCOOL_WEATHER_ENDPOINT`

```
GRAPHCOOL_ADDRESS_ENDPOINT=https://api.graph.cool/simple/v1/...
GRAPHCOOL_ADDRESS_ENDPOINT=https://api.graph.cool/simple/v1/...
```
> If you don't provide these keys, the application will use demo endpoints (read-only)

- Run `yarn install` or `npm install`

- Run `yarn start` or `npm start`

- Open http://localhost:3000/playground and execute queries

![image](https://user-images.githubusercontent.com/852069/32027816-74599806-b9eb-11e7-9842-8a580bee9b78.png)
