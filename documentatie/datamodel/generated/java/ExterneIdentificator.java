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
 * ExterneIdentificator
 * <a href="http://www.w3.org/ns/adms#Identifier">ExterneIdentificator</a>
 **/
@Getter
@Setter
@Entity(name = "ExterneIdentificator")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "externe_identificator")
public class ExterneIdentificator {
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
	// <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("notation")
	private String datatype;
	// <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("notation")
	private String notatie;
	// <a href="http://www.w3.org/ns/adms#schemeAgency">schemeAgency</a>
	@Column(name = "schema", nullable = false)
	@JsonProperty("schemeAgency")
	private String schema;
}
