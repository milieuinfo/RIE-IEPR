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
 * Proces
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces">Proces</a>
 * Een (milieu)proces is een door de gebruiker in te vullen industrieel proces op een bepaalde locatie bestaande uit meerdere procedurestappen die het proces beschrijven. Een proces kan hiërarchisch opgebouwd zijn als een plan met substappen.
 **/
@Getter
@Setter
@Entity(name = "Proces")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "proces")
public class Proces {
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
	 * Een proces moet een datum hebben waarop het is ingegeven
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	/**
	 * issued
	 * <a href="http://purl.org/dc/terms/issued">issued</a>
	 * Een proces kan een geldigheid start hebben
	 */
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	/**
	 * valid
	 * <a href="http://purl.org/dc/terms/valid">valid</a>
	 * Een proces kan een geldigheid einde hebben
	 */
	@Column(name = "geldig_tot", nullable = true)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	/**
	 * modified
	 * <a href="http://purl.org/dc/terms/modified">modified</a>
	 * Een proces moet een modificatie datum hebben
	 */
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	/**
	 * type
	 * <a href="http://purl.org/dc/terms/type">type</a>
	 * Een proces kan zijn afgeleid van een (generieke) procedure (optioneel). Max 1 omdat een proces slechts van 1 procedure afgeleid kan zijn en deze procedure een verzameling van andere procedures zou moeten zijn.
	 */
	@JsonProperty("type")
	private Procedure type;
	/**
	 * hasInputVar
	 * <a href="http://purl.org/net/p-plan#hasInputVar">hasInputVar</a>
	 * Een proces mag minstens één inputvariabele hebben (stof)
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_procesvariabele",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasInputVar")
	private List<Procesvariabele> heeftInvoer;
	/**
	 * hasOutputVar
	 * <a href="http://purl.org/net/p-plan#hasOutputVar">hasOutputVar</a>
	 * Een proces mag minstens één outputvariabele hebben (stof)
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_procesvariabele",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasOutputVar")
	private List<Procesvariabele> heeftUitvoer;
	/**
	 * hasStep
	 * <a href="http://purl.org/net/p-plan#hasStep">hasStep</a>
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_proces_has_step",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasStep")
	private List<Proces> hasStep;
	/**
	 * isPrecededBy
	 * <a href="http://purl.org/net/p-plan#isPrecededBy">isPrecededBy</a>
	 * Een proces mag een of meer andere processen als voorgaande stap hebben.
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_proces_volgt_op",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("isPrecededBy")
	private List<Proces> volgtOp;
	/**
	 * isStepOfPlan
	 * <a href="http://purl.org/net/p-plan#isStepOfPlan">isStepOfPlan</a>
	 * Een proces kan deel uitmaken van een ander proces
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("isStepOfPlan")
	private Proces onderdeelVan;
	/**
	 * comment
	 * <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	 * Een proces kan een beschrijving hebben
	 */
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
	/**
	 * label
	 * <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	 * Een proces moet een benaming hebben
	 */
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	/**
	 * identifier
	 * <a href="http://www.w3.org/ns/adms#identifier">identifier</a>
	 * Een proces kan externe identificaties hebben (optioneel)
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_externe_identificator",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("identifier")
	private List<ExterneIdentificator> identifier;
	/**
	 * implementedBy
	 * <a href="http://www.w3.org/ns/ssn/implementedBy">implementedBy</a>
	 * Een proces kan het gebruik van een systeem representeren
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("implementedBy")
	private ISysteem systeem;
	/**
	 * aangifte
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
	/**
	 * rubriek
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek">rubriek</a>
	 * De rubriek die van toepassing is op een proces of installatie.
	 */
	@ManyToMany
	@JoinTable(
		name = "proces_rubriek",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("rubriek")
	private List<Rubriek> rubriek;
}
