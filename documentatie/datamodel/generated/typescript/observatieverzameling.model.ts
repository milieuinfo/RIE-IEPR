import { Aangifte } from './aangifte.model';
import { Gebeurtenis } from './gebeurtenis.interface';
import { Observatie } from './observatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * ObservatieVerzameling
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ObservatieVerzameling}
 * Een observatieverzameling is een verzameling van waarnemingen of metingen uitgevoerd op een emissie of onttrekking over een bepaalde periode of op een bepaald moment.
 */
@jsonObject
export class ObservatieVerzameling {
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
	 * Een observatieverzameling moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * hasFeatureOfInterest
	 * @see {@link http://www.w3.org/ns/sosa/hasFeatureOfInterest}
	 * Een observatieverzameling is gekoppeld aan een Emissie of Onttrekking
	 */
	@jsonMember(() => Gebeurtenis, { name: 'hasFeatureOfInterest' })
	betrekkingTot?: Gebeurtenis;

	/**
	 * hasMember
	 * @see {@link http://www.w3.org/ns/sosa/hasMember}
	 * Een observatieverzameling bestaat uit ten minste één observatie (of geneste observatieverzameling)
	 */
	@jsonArrayMember(() => Observatie, { name: 'hasMember' })
	hasMember?: Observatie[];

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

}
