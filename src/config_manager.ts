import dotenv from 'dotenv';
import pinoPretty from 'pino-pretty';
import { pino } from 'pino';
import fs from 'fs-extra';
import path from 'node:path';

const logger = pino(pinoPretty());

dotenv.config();

export const disabledFeatures = {
    s3: false
}

export const config = {
    http: {
        port: Number(process.env.DI_CONFIG_HTTP_PORT || '') 
    },
    mongoose: {
		connection_string: process.env.DI_CONFIG_MONGO_CONNECTION_STRING || ''
	},
    
	cdn: {
		s3: {
		endpoint: process.env.DI_CONFIG_S3_ENDPOINT || '',
		region: process.env.DI_CONFIG_S3_REGION || '',
		bucket: process.env.DI_CONFIG_S3_BUCKET || '',
		key: process.env.DI_MAKER_CONFIG_S3_ACCESS_KEY || '',
		secret: process.env.DI_CONFIG_S3_ACCESS_SECRET || ''
	    },
        disk_path: process.env.DI_CONFIG_CDN_DISK_PATH || ''
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

if (!config.cdn.s3.endpoint) {
	logger.warn('Failed to find s3 endpoint config. Disabling feature. To enable feature set the PN_BOSS_CONFIG_S3_ENDPOINT environment variable');
	disabledFeatures.s3 = true;
}

if (!config.cdn.s3.region) {
	logger.warn('Failed to find s3 region config. Disabling feature. To enable feature set the PN_BOSS_CONFIG_S3_REGION environment variable');
	disabledFeatures.s3 = true;
}

if (!config.cdn.s3.bucket) {
	logger.warn('Failed to find s3 bucket config. Disabling feature. To enable feature set the PN_BOSS_CONFIG_S3_BUCKET environment variable');
	disabledFeatures.s3 = true;
}

if (!config.cdn.s3.key) {
	logger.warn('Failed to find s3 access key config. Disabling feature. To enable feature set the PN_BOSS_CONFIG_S3_ACCESS_KEY environment variable');
	disabledFeatures.s3 = true;
}

if (!config.cdn.s3.secret) {
	logger.warn('Failed to find s3 secret key config. Disabling feature. To enable feature set the PN_BOSS_CONFIG_S3_ACCESS_SECRET environment variable');
	disabledFeatures.s3 = true;
}

if (disabledFeatures.s3) {
	if (!config.cdn.disk_path) {
		logger.error('s3 file storage is disabled and no CDN disk path was set. Set the PN_BOSS_CONFIG_CDN_DISK_PATH environment variable');
        process.exit(0)
	}

	config.cdn.disk_path = path.resolve(config.cdn.disk_path);

	fs.ensureDirSync(config.cdn.disk_path);
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