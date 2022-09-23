import express, { NextFunction, Response, Request } from 'express';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { gqlQuery_Get_Card_By_ID } from './graphql/GetPaymentCardById';
import axios from 'axios';

dotenv.config();
// -------------------------------------------------------------
// -------------------------------------------------------------

const app = express();
const apiKey = process.env.HIGHNOTE_API_KEY;

// Body Parser
app.use(express.json());
let redisClient: any;

// Custom Middleware (colorize requests in console)
app.use((req, res, next) => {
  console.log(
    `*=== \x1b[34mNew Request Logged:\x1b[0m Type: \x1b[33m${req.method}\x1b[0m REQUEST, URL: \x1b[33m${req.url}\x1b[0m ===*`
  );
  next();
});

(async () => {
  redisClient = createClient();

  redisClient.on('error', (error: unknown) =>
    console.error(`Error : ${error}`)
  );

  await redisClient.connect();
})();

app.use('/users', async (req: Request, res: Response, next: NextFunction) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  } else if (req.method === 'GET') {
    const cacheResults = await redisClient.get('users');
    if (cacheResults) {
      console.log('cached users', { data: JSON.parse(cacheResults) });
      return res.status(200).json({
        data: JSON.parse(cacheResults),
      });
    } else {
      console.log('no cached users');
      return res.status(200).json({
        data: [],
      });
    }
  } else {
    const cacheResults = await redisClient.get('users');
    if (cacheResults) {
      await redisClient.set(
        'users',
        JSON.stringify([...JSON.parse(cacheResults), req.body])
      );
      const updatedData = await redisClient.get('users');

      console.log('updated cached users', { data: req.body });
      return res.status(200).json({
        data: JSON.parse(updatedData),
      });
    } else {
      await redisClient.set('users', JSON.stringify([req.body]));
      const updatedData = await redisClient.get('users');

      console.log('initiated users', { data: JSON.parse(updatedData) });
      return res.status(200).json({
        data: JSON.parse(updatedData),
      });
    }
  }
});

/**
 * Second Phase Stub Out
 *
 * TODO: implement endpoint
 */
app.use(
  '/cards/:cardId',
  async (req: Request, res: Response, next: NextFunction) => {
    const encodedAPIKey = `Basic ${Buffer.from(`${apiKey}`).toString(
      'base64'
    )}`;
    const endpointUrl = 'https://api.us.highnoteplatform.com/graphql';
    const cardId = req.params.cardId;
    if (req.method === 'GET') {
      const params = JSON.stringify({
        query: gqlQuery_Get_Card_By_ID,
      });

      const config = {
        method: 'POST',
        url: endpointUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${encodedAPIKey}`,
        },
        body: params,
      };

      axios(config)
        .then((response) => {
          console.log(response.data);
          res.send(JSON.stringify(response.data));
        })
        .catch(function (error: Error) {
          console.log(
            `*=== \x1b[34mERROR!\x1b[0m ===* ${error} *=== \x1b[34mERROR!\x1b[0m ===* `
          );
        });
    }
  }
);

export default app;

// const apolloClient = new ApolloClient({
//   headers: {
//     'Content-Type': 'application/json',
//     authorization: `${encodedAPIKey}`,
//   },
//   link: new HttpLink({
//     uri: endpointUrl,
//     fetch,
//   }),
//   cache: new InMemoryCache(),
// });

// const cardInfo = await apolloClient.query({
//   query: gqlQuery_Get_Card_By_ID,
//   variables: { paymentCardId: cardId },
// });

// if (cardInfo) {
//   return res.status(200).json({
//     data: JSON.parse(cardInfo.data),
//   });
// } else {
//   return cardInfo;
// }
