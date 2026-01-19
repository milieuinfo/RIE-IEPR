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
                # Add property to class
                if 'properties' not in classes[class_name]:
                    classes[class_name]['properties'] = {}
                classes[class_name]['properties'][prop_name] = range_name
        
        # Handle relationships between classes
        if row.get('subjectClass') and row.get('objectClass') and row.get('predicate'):
            subject_class = simplify_uri(row['subjectClass'])
            object_class = simplify_uri(row['objectClass'])
            predicate = simplify_uri(row['predicate'])
            
            # Clean up predicate name
            clean_predicate = predicate
            clean_predicate = clean_predicate.replace('http://www.w3.org/ns/prov#', '')
            clean_predicate = clean_predicate.replace('http://www.w3.org/ns/sosa/', '')
            clean_predicate = clean_predicate.replace('http://purl.org/net/p-plan#', '')
            clean_predicate = clean_predicate.replace('http://www.opengis.net/ont/geosparql#', '')
            clean_predicate = clean_predicate.replace('http://www.w3.org/2000/01/rdf-schema#', '')
            
            if subject_class and object_class and subject_class != object_class:
                relationships.add((subject_class, object_class, clean_predicate))
    
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
        
        # Add properties
        if 'properties' in class_data:
            for prop, range_type in sorted(class_data['properties'].items()):
                # Clean up range type
                clean_range = range_type.replace('http://www.w3.org/2001/XMLSchema#', '')
                clean_range = clean_range.replace('http://www.w3.org/2000/01/rdf-schema#', '')
                print(f"        {prop}: {clean_range}")
        
        # Add comment if available
        if 'comment' in class_data:
            comment = class_data['comment'].replace('"', '\"')
            print(f'        "{comment}"')
            
        print("    }")
        print()
    
    # Then define relationships
    if relationships:
        print("    %% Relationships")
        for subject, object_type, predicate in sorted(relationships):
            print(f"    {subject} --> {object_type} : {predicate}")

if __name__ == "__main__":
    generate_mermaid(sys.stdin)