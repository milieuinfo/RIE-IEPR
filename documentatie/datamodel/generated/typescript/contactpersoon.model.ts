import { Exploitant } from './exploitant.model';
import { Exploitatie } from './exploitatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Contactpersoon
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon}
 * Een exploitant contactpersoon is een persoon die optreedt als contactpersoon voor een exploitant.
 */
@jsonObject
export class Contactpersoon {
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
	 * Een exploitant contactpersoon kan een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan: Date;

	/**
	 * created
	 * @see {@link http://purl.org/dc/terms/created}
	 * Een exploitant contactpersoon kan een creatie datum hebben
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
	 * Een exploitant contactpersoon kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een exploitant contactpersoon kan een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Een exploitant contactpersoon kan een opmerking hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een exploitant contactpersoon moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * hasRole
	 * @see {@link http://www.w3.org/ns/org#hasRole}
	 * Een exploitant contactpersoon moet een functie hebben binnen de organisatie
	 */
	@jsonMember({ name: 'hasRole' })
	functie?: string;

	/**
	 * memberOf
	 * @see {@link http://www.w3.org/ns/org#memberOf}
	 */
	@jsonArrayMember(() => Exploitatie, { name: 'memberOf' })
	contactpersoonVan?: (Exploitatie | Exploitant)[];

	/**
	 * mbox
	 * @see {@link http://xmlns.com/foaf/0.1/mbox}
	 * Een exploitant contactpersoon kan een e-mailadres hebben
	 */
	@jsonMember({ name: 'mbox' })
	email?: string;

	/**
	 * name
	 * @see {@link http://xmlns.com/foaf/0.1/name}
	 * Een exploitant contactpersoon moet een naam hebben
	 */
	@jsonArrayMember(() => string, { name: 'name' })
	name?: string[];

	/**
	 * phone
	 * @see {@link http://xmlns.com/foaf/0.1/phone}
	 * Een exploitant contactpersoon kan een telefoonnummer hebben
	 */
	@jsonMember({ name: 'phone' })
	telefoonnummer?: string;

}
