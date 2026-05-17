package be.vlaanderen.omgeving.riepr.model.structuur;

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
 * Aangifte
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte">Aangifte</a>
 **/
@Getter
@Setter
@Entity(name = "Aangifte")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aangifte")
public class Aangifte {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId">vlaanderenId</a>
	@Id
	@Column(name = "vlaanderen_id", nullable = false)
	@JsonProperty("vlaanderenId")
	private String vlaanderenId;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = true)
	@JsonProperty("created")
	private LocalDate aangemaaktOp;
	// <a href="http://purl.org/dc/terms/isPartOf">isPartOf</a>
	@JoinColumn(name = "vlaanderen_id", nullable = true)
	@JsonProperty("isPartOf")
	private Aangifte onderdeelVan;
	// <a href="http://purl.org/dc/terms/subject">subject</a>
	@ManyToMany
	@JoinTable(
		name = "aangifte_exploitatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("subject_exploitatie")
	private List<Exploitatie> subjectExploitatie;
	@ManyToMany
	@JoinTable(
		name = "aangifte_observatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("subject_observatie")
	private List<Observatie> subjectObservatie;
	// <a href="http://www.w3.org/ns/prov#wasAssociatedWith">wasAssociatedWith</a>
	@Column(name = "verantwoordelijke", nullable = true)
	@JsonProperty("wasAssociatedWith")
	private String verantwoordelijke;
	// <a href="https://data.vlaanderen.be/ns/dossier#informatieclassificatie">informatieclassificatie</a>
	@Column(name = "informatieclassificatie", nullable = true)
	@JsonProperty("informatieclassificatie")
	private String informatieclassificatie;
}
