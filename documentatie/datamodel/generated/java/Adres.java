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
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
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
	// <a href="http://www.w3.org/ns/locn#postCode">postCode</a>
	@Column(name = "postcode", nullable = true)
	@JsonProperty("postCode")
	private String postcode;
	// <a href="http://www.w3.org/ns/locn#postName">postName</a>
	@Column(name = "stad", nullable = true)
	@JsonProperty("postName")
	private String stad;
	// <a href="http://www.w3.org/ns/locn#thoroughfare">thoroughfare</a>
	@Column(name = "straat", nullable = true)
	@JsonProperty("thoroughfare")
	private String straat;
}
