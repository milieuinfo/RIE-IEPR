import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * parameter
 * @see {@link http://www.w3.org/ns/sosa/observedProperty}
 * Relation linking an Observation to the property that was observed. The ObservableProperty should be a property of the FeatureOfInterest (linked by hasFeatureOfInterest) of this Observation.
 */
@jsonObject
export class parameter {
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
	 * observedProperty
	 * @see {@link http://www.w3.org/ns/sosa/observedProperty}
	 * Relation linking an Observation to the property that was observed. The ObservableProperty should be a property of the FeatureOfInterest (linked by hasFeatureOfInterest) of this Observation.
	 */
	@jsonArrayMember(() => string, { name: 'observedProperty' })
	observedProperty?: string[];

}
