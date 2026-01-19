#!/usr/bin/env python3

import csv
import sys
from collections import defaultdict
import re

def simplify_uri(uri):
    """Simplify URI to just the local name"""
    if uri:
        # Remove angle brackets if present
        uri = uri.strip('<>')
        # Get last part after / or #
        return uri.split('/')[-1].split('#')[-1]
    return uri

def get_prefix(uri):
    """Get the prefix for a URI"""
    if not uri:
        return ""
    
    uri = uri.strip('<>')
    
    # Common prefixes
    prefixes = {
        'https://data.riepr.omgeving.vlaanderen.be/id/concept/': 'riepr:',
        'https://data.rieiepr.omgeving.vlaanderen.be/id/concept/': 'rieiepr:',
        'http://www.w3.org/ns/prov#': 'prov:',
        'http://www.w3.org/ns/sosa/': 'sosa:',
        'http://purl.org/net/p-plan#': 'pplan:',
        'http://www.opengis.net/ont/geosparql#': 'geo:',
        'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
        'http://www.w3.org/2001/XMLSchema#': 'xsd:',
        'http://www.w3.org/2004/02/skos/core#': 'skos:',
    }
    
    for prefix_uri, prefix_name in prefixes.items():
        if uri.startswith(prefix_uri):
            return prefix_name
    
    return ""

def generate_mermaid(csv_file):
    classes = defaultdict(dict)
    relationships = set()
    
    reader = csv.DictReader(csv_file)
    
    for row in reader:
        class_name = simplify_uri(row['class'])
        
        # Skip empty or invalid classes
        if not class_name or class_name.startswith('http'):
            continue
            
        # Add label if available
        if row['label']:
            classes[class_name]['label'] = row['label']
            
        # Add comment if available
        if row['comment']:
            classes[class_name]['comment'] = row['comment']
        
        # Handle properties
        if row['property']:
            prop_name = simplify_uri(row['property'])
            range_name = simplify_uri(row['range']) if row['range'] else "string"
            
            # Skip standard RDF/RDFS properties
            if prop_name and not prop_name.startswith('rdf') and not prop_name.startswith('rdfs'):
                # Add property to class - store both the simplified name and full URI for prefix lookup
                if 'properties' not in classes[class_name]:
                    classes[class_name]['properties'] = {}
                classes[class_name]['properties'][prop_name] = {
                    'range': range_name,
                    'uri': row['property']  # Store full URI for prefix lookup later
                }
        
        # Handle relationships between classes
        if row.get('subjectClass') and row.get('objectClass') and row.get('predicate'):
            subject_class = simplify_uri(row['subjectClass'])
            object_class = simplify_uri(row['objectClass'])
            predicate_uri = row['predicate']  # Keep full URI
            
            if subject_class and object_class and subject_class != object_class:
                relationships.add((subject_class, object_class, predicate_uri))
    
    # Generate Mermaid syntax
    print("classDiagram")
    print("    %% Generated from RDF data using csv_to_mermaid.py")
    print("    %% Source: RIE-IEPR datamodel")
    print()
    
    # First define all classes
    for class_name, class_data in sorted(classes.items()):
        print(f"    class {class_name} {{")
        
        # Add label as first line
        if 'label' in class_data:
            # Escape quotes in label
            label = class_data['label'].replace('"', '\"')
            print(f'        "{label}"')
        
        # Add properties with prefixes (Mermaid compatible)
        if 'properties' in class_data:
            for prop, prop_data in sorted(class_data['properties'].items()):
                # Get prefix for property using stored URI
                prop_prefix = get_prefix(prop_data['uri']) if prop_data.get('uri') else ""
                range_type = prop_data['range']
                
                # Get prefix for range
                range_prefix = get_prefix(range_type) if range_type else ""
                
                # Clean up range type but keep prefix
                clean_range = range_type
                if range_prefix:
                    clean_range = f"{range_prefix}{simplify_uri(range_type)}"
                else:
                    clean_range = clean_range.replace('http://www.w3.org/2001/XMLSchema#', '')
                    clean_range = clean_range.replace('http://www.w3.org/2000/01/rdf-schema#', '')
                
                # Show property with prefix (replace colon with space for Mermaid compatibility)
                if prop_prefix:
                    prop_name = f"{prop_prefix}{prop}"
                    print(f"        {prop_name} {clean_range}")
                else:
                    print(f"        {prop} {clean_range}")
        
        # Add comment if available
        if 'comment' in class_data:
            comment = class_data['comment'].replace('"', '\"')
            print(f'        "{comment}"')
            
        print("    }")
        print()
    
    # Then define relationships with prefixes
    if relationships:
        print("    %% Relationships")
        print()  # Add empty line after relationships header
        for subject, object_type, predicate in sorted(relationships):
            # Get prefix for predicate
            pred_prefix = get_prefix(predicate)
            
            # Show relationship with prefixes
            if pred_prefix:
                # Get just the local name of the predicate
                pred_local = simplify_uri(predicate)
                # Replace colon with space for Mermaid compatibility
                relationship_label = f"{pred_prefix}{pred_local}".replace(":", "_")
                print(f"    {subject} --> {object_type} : {relationship_label}")
            else:
                # Replace colon with space for Mermaid compatibility
                relationship_label = predicate.replace(":", " ")
                print(f"    {subject} --> {object_type} : {relationship_label}")

if __name__ == "__main__":
    #with open('/tmp/mermaid_data.csv', 'r') as f:
    #    generate_mermaid(f)
    generate_mermaid(sys.stdin)
