import { getAccountByToken } from "@/database";
import type express from 'express';
import type { HydratedAccountDocument } from "@/types/mongoose/account";

async function accountMiddleware(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
    const authHeader = request.header("Authorization");

    if (!authHeader || !(authHeader.includes("AuthZ"))) {
        return next();
    };

    const parts = authHeader.split(", ");
    const accessTokenHeader = parts[1].split(" ");
    const token = accessTokenHeader[1];
    let account: HydratedAccountDocument | null = null;

    console.log(`${token}`);

    account = await getAccountByToken(token)

    if (!account) {
        response.status(403).send();
        return
    }

    request.account = account

    return next();
}

export default accountMiddleware