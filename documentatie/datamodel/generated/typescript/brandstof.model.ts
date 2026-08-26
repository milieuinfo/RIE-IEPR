import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Brandstof
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Brandstof}
 */
@jsonObject
export class Brandstof {
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
