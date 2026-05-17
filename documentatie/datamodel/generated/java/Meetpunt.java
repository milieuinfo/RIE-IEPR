package be.vlaanderen.omgeving.riepr.model.structuur;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
 * Meetpunt
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt">Meetpunt</a>
 **/
@Getter
@Setter
@Entity(name = "Meetpunt")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "meetpunt")
@IdClass(Meetpunt.Id.class)
public class Meetpunt implements ISysteem {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Id
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Id
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/valid">valid</a>
	@Column(name = "geldig_tot", nullable = true)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	// <a href="http://www.opengis.net/ont/geosparql#hasGeometry">hasGeometry</a>
	@Column(name = "geometrie", nullable = true)
	@JsonProperty("hasGeometry")
	private String geometrie;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/adms#identifier">identifier</a>
	@JsonProperty("identifier")
	private List<ExterneIdentificator> identifier;
	// <a href="http://www.w3.org/ns/adms#status">status</a>
	@JsonProperty("status")
	private Rubriek status;
	// <a href="http://www.w3.org/ns/prov#wasRevisionOf">wasRevisionOf</a>
	@JsonProperty("wasRevisionOf")
	private ISysteem revisieVan;
	// <a href="http://www.w3.org/ns/sosa/isHostedBy">isHostedBy</a>
	@JsonProperty("isHostedBy")
	private ISysteem locatie;
	// <a href="http://www.w3.org/ns/ssn/hasDeployment">hasDeployment</a>
	@ManyToMany
	@JoinTable(
		name = "meetpunt_exploitatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasDeployment")
	private List<Exploitatie> hasDeployment;
	// <a href="http://www.w3.org/ns/ssn/hasProperty">hasProperty</a>
	@JsonProperty("hasProperty")
	private List<SysteemEigenschap> heeftEigenschap;
	// <a href="http://www.w3.org/ns/ssn/hasSubSystem">hasSubSystem</a>
	@ManyToMany
	@JoinTable(
		name = "meetpunt_meet_instrument",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasSubSystem")
	private List<MeetInstrument> heeftSubSysteem;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;

	/** Composite primary-key class. */
	@Embeddable
	@Getter
	@EqualsAndHashCode
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Id implements Serializable {
		private String uuid;
		private LocalDate geldigVan;
		private LocalDateTime aangemaaktOp;
	}
}
