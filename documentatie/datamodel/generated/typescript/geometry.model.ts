import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Geometry
 * @see {@link http://www.opengis.net/ont/geosparql#Geometry}
 */
@jsonObject
export class Geometry {
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
	 * asWKT
	 * @see {@link http://www.opengis.net/ont/geosparql#asWKT}
	 * Een geometrie heeft exact 1 WKT-serialisatie
	 */
	@jsonMember({ name: 'asWKT' })
	asWKT?: string;

}
