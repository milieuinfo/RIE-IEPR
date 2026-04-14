import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * SysteemEigenschap
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap}
 * Een systeem eigenschap is een specifieke eigenschap van een systeem, zoals de hoogte van de schouw.
 */
@jsonObject
export class SysteemEigenschap {
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
	 * range
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#range}
	 * Een systeem eigenschap moet een datatype hebben
	 */
	@jsonMember({ name: 'range' })
	datatype: string;

	/**
	 * range
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#range}
	 * Een systeem eigenschap moet een datatype hebben
	 */
	@jsonMember({ name: 'range' })
	range?: string;

	/**
	 * value
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#value}
	 * Een systeem eigenschap kan een waarde hebben
	 */
	@jsonMember({ name: 'value' })
	value?: string;

	/**
	 * parameter
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter}
	 * De parameter die wordt gebruikt bij een eigenschap of meting.
	 */
	@jsonMember({ name: 'parameter' })
	parameter?: string;

}
