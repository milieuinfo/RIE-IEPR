package be.vlaanderen.omgeving.riepr.model.structuur;

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
 * Productie
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Productie">Productie</a>
 **/
@Getter
@Setter
@Entity(name = "Productie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "productie")
public class Productie {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://www.w3.org/ns/sosa/isFeatureOfInterestOf">isFeatureOfInterestOf</a>
	@JsonProperty("isFeatureOfInterestOf")
	private List<IObservation> isFeatureOfInterestOf;
	// <a href="http://www.w3.org/ns/ssn/hasProperty">hasProperty</a>
	@JsonProperty("hasProperty")
	private List<Productievolume> heeftEigenschap;
}
