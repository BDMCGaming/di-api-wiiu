import express from 'express';
import { config } from '@/config_manager';

const router: express.Router = express.Router();

/**
 * [GET]
 * Replacement for: https://api.disney.com/infinity/config/v1/wiiu
 * Description: Gets the URL config for all other features for Disney Infinity 1.0 Wii U
 */

// TODO - Function CKFReceiveCloudURLs mentions configs for server_friend, server_chat, host_friend, host_chat. We need to find out what these are

router.get('/infinity/config/v1/wiiu', async (request: express.Request, response: express.Response) => {
    const apiUrl: string = config.domains.api;
    const cdnUrl: string = config.domains.cdn;

    const responseConfig = {
        url_authentication: `${apiUrl}/coregames/did/v1/`,
        url_bi: `${apiUrl}/bi/v1/batch`,
        // TODO: Find the official URL path that this uses
        url_geopixel: `${apiUrl}/infinity/geopixel/`,
        url_feed_ticker: `${apiUrl}/infinity/feed/v1/wiiu/ticker/`,
        url_feed_storefront: `${apiUrl}/infinity/feed/v1/wiiu/storefront/`,
        url_saved_games: `${apiUrl}/infinity/save/v1/wiiu/`,
        url_ugc_public: `${apiUrl}/infinity/ugc/v1/wiiu/public/`,
        url_ugc_private: `${apiUrl}/infinity/ugc/v1/wiiu/private/`,
        url_profiles: `${apiUrl}/infinity/profile/v1/wiiu/`,
        url_catalogs: `${apiUrl}/infinity/catalogs/v1/`,
        url_missions: `${apiUrl}/infinity/missions/v1/`,
        // "server_friend":
        // "server_chat":
        // TODO: Find the official URL path that this uses
        url_social: `${apiUrl}/infinity/social/v1/`,
        // TODO: Find the official URL path that this uses
        url_phrase_chat: `${apiUrl}/infinity/phrasechat/v1/`,
        // "host_friend":
        // "host_chat":
        // "disney_shop":
        url_events: `${apiUrl}/infinity/events/v1/`,
        url_activity_stream: `${apiUrl}/disneynetwork/activitystream/v1`,
        url_activity_stream_icons: `${cdnUrl}/infinity1/streamicons`,
        url_activity_stream_links: `${apiUrl}`,
        url_geoip_locale: `${apiUrl}/capmon/`,
        // * I hope they don't mind us using their NATNEG servers.
        url_natneg_domain: 'openspy.net',
    };

    response.json(responseConfig);
});

export default router;
