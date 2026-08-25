import { Aangifte } from './aangifte.model';
import { Exploitatie } from './exploitatie.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Status } from './status.enum';
import { Systeem } from './systeem.interface';
import { Systeemeigenschap } from './systeemeigenschap.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Emissiepunt
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt}
 * Een emissiepunt is een specifiek punt waar stoffen de installatie verlaten en in de omgeving worden uitgestoten.
 */
@jsonObject
export class Emissiepunt implements Systeem {
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
	 * Een emissiepunt moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een emissiepunt moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan?: Date;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een emissiepunt kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een emissiepunt moet een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een emissiepunt kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasGeometry
	 * @see {@link http://www.opengis.net/ont/geosparql#hasGeometry}
	 * Een emissiepunt mag max 1 geometrie hebben
	 */
	@jsonMember({ name: 'hasGeometry' })
	geometrie?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een emissiepunt moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * identifier
	 * @see {@link http://www.w3.org/ns/adms#identifier}
	 * Een emissiepunt heeft externe identificaties (optioneel)
	 */
	@jsonArrayMember(() => ExterneIdentificator, { name: 'identifier' })
	identifier?: ExterneIdentificator[];

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een emissiepunt moet een enkele status hebben
	 */
	@jsonMember(() => String, { name: 'status' })
	status?: Status;

	/**
	 * hasDeployment
	 * @see {@link http://www.w3.org/ns/ssn/hasDeployment}
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'hasDeployment' })
	hasDeployment?: Exploitatie[];

	/**
	 * hasProperty
	 * @see {@link http://www.w3.org/ns/ssn/hasProperty}
	 * Een emissiepunt kan meerdere eigenschappen hebben
	 */
	@jsonArrayMember(() => Systeemeigenschap, { name: 'hasProperty' })
	heeftEigenschap?: Systeemeigenschap[];

	/**
	 * hasSubSystem
	 * @see {@link http://www.w3.org/ns/ssn/hasSubSystem}
	 * Een emissiepunt kan meerdere objecten bevatten.
	 */
	@jsonArrayMember(() => Systeem, { name: 'hasSubSystem' })
	heeftSubSysteem?: Systeem[];

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
