import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Resultaat
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat}
 * Een resultaat is de waarde van een observatie.
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
	 * numericValue
	 * @see {@link http://qudt.org/schema/qudt/numericValue}
	 * Een resultaat kan een numerieke waarde hebben
	 */
	@jsonMember({ name: 'numericValue' })
	waarde?: number;

	/**
	 * unit
	 * @see {@link http://qudt.org/schema/qudt/unit}
	 * Een resultaat kan een eenheid hebben
	 */
	@jsonMember({ name: 'unit' })
	eenheid?: string;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Een resultaat kan een tekstuele waarde hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

}
