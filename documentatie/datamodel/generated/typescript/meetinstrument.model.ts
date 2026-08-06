import { Aangifte } from './aangifte.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Status } from './status.enum';
import { Systeem } from './systeem.interface';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * MeetInstrument
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument}
 * Een meetinstrument is een specifiek apparaat of systeem dat wordt gebruikt om metingen uit te voeren op meetpunten.
 */
@jsonObject
export class MeetInstrument implements Systeem {
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
	 * Een meetinstrument moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een meetinstrument moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan?: Date;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een meetinstrument kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een meetinstrument moet een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een meetinstrument kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een meetinstrument moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * identifier
	 * @see {@link http://www.w3.org/ns/adms#identifier}
	 * Een meetinstrument heeft externe identificaties (optioneel)
	 */
	@jsonArrayMember(() => ExterneIdentificator, { name: 'identifier' })
	identifier?: ExterneIdentificator[];

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een meetinstrument moet een enkele status hebben
	 */
	@jsonMember(() => String, { name: 'status' })
	status?: Status;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een meetinstrument kan een revisie zijn van een andere systemen (optioneel)
	 */
	@jsonMember(() => Systeem, { name: 'wasRevisionOf' })
	revisieVan?: Systeem;

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
