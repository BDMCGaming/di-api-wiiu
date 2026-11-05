import crypto from 'node:crypto';
import { Schema, model } from 'mongoose';
import type { dAccount, dAccountMethods, accountModel } from '@/types/mongoose/account';

const accountSchema = new Schema<dAccount, accountModel, dAccountMethods>({
    swid: {
        type: String,
        unique: true,
    },
    first_name: String,
    middle_name: String,
    last_name: String,
    username: {
        type: String,
        unique: true,
        // TODO - Find character limits in the client
    },
    password: String,
    date_of_birth: String,
    email: {
        user_email: String,
        email_verified: Boolean,
        email_verified_date: String,
    },
    gender: String,
    region: String,
    language: String,
    marketing: Number,
    identification: {
        email_code: String,
    },
    connections: {
        nintendo: {
            id: String, // * Nintendo PID in hexadecimal format
        },
    },
});

accountSchema.method('generateSWID', async function generateSWID(): Promise<void> {
    //* It's just a GUIDv4 wrapped in parentheses

    const swid = crypto.randomUUID();
    this.swid = swid;
});

export const Account = model<dAccount, accountModel>('account', accountSchema);
