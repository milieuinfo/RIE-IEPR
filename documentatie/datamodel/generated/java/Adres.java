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
 * Adres
 * <a href="http://www.w3.org/ns/locn#Address">Address</a>
 **/
@Getter
@Setter
@Entity(name = "Adres")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "adres")
public class Adres {
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://www.w3.org/ns/locn#fullAddress">fullAddress</a>
	@Column(name = "full_address", nullable = true)
	@JsonProperty("fullAddress")
	private String fullAddress;
	// <a href="http://www.w3.org/ns/locn#locatorDesignator">locatorDesignator</a>
	@Column(name = "locator_designator", nullable = true)
	@JsonProperty("locatorDesignator")
	private String locatorDesignator;
}
