import { Emissiepunt } from './emissiepunt.model';

/**
 * AbstractEmissiepunt
 * @see {@link https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt}
 * Een abstract emissiepunt is een conceptueel emissiepunt dat niet noodzakelijk een vaste locatie heeft, maar wel een functionele rol vervult in het proces.
 */
@jsonObject
export class AbstractEmissiepunt extends Emissiepunt {
}
