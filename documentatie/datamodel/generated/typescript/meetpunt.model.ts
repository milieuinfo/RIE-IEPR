import { Aangifte } from './aangifte.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Filter } from './filter.model';
import { MeetInstrument } from './meetinstrument.model';
import { Status } from './status.enum';
import { Systeem } from './systeem.interface';
import { Systeemeigenschap } from './systeemeigenschap.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Meetpunt
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt}
 * Een meetpunt is een specifiek punt waar metingen worden uitgevoerd om de kwaliteit van de uitstoot of de omgeving te controleren.
 */
@jsonObject
export class Meetpunt implements Systeem {
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
	 * Een meetpunt moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een meetpunt moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan?: Date;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een meetpunt kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een meetpunt kan een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een meetpunt kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasGeometry
	 * @see {@link http://www.opengis.net/ont/geosparql#hasGeometry}
	 * Een meetpunt mag max 1 geometrie hebben
	 */
	@jsonMember({ name: 'hasGeometry' })
	geometrie?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een meetpunt moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * identifier
	 * @see {@link http://www.w3.org/ns/adms#identifier}
	 * Een meetpunt heeft externe identificaties (optioneel)
	 */
	@jsonArrayMember(() => ExterneIdentificator, { name: 'identifier' })
	identifier?: ExterneIdentificator[];

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een meetpunt moet een enkele status hebben
	 */
	@jsonMember(() => String, { name: 'status' })
	status?: Status;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een meetpunt kan een revisie zijn van een andere systemen (optioneel)
	 */
	@jsonMember(() => Systeem, { name: 'wasRevisionOf' })
	revisieVan?: Systeem;

	/**
	 * hasProperty
	 * @see {@link http://www.w3.org/ns/ssn/hasProperty}
	 * Een meetpunt kan meerdere eigenschappen hebben
	 */
	@jsonArrayMember(() => Systeemeigenschap, { name: 'hasProperty' })
	heeftEigenschap?: Systeemeigenschap[];

	/**
	 * hasSubSystem
	 * @see {@link http://www.w3.org/ns/ssn/hasSubSystem}
	 * Een meetpunt kan meetinstrumenten hebben
	 */
	@jsonArrayMember(() => MeetInstrument, { name: 'hasSubSystem' })
	heeftSubSysteem?: (MeetInstrument | Filter)[];

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

	/**
	 * inGebruikTot
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot}
	 * De niet-functionele datum waarop een entiteit buiten gebruik is gesteld.
	 */
	@jsonMember(() => Date, { name: 'inGebruikTot' })
	inGebruikTot?: Date;

	/**
	 * inGebruikVanaf
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf}
	 * De niet-functionele datum waarop een entiteit in gebruik is genomen.
	 */
	@jsonMember(() => Date, { name: 'inGebruikVanaf' })
	inGebruikVanaf?: Date;

}
