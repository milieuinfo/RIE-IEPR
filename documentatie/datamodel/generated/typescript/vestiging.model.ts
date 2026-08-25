import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Vestiging
 * @see {@link http://www.w3.org/ns/org#Site}
 */
@jsonObject
export class Vestiging {
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
