import { Aangifte } from './aangifte.model';
import { Gebeurtenis } from './gebeurtenis.interface';
import { MeetInstrument } from './meetinstrument.model';
import { Resultaat } from './resultaat.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Observatie
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie}
 * Een observatie is een waarneming of meting uitgevoerd op een emissie via een meetinstrument.
 */
@jsonObject
export class Observatie {
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
	 * Een observatie is gekoppeld aan een Emissie, Onttrekking of Uitwisseling
	 */
	@jsonMember(() => Gebeurtenis, { name: 'hasFeatureOfInterest' })
	betrekkingTot?: Gebeurtenis;

	/**
	 * hasResult
	 * @see {@link http://www.w3.org/ns/sosa/hasResult}
	 * Een observatie heeft minstens één resultaat.
	 */
	@jsonArrayMember(() => Resultaat, { name: 'hasResult' })
	heeftResultaat?: Resultaat[];

	/**
	 * madeBySensor
	 * @see {@link http://www.w3.org/ns/sosa/madeBySensor}
	 * Een observatie kan gedaan zijn door een meetinstrument
	 */
	@jsonMember(() => MeetInstrument, { name: 'madeBySensor' })
	madeBySensor?: MeetInstrument;

	/**
	 * observedProperty
	 * @see {@link http://www.w3.org/ns/sosa/observedProperty}
	 * Een observatie kan een geobserveerde eigenschap hebben
	 */
	@jsonMember({ name: 'observedProperty' })
	observedProperty?: string;

	/**
	 * phenomenonTime
	 * @see {@link http://www.w3.org/ns/sosa/phenomenonTime}
	 * Een observatie kan een verschijnsel tijdsinterval hebben
	 */
	@jsonMember({ name: 'phenomenonTime' })
	phenomenonTime?: string;

	/**
	 * resultTime
	 * @see {@link http://www.w3.org/ns/sosa/resultTime}
	 * Een observatie kan een resultaat tijdstip hebben
	 */
	@jsonMember(() => Date, { name: 'resultTime' })
	resultTime?: Date;

	/**
	 * usedProcedure
	 * @see {@link http://www.w3.org/ns/sosa/usedProcedure}
	 * Een observatie kan een gebruikte bepalingsmethode hebben
	 */
	@jsonMember({ name: 'usedProcedure' })
	usedProcedure?: string;

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

}
