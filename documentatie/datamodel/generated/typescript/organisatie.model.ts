import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Organisatie
 * @see {@link http://www.w3.org/ns/org#Organization}
 */
@jsonObject
export class Organisatie {
	/**
	 * uuid
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId}
	 * UUID
	 */
	@jsonMember({ name: 'uuid' })
	uuid: string;

	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

}
