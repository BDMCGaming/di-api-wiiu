import { getInfinity1ProfileBySWID } from '@/database';
import accountMiddleware from '@/middleware/account';
import { HydratedInfinity1ProfileDocument, Infinity1Profile } from '@/models/infinity-1-profile';
import express from 'express';
import moment from 'moment';
import { parse, stringify} from 'lossless-json';
import pako from 'pako';
import { LOG_ERROR } from '@/logger';

const router: express.Router = express.Router();

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/profile/v1/wiiu
 * Description: Gets the user's saved profile from the cloud
 */

router.get('/infinity/profile/v1/wiiu', accountMiddleware, async (request: express.Request, response: express.Response) => {    
    const profile: HydratedInfinity1ProfileDocument | null = await getInfinity1ProfileBySWID(request.account!.swid);

    if (!profile) {
        return response.status(204).send()
    }

    const profileResponse = {
        global: {},
        _0_: parse(profile._0_)
    }


    const compressedData = pako.gzip(stringify(profileResponse)!)

    response.setHeader('Content-Encoding', 'gzip');
    response.setHeader('Content-Type', 'application/json');
    return response.send(Buffer.from(compressedData))
})

/**
 * [PUT] 
 * Replacement for: https://api.disney.com/infinity/profile/v1/wiiu
 * Description: Places the user's saved profile on the cloud.
 */

router.put('/infinity/profile/v1/wiiu', accountMiddleware, async (request: express.Request, response: express.Response) => {
    if (request.header("Content-Encoding") != "gzip") {
        return response.status(400).send()
    };
    
    if (!request.rawBody) {
        return response.status(400).send()
    };

    try {    
        const profile = parse(request.rawBody.toString()) as any;

        if (!profile._0_) {
            return response.status(400).send()
        }
        await Infinity1Profile.findOneAndUpdate({ swid: request.account!.swid },{
            swid: request.account!.swid,
            _0_: stringify(profile._0_)
        }, { upsert: true });
    } catch (error) {
        LOG_ERROR('[PUT] /infinity/profile/v1/wiiu:' + error)
        return response.status(503).send()
    }
    
    return response.json({creation_time: moment().unix().toString()})
})

export default router;