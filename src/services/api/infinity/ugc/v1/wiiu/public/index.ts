import express from 'express';
import { HydratedInfinity1ToyboxDocument } from '@/types/mongoose/infinity-1-toybox'; 
import { Infinity1Toybox } from '@/models/infinity-1-toybox';
import { getCDNFileStream, uploadCDNAsset } from '@/util'
import { getInfinity1ToyboxByID, getInfinity1UGCList } from '@/database';
import moment from 'moment';
import accountMiddleware from '@/middleware/account';
import multipartMiddleware from '@/middleware/multipart';
import { Readable } from 'stream';
import { ReadStream } from 'fs';

const router: express.Router = express.Router();

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox?page=%s&page_size=%s&sort_field=%s&sort_direction=%s
 * Description: Gets toyboxes from all users
 */

router.get('/infinity/ugc/v1/wiiu/public/toybox', accountMiddleware, async (request: express.Request, response: express.Response) => {
    const page = Number(request.query.page);
    const pageSize = Number(request.query.page_size);
    const sortField = request.query.sort_field as string;
    const sortDirection = request.query.sort_direction as string;

    if (!page) {
        return response.status(400).send()
    }

    if (!pageSize) {
        return response.status(400).send()
    }
    
    if (!sortField) {
        return response.status(400).send()
    }

    if (!sortDirection) {
        return response.status(400).send()
    }

    let toyboxes = await getInfinity1UGCList(page, pageSize, null, "Public")

    if (!toyboxes) {
        toyboxes = { items: [] }
    }

    return response.json({toyboxes})
});

/**
 * [POST]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox
 * Description: Uploads a toybox to the user's personal toybox collection
 */

router.post('/infinity/ugc/v1/wiiu/public/toybox', accountMiddleware, multipartMiddleware, async (request: express.Request, response: express.Response) => {
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
        creator: request.account?.swid,
        zone: zone,
        locale: locale,
        last_updated: moment().unix().toString(),
        creation_date: moment().unix().toString(),
        object_counts: objectCounts,
        screenshot: request.screenshotArgs,
        scope: "Public"
    })

    await toybox.generateID();
    await toybox.save();

    await uploadCDNAsset(`infinity-1-toyboxes/${toybox.creator}/${toybox.id}.bin`, request.file)

    await uploadCDNAsset(`infinity-1-toyboxes/screenshots/${toybox.id}/screenshot.bin`, request.screenshot)

    return response.json({"_id": `${toybox.id}`, "name": name})
});


/**
 * [PUT]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox
 * Description: Updates a toybox in a user's personal collection
 */

router.put('/infinity/ugc/v1/wiiu/public/toybox/:id', accountMiddleware, multipartMiddleware, async (request: express.Request, response: express.Response) => {
    const id = request.query.id as string;
    
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

    const toybox = await getInfinity1ToyboxByID(id);

    if (!toybox) {
        return response.status(204).send();
    }

    if (toybox.creator != request.account!.username) {
        return response.status(403).send()
    }

    toybox.updateOne({
        original_size: originalSize,
        compressed_size: compressedSize,
        name: name,
        description: desc,
        creator: request.account?.username,
        zone: zone,
        locale: locale,
        last_updated: moment().unix().toString(),
        object_counts: objectCounts,
        screenshot: request.screenshotArgs,
        scope: "Private"
    })

    await toybox.save();

    await uploadCDNAsset(`infinity-1-toyboxes/${toybox.creator}/${toybox.id}.bin`, request.file)

    await uploadCDNAsset(`infinity-1-toyboxes/screenshots/${toybox.id}/screenshot.bin`, request.screenshot)

    return response.json({"_id": `${toybox.id}`, "name": name})
});

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox/%s/screenshot
 * Description: Gets the screenshot associated with a private toybox
 */

router.get('/infinity/ugc/v1/wiiu/public/toybox/:id/screenshot', accountMiddleware, async (request: express.Request, response: express.Response) => {
    const id = request.params.id as string;
    
    const toybox = await getInfinity1ToyboxByID(id);

    if (!toybox) {
        return response.status(204).send();
    }

    const screenshotStream: Readable | ReadStream | null = await getCDNFileStream(`infinity-1-toyboxes/screenshots/${id}/screenshot.bin`);

    if (!screenshotStream) {
        return response.status(204).send();
    }

    response.setHeader("x-binary-metadata", JSON.stringify(toybox.screenshot));
    response.setHeader('Content-Type', 'application/octet-stream');

    screenshotStream.pipe(response);
});

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox/%s/object_counts
 * Description: Gets the object counts associated with the toybox
 */

router.get('/infinity/ugc/v1/wiiu/public/toybox/:id/object_counts', accountMiddleware, async (request: express.Request, response: express.Response) => {
    const id = request.params.id as string;
    
    const toybox = await getInfinity1ToyboxByID(id);

    if (!toybox) {
        return response.status(204).send();
    }

    return response.json(toybox.object_counts)
});

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/ugc/v1/wiiu/public/toybox/%s
 * Description: Gets the screenshot associated with a public toybox
 */

router.get('/infinity/ugc/v1/wiiu/public/toybox/:id', accountMiddleware, async (request: express.Request, response: express.Response) => {
    const id = request.params.id as string;
    
    const toybox = await getInfinity1ToyboxByID(id);

    if (!toybox) {
        return response.status(204).send();
    }

    const toyboxStream: Readable | ReadStream | null = await getCDNFileStream(`infinity-1-toyboxes/${toybox.creator}/${id}.bin`);

    if (!toyboxStream) {
        return response.status(204).send();
    }

    response.setHeader('Content-Type', 'application/octet-stream');

    toyboxStream.pipe(response);
});

export default router;