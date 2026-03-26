package be.vlaanderen.omgeving.mjv.model.structuur;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumns;
import java.util.List;

/**
 * Installatie
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie">Installatie</a>
 **/
@Getter
@Setter
@Entity(name = "Installatie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "installatie")
public class Installatie implements ISysteem {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Column(name = "systeem_uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = false)
	@JsonProperty("uri")
	private String uri;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend">ingediend</a>
	@Column(name = "ingediend", nullable = false)
	@JsonProperty("ingediend")
	private Boolean ingediend;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/valid">valid</a>
	@Column(name = "geldig_tot", nullable = false)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = false)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@Column(name = "type", nullable = false)
	@JsonProperty("type")
	private String type;
	// <a href="http://www.opengis.net/ont/geosparql#hasGeometry">hasGeometry</a>
	@Column(name = "geometrie", nullable = false)
	@JsonProperty("hasGeometry")
	private String geometrie;
	// <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	@Column(name = "beschrijving", nullable = false)
	@JsonProperty("comment")
	private String beschrijving;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = false)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/adms#identifier">identifier</a>
	@ManyToMany
	@JoinTable(
		name = "rel_installatie_externe_identificator",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("identifier")
	private List<ExterneIdentificator> identifier;
	// <a href="http://www.w3.org/ns/adms#status">status</a>
	@JsonProperty("status")
	private Status status;
	// <a href="http://www.w3.org/ns/prov#wasRevisionOf">wasRevisionOf</a>
	@JoinColumn(name = "systeem_uuid", nullable = false)
	@JsonProperty("wasRevisionOf")
	private ISysteem revisieVan;
	// <a href="http://www.w3.org/ns/ssn/hasProperty">hasProperty</a>
	@ManyToMany
	@JoinTable(
		name = "rel_installatie_systeem_eigenschap",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasProperty")
	private List<SysteemEigenschap> heeftEigenschap;
	// <a href="http://www.w3.org/ns/ssn/hasSubSystem">hasSubSystem</a>
	@ManyToMany
	@JoinTable(
		name = "rel_installatie_systeem",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasSubSystem")
	private List<ISysteem> heeftSubSysteem;
}
