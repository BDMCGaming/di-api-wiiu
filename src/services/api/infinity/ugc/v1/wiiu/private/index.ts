import express from 'express';
import { HydratedInfinity1ToyboxDocument } from '@/types/mongoose/infinity-1-toybox'; 
import { Infinity1Toybox } from '@/models/infinity-1-toybox';
import { uploadCDNAsset } from '@/util'
import { getAccountByToken } from '@/database';
import moment from 'moment';
import accountMiddleware from '@/middleware/account';
import multipartMiddleware from '@/middleware/multipart';

const router: express.Router = express.Router();

/**
 * [POST]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/private/toybox
 * Description: Uploads a toybox to the user's personal toybox collection
 */

router.post('/infinity/ugc/v1/wiiu/private/toybox', accountMiddleware, multipartMiddleware, async (request: express.Request, response: express.Response) => {
    const name = request.body.args.name as string;
    const desc = request.body.args.desc as string;
    const creator = request.body.args.creator as string;
    const originalSize = request.body.args.orig_size as number;
    const compressedSize = request.body.args.comp_size as number;
    const type = request.body.args.type as string;
    const zone = request.body.args.zone as string;
    const locale = request.body.args.locale as string;
    const objectCounts = request.body.args.object_counts as Record<string, number>;

    const width = request.screenshotArgs.width as number;
    const height = request.screenshotArgs.height as number;
    const size = request.screenshotArgs.size as number;
    const format = request.screenshotArgs.format as number;
    const platform = request.screenshotArgs.platform as number;

    // * There is no proper error handling like DID has. Just send an error code
    if (name === undefined) { 
        return response.status(400).send() 
    };
    if (desc === undefined) { 
        return response.status(400).send() 
    };
    if (creator === undefined) { 
        return response.status(400).send() 
    };
    if (originalSize === undefined) { 
        return response.status(400).send() 
    };
    if (compressedSize === undefined) { 
        return response.status(400).send() 
    };
    if (type === undefined) { 
        return response.status(400).send() 
    };
    if (zone === undefined) { 
        return response.status(400).send() 
    };
    if (locale === undefined) { 
        return response.status(400).send() 
    };
    if (objectCounts === undefined) { 
        return response.status(400).send() 
    };
    if (width === undefined) { 
        return response.status(400).send() 
    };
    if (height === undefined) { 
        return response.status(400).send() 
    };
    if (size === undefined) { 
        return response.status(400).send() 
    };
    if (format === undefined) { 
        return response.status(400).send() 
    };
    if (platform === undefined) { 
        return response.status(400).send() 
    };
   
    // * At some point, we should try to validate the size with "orig_size". It doesn't seem to match up at all though.

    const toybox: HydratedInfinity1ToyboxDocument = await Infinity1Toybox.create({
        original_size: originalSize,
        compressed_size: compressedSize,
        name: name,
        description: desc,
        creator: request.account?.username,
        zone: zone,
        locale: locale,
        last_updated: moment().format(`YYYY-MM-DD`),
        creation_date: moment().format(`YYYY-MM-DD`),
        object_counts: objectCounts,
        screenshot: request.screenshotArgs,
        scope: "Private"
    })

    await toybox.generateID();
    await toybox.save();

    await uploadCDNAsset(`infinity-1-toyboxes/${toybox.creator}/${toybox.id}.bin`, request.file)

    await uploadCDNAsset(`infinty-1-toyboxes/screenshots/${toybox.id}/screenshot.bin`, request.screenshot)

    return response.json({"_id": `${toybox.id}`, "name": name})
});

export default router;