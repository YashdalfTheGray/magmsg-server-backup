import { resolve } from 'path';

import * as dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';

import { wrap } from './utils';
import { getMessage, putMessage } from './middlewares';

dotenv.config();

const port = process.env.PORT || process.argv[2] || 8080;
const app = express();
const apiRouter = express.Router();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static(resolve('public')));

apiRouter.get('/', (_, res) => {
  res.json({
    status: 'okay',
  });
});
apiRouter.get('/messages/:messageId', wrap(getMessage));
apiRouter.put('/messages', wrap(putMessage));

app.use('/api', apiRouter);

app.listen(port, () =>
  // tslint:disable-next-line
  console.log(`Server running on port ${chalk.green(port)}`)
);
