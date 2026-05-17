import { Observation } from './observation.interface';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Resultaat
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat}
 * Een resultaat is de gemeten of berekende waarde van een observatie.
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
	 * hasUnit
	 * @see {@link http://qudt.org/schema/qudt/hasUnit}
	 * Een resultaat heeft een eenheid
	 */
	@jsonMember({ name: 'hasUnit' })
	eenheid?: string;

	/**
	 * numericValue
	 * @see {@link http://qudt.org/schema/qudt/numericValue}
	 * Een resultaat heeft een numerieke waarde
	 */
	@jsonMember({ name: 'numericValue' })
	waarde?: number;

	/**
	 * isResultOf
	 * @see {@link http://www.w3.org/ns/sosa/isResultOf}
	 */
	@jsonArrayMember(() => Observation, { name: 'isResultOf' })
	isResultOf?: Observation[];

}
