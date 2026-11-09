import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Resultaat
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat}
 * Een resultaat is het resultaat record van een observatie.
 */
@jsonObject
export class Resultaat {
	/**
	 * id
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id}
	 */
	@jsonMember({ name: 'id' })
	id: string;

	/**
	 * uuid
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId}
	 * UUID
	 */
	@jsonMember({ name: 'uuid' })
	uuid?: string;

	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

	/**
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 */
	@jsonMember({ name: 'created' })
	aangemaaktOp?: string;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 */
	@jsonMember({ name: 'issued' })
	geldigVan?: string;

	/**
	 * hasUnit
	 * @see {@link http://qudt.org/schema/qudt/hasUnit}
	 * Een resultaat kan een eenheid hebben
	 */
	@jsonMember({ name: 'hasUnit' })
	eenheid?: string;

	/**
	 * numericValue
	 * @see {@link http://qudt.org/schema/qudt/numericValue}
	 * Een resultaat kan een numerieke waarde hebben
	 */
	@jsonMember({ name: 'numericValue' })
	waarde?: number;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Een resultaat kan een tekstuele waarde hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

}
