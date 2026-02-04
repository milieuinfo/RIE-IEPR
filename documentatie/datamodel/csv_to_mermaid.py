#!/usr/bin/env python3

import csv
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, Set, Tuple, Optional
import sys

# -----------------------------
# Prefix handling
# -----------------------------

PREFIXES = {
    'http://dbpedia.org/ontology/': 'dbo:',
    'http://purl.org/dc/elements/1.1/': 'dc:',
    'http://purl.org/dc/terms/': 'dct:',
    'http://purl.org/net/p-plan#': 'p-plan:',
    'http://purl.org/vocab/vann/': 'vann:',
    'http://purl.org/vocommons/voaf#': 'voaf:',
    'http://qudt.org/schema/qudt/': 'qudt:',
    'http://qudt.org/vocab/unit/': 'unit:',
    'http://schema.org/': 'schema:',
    'https://data.omgeving.vlaanderen.be/id/concept/parameter/': 'parameter:',
    'https://data.riepr.omgeving.vlaanderen.be/id/activiteit/': 'activiteit:',
    'https://data.riepr.omgeving.vlaanderen.be/id/activity/': 'activity:',
    'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/': 'apparaat:',
    'https://data.riepr.omgeving.vlaanderen.be/id/attribution/': 'attribution:',
    'https://data.riepr.omgeving.vlaanderen.be/id/concept/': 'concept:',
    'https://data.riepr.omgeving.vlaanderen.be/id/concept/platform/': 'platform:',
    'https://data.riepr.omgeving.vlaanderen.be/id/concept/role/': 'role:',
    'https://data.riepr.omgeving.vlaanderen.be/id/concept/status/': 'status:',
    'https://data.riepr.omgeving.vlaanderen.be/id/deployment/': 'deployment:',
    'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/': 'emissiepunt:',
    'https://data.riepr.omgeving.vlaanderen.be/id/entity/': 'entity:',
    'https://data.riepr.omgeving.vlaanderen.be/id/exploitant/': 'exploitant:',
    'https://data.riepr.omgeving.vlaanderen.be/id/exploitatielocatie/': 'exploitatielocatie:',
    'https://data.riepr.omgeving.vlaanderen.be/id/installatie/': 'installatie:',
    'https://data.riepr.omgeving.vlaanderen.be/id/meetpunt/': 'meetpunt:',
    'https://data.riepr.omgeving.vlaanderen.be/id/observation/': 'observation:',
    'https://data.riepr.omgeving.vlaanderen.be/id/procedure/': 'activteitstap:',
    'https://data.riepr.omgeving.vlaanderen.be/id/proces/': 'proces:',
    'https://data.riepr.omgeving.vlaanderen.be/id/stof/': 'stof:',
    'https://data.riepr.omgeving.vlaanderen.be/id/system/': 'system:',
    'https://data.riepr.omgeving.vlaanderen.be/id/time/': 't:',
    'https://data.riepr.omgeving.vlaanderen.be/id/variable/': 'variable:',
    'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#': 'riepr:',
    'https://data.vkbo.omgeving.vlaanderen.be/id/organisatie/': 'vkbo:',
    'https://www.openstreetmap.org/node/': 'osm:',
    'http://www.opengis.net/ont/geosparql#': 'geo:',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
    'http://www.w3.org/1999/xhtml/vocab#': 'xhv:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://www.w3.org/2001/XMLSchema#': 'xsd:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://www.w3.org/2004/02/skos/core#': 'skos:',
    'http://www.w3.org/2006/time#': 'time:',
    'http://www.w3.org/2006/vcard/ns#': 'vcard:',
    'http://www.w3.org/2007/05/powder-s#': 'wdrs:',
    'http://www.w3.org/ns/adms#': 'adms:',
    'http://www.w3.org/ns/dcat#': 'dcat:',
    'http://www.w3.org/ns/dqv#': 'dqv:',
    'http://www.w3.org/ns/locn#': 'locn:',
    'http://www.w3.org/ns/org#': 'org:',
    'http://www.w3.org/ns/prov#': 'prov:',
    'http://www.w3.org/ns/shacl#': 'sh:',
    'http://www.w3.org/ns/sosa/act/': 'sosa-act:',
    'http://www.w3.org/ns/sosa/common/': 'sosa-common:',
    'http://www.w3.org/ns/sosa/dep/': 'sosa-dep:',
    'http://www.w3.org/ns/sosa/obs/': 'sosa-obs:',
    'http://www.w3.org/ns/sosa/prov/': 'sp:',
    'http://www.w3.org/ns/sosa/sam/': 'sosa-sam:',
    'http://www.w3.org/ns/sosa/': 'sosa:',
    'http://www.w3.org/ns/ssn/act/': 'ssn-act:',
    'http://www.w3.org/ns/ssn/common/': 'ssn-common:',
    'http://www.w3.org/ns/ssn/dep/': 'ssn-dep:',
    'http://www.w3.org/ns/ssn/obs/': 'ssn-obs:',
    'http://www.w3.org/ns/ssn/sam/': 'ssn-sam:',
    'http://www.w3.org/ns/ssn/': 'ssn:',
    'http://www.w3.org/XML/1998/namespace': 'xml:',
    'http://www.wikidata.org/entity/': 'wikidata:',
    'http://xmlns.com/foaf/0.1/': 'foaf:'
}

DATATYPES = {
    'string',
    'integer',
    'decimal',
    'boolean',
    'date',
    'dateTime',
}

# -----------------------------
# Utility functions
# -----------------------------

def simplify_uri(uri: Optional[str]) -> Optional[str]:
    if not uri:
        return None
    uri = uri.strip('<>')
    return uri.split('/')[-1].split('#')[-1]

def get_prefix(uri: Optional[str]) -> str:
    if not uri:
        return ''
    uri = uri.strip('<>')
    for base, prefix in PREFIXES.items():
        if uri.startswith(base):
            return prefix
    return ''

def normalize_name(uri: Optional[str]) -> Optional[str]:
    if not uri:
        return None
    local = simplify_uri(uri)
    prefix = get_prefix(uri)
    name = f"{prefix}{local}" if prefix else local
    return name.replace(':', '_')

def is_datatype(range_uri: Optional[str]) -> bool:
    if not range_uri:
        return True
    local = simplify_uri(range_uri)
    prefix = get_prefix(range_uri)
    return prefix == 'xsd:' or local in DATATYPES or local == 'Literal'

def format_type(range_uri: Optional[str]) -> str:
    if not range_uri:
        return 'string'
    local = simplify_uri(range_uri)
    prefix = get_prefix(range_uri)
    if prefix:
        return f"{prefix}{local}"
    return local

# -----------------------------
# Data models
# -----------------------------

@dataclass
class PropertyDef:
    name: str
    range: str
    stereotype: str  # datatypeProperty | objectProperty

@dataclass
class ClassDef:
    name: str
    label: Optional[str] = None
    comment: Optional[str] = None
    properties: Dict[str, PropertyDef] = field(default_factory=dict)

# -----------------------------
# Main logic
# -----------------------------

def generate_mermaid(csv_file):
    classes: Dict[str, ClassDef] = {}
    relationships: Set[Tuple[str, str, str]] = set()

    reader = csv.DictReader(csv_file)

    for row in reader:
        class_name = normalize_name(row.get('class'))
        if not class_name:
            continue

        cls = classes.setdefault(class_name, ClassDef(name=class_name))

        if row.get('label'):
            cls.label = row['label']

        if row.get('comment'):
            cls.comment = row['comment']

        # Properties
        if row.get('property'):
            prop_local = simplify_uri(row['property'])
            prop_prefix = get_prefix(row['property'])
            prop_name = f"{prop_prefix}{prop_local}" if prop_prefix else prop_local
            prop_name = prop_name.replace(':', '_')

            range_uri = row.get('range')
            range_type = format_type(range_uri)

            if is_datatype(range_uri):
                cls.properties[prop_name] = PropertyDef(
                    name=prop_name,
                    range=range_type,
                    stereotype='datatypeProperty'
                )
            else:
                target_class = normalize_name(range_uri)
                if target_class:
                    relationships.add((
                        class_name,
                        target_class,
                        prop_name
                    ))

        # Explicit relationships (optioneel)
        if row.get('subjectClass') and row.get('objectClass') and row.get('predicate'):
            subject = normalize_name(row['subjectClass'])
            obj = normalize_name(row['objectClass'])
            pred = normalize_name(row['predicate'])

            if subject and obj and pred:
                relationships.add((subject, obj, pred))

    # -----------------------------
    # Mermaid output
    # -----------------------------

    print("classDiagram")
    print("    %% Generated from RDF CSV")
    print()

    # Classes
    for cls in sorted(classes.values(), key=lambda c: c.name):
        print(f"    class {cls.name} {{")


        if cls.label:
            print(f'        "{cls.label}"')

        for prop in sorted(cls.properties.values(), key=lambda p: p.name):
            if prop.stereotype == "datatypeProperty":
                print(f"        {prop.name} : {prop.range}")

        if cls.comment:
            print(f'        "{cls.comment}"')

        print("    }\n")
        #print(f"    <<rdfClass>> {cls.name}")
        print(f"    class {cls.name} \n")

    # Datatype stereotypes (visual hint)

    # Datatype classes
    for dt in ["string", "integer", "boolean", "date"]:
        print(f"    class {dt}")
        print(f"    class {dt} datatype")

    # Relationships
    print("    %% Object properties")
    for source, target, label in sorted(relationships):
        if source in classes and target in classes:
            print(f"    {source} --> {target} : <<objectProperty>> {label}")

# -----------------------------
# Entry point
# -----------------------------

if __name__ == "__main__":
    #with open('/tmp/mermaid_data.csv', 'r') as f:
    #    generate_mermaid(f)

    generate_mermaid(sys.stdin)
