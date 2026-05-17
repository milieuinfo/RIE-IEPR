import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Rubriek
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek}
 * Een rubriek is een specifieke classificatie die wordt gebruikt om activiteiten te categoriseren volgens de regelgeving.
 */
@jsonObject
export class Rubriek {
	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een rubriek kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * definition
	 * @see {@link http://www.w3.org/2004/02/skos/core#definition}
	 * Een rubriek kan een beschrijving hebben
	 */
	@jsonMember({ name: 'definition' })
	definition?: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een rubriek moet een code hebben
	 */
	@jsonMember({ name: 'notation' })
	datatype: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een rubriek moet een code hebben
	 */
	@jsonMember({ name: 'notation' })
	notatie?: string;

}
