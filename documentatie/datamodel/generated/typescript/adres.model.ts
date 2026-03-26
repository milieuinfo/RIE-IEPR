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
	 * ingediend
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend}
	 * Indicates whether the entity is ingediend (posted) or not (draft)
	 */
	@jsonMember({ name: 'ingediend' })
	ingediend?: boolean;

	/**
	 * postCode
	 * @see {@link http://www.w3.org/ns/locn#postCode}
	 * The post code (a.k.a postal code, zip code etc.). Post codes are common elements in many countries' postal address systems. The domain of locn:postCode is locn:Address.
	 */
	@jsonMember({ name: 'postCode' })
	postcode?: string;

	/**
	 * postName
	 * @see {@link http://www.w3.org/ns/locn#postName}
	 * The key postal division of the address, usually the city. (INSPIRE's definition is "One or more names created and maintained for postal purposes to identify a subdivision of addresses and postal delivery points."). The domain of locn:postName is locn:Address.
	 */
	@jsonMember({ name: 'postName' })
	stad?: string;

	/**
	 * thoroughfare
	 * @see {@link http://www.w3.org/ns/locn#thoroughfare}
	 * An address component that represents the name of a passage or way through from one location to another. A thoroughfare is not necessarily a road, it might be a waterway or some other feature. The domain of locn:thoroughfare is locn:Address.
	 */
	@jsonMember({ name: 'thoroughfare' })
	straat?: string;

}
