package be.vlaanderen.omgeving.mjv.model.structuur;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Embeddable;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumns;
import java.io.Serializable;
import java.util.List;

/**
 * ExterneIdentificator
 * <a href="http://www.w3.org/ns/adms#Identifier">Identifier</a>
 **/
@Getter
@Setter
@Entity(name = "ExterneIdentificator")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "externe_identificator")
public class ExterneIdentificator implements IriReferentie {
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	/**
	 * uri
	 * <a href="http://example.org/vocab/uri">uri</a>
	 * URI
	 */
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	/**
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een externe identificator heeft een notatie waarde
	 */
	@Column(name = "notatie", nullable = true)
	@JsonIgnore
	private String notatie;
	/**
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een externe identificator heeft een notatie waarde
	 */
	@Column(name = "notatie", nullable = true)
	@JsonIgnore
	private String notatie_datatype;
	/**
	 * schemaAgency
	 * <a href="http://www.w3.org/ns/adms#schemaAgency">schemaAgency</a>
	 * Een externe identificator heeft een schema-agentschap dat de bron van de identificator aanduidt (bv. 'VMM', 'DOMG')
	 */
	@Column(name = "schema_agency", nullable = true)
	@JsonProperty("schemaAgency")
	private String schemaAgency;
	/**
	 * notatietype
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype">notatietype</a>
	 * Het datatype-IRI van een skos:notation typed literal, opgeslagen als URI-string zodat het datatype en de notatie-waarde afzonderlijk bewaard worden.
	 */
	@Column(name = "notatietype", nullable = true)
	@JsonIgnore
	private String notatietype;
	/**
	 * notatietype
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype">notatietype</a>
	 * Het datatype-IRI van een skos:notation typed literal, opgeslagen als URI-string zodat het datatype en de notatie-waarde afzonderlijk bewaard worden.
	 */
	@Column(name = "notatietype", nullable = true)
	@JsonIgnore
	private String notatietype_datatype;

	/** notation as JSON-LD: a typed literal when the datatype is set. */
	@jakarta.persistence.Transient
	@JsonProperty("notation")
	public Object getNotatieJsonLd() {
		if (notatie == null || notatie_datatype == null) {
			return notatie;
		}
		java.util.Map<String, Object> literal = new java.util.LinkedHashMap<>();
		literal.put("@value", notatie);
		literal.put("@type", notatie_datatype);
		return literal;
	}

	@JsonSetter("notation")
	public void setNotatieJsonLd(Object value) {
		if (value instanceof java.util.Map<?, ?> literal) {
			Object literalValue = literal.get("@value");
			Object literalType = literal.get("@type");
			this.notatie = literalValue != null ? literalValue.toString() : null;
			this.notatie_datatype = literalType != null ? literalType.toString() : null;
		} else {
			this.notatie = value != null ? value.toString() : null;
			this.notatie_datatype = null;
		}
	}

	/** notatietype as JSON-LD: a typed literal when the datatype is set. */
	@jakarta.persistence.Transient
	@JsonProperty("notatietype")
	public Object getNotatietypeJsonLd() {
		if (notatietype == null || notatietype_datatype == null) {
			return notatietype;
		}
		java.util.Map<String, Object> literal = new java.util.LinkedHashMap<>();
		literal.put("@value", notatietype);
		literal.put("@type", notatietype_datatype);
		return literal;
	}

	@JsonSetter("notatietype")
	public void setNotatietypeJsonLd(Object value) {
		if (value instanceof java.util.Map<?, ?> literal) {
			Object literalValue = literal.get("@value");
			Object literalType = literal.get("@type");
			this.notatietype = literalValue != null ? literalValue.toString() : null;
			this.notatietype_datatype = literalType != null ? literalType.toString() : null;
		} else {
			this.notatietype = value != null ? value.toString() : null;
			this.notatietype_datatype = null;
		}
	}

	@jakarta.persistence.Transient
	@JsonProperty(value = "@type", access = JsonProperty.Access.READ_ONLY)
	public String getRdfType() {
		return "http://www.w3.org/ns/adms#Identifier";
	}
}
