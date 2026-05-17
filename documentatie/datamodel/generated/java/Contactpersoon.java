package be.vlaanderen.omgeving.riepr.model.structuur;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
@IdClass(Contactpersoon.Id.class)
public class Contactpersoon {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Id
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Id
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private LocalDate geldigVan;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Id
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/valid">valid</a>
	@Column(name = "geldig_tot", nullable = true)
	@JsonProperty("valid")
	private LocalDate geldigTot;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
	// <a href="http://www.w3.org/2000/01/rdf-schema#label">label</a>
	@Column(name = "benaming", nullable = true)
	@JsonProperty("label")
	private String benaming;
	// <a href="http://www.w3.org/ns/org#hasRole">hasRole</a>
	@Column(name = "functie", nullable = true)
	@JsonProperty("hasRole")
	private String functie;
	// <a href="http://www.w3.org/ns/org#memberOf">memberOf</a>
	@ManyToMany
	@JoinTable(
		name = "contactpersoon_exploitatie",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("memberOf_exploitatie")
	private List<Exploitatie> contactpersoonVanExploitatie;
	@ManyToMany
	@JoinTable(
		name = "contactpersoon_exploitant",
		joinColumns = @JoinColumn(name = "source_uuid"),
		inverseJoinColumns = @JoinColumn(name = "target_uuid")
	)
	@JsonProperty("memberOf_exploitant")
	private List<Exploitant> contactpersoonVanExploitant;
	// <a href="http://xmlns.com/foaf/0.1/mbox">mbox</a>
	@Column(name = "email", nullable = true)
	@JsonProperty("mbox")
	private String email;
	// <a href="http://xmlns.com/foaf/0.1/name">name</a>
	@Column(name = "name", nullable = true)
	@JsonProperty("name")
	private List<String> name;
	// <a href="http://xmlns.com/foaf/0.1/phone">phone</a>
	@Column(name = "telefoonnummer", nullable = true)
	@JsonProperty("phone")
	private String telefoonnummer;

	/** Composite primary-key class. */
	@Embeddable
	@Getter
	@EqualsAndHashCode
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Id implements Serializable {
		private String uuid;
		private LocalDate geldigVan;
		private LocalDateTime aangemaaktOp;
	}
}
