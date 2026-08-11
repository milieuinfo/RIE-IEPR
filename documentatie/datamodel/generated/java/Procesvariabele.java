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
 * Procesvariabele
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Procesvariabele">Procesvariabele</a>
 * Een procesvariabele is een variabel gegeven die als input of output van een proces dient.
 **/
@Getter
@Setter
@Entity(name = "Procesvariabele")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "procesvariabele")
public class Procesvariabele {
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
	 * Een proces variabele kan een typering hebben via dct:type
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * isInputVarOf
	 * <a href="http://purl.org/net/p-plan#isInputVarOf">isInputVarOf</a>
	 */
	@ManyToMany
	@JoinTable(
		name = "procesvariabele_proces",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("isInputVarOf")
	private List<Proces> isInputVarOf;
	/**
	 * hasUnit
	 * <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	 * Een proces variabele kan een eenheid hebben
	 */
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("hasUnit")
	private String eenheid;
	/**
	 * numericValue
	 * <a href="http://qudt.org/schema/qudt/numericValue">numericValue</a>
	 * Een proces variabele kan een waarde hebben
	 */
	@Column(name = "waarde", nullable = true)
	@JsonProperty("numericValue")
	private Double waarde;
	/**
	 * label
	 * <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	 * Een proces variabele kan een benaming hebben
	 */
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
}
