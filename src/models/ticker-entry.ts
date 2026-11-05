import mongoose from 'mongoose';
import { HydratedTickerEntryDocument, dTickerEntry, dTickerEntryMethods, TickerEntryModel } from '@/types/mongoose/ticker-entry';

const TickerEntrySchema = new mongoose.Schema<dTickerEntry, TickerEntryModel, dTickerEntryMethods>({
    title: String,
    body: String,
    image: String, // * Should be an Hyperlink, or empty if the a news item contains image
});

export const mTickerEntry = mongoose.model<dTickerEntry, TickerEntryModel>('TickerEntry', TickerEntrySchema);
