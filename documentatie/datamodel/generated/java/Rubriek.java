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
 * Rubriek
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek">Rubriek</a>
 * Een rubriek is een specifieke classificatie die wordt gebruikt om activiteiten te categoriseren volgens de regelgeving.
 **/
@Getter
@Setter
@Entity(name = "Rubriek")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rubriek")
public class Rubriek {
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
	 * Een rubriek kan een typering hebben via dct:type
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * definition
	 * <a href="http://www.w3.org/2004/02/skos/core#definition">definition</a>
	 * Een rubriek kan een beschrijving hebben
	 */
	@Column(name = "definition", nullable = true)
	@JsonProperty("definition")
	private String definition;
	/**
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een rubriek moet een code hebben
	 */
	@Column(name = "notatie", nullable = true)
	@JsonProperty("notation")
	private String notatie;
	/**
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een rubriek moet een code hebben
	 */
	@Column(name = "notatie", nullable = true)
	@JsonProperty("notation")
	private String notatie_datatype;
	/**
	 * hadPrimarySource
	 * <a href="http://www.w3.org/ns/prov#hadPrimarySource">hadPrimarySource</a>
	 * Een rubriek kan een primaire bron hebben (VITO, ...)
	 */
	@Column(name = "primaire_bron", nullable = true)
	@JsonProperty("hadPrimarySource")
	private String primaireBron;
}
