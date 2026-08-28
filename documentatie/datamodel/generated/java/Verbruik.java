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
 * Verbruik
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Verbruik">Verbruik</a>
 * Een verbruik is een specifieke gebeurtenis dat betrekking heeft op het verbruiken van stoffen aan verbruikspunten over of op een bepaalde periode of momentopname.
 **/
@Getter
@Setter
@Entity(name = "Verbruik")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "verbruik")
public class Verbruik implements IGebeurtenis {
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
	@Id
	@Column(name = "gebeurtenis_uuid", nullable = false)
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
	 * wasDerivedFrom
	 * <a href="http://www.w3.org/ns/prov#wasDerivedFrom">wasDerivedFrom</a>
	 * Een verbruik moet gekoppeld zijn aan een proces
	 */
	@ManyToMany
	@JoinTable(
		name = "verbruik_proces",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("wasDerivedFrom")
	private List<Proces> wasDerivedFrom;
	/**
	 * isFeatureOfInterestOf
	 * <a href="http://www.w3.org/ns/sosa/isFeatureOfInterestOf">isFeatureOfInterestOf</a>
	 */
	@ManyToMany
	@JoinTable(
		name = "verbruik_observatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("isFeatureOfInterestOf_observatie")
	private List<Observatie> isFeatureOfInterestOfObservatie;
	@ManyToMany
	@JoinTable(
		name = "verbruik_observatie_verzameling",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("isFeatureOfInterestOf_observatie_verzameling")
	private List<ObservatieVerzameling> isFeatureOfInterestOfObservatieVerzameling;
}
