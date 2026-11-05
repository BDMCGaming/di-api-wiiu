import mongoose from 'mongoose';
import { LOG_ERROR } from './logger';
import { config } from '@/config_manager';
import { HydratedTickerEntryDocument } from '@/types/mongoose/ticker-entry'
import { mTickerEntry } from '@/models/ticker-entry'
import { tickerEntry } from '@/types/common/ticker-entry'
import { HydratedAccountDocument } from '@/types/mongoose/account'
import { Account } from '@/models/account'
import { token as Token, HydratedTokenDocument } from '@/models/token'
import { HydratedInfinity1ToyboxDocument } from '@/types/mongoose/infinity-1-toybox';
import { Infinity1Toybox } from '@/models/infinity-1-toybox';
import { userInfinity1Toybox } from '@/types/common/infinity-1-toybox';
import { HydratedInfinity1ProfileDocument, Infinity1Profile } from '@/models/infinity-1-profile';

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

export async function getAccountBySWID(swid: string): Promise<HydratedAccountDocument | null> {
	verifyConnected();

	return await Account.findOne<HydratedAccountDocument>({
		swid: swid
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

export async function getAccountByToken(token: string): Promise<HydratedAccountDocument | null> {
	verifyConnected();

	const tokenDoc = await Token.findOne<HydratedTokenDocument>({
		token: token
	});

	if (tokenDoc === null) {
		return null;
	}

	return await getAccountBySWID(tokenDoc.swid)
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
	} catch (error) {
		LOG_ERROR(`Error while fetching news entries: ${error}`);
		return null
	}
}

export async function getInfinity1UGCList(page: number, pageSize: number, username: string | null, scope: string): Promise<{ items: userInfinity1Toybox[] } | null> {
	verifyConnected();
	let queryResults: HydratedInfinity1ToyboxDocument[] = [];
	
	if (scope == "Private") {
		try {
			queryResults = await Infinity1Toybox.find().skip(pageSize * (page - 1)).limit(pageSize).where({creator: username, scope: "Private"}).exec()
		
			const toyboxes: userInfinity1Toybox[] = []

			for (let i = 0; i <queryResults.length; i++) {
				const queryResult = queryResults[i];
				const toybox = {
					_id: queryResult.id,
					name: queryResult.name,
					desc: queryResult.description,
					creator: queryResult.creator,
					zone: queryResult.zone,
					last_update_time: queryResult.last_updated
				}

				toyboxes.push(toybox)
			}
			return { items: toyboxes }
		}
		catch (error) {
			LOG_ERROR(`Error while fetching private toyboxes of user ${username}: ${error}`);
			return null
		}
	} else if (scope === "Public") {
		try {
			queryResults = await Infinity1Toybox.find().skip(pageSize * (page - 1)).limit(pageSize).where({ scope: "Public"}).exec()
		
			const toyboxes: userInfinity1Toybox[] = []

			for (let i = 0; i <queryResults.length; i++) {
				const queryResult = queryResults[i];
				const toybox = {
					_id: queryResult.id,
					orig_size: queryResult.original_size,
					comp_size: queryResult.compressed_size,
					name: queryResult.name,
					desc: queryResult.description,
					creator: queryResult.creator,
					zone: queryResult.zone,
					last_update_time: queryResult.last_updated,
					creation_time: queryResult.creation_date,
					rating: queryResult.rating
				}

				toyboxes.push(toybox)
			}
			return { items: toyboxes }
		}
		catch (error: any) {
			LOG_ERROR(`Error while fetching private toyboxes of user ${username}: ${error}`);
			return null
		}
	};

	return null

}

export async function getInfinity1ToyboxByID(id: string): Promise<HydratedInfinity1ToyboxDocument | null> {
	verifyConnected();

	const toybox = Infinity1Toybox.findOne<HydratedInfinity1ToyboxDocument>({ id: id });

	return toybox
}

export async function getInfinity1ProfileBySWID(swid: string): Promise<HydratedInfinity1ProfileDocument | null> {
	verifyConnected();

	const profile = Infinity1Profile.findOne<HydratedInfinity1ProfileDocument>({ swid: swid});

	return profile
}