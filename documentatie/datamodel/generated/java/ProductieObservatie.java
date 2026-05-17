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
 * ProductieObservatie
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProductieObservatie">ProductieObservatie</a>
 **/
@Getter
@Setter
@Entity(name = "ProductieObservatie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "productie_observatie")
public class ProductieObservatie implements IObservation {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = true)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Column(name = "geldig_van", nullable = true)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/sosa/hasFeatureOfInterest">hasFeatureOfInterest</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasFeatureOfInterest")
	private Productie heeftAandachtspunt;
	// <a href="http://www.w3.org/ns/sosa/hasResult">hasResult</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasResult")
	private Resultaat heeftResultaat;
	// <a href="http://www.w3.org/ns/sosa/madeBySensor">madeBySensor</a>
	@Column(name = "made_by_sensor", nullable = true)
	@JsonProperty("madeBySensor")
	private String madeBySensor;
	// <a href="http://www.w3.org/ns/sosa/observedProperty">observedProperty</a>
	@JsonProperty("observedProperty")
	private Productievolume observedProperty;
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
}
