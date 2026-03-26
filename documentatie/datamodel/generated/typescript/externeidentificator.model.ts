import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * ExterneIdentificator
 * @see {@link http://www.w3.org/ns/adms#Identifier}
 */
@jsonObject
export class ExterneIdentificator {
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

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 */
	@jsonMember({ name: 'notation' })
	datatype: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 */
	@jsonMember({ name: 'notation' })
	notatie?: string;

	/**
	 * schemeAgency
	 * @see {@link http://www.w3.org/ns/adms#schemeAgency}
	 * The name of the agency responsible for issuing the identifier
	 */
	@jsonMember({ name: 'schemeAgency' })
	schema?: string;

}
