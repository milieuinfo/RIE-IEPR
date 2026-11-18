import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Uitvoerder
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitvoerder}
 * Een uitvoerder is een persoon die een of meer observaties heeft uitgevoerd.
 */
@jsonObject
export class Uitvoerder {
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
