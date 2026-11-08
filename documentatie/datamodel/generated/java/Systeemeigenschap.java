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
 * Systeemeigenschap
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap">Systeemeigenschap</a>
 * Een systeemeigenschap is een specifieke eigenschap van een systeem, zoals de hoogte van de schouw.
 **/
@Getter
@Setter
@Entity(name = "Systeemeigenschap")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "systeemeigenschap")
public class Systeemeigenschap implements IriReferentie {
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
	 * type
	 * <a href="http://purl.org/dc/terms/type">type</a>
	 * Een systeem eigenschap moet een typering hebben
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * hasUnit
	 * <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	 * Een systeem eigenschap kan een eenheid hebben
	 */
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("hasUnit")
	private String eenheid;
	/**
	 * label
	 * <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	 * Een systeem eigenschap kan een benaming hebben
	 */
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	/**
	 * value
	 * <a href="http://www.w3.org/2000/01/rdf-schema#value">value</a>
	 * Een systeem eigenschap kan een waarde hebben
	 */
	@Column(name = "value", nullable = true)
	@JsonProperty("value")
	private String value;
	/**
	 * datatype
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype">datatype</a>
	 * Het datatype van de waarde van een systeem eigenschap.
	 */
	@Column(name = "datatype", nullable = true)
	@JsonIgnore
	private String datatype;
	/**
	 * datatype
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype">datatype</a>
	 * Het datatype van de waarde van een systeem eigenschap.
	 */
	@Column(name = "datatype", nullable = true)
	@JsonIgnore
	private String datatype_datatype;
	/**
	 * parameter
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter">parameter</a>
	 * De parameter die wordt gebruikt bij een eigenschap of meting.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonSerialize(using = IriReferentieSerializer.class)
	@JsonProperty("parameter")
	private Rubriek parameter;

	/** datatype as JSON-LD: a typed literal when the datatype is set. */
	@jakarta.persistence.Transient
	@JsonProperty("datatype")
	public Object getDatatypeJsonLd() {
		if (datatype == null || datatype_datatype == null) {
			return datatype;
		}
		java.util.Map<String, Object> literal = new java.util.LinkedHashMap<>();
		literal.put("@value", datatype);
		literal.put("@type", datatype_datatype);
		return literal;
	}

	@JsonSetter("datatype")
	public void setDatatypeJsonLd(Object value) {
		if (value instanceof java.util.Map<?, ?> literal) {
			Object literalValue = literal.get("@value");
			Object literalType = literal.get("@type");
			this.datatype = literalValue != null ? literalValue.toString() : null;
			this.datatype_datatype = literalType != null ? literalType.toString() : null;
		} else {
			this.datatype = value != null ? value.toString() : null;
			this.datatype_datatype = null;
		}
	}

	@jakarta.persistence.Transient
	@JsonProperty(value = "@type", access = JsonProperty.Access.READ_ONLY)
	public String getRdfType() {
		return "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap";
	}
}
