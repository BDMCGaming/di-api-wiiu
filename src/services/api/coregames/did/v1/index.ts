import crypto from 'node:crypto';
import express from 'express';
import { connection as databaseConnection, doesUsernameExist, doesEmailExist, getAccountByAssertionID, getAccountByUsername, getAccountByEmail } from '@/database'
import { createTokens ,checkUsernameLength, checkUsernameValidCharacters, checkPasswordValid, getAgeFromDate } from '@/util'
import IP2LocationManager from '@/ip2location'
import { Account } from '@/models/account'
import { token } from '@/models/token'
import { HydratedAccountDocument } from '@/types/mongoose/account'
import moment from 'moment'
import bcrypt from 'bcrypt'
import { LOG_ERROR } from '@/logger';

const router: express.Router = express.Router();

/**
 * [POST]
 * Replacement for: https://api.disney.com/coregames/did/v1/authenticate
 * Description: Authenticates the user/console with a platform token
 */

router.post('/coregames/did/v1/authenticate', async (request: express.Request, response: express.Response) => {
    const grantType = request.body.grant_type
    
    if (grantType === "assertion"){
        const assertionPlatform = request.body.assertion_platform
        const assertionID = request.body.assertion_id
        const platformToken = request.body.platform_token

        if (!assertionPlatform) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_PLATFORM"})
        }

        if (!assertionID) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_ID"})
        }
    
        if (!platformToken) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.PLATFORM_TOKEN"})
        }

        // * Could we support other platforms? Probably. Are we going to? Probably not.
        if (assertionPlatform !== "wiiu") {
            return response.json({"code": "110", "name": "APP.ASSERTION_PLATFORM_UNKNOWN"})
        }

        // * Validate token here (if we had access to gRPC)
        // if (blahblahblah === grpc error) {
        //      return response.json({"code": "100", "name": "SECURITY.FAILED_PLATFORM_AUTHORIZATION"})
        // }

        // * Lookup account by assertion ID

        const account = await getAccountByAssertionID(assertionID)

        if (!account) {
            return response.json({"code": "110", "name": "APP.ACCOUNT_NOT_LINKED"})
        }

        const accessToken = crypto.randomBytes(16).toString('hex');
	    const newRefreshToken = crypto.randomBytes(20).toString('hex');

	    await token.create({
	    	token: crypto.createHash('sha256').update(accessToken).digest('hex'),
        
	    	info: {
                token_type: "access_token",
                issued: new Date(),
	    		expires: new Date(Date.now() + (3600 * 1000))
	    	}
	    });

        await token.create({
	    	token: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
        
	    	info: {
                token_type: "refresh_token",
                issued: new Date(),
	    		expires: new Date(Date.now() +  7 * 24 * 3600 * 1000)
	    	}
	    });

        // * Decompiling shows that there are additional fields for gamespy_challenge and gamespy_token. These do not get read on Wii U aside from being cleared

        return response.json({
            access_token: accessToken,
            refresh_token: newRefreshToken,
            swid: account.swid,
            first_name: account.first_name,
            last_name: account.last_name,
            username: account.username
        })
    } else if (grantType === "password") {
        const username = request.body.username as string;
        const password = request.body.password as string;
        const assertionPlatform = request.body.assertion_platform as string;
        const assertionID = request.body.assertion_id as string;
        const platformToken = request.body.platform_token as string;

        if (!username) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.USERNAME"})
        }

        if (!password) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.PASSWORD"})
        }

        if (!assertionPlatform) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_PLATFORM"})
        }
        if (!assertionID) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_ID"})
        }

        if (!platformToken) {
            return response.json({"code": "1", "name": "INPUT.MISSING_DATA.PLATFORM_TOKEN"})
        }
        // * Could we support other platforms? Probably. Are we going to? Probably not.
        if (assertionPlatform !== "wiiu") {
            return response.json({"code": "110", "name": "APP.ASSERTION_PLATFORM_UNKNOWN"})
        }
        // * Validate token here (if we had access to gRPC)
        // if (blahblahblah === grpc error) {
        //      return response.json({"code": "100", "name": "SECURITY.FAILED_PLATFORM_AUTHORIZATION"})
        // }

        let account;
        
        // * Scuffed check for an email, as the game can send either a username or an email in the username field for sign-in
        if (username.includes('@') && username.includes('.')) {
            account = await getAccountByEmail(username)
        } else {
            account = await getAccountByUsername(username)
        }

        if (!account){
            return response.json({"code": "100", "name": "SECURITY.INVALID_USER"})
        }

        if (!await bcrypt.compare(password, account.password)) {
            return response.json({"code": "100", "name": "SECURITY.INVALID_USER"})
        }

        account.connections.nintendo.id = assertionID

        account.save()

        const [accessToken, expirationDate, refreshToken] = await createTokens(account.swid)

        return response.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            swid: account.swid,
            first_name: account.first_name,
            last_name: "",
            username: username
        })
    } else {
        return response.json({"code": "110", "name": "APP.GRANT_TYPE_UNKNOWN"})
    }
});

/**
 * [GET]
 * Replacement for: https://api.disney.com/coregames/did/v1/compliance?country-code={country}&dob={date}
 * Description: Checks the age band for a given user based off of country and DOB
 */

router.get('/coregames/did/v1/compliance', async (request: express.Request, response: express.Response) => {
    const dob = request.query.dob as string;
    const ip = request.ip;

    if (!dob) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.DOB"})
    };

    const age = getAgeFromDate(dob);

    if (age < 13) {
        // * Block so we don't have to deal with child accounts and COPPA
        return response.json({"code": "1", "name": "APP.INVALID_DATE_OF_BIRTH"})
    };

    if (age < 18) {
        if (ip) {
            const location = IP2LocationManager.lookup(ip)
                if (location?.countryShort === 'US' && location?.region === 'Mississippi') {
                    // * Mirroring logic from PretendoNetwork/account. See https://bsky.social/about/blog/08-22-2025-mississippi-hb1126 for details
                    return response.json({"code": "1", "name": "APP.INVALID_DATE_OF_BIRTH"})
                }
        }
    }

    if (age < 18 && age > 13) {
        return response.json({"age_band": "teen"})
    };

    if (age > 18) {
        return response.json({"age_band": "adult"})
    };
});

/**
 * [POST]
 * Replacement for: https://api.disney.com/coregames/did/v1/create
 * Description: Creates a Disney Account
 */

router.post('/coregames/did/v1/create', async (request: express.Request, response: express.Response) => {
    const firstName = request.body.first_name;
    const username = request.body.username;
    const dateOfBirth = request.body.date_of_birth;
    const email = request.body.parents_email;
    const region = request.body.region;
    const password = request.body.password
    const gender = request.body.gender;
    let marketingOptIn = request.body.marketing_optin as boolean;
    const language = request.body.language
    const assertionPlatform = request.body.assertion_platform
    const assertionID = request.body.assertion_id
    const platformToken = request.body.platform_token
    if (!firstName) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.FIRST_NAME"})
    }
    if (firstName.length <= 1 || firstName.length >= 32) {
        return response.json({"code": "1", "name": "APP.INVALID_FIRST_NAME_SIZE"})
    }
    if (!username) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.USERNAME"})
    }
    if (!checkUsernameLength) {
        return response.json({"code": "1", "name": "APP.INVALID_USERNAME_SIZE"})
    }
    if (!checkUsernameValidCharacters) {
        return response.json({"code": "1", "name": "APP.INVALID_USERNAME"})
    }
    if (!doesUsernameExist(username)) {
        return response.json({"code": "2002", "name": "APP.USERNAME_ALREADY_EXISTS"})
    }
    if (!dateOfBirth) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.DOB"})
    }
    if (!email) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.EMAIL"}) 
    }
    if (!email.includes('@') || !email.includes('.')) {
        return response.json({"code": "1", "name": "APP.INVALID_EMAIL_FORMAT"}) 
    }
    
    if (email.length <= 1 || email.length >= 32) {
        return response.json({"code": "1", "name": "APP.INVALID_EMAIL_SIZE"})
    }
    if (!region) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.REGION"})
    }
    if (!password) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.PASSWORD"})
    }
    if (!checkPasswordValid) {
        return response.json({"code": "1", "name": "APP.INVALID_PASSWORD"})
    }
    if (!marketingOptIn) {
        marketingOptIn = false
    }

    if (!assertionPlatform) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_PLATFORM"})
    }
    if (!assertionID) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.ASSERTION_ID"})
    }

    if (!platformToken) {
        return response.json({"code": "1", "name": "INPUT.MISSING_DATA.PLATFORM_TOKEN"})
    }
    // * Could we support other platforms? Probably. Are we going to? Probably not.
    if (assertionPlatform !== "wiiu") {
        return response.json({"code": "110", "name": "APP.ASSERTION_PLATFORM_UNKNOWN"})
    }
    // * Validate token here (if we had access to gRPC)
    // if (blahblahblah === grpc error) {
    //      return response.json({"code": "100", "name": "SECURITY.FAILED_PLATFORM_AUTHORIZATION"})
    // }
    const creationDate = moment().format('YYYY-MM-DDTHH:MM:SS');
    let account: HydratedAccountDocument;
    let swid: string;
    const session = await databaseConnection().startSession();
	await session.startTransaction();
    try {
        const passwordHash = await bcrypt.hash(request.body.password, 10);
        account = new Account({
            swid: "",
            first_name: firstName,
            username: username,
            password: passwordHash,
            date_of_birth: dateOfBirth,
            email: {
                user_email: email,
                email_verified: false
            },
            gender: gender,
            region: region,
            language: language,
            identification: {
                email_code: 1, // * will be overwritten before saving
            },
            connections: {
                nintendo: {
                    id: assertionID // * Nintendo PID in hexadecimal format
                }
            }
        })
        
        await account.generateEmailValidationCode();
        await account.generateSWID();
        swid = account.swid;
        await account.save({ session });
        await session.commitTransaction();
    } catch (error) {
        LOG_ERROR('[POST] /coregames/did/v1/create: ' + error)
        
        await session.abortTransaction();
        // * Likely not the right error code, but it displays an error at least
        return response.json({"code": "200", "name": "SYSTEM.UNRESPONSIVE.PROFILE"})
    }
        
    const [accessToken, expirationDate, refreshToken] = await createTokens(swid)

    // * Decompiling shows that there are additional fields for gamespy_challenge and gamespy_token. These do not get read on Wii U aside from being cleared

    return response.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        swid: swid,
        first_name: firstName,
        last_name: "",
        username: username
    })
})

export default router;