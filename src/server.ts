import express from 'express';
import morgan from 'morgan';
import { connect as connectDatabase } from './database';
import { LOG_INFO, LOG_SUCCESS } from './logger';

import wiiuconfig from './services/api/infinity/config/v1/wiiu'
import tickerv1 from '@/services/api/infinity/feed/v1/wiiu/ticker'

import { config } from './config_manager'

const { http: { port }} = config;
const app = express();

LOG_INFO('Setting up Middleware');
app.use(morgan('dev'));
app.use(express.json());
app.use(express.raw());

const api = express.Router();

LOG_INFO(`Setting up routes`)
api.use(wiiuconfig);
api.use(tickerv1);

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