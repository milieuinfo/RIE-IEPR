import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * ExterneIdentificator
 * @see {@link http://www.w3.org/ns/adms#Identifier}
 * This class is based on the UN/CEFACT Identifier complex type defined in See Section 5.8 of Core Components Data Type Catalogue Version 3.1 (http://www.unece.org/fileadmin/DAM/cefact/codesfortrade/CCTS/CCTS-DTCatalogueVersion3p1.pdf) In RDF this is expressed using the following properties: - the content string should be provided using skos:notation, datatyped with the identifier scheme (inclduing the version number if appropriate); - use dcterms:creator to link to a class describing the agency that manages the identifier scheme or adms:schemaAgency to provide the name as a literal. Although not part of the ADMS conceptual model, it may be useful to provide further properties to the Identifier class such as dcterms:created to provide the date on which the identifier was issued.
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
	 * schemeAgency
	 * @see {@link http://www.w3.org/ns/adms#schemeAgency}
	 * The name of the agency responsible for issuing the identifier
	 */
	@jsonMember({ name: 'schemeAgency' })
	schema?: string;

	/**
	 * notatietype
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype}
	 * Het datatype-IRI van een skos:notation typed literal, opgeslagen als URI-string zodat het datatype en de notatie-waarde afzonderlijk bewaard worden.
	 */
	@jsonMember(() => AnyURI, { name: 'notatietype' })
	notatietype?: AnyURI;

}
