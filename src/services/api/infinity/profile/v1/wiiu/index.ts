import { getInfinity1ProfileBySWID } from "@/database";
import accountMiddleware from "@/middleware/account";
import { HydratedInfinity1ProfileDocument, Infinity1Profile } from "@/models/infinity-1-profile";
import express from 'express';
import moment from "moment";

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

    return response.json({global: {}, _0_: profile._0_})
})

/**
 * [PUT] 
 * Replacement for: https://api.disney.com/infinity/profile/v1/wiiu
 * Description: Places the user's saved profile on the cloud.
 */

router.get('/infinity/profile/v1/wiiu', accountMiddleware, async (request: express.Request, response: express.Response) => {
    Infinity1Profile.create({
        swid: request.account!.swid,
        _0_: request.body._0_
    })

    return response.json({creation_time: moment.unix(moment.now())})
})

export default router;