import { Aangifte } from './aangifte.model';
import { Exploitatie } from './exploitatie.model';
import { Exploitatielocatie } from './exploitatielocatie.model';
import { ExterneIdentificator } from './externeidentificator.model';
import { Rubriek } from './rubriek.model';
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
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een systeem moet een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan: Date;

	/**
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 * Een systeem moet een creatie datum hebben
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
	 * Een systeem kan een typering hebben via dct:type
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
	@jsonMember(() => Rubriek, { name: 'status' })
	status?: Rubriek;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een systeem kan een revisie zijn van een andere systemen (optioneel)
	 */
	@jsonMember(() => Systeem, { name: 'wasRevisionOf' })
	revisieVan?: Systeem;

	/**
	 * isHostedBy
	 * @see {@link http://www.w3.org/ns/sosa/isHostedBy}
	 * Een filter kan gehost worden door een exploitatielocatie
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
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

}
