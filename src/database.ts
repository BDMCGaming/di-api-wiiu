import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { LOG_INFO, LOG_SUCCESS, LOG_ERROR } from './logger';
import { config } from '@/config_manager';
import { HydratedTickerEntryDocument } from '@/types/mongoose/ticker-entry'
import { mTickerEntry } from '@/models/ticker-entry'
import { tickerEntry } from '@/types/common/ticker-entry'



const connection_string: string = config.mongoose.connection_string;

let _connection: mongoose.Connection;

export async function connect(): Promise<void> {
	await mongoose.connect(connection_string);

	_connection = mongoose.connection;
	_connection.on('error', console.error.bind(console, 'connection error:'));
}

export function connection(): mongoose.Connection {
	return _connection;
}

export function verifyConnected(): void {
	if (!connection()) {
		throw new Error('Cannot make database requests without being connected');
	}
}

export async function getTickerEntries(page: number, pageSize: number): Promise<{ items: tickerEntry[] } |null> {
	verifyConnected();

	try {
		const queryResults: HydratedTickerEntryDocument[] = await mTickerEntry.find().skip(pageSize * (page - 1)).limit(pageSize).exec()

		const TickerEntries: tickerEntry[] = [];
		for (let i = 0; i <queryResults.length; i++) {
			const queryResult = queryResults[i];
			const TickerEntry: tickerEntry = {
				body: queryResult.body,
			};

			if (queryResult.title) {
				TickerEntry.title = queryResult.title
			}

			if (queryResult.image) {
				TickerEntry.image = queryResult.image
			}

			TickerEntries.push(TickerEntry);
		}

		return { items: TickerEntries };
	} catch (error: any) {
		LOG_ERROR(`Error while fetching news entries: $(error)`);
		return null
	}
}