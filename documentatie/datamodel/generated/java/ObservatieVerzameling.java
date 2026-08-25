package be.vlaanderen.omgeving.mjv.model.structuur;

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
 * ObservatieVerzameling
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ObservatieVerzameling">ObservatieVerzameling</a>
 * Een observatieverzameling is een verzameling van waarnemingen of metingen uitgevoerd op een emissie of onttrekking over een bepaalde periode of op een bepaald moment.
 **/
@Getter
@Setter
@Entity(name = "ObservatieVerzameling")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "observatie_verzameling")
public class ObservatieVerzameling {
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
	 * Een observatieverzameling moet een creatie datum hebben
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	/**
	 * hasFeatureOfInterest
	 * <a href="http://www.w3.org/ns/sosa/hasFeatureOfInterest">hasFeatureOfInterest</a>
	 * Een observatieverzameling is gekoppeld aan een Emissie of Onttrekking
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasFeatureOfInterest")
	private IGebeurtenis betrekkingTot;
	/**
	 * hasMember
	 * <a href="http://www.w3.org/ns/sosa/hasMember">hasMember</a>
	 * Een observatieverzameling bestaat uit ten minste één observatie (of geneste observatieverzameling)
	 */
	@ManyToMany
	@JoinTable(
		name = "observatie_verzameling_observatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasMember")
	private List<Observatie> hasMember;
	/**
	 * aangifte
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
}
