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
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
	@Id
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
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een externe identificator heeft een notatie waarde
	 */
	@Column(name = "notatie", nullable = true)
	@JsonProperty("notation")
	private String notatie;
	/**
	 * notation
	 * <a href="http://www.w3.org/2004/02/skos/core#notation">notation</a>
	 * Een externe identificator heeft een notatie waarde
	 */
	@Column(name = "notatie", nullable = true)
	@JsonProperty("notation")
	private String notatie_datatype;
	/**
	 * schemaAgency
	 * <a href="http://www.w3.org/ns/adms#schemaAgency">schemaAgency</a>
	 * Een externe identificator heeft een schema-agentschap dat de bron van de identificator aanduidt (bv. 'VMM', 'DOMG')
	 */
	@Column(name = "schema_agency", nullable = true)
	@JsonProperty("schemaAgency")
	private String schemaAgency;
}
