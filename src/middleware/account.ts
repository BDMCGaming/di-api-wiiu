import { getAccountByToken } from "@/database";
import type express from 'express';
import type { HydratedAccountDocument } from "@/types/mongoose/account";

async function accountMiddleware(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
    const authHeader = request.headersDistinct.authorization?.at(-1);
    if (!authHeader) {
        response.status(403).send()
        return next();
    }

    if (!authHeader || !(authHeader.includes("AuthZ"))) {
        return next();
    };

    const parts = authHeader.split(", ");
    if (!parts[1]) {
        response.status(403).send()
        return next();
    }

    const accessTokenHeader = parts[1].split(" ");
    if (!accessTokenHeader[1]) {
        response.status(403).send()
        return next();
    }

    const token = accessTokenHeader[1];
    let account: HydratedAccountDocument | null = null;

    account = await getAccountByToken(token)

    if (!account) {
        response.status(401).json({message: "Invalid token"});
        return
    }

    request.account = account

    return next();
}

export default accountMiddleware