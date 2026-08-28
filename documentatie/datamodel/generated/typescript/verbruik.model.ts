import { Gebeurtenis } from './gebeurtenis.interface';
import { Observatie } from './observatie.model';
import { ObservatieVerzameling } from './observatieverzameling.model';
import { Proces } from './proces.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Verbruik
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Verbruik}
 * Een verbruik is een specifieke gebeurtenis dat betrekking heeft op het verbruiken van stoffen aan verbruikspunten over of op een bepaalde periode of momentopname.
 */
@jsonObject
export class Verbruik implements Gebeurtenis {
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
	 * wasDerivedFrom
	 * @see {@link http://www.w3.org/ns/prov#wasDerivedFrom}
	 * Een verbruik moet gekoppeld zijn aan een proces
	 */
	@jsonArrayMember(() => Proces, { name: 'wasDerivedFrom' })
	wasDerivedFrom?: Proces[];

	/**
	 * isFeatureOfInterestOf
	 * @see {@link http://www.w3.org/ns/sosa/isFeatureOfInterestOf}
	 */
	@jsonArrayMember(() => Observatie, { name: 'isFeatureOfInterestOf' })
	isFeatureOfInterestOf?: (Observatie | ObservatieVerzameling)[];

}
