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
 * HoeveelheidWaarde
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#HoeveelheidWaarde">HoeveelheidWaarde</a>
 **/
@Getter
@Setter
@Entity(name = "HoeveelheidWaarde")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hoeveelheid_waarde")
public class HoeveelheidWaarde {
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://qudt.org/schema/qudt/hasUnit">hasUnit</a>
	@Column(name = "eenheid", nullable = true)
	@JsonProperty("hasUnit")
	private String eenheid;
	// <a href="http://qudt.org/schema/qudt/numericValue">numericValue</a>
	@Column(name = "waarde", nullable = true)
	@JsonProperty("numericValue")
	private Double waarde;
}
