import { Exploitatie } from './exploitatie.model';
import { Observatie } from './observatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Aangifte
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte}
 * Een aangifte is een document dat wordt ingediend bij de overheid.
 */
@jsonObject
export class Aangifte {
	/**
	 * vlaanderenId
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId}
	 * Een unieke identificatie binnen de context van Vlaanderen, gebruikt voor het identificeren van entiteiten zoals aangiften.
	 */
	@jsonMember({ name: 'vlaanderenId' })
	vlaanderenId: string;

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
	 * Een aangifte kan deel zijn van een andere aangifte.
	 */
	@jsonMember(() => Aangifte, { name: 'isPartOf' })
	onderdeelVan?: Aangifte;

	/**
	 * subject
	 * @see {@link http://purl.org/dc/terms/subject}
	 * Een aangifte heeft betrekking tot een concept.
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'subject' })
	subject?: (Exploitatie | Observatie)[];

	/**
	 * wasAssociatedWith
	 * @see {@link http://www.w3.org/ns/prov#wasAssociatedWith}
	 * Een aangifte heeft optioneel een auteur (die verschillend kan zijn dan de indiener).
	 */
	@jsonMember({ name: 'wasAssociatedWith' })
	verantwoordelijke?: string;

	/**
	 * informatieclassificatie
	 * @see {@link https://data.vlaanderen.be/ns/dossier#informatieclassificatie}
	 * Een aangifte heeft een informatie classificatie.
	 */
	@jsonMember({ name: 'informatieclassificatie' })
	informatieclassificatie?: string;

}
