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
 * ExterneIdentificator
 * <a href="http://www.w3.org/ns/adms#Identifier">Identifier</a>
 **/
@Getter
@Setter
@Entity(name = "ExterneIdentificator")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "externe_identificator")
public class ExterneIdentificator {
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("notation")
	private String datatype;
	// <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	@Column(name = "datatype", nullable = false)
	@JsonProperty("notation")
	private String notatie;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype">notatietype</a>
	@Column(name = "notatietype", nullable = true)
	@JsonProperty("notatietype")
	private AnyURI notatietype;
}
