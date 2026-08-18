#!/usr/bin/env python3
"""Prepare the RIE-IEPR ontology for Widoco.

Widoco 1.4.25 bundles OWLAPI 5.1.x whose RDF->OWL consumer cannot translate
some owl:Restriction constructs (e.g. owl:onProperty pointing at annotation
properties such as dct:subject or rdfs:label).  OWLAPI then substitutes the
affected class hierarchy with placeholder error entities (owlapi/error#ErrorN).

This script strips those owl:Restriction superclass constraints (and owl:imports)
so Widoco documents the named class hierarchy cleanly.  The source ontology is
left untouched.
"""
import sys
import rdflib
from rdflib import URIRef, BNode, RDF, RDFS, OWL

ONTOLOGY_SRC = sys.argv[1] if len(sys.argv) > 1 else "src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl"
ONTOLOGY_OUT = sys.argv[2] if len(sys.argv) > 2 else "documentatie/datamodel/tmp/riepr-widoco.ttl"

ONT = URIRef("https://data.riepr.omgeving.vlaanderen.be/ns/riepr")

g = rdflib.Graph()
g.parse(ONTOLOGY_SRC, format="turtle")

g.remove((None, OWL.imports, None))

removed = 0
for s, o in list(g.subject_objects(RDFS.subClassOf)):
    if isinstance(o, BNode) and (o, RDF.type, OWL.Restriction) in g:
        g.remove((s, RDFS.subClassOf, o))
        for t in list(g.triples((o, None, None))):
            g.remove(t)
        removed += 1

g.add((ONT, RDF.type, OWL.Ontology))

import os
os.makedirs(os.path.dirname(ONTOLOGY_OUT) or ".", exist_ok=True)
g.serialize(ONTOLOGY_OUT, format="turtle")
print("prepared {} triples for Widoco ({} restriction blocks removed)".format(len(g), removed))
