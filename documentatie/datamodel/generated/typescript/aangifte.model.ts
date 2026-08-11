import { Aangiftebundel } from './aangiftebundel.model';
import { Exploitatie } from './exploitatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Aangifte
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte}
 * Een aangifte is een document dat wordt ingediend bij de overheid.
 */
@jsonObject
export class Aangifte {
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
	 * Een aangifte heeft een datum van indiening.
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * isPartOf
	 * @see {@link http://purl.org/dc/terms/isPartOf}
	 * Een aangifte kan deel zijn van een andere bundel.
	 */
	@jsonMember(() => Aangiftebundel, { name: 'isPartOf' })
	onderdeelVan?: Aangiftebundel;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een aangifte kan een datum van goedkeuring hebben.
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * subject
	 * @see {@link http://purl.org/dc/terms/subject}
	 * Een aangifte heeft betrekking tot een enkele exploitatie.
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'subject' })
	onderwerp?: Exploitatie[];

	/**
	 * vlaanderenId
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId}
	 * Een unieke identificatie binnen de context van Vlaanderen, gebruikt voor het identificeren van entiteiten zoals aangiften.
	 */
	@jsonMember({ name: 'vlaanderenId' })
	vlaanderenId?: string;

	/**
	 * informatieclassificatie
	 * @see {@link https://data.vlaanderen.be/ns/dossier#informatieclassificatie}
	 * Een aangifte heeft een informatie classificatie.
	 */
	@jsonMember({ name: 'informatieclassificatie' })
	informatieclassificatie?: string;

}
