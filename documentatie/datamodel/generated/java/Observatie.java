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
 * Een observatie is een waarneming of meting uitgevoerd op een emissie of onttrekking.
 **/
@Getter
@Setter
@Entity(name = "Observatie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "observatie")
public class Observatie {
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
	 * Een observatie moet een creatie datum hebben
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	/**
	 * hasFeatureOfInterest
	 * <a href="http://www.w3.org/ns/sosa/hasFeatureOfInterest">hasFeatureOfInterest</a>
	 * Een observatie is gekoppeld aan een Emissie of Onttrekking
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasFeatureOfInterest")
	private IGebeurtenis betrekkingTot;
	/**
	 * hasResult
	 * <a href="http://www.w3.org/ns/sosa/hasResult">hasResult</a>
	 * Een observatie heeft één resultaat.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasResult")
	private Resultaat heeftResultaat;
	/**
	 * isMemberOf
	 * <a href="http://www.w3.org/ns/sosa/isMemberOf">isMemberOf</a>
	 * Een observatie kan deel uitmaken van een observatieverzameling
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("isMemberOf")
	private ObservatieVerzameling isMemberOf;
	/**
	 * madeBySensor
	 * <a href="http://www.w3.org/ns/sosa/madeBySensor">madeBySensor</a>
	 * Een observatie kan zijn gemaakt door een meetpunt of ander systeem (sosa:madeBySensor)
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("madeBySensor")
	private ISysteem madeBySensor;
	/**
	 * observedProperty
	 * <a href="http://www.w3.org/ns/sosa/observedProperty">observedProperty</a>
	 * Een observatie kan een geobserveerde eigenschap hebben
	 */
	@Column(name = "eigenschap", nullable = true)
	@JsonProperty("observedProperty")
	private String eigenschap;
	/**
	 * phenomenonTime
	 * <a href="http://www.w3.org/ns/sosa/phenomenonTime">phenomenonTime</a>
	 * Een observatie kan een verschijnsel tijdsinterval hebben
	 */
	@Column(name = "phenomenon_time", nullable = true)
	@JsonProperty("phenomenonTime")
	private String phenomenonTime;
	/**
	 * resultTime
	 * <a href="http://www.w3.org/ns/sosa/resultTime">resultTime</a>
	 * Een observatie kan een resultaat tijdstip hebben
	 */
	@Column(name = "result_time", nullable = true)
	@JsonProperty("resultTime")
	private LocalDateTime resultTime;
	/**
	 * usedProcedure
	 * <a href="http://www.w3.org/ns/sosa/usedProcedure">usedProcedure</a>
	 * Een observatie kan een gebruikte bepalingsmethode hebben
	 */
	@Column(name = "used_procedure", nullable = true)
	@JsonProperty("usedProcedure")
	private String usedProcedure;
	/**
	 * aangifte
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte">aangifte</a>
	 * De aangifte die gerelateerd is aan een exploitatielocatie of observatie.
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("aangifte")
	private Aangifte aangifte;
}
