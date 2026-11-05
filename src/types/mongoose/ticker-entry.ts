import { Model, HydratedDocument } from 'mongoose';

export interface dTickerEntry {
    title?: string;
    body: string;
    image?: string; // * Should be an Hyperlink, or empty if the a news item contains image
}

export interface dTickerEntryMethods {}

interface dTickerEntryQueryHelpers {}

export interface TickerEntryModel extends Model<dTickerEntry, dTickerEntryQueryHelpers, dTickerEntryMethods> {}

export type HydratedTickerEntryDocument = HydratedDocument<dTickerEntry, dTickerEntryMethods>;
