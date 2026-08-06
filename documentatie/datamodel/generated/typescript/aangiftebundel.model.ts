import { Exploitant } from './exploitant.model';
import { Status } from './status.enum';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * AangifteBundel
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AangifteBundel}
 * Een aangifte bundel is een verzameling van aangiften die samen worden ingediend bij de overheid door een enkele exploitant.
 */
@jsonObject
export class AangifteBundel {
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
	 * Een aangifte bundel heeft een datum van indiening.
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * creator
	 * @see {@link http://purl.org/dc/terms/creator}
	 * Een aangifte bundel is gelinked aan de exploitant
	 */
	@jsonMember(() => Exploitant, { name: 'creator' })
	creator?: Exploitant;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een aangifte kan een datum van goedkeuring hebben.
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een aangifte bundel heeft een typering.
	 */
	@jsonMember({ name: 'type' })
	type?: string;

	/**
	 * status
	 * @see {@link http://www.w3.org/ns/adms#status}
	 * Een aangifte heeft een status.
	 */
	@jsonMember(() => String, { name: 'status' })
	status?: Status;

	/**
	 * vlaanderenId
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId}
	 * Een unieke identificatie binnen de context van Vlaanderen, gebruikt voor het identificeren van entiteiten zoals aangiften.
	 */
	@jsonMember({ name: 'vlaanderenId' })
	vlaanderenId?: string;

}
