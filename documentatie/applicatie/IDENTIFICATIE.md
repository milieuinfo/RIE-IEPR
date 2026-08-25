# RIE-IEPR Datamodel
## Identificatie

> De business analyse staat op: https://www.milieuinfo.be/confluence/display/BIVS/Vereisten+mbt+IDs

We maken een onderscheid tussen identificatie van versies en identificatie van entiteiten.
Algemeen is de identificatie van entiteiten vrij simpel omdat we als loket geen register zijn dat globaal (over meerdere exploitanten heen) uniek moet zijn.
We hebben ook niet de nodige applicatieve regels om te bepalen wanneer een emissiepunt wijzigt of volledig verdwijnt. We kunnen dus volstaan met een eenvoudige identificatie van entiteiten, waarbij we er van uit gaan dat een emissiepunt altijd hetzelfde blijft zolang het niet verdwijnt.

Binnen RIE-IEPR is dit op de meeste plaatsen steeds een UUID, al is het op enkele plaatsen een meer natuurlijke identifier. Voor simpliciteit noemt dit in de documentatie `<local_id>` wat kan duiden op iets natuurlijk of UUID.

[TOC]

### Versie identificatie

#### Entiteiten
Versies van entiteiten worden geidentificeerd door volgende attributen:
- `<local_id>`: een unieke identifier binnen de context van een exploitant. Dit kan een UUID zijn, maar ook een natuurlijk gegenereerde identifier.
- `geldig_van`: de datum waarop de entiteit geldig wordt. Dit is een datum zonder tijdsaanduiding.
- `aangemaakt_op`: de datum en tijd waarop de entiteit is aangemaakt. Dit is een timestamp.

Deze drie attributen identificeren een versie functioneel op unieke wijze. In de databank wordt dit niet als primaire sleutel gemodelleerd, maar als een unieke sleutel (UK) op een tabel die een eigen surrogaatsleutel `id` (UUID) als primaire sleutel heeft (zie [DATABANK.md](./DATABANK.md)).

> MOTIVATIE: Waarom geen geldig_tot? Het toevoegen van een geldig_tot aan deze unieke sleutel impliceert dat er een overlap kan zijn van twee versies, gemaakt op hetzelfde moment met dezelfde geldig_van en geldig_tot. Op hetzelfde moment kan je twee versies maken, maar de geldig_van zal steeds verschillend zijn.
> Bijkomstig kan de geldig_van en aangemaakt_op niet wijzigen, maar de geldig_tot kan van de sentinelwaarde `9999-12-31` naar een echte einddatum wijzigen. Dit maakt het maken van indexen op deze attributen moeilijker.

#### Relaties (MANY_TO_MANY)
Relaties tussen entiteiten worden geïdentificeerd door de combinatie van de identificatie van de bron en de identificatie van het doel. Dit betekent dat een relatie uniek is als de combinatie van de lokale identificatoren van de bron en het doel uniek is.
Bijkomend zal er ook een `geldig_van` en `aangemaakt_op` attribuut zijn dat mee tot de unieke sleutel behoort van de relatie (ook hier met een surrogaatsleutel `id` (UUID) als primaire sleutel):
- `<bron_local_id>`: de lokale identifier van de bronentiteit.
- `<doel_local_id>`: de lokale identifier van de doelentiteit.
- `geldig_van`: de datum waarop de relatie geldig wordt. Dit is een datum zonder tijdsaanduiding.
- `aangemaakt_op`: de datum en tijd waarop de relatie is aangemaakt. Dit is een timestamp.

> MOTIVATIE: Als geldig_van en aangemaakt_op niet deel uitmaken van deze unieke sleutel kan je bijvoorbeeld niet een relatie verwijderen en daarna terug toevoegen. (b.v. tussen X en Y was het emissiepunt niet gekoppeld aan een installatie).

### Externe identificatie
Omdat het loket dat we bouwen geen register is dat globaal uniek moet zijn, kan het volstaan om externe identificatie te koppelen
aan entiteiten.

Hiervoor hebben we een aparte tabel voorzien, genaamd "externe_identificator". Deze bevat volgende attributen:
- `notatie`: De waarde van de identificatie
- `schema`: De organisatie die de identificatie heeft uitgegeven ("VMM", "DOMG", ...)
- `datatype`: Het (data)type van de identificatie als URI

Externe identificaties kunnen gekoppeld worden aan meerdere entiteiten en een entiteit kan meerdere externe identificaties hebben.

In het datamodel zijn er data types voorzien voor de externe identificatie die eigen zijn aan RIE-IEPR. Deze data types zijn:
- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#putNummer
- ...

*(Zie ook: https://milieuinfo.github.io/RIE-IEPR/#datatypes)*