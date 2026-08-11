import { Rubriek } from './rubriek.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Systeemeigenschap
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap}
 * Een systeemeigenschap is een specifieke eigenschap van een systeem, zoals de hoogte van de schouw.
 */
@jsonObject
export class Systeemeigenschap {
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
	 * Een systeem eigenschap moet een typering hebben
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasUnit
	 * @see {@link http://qudt.org/schema/qudt/hasUnit}
	 * Een systeem eigenschap kan een eenheid hebben
	 */
	@jsonMember({ name: 'hasUnit' })
	eenheid?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een systeem eigenschap kan een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * value
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#value}
	 * Een systeem eigenschap kan een waarde hebben
	 */
	@jsonMember({ name: 'value' })
	value?: string;

	/**
	 * datatype
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype}
	 * Het datatype van de waarde van een systeem eigenschap.
	 */
	@jsonMember({ name: 'datatype' })
	datatype?: string;

	/**
	 * datatype
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype}
	 * Het datatype van de waarde van een systeem eigenschap.
	 */
	@jsonMember({ name: 'datatype' })
	datatype_datatype: string;

	/**
	 * parameter
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter}
	 * De parameter die wordt gebruikt bij een eigenschap of meting.
	 */
	@jsonMember(() => Rubriek, { name: 'parameter' })
	parameter?: Rubriek;

}
