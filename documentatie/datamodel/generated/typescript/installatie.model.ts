import { Aangifte } from './aangifte.model';
import { Exploitatie } from './exploitatie.model';
import { Exploitatielocatie } from './exploitatielocatie.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Rubriek } from './rubriek.model';
import { Systeem } from './systeem.interface';
import { SysteemEigenschap } from './systeemeigenschap.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Installatie
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie}
 * Een installatie is infrastructuur of een verzameling van infrastructuur op een bepaalde locatie die een specifieke functie vervult.
 */
@jsonObject
export class Installatie implements Systeem {
	/**
	 * uuid
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId}
	 * UUID
	 */
	@jsonMember({ name: 'uuid' })
	uuid: string;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een installatie moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan: Date;

	/**
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 * Een installatie moet een creatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp: Date;

	/**
	 * uri
	 * @see {@link http://example.org/vocab/uri}
	 * URI
	 */
	@jsonMember({ name: 'uri' })
	uri?: string;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een installatie kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een installatie moet een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een installatie kan een typering hebben via dct:type
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * hasGeometry
	 * @see {@link http://www.opengis.net/ont/geosparql#hasGeometry}
	 * Een installatie mag max 1 geometrie hebben
	 */
	@jsonMember({ name: 'hasGeometry' })
	geometrie?: string;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Een installatie kan een beschrijving hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een installatie moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * identifier
	 * @see {@link http://www.w3.org/ns/adms#identifier}
	 * Een installatie heeft externe identificaties (optioneel)
	 */
	@jsonArrayMember(() => ExterneIdentificator, { name: 'identifier' })
	identifier?: ExterneIdentificator[];

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een installatie moet een enkele status hebben
	 */
	@jsonMember(() => Rubriek, { name: 'status' })
	status?: Rubriek;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een installatie kan een revisie zijn van een andere systemen (optioneel)
	 */
	@jsonMember(() => Systeem, { name: 'wasRevisionOf' })
	revisieVan?: Systeem;

	/**
	 * isHostedBy
	 * @see {@link http://www.w3.org/ns/sosa/isHostedBy}
	 * Een installatie kan gehost worden door een exploitatielocatie
	 */
	@jsonMember(() => Exploitatielocatie, { name: 'isHostedBy' })
	locatie?: Exploitatielocatie;

	/**
	 * hasDeployment
	 * @see {@link http://www.w3.org/ns/ssn/hasDeployment}
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'hasDeployment' })
	hasDeployment?: Exploitatie[];

	/**
	 * hasProperty
	 * @see {@link http://www.w3.org/ns/ssn/hasProperty}
	 * Een installatie kan meerdere eigenschappen hebben
	 */
	@jsonArrayMember(() => SysteemEigenschap, { name: 'hasProperty' })
	heeftEigenschap?: SysteemEigenschap[];

	/**
	 * hasSubSystem
	 * @see {@link http://www.w3.org/ns/ssn/hasSubSystem}
	 * Een installatie kan meerdere objecten bevatten.
	 */
	@jsonArrayMember(() => Systeem, { name: 'hasSubSystem' })
	heeftSubSysteem?: Systeem[];

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

	/**
	 * ingediend
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend}
	 * Een installatie kan een referentie hebben naar een aangifte.
	 */
	@jsonArrayMember(() => string, { name: 'ingediend' })
	ingediend?: string[];

}
