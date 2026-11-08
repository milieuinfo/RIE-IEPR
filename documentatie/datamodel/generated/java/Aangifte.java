package be.vlaanderen.omgeving.mjv.model.structuur;

import java.time.LocalDate;
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
 * Aangifte
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte">Aangifte</a>
 * Een aangifte is een document dat wordt ingediend bij de overheid.
 **/
@Getter
@Setter
@Entity(name = "Aangifte")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aangifte")
public class Aangifte implements IriReferentie {
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
	 * Een aangifte heeft een datum van indiening.
	 */
	@Column(name = "aangemaakt_op", nullable = true)
	@JsonProperty("created")
	private LocalDate aangemaaktOp;
	/**
	 * isPartOf
	 * <a href="http://purl.org/dc/terms/isPartOf">isPartOf</a>
	 * Een aangifte kan deel zijn van een andere bundel.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonSerialize(using = IriReferentieSerializer.class)
	@JsonProperty("isPartOf")
	private Aangiftebundel onderdeelVan;
	/**
	 * modified
	 * <a href="http://purl.org/dc/terms/modified">modified</a>
	 * Een aangifte kan een datum van goedkeuring hebben.
	 */
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDate aangepastOp;
	/**
	 * subject
	 * <a href="http://purl.org/dc/terms/subject">subject</a>
	 * Een aangifte heeft betrekking tot een enkele exploitatie.
	 */
	@ManyToMany
	@JoinTable(
		name = "aangifte_exploitatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonSerialize(contentUsing = IriReferentieSerializer.class)
	@JsonProperty("subject")
	private List<Exploitatie> onderwerp;
	/**
	 * vlaanderenId
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId">vlaanderenId</a>
	 * Een unieke identificatie binnen de context van Vlaanderen, gebruikt voor het identificeren van entiteiten zoals aangiften.
	 */
	@Column(name = "vlaanderen_id", nullable = false)
	@JsonProperty("vlaanderenId")
	private String vlaanderenId;
	/**
	 * informatieclassificatie
	 * <a href="https://data.vlaanderen.be/ns/dossier#informatieclassificatie">informatieclassificatie</a>
	 * Een aangifte heeft een informatie classificatie.
	 */
	@Column(name = "informatieclassificatie", nullable = true)
	@JsonProperty("informatieclassificatie")
	private String informatieclassificatie;

	@jakarta.persistence.Transient
	@JsonProperty(value = "@type", access = JsonProperty.Access.READ_ONLY)
	public String getRdfType() {
		return "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte";
	}
}
