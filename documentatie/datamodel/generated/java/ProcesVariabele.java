package be.vlaanderen.omgeving.mjv.model.structuur;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumns;
import java.util.List;

/**
 * ProcesVariabele
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele">ProcesVariabele</a>
 **/
@Getter
@Setter
@Entity(name = "ProcesVariabele")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "proces_variabele")
public class ProcesVariabele {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = false)
	@JsonProperty("uri")
	private String uri;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend">ingediend</a>
	@Column(name = "ingediend", nullable = false)
	@JsonProperty("ingediend")
	private Boolean ingediend;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@Column(name = "type", nullable = false)
	@JsonProperty("type")
	private String type;
	// <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	@Column(name = "eenheid", nullable = false)
	@JsonProperty("hasUnit")
	private String eenheid;
	// <a href="http://qudt.org/schema/qudt/numericValue">numericValue</a>
	@Column(name = "waarde", nullable = false)
	@JsonProperty("numericValue")
	private Double waarde;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = false)
	@JsonProperty("label")
	private String benaming;
}
