import express from 'express';
import { mflix_route } from './routes/mflix.mjs';
import {validateBody, valid, validateParams} from './middleware/validation.mjs'
import { accounts_route } from './routes/accounts.mjs';
import { errorHandler } from './errors/error.mjs';
import schemas  from './validation-schemas/schemas.mjs';
import AccountsService from './service/AccountsService.mjs';
import { authenticate, auth } from './middleware/authentication.mjs';
import { ADD_UPDATE_ACCOUNT, SET_ROLE_ACCOUNT } from './config/pathes.mjs';
import mflix_authorization from './middleware/mflix-authorization.mjs';
import { accountsService } from './config/service.mjs';
const app = express();
const port = process.env.PORT || 3500;

const server = app.listen(port);


server.on("listening", ()=>console.log(`server listening on port ${server.address().port}`));
app.use(express.json());
app.use(authenticate(accountsService));
app.use(auth(JSON.stringify({path:ADD_UPDATE_ACCOUNT, method:"POST"}),JSON.stringify({path:SET_ROLE_ACCOUNT, method:"PUT"}) ))
app.use(validateBody(schemas));
app.use(valid);
app.use('/mflix', mflix_route);
app.use('/accounts', accounts_route);
app.use(errorHandler);