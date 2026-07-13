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
 * Systeemeigenschap
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap">Systeemeigenschap</a>
 **/
@Getter
@Setter
@Entity(name = "Systeemeigenschap")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "systeemeigenschap")
public class Systeemeigenschap {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	// <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("hasUnit")
	private String eenheid;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/2000/01/rdf-schema#value">value</a>
	@Column(name = "value", nullable = true)
	@JsonProperty("value")
	private String value;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype">datatype</a>
	@Column(name = "datatype", nullable = true)
	@JsonProperty("datatype")
	private String datatype;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype">datatype</a>
	@Column(name = "datatype", nullable = true)
	@JsonProperty("datatype")
	private String datatype_datatype;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter">parameter</a>
	@Column(name = "parameter", nullable = true)
	@JsonProperty("parameter")
	private String parameter;
}
