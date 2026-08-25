import { Gebeurtenis } from './gebeurtenis.interface';
import { Observatie } from './observatie.model';
import { ObservatieVerzameling } from './observatieverzameling.model';
import { Proces } from './proces.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Onttrekking
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking}
 * Een onttrekking is een specifiek onttrekkingsevent dat betrekking heeft op het winnen of bemonsteren van grondstoffen aan onttrekkingspunten over of op een bepaalde periode of momentopname.
 */
@jsonObject
export class Onttrekking implements Gebeurtenis {
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
	 * Een onttrekking moet gekoppeld zijn aan een proces
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
