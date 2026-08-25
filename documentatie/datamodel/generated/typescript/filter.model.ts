import { Aangifte } from './aangifte.model';
import { Exploitatie } from './exploitatie.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Status } from './status.enum';
import { Systeem } from './systeem.interface';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Filter
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter}
 * Een filter is een specifiek systeem dat wordt gebruikt om de kwaliteit van de uitstoot te verbeteren door het verwijderen of verminderen van schadelijke stoffen.
 */
@jsonObject
export class Filter implements Systeem {
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
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 * Een systeem moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een systeem moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan?: Date;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een systeem kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een systeem moet een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een filter kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasGeometry
	 * @see {@link http://www.opengis.net/ont/geosparql#hasGeometry}
	 * Een systeem mag max 1 geometrie hebben
	 */
	@jsonMember({ name: 'hasGeometry' })
	geometrie?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een systeem moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * identifier
	 * @see {@link http://www.w3.org/ns/adms#identifier}
	 * Een systeem heeft externe identificaties (optioneel)
	 */
	@jsonArrayMember(() => ExterneIdentificator, { name: 'identifier' })
	identifier?: ExterneIdentificator[];

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een systeem moet een enkele status hebben
	 */
	@jsonMember(() => String, { name: 'status' })
	status?: Status;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een systeem kan een revisie zijn van een andere systemen (optioneel)
	 */
	@jsonMember(() => Systeem, { name: 'wasRevisionOf' })
	revisieVan?: Systeem;

	/**
	 * hasDeployment
	 * @see {@link http://www.w3.org/ns/ssn/hasDeployment}
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'hasDeployment' })
	hasDeployment?: Exploitatie[];

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
