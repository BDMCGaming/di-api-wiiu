import express from 'express';

import { getTickerEntries } from '@/database';

const router: express.Router = express.Router();

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/feed/v1/wiiu/ticker/*
 * Description: Retrieves the news entries to be used by the ticker feed
 */

// TODO - Would it be ideal to do region specific tickers rather tickers being global

router.get('/infinity/feed/v1/wiiu/ticker/:region/:language', async (request: express.Request, response: express.Response) => {
    if (request.query.page === undefined || request.query.page_size === undefined) {
        response.json({ code: '1', name: 'INPUT.MISSING_DATA.UNKNOWN' });
    }

    const pageNum: number = Number(request.query.page);
    const pageSize: number = Number(request.query.page_size);

    const TickerEntries = await getTickerEntries(pageNum, pageSize);

    if (TickerEntries === null) {
        response.json({});
    }

    response.json({
        page: pageNum,
        page_count: 1,
        TickerEntries,
    });
});

export default router;
