import { Aangifte } from './aangifte.model';
import { Gebeurtenis } from './gebeurtenis.interface';
import { ObservatieVerzameling } from './observatieverzameling.model';
import { Resultaat } from './resultaat.model';
import { Systeem } from './systeem.interface';
import { Uitvoerder } from './uitvoerder.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Observatie
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie}
 * Een observatie is een waarneming of meting uitgevoerd op een emissie of onttrekking.
 */
@jsonObject
export class Observatie {
	/**
	 * id
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id}
	 */
	@jsonMember({ name: 'id' })
	id: string;

	/**
	 * uuid
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId}
	 * UUID
	 */
	@jsonMember({ name: 'uuid' })
	uuid?: string;

	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

	/**
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 * Een observatie moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 */
	@jsonMember({ name: 'issued' })
	geldigVan?: string;

	/**
	 * wasAssociatedWith
	 * @see {@link http://www.w3.org/ns/prov#wasAssociatedWith}
	 * Een observatie kan één of meer uitvoerders hebben.
	 */
	@jsonArrayMember(() => Uitvoerder, { name: 'wasAssociatedWith' })
	verantwoordelijke?: Uitvoerder[];

	/**
	 * hasFeatureOfInterest
	 * @see {@link http://www.w3.org/ns/sosa/hasFeatureOfInterest}
	 * Een observatie is gekoppeld aan een Emissie of Onttrekking
	 */
	@jsonMember(() => Gebeurtenis, { name: 'hasFeatureOfInterest' })
	betrekkingTot?: Gebeurtenis;

	/**
	 * hasResult
	 * @see {@link http://www.w3.org/ns/sosa/hasResult}
	 * Een observatie heeft één resultaat.
	 */
	@jsonMember(() => Resultaat, { name: 'hasResult' })
	heeftResultaat?: Resultaat;

	/**
	 * isMemberOf
	 * @see {@link http://www.w3.org/ns/sosa/isMemberOf}
	 * Een observatie kan deel uitmaken van een observatieverzameling
	 */
	@jsonMember(() => ObservatieVerzameling, { name: 'isMemberOf' })
	isLidVan?: ObservatieVerzameling;

	/**
	 * madeBySensor
	 * @see {@link http://www.w3.org/ns/sosa/madeBySensor}
	 * Een observatie kan zijn gemaakt door een meetpunt of ander systeem (sosa:madeBySensor)
	 */
	@jsonMember(() => Systeem, { name: 'madeBySensor' })
	waargenomenMet?: Systeem;

	/**
	 * observedProperty
	 * @see {@link http://www.w3.org/ns/sosa/observedProperty}
	 * Een observatie moet precies één geobserveerde eigenschap hebben
	 */
	@jsonMember({ name: 'observedProperty' })
	eigenschap?: string;

	/**
	 * phenomenonTime
	 * @see {@link http://www.w3.org/ns/sosa/phenomenonTime}
	 * Een observatie kan een verschijnsel tijdsinterval hebben
	 */
	@jsonMember({ name: 'phenomenonTime' })
	verschijnseltijd?: string;

	/**
	 * resultTime
	 * @see {@link http://www.w3.org/ns/sosa/resultTime}
	 * Een observatie kan een resultaat tijdstip hebben
	 */
	@jsonMember(() => Date, { name: 'resultTime' })
	resultaattijd?: Date;

	/**
	 * usedProcedure
	 * @see {@link http://www.w3.org/ns/sosa/usedProcedure}
	 * Een observatie kan een gebruikte bepalingsmethode hebben
	 */
	@jsonMember({ name: 'usedProcedure' })
	gebruikteProcedure?: string;

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

}
