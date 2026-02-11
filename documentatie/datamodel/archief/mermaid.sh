#!/bin/bash

# Mermaid Class Diagram Generator with Relationships from RDF data
# Usage: ./mermaid.sh

echo "Generating Mermaid class diagram with relationships from RDF data..."

# Combineer alle TTL bestanden
TTL_FILES=$(find '../../src/main/resources/be/vlaanderen/omgeving/riepr/data/id' -type f)
riot --formatted=turtle $TTL_FILES > /tmp/riepr.ttl

# Voer SPARQL query uit en genereer CSV
sparql --results=CSV --data=/tmp/riepr.ttl --query mermaid.rq > /tmp/mermaid_data.csv

# Converteer CSV naar Mermaid syntax
python3 csv_to_mermaid.py < /tmp/mermaid_data.csv > mermaid_class_diagram.mmd

echo "Mermaid class diagram with relationships generated: mermaid_class_diagram.mmd"

# Toon een voorbeeld
echo ""
echo "Preview:"
head -50 mermaid_class_diagram.mmd