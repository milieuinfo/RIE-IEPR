import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Aangifte
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte}
 * Een aangifte is een specifieke gebeurtenis waarbij een aanvraag of melding wordt ingediend bij de overheid.
 */
@jsonObject
export class Aangifte {
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
	 * ingediend
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend}
	 * Indicates whether the entity is ingediend (posted) or not (draft)
	 */
	@jsonMember({ name: 'ingediend' })
	ingediend?: boolean;

	/**
	 * hadPart
	 * @see {@link http://www.w3.org/ns/prov#hadPart}
	 * Een aangifte heeft meerdere stukken
	 */
	@jsonArrayMember(() => Stuk, { name: 'hadPart' })
	hadPart?: Stuk[];

}
