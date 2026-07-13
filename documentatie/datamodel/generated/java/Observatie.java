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
 * Observatie
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie">Observatie</a>
 **/
@Getter
@Setter
@Entity(name = "Observatie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "observatie")
public class Observatie {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://www.w3.org/ns/sosa/hasFeatureOfInterest">hasFeatureOfInterest</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasFeatureOfInterest")
	private IGebeurtenis betrekkingTot;
	// <a href="http://www.w3.org/ns/sosa/hasResult">hasResult</a>
	@ManyToMany
	@JoinTable(
		name = "observatie_resultaat",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("hasResult")
	private List<Resultaat> heeftResultaat;
	// <a href="http://www.w3.org/ns/sosa/madeBySensor">madeBySensor</a>
	@JoinColumn(name = "systeem_uuid", nullable = true)
	@JsonProperty("madeBySensor")
	private MeetInstrument madeBySensor;
	// <a href="http://www.w3.org/ns/sosa/observedProperty">observedProperty</a>
	@Column(name = "observed_property", nullable = true)
	@JsonProperty("observedProperty")
	private String observedProperty;
	// <a href="http://www.w3.org/ns/sosa/phenomenonTime">phenomenonTime</a>
	@Column(name = "phenomenon_time", nullable = true)
	@JsonProperty("phenomenonTime")
	private String phenomenonTime;
	// <a href="http://www.w3.org/ns/sosa/resultTime">resultTime</a>
	@Column(name = "result_time", nullable = true)
	@JsonProperty("resultTime")
	private LocalDateTime resultTime;
	// <a href="http://www.w3.org/ns/sosa/usedProcedure">usedProcedure</a>
	@Column(name = "used_procedure", nullable = true)
	@JsonProperty("usedProcedure")
	private String usedProcedure;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
}
