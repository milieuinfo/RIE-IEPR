import { NAMESPACES } from './constants.js';

export class TurtleBuilder {
    constructor() {
        this.prefixes = new Map();
        this.subjects = new Map();
        this.initializePrefixes();
    }

    initializePrefixes() {
        for (const [key, value] of Object.entries(NAMESPACES)) {
            this.prefixes.set(key, value);
        }
        // Ensure onttrekkingspunt prefix exists (used for Grondwaterput subjects)
        if (!this.prefixes.has('ontrekkingspunt')) {
            this.prefixes.set('ontrekkingspunt', 'https://data.riepr.omgeving.vlaanderen.be/id/ontrekkingspunt/');
        }
    }

    triple(subject, predicate, object) {
        if (!this.subjects.has(subject)) {
            this.subjects.set(subject, []);
        }
        this.subjects.get(subject).push([predicate, object]);
    }

    /**
     * Add a quad from N3 Store to TurtleBuilder
     */
    addQuad(quad) {
        const subject = this.formatTerm(quad.subject);
        const predicate = this.formatTerm(quad.predicate);
        const object = this.formatTerm(quad.object);
        
        if (quad.object.termType === 'Literal') {
            const lang = quad.object.language;
            const datatype = quad.object.datatype?.value;
            this.triple(subject, predicate, object);
        } else {
            this.triple(subject, predicate, object);
        }
    }

    /**
     * Format a term from N3 Store for Turtle output
     */
    formatTerm(term) {
        if (term.termType === 'NamedNode') {
            // Check if it matches any known prefix
            for (const [prefix, namespace] of this.prefixes.entries()) {
                if (term.value.startsWith(namespace)) {
                    const localName = term.value.substring(namespace.length);
                    return `${prefix}:${localName}`;
                }
            }
            // No matching prefix, use full URI
            return `<${term.value}>`;
        } else if (term.termType === 'Literal') {
            const value = this.escapeString(term.value);
            if (term.language) {
                return `"${value}"@${term.language}`;
            } else if (term.datatype && term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                // Format datatype as prefix:localName if possible
                let datatypeStr = term.datatype.value;
                for (const [prefix, namespace] of this.prefixes.entries()) {
                    if (datatypeStr.startsWith(namespace)) {
                        datatypeStr = `${prefix}:${datatypeStr.substring(namespace.length)}`;
                        break;
                    }
                }
                return `"${value}"^^${datatypeStr}`;
            } else {
                return `"${value}"`;
            }
        } else if (term.termType === 'BlankNode') {
            return `_:${term.value}`;
        }
        return term.value;
    }

    uri(namespace, localName) {
        return `${namespace}${localName}`;
    }

    qname(prefix, localName) {
        return `${prefix}:${localName}`;
    }

    literal(value, type = null, lang = null) {
        if (value === null || value === undefined) return null;
        
        if (lang) {
            return `"${this.escapeString(value)}"@${lang}`;
        } else if (type) {
            return `"${this.escapeString(value)}"^^${type}`;
        }
        return `"${this.escapeString(value)}"`;
    }

    escapeString(str) {
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    build() {
        let turtle = '';
        
        // Add prefixes
        const sortedPrefixes = Array.from(this.prefixes.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [prefix, namespace] of sortedPrefixes) {
            turtle += `@prefix ${prefix}: <${namespace}> .\n`;
        }
        
        turtle += '\n';
        
        // Add triples grouped by subject with pretty printing
        const sortedSubjects = Array.from(this.subjects.keys()).sort();
        for (const subject of sortedSubjects) {
            turtle += subject + '\n';
            
            const predicates = this.subjects.get(subject);
            for (let i = 0; i < predicates.length; i++) {
                const [predicate, object] = predicates[i];
                const isLast = i === predicates.length - 1;
                const terminator = isLast ? ' .' : ' ;';
                turtle += `    ${predicate} ${object}${terminator}\n`;
            }
            turtle += '\n';
        }
        
        return turtle;
    }
}
