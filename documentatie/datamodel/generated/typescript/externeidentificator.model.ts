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
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een externe identificator heeft een notatie waarde
	 */
	@jsonMember({ name: 'notation' })
	notatie?: string;

	/**
	 * notation
	 * @see {@link http://www.w3.org/2004/02/skos/core#notation}
	 * Een externe identificator heeft een notatie waarde
	 */
	@jsonMember({ name: 'notation' })
	notatie_datatype: string;

	/**
	 * schemaAgency
	 * @see {@link http://www.w3.org/ns/adms#schemaAgency}
	 * Een externe identificator heeft een schema-agentschap dat de bron van de identificator aanduidt (bv. 'VMM', 'DOMG')
	 */
	@jsonMember({ name: 'schemaAgency' })
	schemaAgency?: string;

}
