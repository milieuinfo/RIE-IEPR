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
 **/
@Getter
@Setter
@Entity(name = "Proces")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "proces")
public class Proces {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id">id</a>
	@Id
	@Column(name = "id", nullable = false)
	@JsonProperty("id")
	private String id;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/valid">valid</a>
	@Column(name = "geldig_tot", nullable = true)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@JsonProperty("type")
	private Procedure type;
	// <a href="http://purl.org/net/p-plan#hasInputVar">hasInputVar</a>
	@ManyToMany
	@JoinTable(
		name = "proces_proces_variabele",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasInputVar")
	private List<ProcesVariabele> heeftInvoer;
	// <a href="http://purl.org/net/p-plan#hasOutputVar">hasOutputVar</a>
	@ManyToMany
	@JoinTable(
		name = "proces_proces_variabele",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasOutputVar")
	private List<ProcesVariabele> heeftUitvoer;
	// <a href="http://purl.org/net/p-plan#hasStep">hasStep</a>
	@ManyToMany
	@JoinTable(
		name = "proces_proces_has_step",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasStep")
	private List<Proces> hasStep;
	// <a href="http://purl.org/net/p-plan#isPrecededBy">isPrecededBy</a>
	@ManyToMany
	@JoinTable(
		name = "proces_proces_volgt_op",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("isPrecededBy")
	private List<Proces> volgtOp;
	// <a href="http://purl.org/net/p-plan#isStepOfPlan">isStepOfPlan</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("isStepOfPlan")
	private Proces onderdeelVan;
	// <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/prov#wasRevisionOf">wasRevisionOf</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("wasRevisionOf")
	private Proces revisieVan;
	// <a href="http://www.w3.org/ns/ssn/implementedBy">implementedBy</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("implementedBy")
	private ISysteem systeem;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek">rubriek</a>
	@ManyToMany
	@JoinTable(
		name = "proces_rubriek",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("rubriek")
	private List<Rubriek> rubriek;
}
