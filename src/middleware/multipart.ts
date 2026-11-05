import express from 'express';
import * as multipart from 'parse-multipart-data';
import { Input } from '@/types/multipart';
import { LOG_ERROR } from '@/logger';


async function multipartMiddleware(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
    if (request.headers['content-type']?.startsWith('multipart/form-data')) {
        const boundary = multipart.getBoundary(request.headers['content-type'])
        const parts: Input[] = multipart.parse(request.body, boundary);
        const argsInput: Input | undefined = parts.find(({ name }) => name === 'contentInfo');
        const fileInput: Input | undefined = parts.find(({ name }) => name === 'content');
        const screenshotArgsInput: Input | undefined = parts.find(({ name }) => name === 'screenshotInfo');
        const screenshotInput: Input | undefined = parts.find(({ name }) => name === 'screenshot');

        if (!argsInput || !fileInput || !screenshotArgsInput ||!screenshotInput) {
            LOG_ERROR("Toybox upload parameters missing file or arguments");
            response.status(400).send()

            return
        }

        request.body = {
            args: JSON.parse(argsInput.data.toString())
        } 

        request.file = fileInput.data;

        request.screenshotArgs = JSON.parse(screenshotArgsInput.data.toString());
        
        request.screenshot = screenshotInput.data;
    }

    return next();
}

export default multipartMiddleware;