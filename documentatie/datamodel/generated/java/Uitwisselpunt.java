package be.vlaanderen.omgeving.mjv.model.structuur;

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
 * Uitwisselpunt
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt">Uitwisselpunt</a>
 * Een uitwisselpunt is een bi-directioneel punt waar stoffen (m.n. grondwater) kunnen worden onttrokken of geïnjecteerd.
 **/
@Getter
@Setter
@Entity(name = "Uitwisselpunt")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "uitwisselpunt")
public class Uitwisselpunt implements ISysteem {
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
	@Column(name = "systeem_uuid", nullable = false)
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
	 * Een uitwisselpunt moet een creatie datum hebben
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	/**
	 * issued
	 * <a href="http://purl.org/dc/terms/issued">issued</a>
	 * Een uitwisselpunt moet een geldigheid start hebben
	 */
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	/**
	 * valid
	 * <a href="http://purl.org/dc/terms/valid">valid</a>
	 * Een uitwisselpunt kan een geldigheid einde hebben
	 */
	@Column(name = "geldig_tot", nullable = true)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	/**
	 * modified
	 * <a href="http://purl.org/dc/terms/modified">modified</a>
	 * Een uitwisselpunt moet een modificatie datum hebben
	 */
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	/**
	 * type
	 * <a href="http://purl.org/dc/terms/type">type</a>
	 * Een uitwisselpunt kan een typering hebben via dct:type
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * hasGeometry
	 * <a href="http://www.opengis.net/ont/geosparql#hasGeometry">hasGeometry</a>
	 * Een uitwisselpunt mag max 1 geometrie hebben
	 */
	@Column(name = "geometrie", nullable = true)
	@JsonProperty("hasGeometry")
	private String geometrie;
	/**
	 * label
	 * <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	 * Een uitwisselpunt moet een benaming hebben
	 */
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	/**
	 * identifier
	 * <a href="http://www.w3.org/ns/adms#identifier">identifier</a>
	 * Een uitwisselpunt heeft externe identificaties (optioneel)
	 */
	@ManyToMany
	@JoinTable(
		name = "uitwisselpunt_externe_identificator",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("identifier")
	private List<ExterneIdentificator> identifier;
	/**
	 * status
	 * <a href="http://www.w3.org/ns/adms#status">status</a>
	 * Een uitwisselpunt moet een enkele status hebben
	 */
	@JsonProperty("status")
	private Status status;
	/**
	 * hasDeployment
	 * <a href="http://www.w3.org/ns/ssn/hasDeployment">hasDeployment</a>
	 */
	@ManyToMany
	@JoinTable(
		name = "uitwisselpunt_exploitatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasDeployment")
	private List<Exploitatie> hasDeployment;
	/**
	 * hasProperty
	 * <a href="http://www.w3.org/ns/ssn/hasProperty">hasProperty</a>
	 * Een uitwisselpunt kan meerdere eigenschappen hebben
	 */
	@ManyToMany
	@JoinTable(
		name = "uitwisselpunt_systeemeigenschap",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasProperty")
	private List<Systeemeigenschap> heeftEigenschap;
	/**
	 * hasSubSystem
	 * <a href="http://www.w3.org/ns/ssn/hasSubSystem">hasSubSystem</a>
	 * Een uitwisselpunt kan filters hebben
	 */
	@ManyToMany
	@JoinTable(
		name = "uitwisselpunt_filter",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasSubSystem")
	private List<Filter> heeftSubSysteem;
	/**
	 * aangifte
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
	/**
	 * inGebruikTot
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot">inGebruikTot</a>
	 * De niet-functionele datum waarop een entiteit buiten gebruik is gesteld.
	 */
	@Column(name = "in_gebruik_tot", nullable = true)
	@JsonProperty("inGebruikTot")
	private LocalDate inGebruikTot;
	/**
	 * inGebruikVanaf
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf">inGebruikVanaf</a>
	 * De niet-functionele datum waarop een entiteit in gebruik is genomen.
	 */
	@Column(name = "in_gebruik_vanaf", nullable = true)
	@JsonProperty("inGebruikVanaf")
	private LocalDate inGebruikVanaf;
}
