import { Exploitatie } from './exploitatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Contactpersoon
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon}
 * Contactpersoon zijn de gegevens van een persoon die optreedt als contact binnen een bepaalde functie voor een exploitant.
 */
@jsonObject
export class Contactpersoon {
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
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Contactpersonen kunnen een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Contactpersonen kunnen een telefoonnummer hebben
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Contactpersonen kunnen een opmerking hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

	/**
	 * hasTarget
	 * @see {@link http://www.w3.org/ns/oa#hasTarget}
	 * Contactpersonen moeten gekoppeld zijn aan exact één exploitant
	 */
	@jsonMember(() => Exploitatie, { name: 'hasTarget' })
	hasTarget?: Exploitatie;

	/**
	 * mbox
	 * @see {@link http://xmlns.com/foaf/0.1/mbox}
	 * Contactpersonen kunnen een e-mail adres hebben
	 */
	@jsonMember({ name: 'mbox' })
	email?: string;

	/**
	 * name
	 * @see {@link http://xmlns.com/foaf/0.1/name}
	 * Contactpersonen moeten een naam hebben
	 */
	@jsonArrayMember(() => string, { name: 'name' })
	naam?: string[];

	/**
	 * phone
	 * @see {@link http://xmlns.com/foaf/0.1/phone}
	 * Contactpersonen kunnen een telefoonnummer hebben
	 */
	@jsonMember({ name: 'phone' })
	telefoonnummer?: string;

}
