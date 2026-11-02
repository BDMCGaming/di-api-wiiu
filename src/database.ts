import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { LOG_INFO, LOG_SUCCESS, LOG_ERROR } from './logger';
import { config } from '@/config_manager';
import { HydratedTickerEntryDocument } from '@/types/mongoose/ticker-entry'
import { mTickerEntry } from '@/models/ticker-entry'
import { tickerEntry } from '@/types/common/ticker-entry'
import { HydratedAccountDocument } from '@/types/mongoose/account'
import { Account } from '@/models/account'

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

export async function getAccountByUsername(username: string): Promise<HydratedAccountDocument | null> {
	verifyConnected();

	return await Account.findOne<HydratedAccountDocument>({
		username: username
	});
}

export async function getAccountByEmail(email: string): Promise<HydratedAccountDocument | null> {
	verifyConnected();

	return await Account.findOne<HydratedAccountDocument>({
		"email.user_email": email
	});
}

export async function getAccountByAssertionID(assertionID: string): Promise<HydratedAccountDocument | null> {
	verifyConnected();

	return await Account.findOne<HydratedAccountDocument>({
		"connections.nintendo.id": assertionID
	});
}

export async function doesUsernameExist(username: string): Promise<boolean> {
	verifyConnected();

	const account = await Account.findOne<HydratedAccountDocument>({
		username: username
	})

	if (account) {
		return true
	} else {
		return false
	}
}

export async function doesEmailExist(username: string): Promise<boolean> {
	verifyConnected();

	let account = await Account.findOne<HydratedAccountDocument>({
		"emails.parents_email": username
	})

	if (account) {
		return true
	}

	account = await Account.findOne<HydratedAccountDocument>({
		"emails.user_email": username
	})

	if (account) {
		return true
	} else {
		return true
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