import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Monster
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Monster}
 * Een monster is een deel van een onderzochte materie dat door een monstername wordt verkregen.
 */
@jsonObject
export class Monster {
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
