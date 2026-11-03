import express from 'express';;
import IP2LocationManager from '@/ip2location';


const router: express.Router = express.Router();

/**
 * [GET]
 * Replacement for: https://tredir.go.com/capmon/GetDE
 * Description: Retrieves the Geo-IP data associated with an IP address
 */

// * This domain is still up actually. The game crashes as a result of a super long header that it sends though.
// * We are only sending what the game needs and what we need. To match the official response, we would need to forward requests to the domain.

router.get('/capmon/GetDE', async (request: express.Request, response: express.Response) => {
    const ip = request.ip
    const geoIPLocation = ip ? IP2LocationManager.lookup(ip) : undefined
    
    return response.send(`geoDecoder.country.name = united states<br>geoDecoder.country.isoCode = usa`)
    //return response.send(`geoDecoder.country.name = ${geoIPLocation?.countryLong}<br>geoDecoder.country.isoCode = ${geoIPLocation?.countryShort}`)
});

export default router;