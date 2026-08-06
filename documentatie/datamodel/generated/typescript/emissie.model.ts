import { Gebeurtenis } from './gebeurtenis.interface';
import { Proces } from './proces.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Emissie
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie}
 * Een emissie is een specifiek emissieevent dat betrekking heeft op het uitstoten of lozen van stoffen aan emissiepunten over of op een bepaalde periode of momentopname.
 */
@jsonObject
export class Emissie implements Gebeurtenis {
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
	 * Een emissie moet gekoppeld zijn aan een proces
	 */
	@jsonArrayMember(() => Proces, { name: 'hasFeatureOfInterest' })
	betrekkingTot?: Proces[];

}
