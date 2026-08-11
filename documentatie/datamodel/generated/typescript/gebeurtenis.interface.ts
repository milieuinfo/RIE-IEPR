/**
 * Gebeurtenis
 * @see {@link http://www.w3.org/ns/sosa/FeatureOfInterest}
 */
export interface Gebeurtenis {
	/**
	 * uuid
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId}
	 * UUID
	 */
	uuid: string;

	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	uri?: string;

}
