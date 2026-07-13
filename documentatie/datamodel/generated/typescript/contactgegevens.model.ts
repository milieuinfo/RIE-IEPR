import { Exploitatie } from './exploitatie.model';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Contactgegevens
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactgegevens}
 * Contactgegevens zijn de gegevens van een persoon die optreedt als contactpersoon voor een exploitant.
 */
@jsonObject
export class Contactgegevens {
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
	 * Contactgegevens kunnen een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Contactgegevens kunnen een opmerking hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

	/**
	 * hasTarget
	 * @see {@link http://www.w3.org/ns/oa#hasTarget}
	 * Contactgegevens moeten gekoppeld zijn aan exact één exploitant
	 */
	@jsonMember(() => Exploitatie, { name: 'hasTarget' })
	hasTarget?: Exploitatie;

	/**
	 * name
	 * @see {@link http://xmlns.com/foaf/0.1/name}
	 * Contactgegevens moeten een naam hebben
	 */
	@jsonArrayMember(() => string, { name: 'name' })
	name?: string[];

	/**
	 * phone
	 * @see {@link http://xmlns.com/foaf/0.1/phone}
	 * Contactgegevens kunnen een telefoonnummer hebben
	 */
	@jsonMember({ name: 'phone' })
	telefoonnummer?: string;

}
