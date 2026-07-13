import { Aangifte } from './aangifte.model';
import { Procedure } from './procedure.enum';
import { ProcesVariabele } from './procesvariabele.model';
import { Rubriek } from './rubriek.model';
import { Systeem } from './systeem.interface';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

/**
 * Proces
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces}
 * Een (milieu)proces is een door de gebruiker in te vullen industrieel proces op een bepaalde locatie bestaande uit meerdere procedurestappen die het proces beschrijven. Een proces kan hiërarchisch opgebouwd zijn als een plan met substappen.
 */
@jsonObject
export class Proces {
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
	 * Een proces moet een datum hebben waarop het is ingegeven
	 */
	@jsonMember(() => Date, { name: 'created' })
	aangemaaktOp?: Date;

	/**
	 * issued
	 * @see {@link http://purl.org/dc/terms/issued}
	 * Een proces kan een geldigheid start hebben
	 */
	@jsonMember(() => Date, { name: 'issued' })
	geldigVan?: Date;

	/**
	 * valid
	 * @see {@link http://purl.org/dc/terms/valid}
	 * Een proces kan een geldigheid einde hebben
	 */
	@jsonMember(() => Date, { name: 'valid' })
	geldigTot?: Date;

	/**
	 * modified
	 * @see {@link http://purl.org/dc/terms/modified}
	 * Een proces moet een modificatie datum hebben
	 */
	@jsonMember(() => Date, { name: 'modified' })
	aangepastOp?: Date;

	/**
	 * type
	 * @see {@link http://purl.org/dc/terms/type}
	 * Een proces kan zijn afgeleid van een (generieke) procedure (optioneel). Max 1 omdat een proces slechts van 1 procedure afgeleid kan zijn en deze procedure een verzameling van andere procedures zou moeten zijn.
	 */
	@jsonMember(() => String, { name: 'type' })
	type?: Procedure;

	/**
	 * hasInputVar
	 * @see {@link http://purl.org/net/p-plan#hasInputVar}
	 * Een proces mag minstens één inputvariabele hebben (stof)
	 */
	@jsonArrayMember(() => ProcesVariabele, { name: 'hasInputVar' })
	heeftInvoer?: ProcesVariabele[];

	/**
	 * hasOutputVar
	 * @see {@link http://purl.org/net/p-plan#hasOutputVar}
	 * Een proces mag minstens één outputvariabele hebben (stof)
	 */
	@jsonArrayMember(() => ProcesVariabele, { name: 'hasOutputVar' })
	heeftUitvoer?: ProcesVariabele[];

	/**
	 * hasStep
	 * @see {@link http://purl.org/net/p-plan#hasStep}
	 */
	@jsonArrayMember(() => Proces, { name: 'hasStep' })
	hasStep?: Proces[];

	/**
	 * isPrecededBy
	 * @see {@link http://purl.org/net/p-plan#isPrecededBy}
	 * Een proces mag een of meer andere processen als voorgaande stap hebben.
	 */
	@jsonArrayMember(() => Proces, { name: 'isPrecededBy' })
	volgtOp?: Proces[];

	/**
	 * isStepOfPlan
	 * @see {@link http://purl.org/net/p-plan#isStepOfPlan}
	 * Een proces kan deel uitmaken van een ander proces
	 */
	@jsonMember(() => Proces, { name: 'isStepOfPlan' })
	onderdeelVan?: Proces;

	/**
	 * comment
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#comment}
	 * Een proces kan een beschrijving hebben
	 */
	@jsonMember({ name: 'comment' })
	beschrijving?: string;

	/**
	 * label
	 * @see {@link http://www.w3.org/2000/01/rdf-schema#label}
	 * Een proces moet een benaming hebben
	 */
	@jsonMember({ name: 'label' })
	benaming?: string;

	/**
	 * wasRevisionOf
	 * @see {@link http://www.w3.org/ns/prov#wasRevisionOf}
	 * Een proces kan een revisie zijn van een ander proces (optioneel)
	 */
	@jsonMember(() => Proces, { name: 'wasRevisionOf' })
	revisieVan?: Proces;

	/**
	 * implementedBy
	 * @see {@link http://www.w3.org/ns/ssn/implementedBy}
	 * Een proces kan het gebruik van een systeem representeren
	 */
	@jsonMember(() => Systeem, { name: 'implementedBy' })
	systeem: Systeem;

	/**
	 * aangifte
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte}
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@jsonMember(() => Aangifte, { name: 'aangifte' })
	aangifte?: Aangifte;

	/**
	 * rubriek
	 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek}
	 * De rubriek die van toepassing is op een proces of installatie.
	 */
	@jsonArrayMember(() => Rubriek, { name: 'rubriek' })
	rubriek?: Rubriek[];

}
