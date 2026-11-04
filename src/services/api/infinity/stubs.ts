import express from 'express';
import { connection as databaseConnection, doesUsernameExist, doesEmailExist, getAccountByAssertionID, getAccountByUsername, getAccountByEmail, getAccountByToken } from '@/database'
import { createTokens ,checkUsernameLength, checkUsernameValidCharacters, checkPasswordValid, getAgeFromDate } from '@/util'
import IP2LocationManager from '@/ip2location'
import { Account } from '@/models/account'
import { HydratedAccountDocument } from '@/types/mongoose/account'
import moment from 'moment'
import bcrypt from 'bcrypt'
import { LOG_ERROR } from '@/logger';

const router: express.Router = express.Router();

/**
 * [POST]
 * Replacement for: https://api.disney.com/bi/v1/batch
 * Description: Sends telemetry to the server 
 */

router.post('/bi/v1/batch', async (request: express.Request, response: express.Response) => {
    response.status(200).send()
});

/**
 * [POST]
 * Replacement for: https://int.api.disney.com/disneynetwork/activitystream/v1activities
 * Description: Unknown purpose, but goes unused by the game in terms of fetching
 */

router.post('/disneynetwork/activitystream/v1activities', async (request: express.Request, response: express.Response) => {
    response.status(200).send()
});

export default router;