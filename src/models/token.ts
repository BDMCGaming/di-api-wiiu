import { Schema, model } from 'mongoose';
import type { Model, HydratedDocument } from 'mongoose';

export interface dToken {
    token: string;
    swid: string;
    info: {
        token_type: string;
        issued: Date;
        expires: Date;
    }
}

export interface dTokenMethods {}

interface dTokenQueryHelpers {}

export interface dTokenModel extends Model<dToken, dTokenQueryHelpers, dTokenMethods> {}

export type HydratedTokenDocument = HydratedDocument<dToken, dTokenMethods>;

const tokenSchema = new Schema<dToken, dTokenModel, dTokenMethods>({
    token: String,
    swid: String,
    info: {
        token_type: String,
        issued: Date,
        expires: Date
    }
});

tokenSchema.index({ 'info.expires': 1}, { expireAfterSeconds: 0 });
tokenSchema.index({ token: 1 });
tokenSchema.index({ pid: 1});

export const token = model<dToken, dTokenModel>('Token', tokenSchema)