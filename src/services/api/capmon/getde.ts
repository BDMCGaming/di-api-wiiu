import express from 'express';
import IP2LocationManager from '@/ip2location';

const router: express.Router = express.Router();

// * Setup a map as countryShort uses Alpha-2 codes while we need Alpha-3 codes

const countryIsoCode = new Map([
  ['AF', 'AFG'], ['AL', 'ALB'], ['DZ', 'DZA'], ['AD', 'AND'], ['AO', 'AGO'],
  ['AR', 'ARG'], ['AM', 'ARM'], ['AU', 'AUS'], ['AT', 'AUT'], ['AZ', 'AZE'],
  ['BS', 'BHS'], ['BH', 'BHR'], ['BD', 'BGD'], ['BB', 'BRB'], ['BY', 'BLR'],
  ['BE', 'BEL'], ['BZ', 'BLZ'], ['BJ', 'BEN'], ['BT', 'BTN'], ['BO', 'BOL'],
  ['BA', 'BIH'], ['BW', 'BWA'], ['BR', 'BRA'], ['BN', 'BRN'], ['BG', 'BGR'],
  ['BF', 'BFA'], ['BI', 'BDI'], ['KH', 'KHM'], ['CM', 'CMR'], ['CA', 'CAN'],
  ['CL', 'CHL'], ['CN', 'CHN'], ['CO', 'COL'], ['CR', 'CRI'], ['HR', 'HRV'],
  ['CU', 'CUB'], ['CY', 'CYP'], ['CZ', 'CZE'], ['DK', 'DNK'], ['DJ', 'DJI'],
  ['DO', 'DOM'], ['EC', 'ECU'], ['EG', 'EGY'], ['SV', 'SLV'], ['EE', 'EST'],
  ['ET', 'ETH'], ['FJ', 'FJI'], ['FI', 'FIN'], ['FR', 'FRA'], ['DE', 'DEU'],
  ['GH', 'GHA'], ['GR', 'GRC'], ['GT', 'GTM'], ['HN', 'HND'], ['HK', 'HKG'],
  ['HU', 'HUN'], ['IS', 'ISL'], ['IN', 'IND'], ['ID', 'IDN'], ['IR', 'IRN'],
  ['IQ', 'IRQ'], ['IE', 'IRL'], ['IL', 'ISR'], ['IT', 'ITA'], ['JM', 'JAM'],
  ['JP', 'JPN'], ['JO', 'JOR'], ['KZ', 'KAZ'], ['KE', 'KEN'], ['KR', 'KOR'],
  ['KW', 'KWT'], ['LV', 'LVA'], ['LB', 'LBN'], ['LY', 'LBY'], ['LT', 'LTU'],
  ['LU', 'LUX'], ['MY', 'MYS'], ['MX', 'MEX'], ['MC', 'MCO'], ['MN', 'MNG'],
  ['MA', 'MAR'], ['NL', 'NLD'], ['NZ', 'NZL'], ['NG', 'NGA'], ['NO', 'NOR'],
  ['PK', 'PAK'], ['PA', 'PAN'], ['PY', 'PRY'], ['PE', 'PER'], ['PH', 'PHL'],
  ['PL', 'POL'], ['PT', 'PRT'], ['QA', 'QAT'], ['RO', 'ROU'], ['RU', 'RUS'],
  ['SA', 'SAU'], ['SG', 'SGP'], ['SK', 'SVK'], ['SI', 'SVN'], ['ZA', 'ZAF'],
  ['ES', 'ESP'], ['LK', 'LKA'], ['SE', 'SWE'], ['CH', 'CHE'], ['TW', 'TWN'],
  ['TH', 'THA'], ['TR', 'TUR'], ['UA', 'UKR'], ['AE', 'ARE'], ['GB', 'GBR'],
  ['US', 'USA'], ['UY', 'URY'], ['VE', 'VEN'], ['VN', 'VNM'], ['ZW', 'ZWE']
]);

/**
 * [GET]
 * Replacement for: https://tredir.go.com/capmon/GetDE
 * Description: Retrieves the Geo-IP data associated with an IP address
 */

// * This domain is still up actually. The game crashes as a result of a super long header that it sends though.
// * We are only sending what the game needs and what we need. To match the official response, we would need to forward requests to the domain.

router.get('/capmon/GetDE', async (request: express.Request, response: express.Response) => {
    const ip = request.ip;
    const geoIPLocation = ip ? IP2LocationManager.lookup(ip) : undefined;

    if (!geoIPLocation || geoIPLocation.countryLong == '-') {
        // * Fallback in the event that there is no IP or there is a local IP.
        return response.send('geoDecoder.country.name = Unknown<br>geoDecoder.country.isoCode = USA')
    }

    return response.send(`geoDecoder.country.name = ${geoIPLocation?.countryLong}<br>geoDecoder.country.isoCode = ${countryIsoCode.get(geoIPLocation.countryShort)}`);
});

export default router;
