import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Resultaat
 * @see {@link http://www.w3.org/ns/sosa/Result}
 */
@jsonObject
export class Resultaat {
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

	/**
	 * ingediend
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend}
	 * Indicates whether the entity is ingediend (posted) or not (draft)
	 */
	@jsonMember({ name: 'ingediend' })
	ingediend?: boolean;

}
