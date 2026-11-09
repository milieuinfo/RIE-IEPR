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
 * Resultaat
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat">Resultaat</a>
 * Een resultaat is het resultaat record van een observatie.
 **/
@Getter
@Setter
@Entity(name = "Resultaat")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "resultaat")
public class Resultaat implements IriReferentie {
	/**
	 * id
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id">id</a>
	 */
	@Id
	@Column(name = "id", nullable = false)
	@JsonProperty("id")
	private String id;
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
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
	 * created
	 * <a href="http://purl.org/dc/terms/created">created</a>
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private String aangemaaktOp;
	/**
	 * issued
	 * <a href="http://purl.org/dc/terms/issued">issued</a>
	 */
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private String geldigVan;
	/**
	 * hasUnit
	 * <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	 * Een resultaat kan een eenheid hebben
	 */
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("hasUnit")
	private String eenheid;
	/**
	 * numericValue
	 * <a href="http://qudt.org/schema/qudt/numericValue">numericValue</a>
	 * Een resultaat kan een numerieke waarde hebben
	 */
	@Column(name = "waarde", nullable = true)
	@JsonProperty("numericValue")
	private Double waarde;
	/**
	 * comment
	 * <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	 * Een resultaat kan een tekstuele waarde hebben
	 */
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;

	@jakarta.persistence.Transient
	@JsonProperty(value = "@type", access = JsonProperty.Access.READ_ONLY)
	public String getRdfType() {
		return "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat";
	}
}
