import { Model, HydratedDocument } from 'mongoose';

// * Toybox

export interface dInfinity1Toybox {
    id: string;
    original_size: number;
    compressed_size: number;
    name: string;
    description: string;
    creator: string;
    zone: string;
    locale: string;
    last_updated: string;
    creation_date: string;
    rating: number;
    object_counts: {
        [key: string]: number;
    };
    screenshot: {
        width: number;
        height: number;
        size: number;
        format: number;
        platform: number;
    };
    scope: string;
}

export interface dInfinity1ToyboxMethods {
    generateID(): Promise<void>;
}

interface dInfinity1ToyboxQueryHelpers {}

export interface infinity1ToyboxModel extends Model<dInfinity1Toybox, dInfinity1ToyboxQueryHelpers, dInfinity1ToyboxMethods> {}

export type HydratedInfinity1ToyboxDocument = HydratedDocument<dInfinity1Toybox, dInfinity1ToyboxMethods>;
