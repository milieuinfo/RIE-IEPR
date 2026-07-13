import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * ProcesVariabele
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele}
 * Een proces variabele is een variabel gegeven die als input of output van een proces dient.
 */
@jsonObject
export class ProcesVariabele {
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
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een proces variabele kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasUnit
	 * @see {@link http://qudt.org/schema/qudt/hasUnit}
	 * Een proces variabele kan een eenheid hebben
	 */
	@jsonMember({ name: 'hasUnit' })
	eenheid?: string;

	/**
	 * numericValue
	 * @see {@link http://qudt.org/schema/qudt/numericValue}
	 * Een proces variabele kan een waarde hebben
	 */
	@jsonMember({ name: 'numericValue' })
	waarde?: number;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een proces variabele kan een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

}
