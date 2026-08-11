import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Adres
 * @see {@link http://www.w3.org/ns/locn#Address}
 */
@jsonObject
export class Adres {
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
	 * fullAddress
	 * @see {@link http://www.w3.org/ns/locn#fullAddress}
	 * Een adres kan een volledig adres hebben als vrije tekst
	 */
	@jsonMember({ name: 'fullAddress' })
	fullAddress?: string;

	/**
	 * locatorDesignator
	 * @see {@link http://www.w3.org/ns/locn#locatorDesignator}
	 * Een adres kan een huisnummer of locatieaanduiding hebben
	 */
	@jsonMember({ name: 'locatorDesignator' })
	locatorDesignator?: string;

}
