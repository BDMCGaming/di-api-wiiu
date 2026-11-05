import { Schema, model } from 'mongoose';
import { dInfinity1Toybox, dInfinity1ToyboxMethods, infinity1ToyboxModel } from '@/types/mongoose/infinity-1-toybox';

const infinity1ToyboxSchema = new Schema<dInfinity1Toybox, infinity1ToyboxModel, dInfinity1ToyboxMethods>({
    id: String,
    original_size: Number,
    compressed_size: Number,
    name: String,
    description: String,
    creator: String,
    zone: String,
    locale: String,
    last_updated: String,
    creation_date: String,
    rating: {
        type: Number,
        default: 0,
    },
    object_counts: {
        type: Map,
        of: Number,
    },
    screenshot: {
        width: Number,
        height: Number,
        size: Number,
        format: Number,
        platform: Number,
    },
    scope: String,
});

infinity1ToyboxSchema.method('generateID', async function generateID(): Promise<void> {
    // * No idea what the ID originally was, but hopefully a GUID will work.
    const id = crypto.randomUUID();
    this.id = id;
});

export const Infinity1Toybox = model<dInfinity1Toybox, infinity1ToyboxModel>('infinity-1-toyboxes', infinity1ToyboxSchema);
