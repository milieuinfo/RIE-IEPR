import { AangifteBundel } from './aangiftebundel.model';
import { Exploitant } from './exploitant.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Transactie
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie}
 * Een transactie is een proces van indienen, verwerken en goedkeuren van documenten door de rapporteringsplichtige.
 */
@jsonObject
export class Transactie {
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
	 * endedAtTime
	 * @see {@link http://www.w3.org/ns/prov#endedAtTime}
	 * Een transactie heeft een eind datum waarop de transactie is beëindigd
	 */
	@jsonMember(() => Date, { name: 'endedAtTime' })
	einddatum?: Date;

	/**
	 * startedAtTime
	 * @see {@link http://www.w3.org/ns/prov#startedAtTime}
	 * Een transactie heeft een start datum waarop de transactie is gestart
	 */
	@jsonMember(() => Date, { name: 'startedAtTime' })
	startdatum?: Date;

	/**
	 * wasAssociatedWith
	 * @see {@link http://www.w3.org/ns/prov#wasAssociatedWith}
	 * Een transactie heeft een verantwoordelijke agent
	 */
	@jsonMember(() => Exploitant, { name: 'wasAssociatedWith' })
	verantwoordelijke?: Exploitant;

	/**
	 * genereert
	 * @see {@link https://data.vlaanderen.be/ns/dossier#genereert}
	 * Een transactie genereert een enkele aangifte bundel
	 */
	@jsonArrayMember(() => AangifteBundel, { name: 'genereert' })
	genereert?: AangifteBundel[];

}
