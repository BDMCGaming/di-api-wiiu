import express from 'express';
import morgan from 'morgan';
import { connect as connectDatabase } from './database';
import { LOG_INFO, LOG_SUCCESS } from './logger';

import wiiuconfig from './services/api/infinity/config/v1/wiiu';
import tickerv1 from '@/services/api/infinity/feed/v1/wiiu/ticker';
import authentication from '@/services/api/coregames/did/v1/index';
import geoiplocale from '@/services/api/capmon/getde';
import privateugc from '@/services/api/infinity/ugc/v1/wiiu/private/index';
import publicugc from '@/services/api/infinity/ugc/v1/wiiu/public/index';
import stubs from '@/services/api/infinity/stubs';
import profiles from '@/services/api/infinity/profile/v1/wiiu/index';

import { config } from './config_manager';

const {
    http: { port },
} = config;
const app = express();

LOG_INFO('Setting up Middleware');
app.use(
    express.raw({
        type: '*/*',
        verify(request: any, _response, buffer) {
            request.rawBody = buffer;
        },
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(
    express.raw({
        limit: '50mb',
        type: 'multipart/form-data',
    })
);

const api = express.Router();

LOG_INFO(`Setting up routes`);
api.use(wiiuconfig);
api.use(tickerv1);
api.use(authentication);
api.use(geoiplocale);
api.use(privateugc);
api.use(publicugc);
api.use(stubs);
api.use(profiles);

app.use(api);

async function main(): Promise<void> {
    // Starts the server
    LOG_INFO('Starting server');

    await connectDatabase();

    app.listen(port, () => {
        LOG_SUCCESS(`Server started on port ${port}`);
    });
}

main().catch(console.error);
