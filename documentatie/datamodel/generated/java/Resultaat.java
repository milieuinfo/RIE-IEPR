package be.vlaanderen.omgeving.mjv.model.structuur;

import com.fasterxml.jackson.annotation.JsonProperty;
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
 * Een resultaat is de waarde van een observatie.
 **/
@Getter
@Setter
@Entity(name = "Resultaat")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "resultaat")
public class Resultaat {
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
	 * numericValue
	 * <a href="http://qudt.org/schema/qudt/numericValue">numericValue</a>
	 * Een resultaat kan een numerieke waarde hebben
	 */
	@Column(name = "waarde", nullable = true)
	@JsonProperty("numericValue")
	private Double waarde;
	/**
	 * unit
	 * <a href="http://qudt.org/schema/qudt/unit">unit</a>
	 * Een resultaat kan een eenheid hebben
	 */
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("unit")
	private String eenheid;
	/**
	 * comment
	 * <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	 * Een resultaat kan een tekstuele waarde hebben
	 */
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
}
