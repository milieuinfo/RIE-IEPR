import { Gebeurtenis } from './gebeurtenis.interface';
import { Proces } from './proces.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Uitwisseling
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisseling}
 * Een uitwisseling is een specifiek uitwisselingspunt dat betrekking heeft op het transporteren van stoffen tussen emissie- en onttrekkingspunten over of op een bepaalde periode of momentopname.
 */
@jsonObject
export class Uitwisseling implements Gebeurtenis {
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
	 * hasFeatureOfInterest
	 * @see {@link http://www.w3.org/ns/sosa/hasFeatureOfInterest}
	 * Een uitwisseling moet gekoppeld zijn aan een proces
	 */
	@jsonArrayMember(() => Proces, { name: 'hasFeatureOfInterest' })
	betrekkingTot?: Proces[];

}
