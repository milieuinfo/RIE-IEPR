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
 * Adres
 * <a href="http://www.w3.org/ns/locn#Address">Adres</a>
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
	// <a href="http://www.w3.org/ns/locn#postCode">postCode</a>
	@Column(name = "postcode", nullable = false)
	@JsonProperty("postCode")
	private String postcode;
	// <a href="http://www.w3.org/ns/locn#postName">postName</a>
	@Column(name = "stad", nullable = false)
	@JsonProperty("postName")
	private String stad;
	// <a href="http://www.w3.org/ns/locn#thoroughfare">thoroughfare</a>
	@Column(name = "straat", nullable = false)
	@JsonProperty("thoroughfare")
	private String straat;
}
