import dotenv from 'dotenv';
import pinoPretty from 'pino-pretty';
import { pino } from 'pino';

const logger = pino(pinoPretty());

dotenv.config();

// TODO - Add S3 and/or CDN for Toybox storage

export const config = {
    http: {
        port: Number(process.env.DI_CONFIG_HTTP_PORT || '') 
    },
    mongoose: {
		connection_string: process.env.DI_CONFIG_MONGO_CONNECTION_STRING || ''
	},
    domains: {
        api: process.env.DI_CONFIG_DOMAINS_API || '',
        cdn: process.env.DI_CONFIG_DOMAINS_CDN || ''
    },
    logging: {
        format: process.env.DI_CONFIG_LOGGING_FORMAT || 'pretty',
        level: process.env.DI_CONFIG_LOGGING_LEVEL || 'info'
    }
}

if (!config.http.port) {
    logger.error("DI_CONFIG_HTTP_PORT is not set. Please set the HTTP port to use.")
    process.exit(0)
}

if (!config.mongoose.connection_string) {
    logger.error("DI_CONFIG_MONGO_CONNECTOIN_STRING is not set. Please set the MongoDB connection string")
    process.exit(0)
}

if (!config.domains.api) {
    logger.error("DI_CONFIG_DOMAINS_API is not set. Please set the domain for the API to use.")
    process.exit(0)
}

if (!config.domains.cdn) {
    logger.error("DI_CONFIG_DOMAINS_CDN is not set. Please set the domain for the CDN to use.")
    process.exit(0)
}

if (config.logging.format != 'pretty' && config.logging.format != 'json') {
    logger.error("DI_CONFIG_LOGGING_FORMAT is invalid. Please set it to 'pretty' or 'json'.")
    process.exit(0)
}

const possibleconfigLevels = ['error', 'warn', 'info', 'debug', 'trace'];
if (!possibleconfigLevels.includes(config.logging.level)) {
    logger.error("DI_CONFIG_LOGGING_LEVEL is invalid.")
    process.exit(0)
}