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
 * Organisatie
 * <a href="http://www.w3.org/ns/org#Organization">Organization</a>
 **/
@Getter
@Setter
@Entity(name = "Organisatie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "organisatie")
public class Organisatie {
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
}
