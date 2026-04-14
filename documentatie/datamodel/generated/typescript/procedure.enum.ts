/**
 * Procedure
 * @see {@link http://www.w3.org/ns/sosa/Procedure}
 * A workflow, protocol, plan, algorithm, or computational method specifying how to make an Observation, create a Sample, or make a change to the state of the world (via an Actuator). A Procedure is re-usable, and might be involved in many Observations, Samplings, or Actuations. It explains the steps to be carried out to arrive at reproducible results.
 */
export enum Procedure {
	EMISSIE = 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#EmissieProcedure',
	MEET = 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetProcedure',
	ONTTREKKING = 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#OnttrekkingProcedure',
	TRANSPORT = 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure',
	VERWERKING = 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerwerkingProcedure'
}
