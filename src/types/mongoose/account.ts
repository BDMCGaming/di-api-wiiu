import { Model, HydratedDocument } from 'mongoose';

export interface dAccount {
    swid: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    password: string;
    date_of_birth: string;
    email: {
        user_email: string;
        email_verified: string;
        email_verified_date: string;
    };
    gender: string;
    region: string;
    language: string;
    marketing: number;
    identification: {
        email_code: string;
    };
    connections: {
        nintendo: {
            id: string;
        };
    };
}

export interface dAccountMethods {
    generateSWID(): Promise<void>;
    generateEmailValidationCode(): Promise<void>;
}

interface dAccountQueryHelpers {}

export interface accountModel extends Model<dAccount, dAccountQueryHelpers, dAccountMethods> {}

export type HydratedAccountDocument = HydratedDocument<dAccount, dAccountMethods>;
