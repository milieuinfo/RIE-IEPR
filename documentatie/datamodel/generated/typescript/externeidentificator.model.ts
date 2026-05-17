import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * ExterneIdentificator
 * @see {@link http://www.w3.org/ns/adms#Identifier}
 */
@jsonObject
export class ExterneIdentificator {
	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een externe identificator heeft een notatie waarde
	 */
	@jsonMember({ name: 'notation' })
	datatype: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een externe identificator heeft een notatie waarde
	 */
	@jsonMember({ name: 'notation' })
	notatie?: string;

	/**
	 * notatietype
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype}
	 * Het datatype-IRI van een skos:notation typed literal, opgeslagen als URI-string zodat het datatype en de notatie-waarde afzonderlijk bewaard worden.
	 */
	@jsonMember(() => AnyURI, { name: 'notatietype' })
	notatietype?: AnyURI;

}
