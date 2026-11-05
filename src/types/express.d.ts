import { screenshotArgs } from '@/types/common/screenshot-args';
import type { HydratedAccountDocument } from '@/types/mongoose/account';

declare global {
    namespace Express {
        interface Request {
            account?: HydratedAccountDocument | null;
            rawBody: Buffer;
            file: Buffer;
            screenshot: Buffer;
            screenshotArgs: screenshotArgs;
        }
    }
}
