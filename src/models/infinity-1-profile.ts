import { Schema, model } from 'mongoose';
import type { Model, HydratedDocument } from 'mongoose';

export interface dInfinity1Profile {
    swid: string;
    _0_: string; // * Yes. This is what the game calls it. 
}

export interface dInfinity1ProfileMethods {}

interface dInfinity1ProfileQueryHelpers {}

export interface dInfinity1ProfileModel extends Model<dInfinity1Profile, dInfinity1ProfileQueryHelpers, dInfinity1ProfileMethods> {}

export type HydratedInfinity1ProfileDocument = HydratedDocument<dInfinity1Profile, dInfinity1ProfileMethods>;

const infinity1ProfileSchema = new Schema<dInfinity1Profile, dInfinity1ProfileModel, dInfinity1ProfileMethods>({
    swid: String,
    _0_: String, // * This is a JSON that must be preserved as is, so we save it as a string.
});

export const Infinity1Profile = model<dInfinity1Profile, dInfinity1ProfileModel>('infinity-1-profiles', infinity1ProfileSchema)