package be.vlaanderen.omgeving.mjv.model.structuur;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
 * Contactpersoon
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon">Contactpersoon</a>
 **/
@Getter
@Setter
@Entity(name = "Contactpersoon")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contactpersoon")
public class Contactpersoon {
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
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/valid">valid</a>
	@Column(name = "geldig_tot", nullable = false)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = false)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	@Column(name = "beschrijving", nullable = false)
	@JsonProperty("comment")
	private String beschrijving;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = false)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/org#hasRole">hasRole</a>
	@Column(name = "functie", nullable = false)
	@JsonProperty("hasRole")
	private String functie;
	// <a href="http://xmlns.com/foaf/0.1/mbox">mbox</a>
	@Column(name = "email", nullable = false)
	@JsonProperty("mbox")
	private String email;
	// <a href="http://xmlns.com/foaf/0.1/name">name</a>
	@Column(name = "name", nullable = false)
	@JsonProperty("name")
	private List<String> name;
	// <a href="http://xmlns.com/foaf/0.1/phone">phone</a>
	@Column(name = "telefoonnummer", nullable = false)
	@JsonProperty("phone")
	private String telefoonnummer;
}
