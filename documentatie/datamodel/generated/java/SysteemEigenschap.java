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
 * SysteemEigenschap
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap">SysteemEigenschap</a>
 **/
@Getter
@Setter
@Entity(name = "SysteemEigenschap")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "systeem_eigenschap")
public class SysteemEigenschap {
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
	// <a href="http://www.w3.org/2000/01/rdf-schema#range">range</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("range")
	private String datatype;
	// <a href="http://www.w3.org/2000/01/rdf-schema#range">range</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("range")
	private String range;
	// <a href="http://www.w3.org/2000/01/rdf-schema#value">value</a>
	@Column(name = "value", nullable = true)
	@JsonProperty("value")
	private String value;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter">parameter</a>
	@Column(name = "parameter", nullable = true)
	@JsonProperty("parameter")
	private String parameter;
}
