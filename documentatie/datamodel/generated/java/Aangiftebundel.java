package be.vlaanderen.omgeving.mjv.model.structuur;

import java.time.LocalDate;
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
 * Aangiftebundel
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangiftebundel">Aangiftebundel</a>
 * Een aangiftebundel is een verzameling van aangiften die samen worden ingediend bij de overheid door een enkele exploitant.
 **/
@Getter
@Setter
@Entity(name = "Aangiftebundel")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aangiftebundel")
public class Aangiftebundel {
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
	 * Een aangifte bundel heeft een datum van indiening.
	 */
	@Column(name = "aangemaakt_op", nullable = true)
	@JsonProperty("created")
	private LocalDate aangemaaktOp;
	/**
	 * creator
	 * <a href="http://purl.org/dc/terms/creator">creator</a>
	 * Een aangiftebundel is gelinkt aan de exploitant
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("creator")
	private Exploitant creator;
	/**
	 * modified
	 * <a href="http://purl.org/dc/terms/modified">modified</a>
	 * Een aangifte kan een datum van goedkeuring hebben.
	 */
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDate aangepastOp;
	/**
	 * type
	 * <a href="http://purl.org/dc/terms/type">type</a>
	 * Een aangifte bundel heeft een typering.
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * status
	 * <a href="http://www.w3.org/ns/adms#status">status</a>
	 * Een aangifte heeft een status.
	 */
	@JsonProperty("status")
	private Status status;
	/**
	 * vlaanderenId
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId">vlaanderenId</a>
	 * Een unieke identificatie binnen de context van Vlaanderen, gebruikt voor het identificeren van entiteiten zoals aangiften.
	 */
	@Column(name = "vlaanderen_id", nullable = false)
	@JsonProperty("vlaanderenId")
	private String vlaanderenId;
}
