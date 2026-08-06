package be.vlaanderen.omgeving.mjv.model.structuur;

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
 * Contactgegevens
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactgegevens">Contactgegevens</a>
 **/
@Getter
@Setter
@Entity(name = "Contactgegevens")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contactgegevens")
public class Contactgegevens {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id">id</a>
	@Id
	@Column(name = "id", nullable = false)
	@JsonProperty("id")
	private String id;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	@Column(name = "uuid", nullable = false)
	@JsonProperty("uuid")
	private String uuid;
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://purl.org/dc/terms/created">created</a>
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	// <a href="http://purl.org/dc/terms/issued">issued</a>
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private String geldigVan;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	// <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
	// <a href="http://www.w3.org/ns/oa#hasTarget">hasTarget</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasTarget")
	private Exploitatie hasTarget;
	// <a href="http://xmlns.com/foaf/0.1/name">name</a>
	@Column(name = "name", nullable = true)
	@JsonProperty("name")
	private List<String> name;
	// <a href="http://xmlns.com/foaf/0.1/phone">phone</a>
	@Column(name = "telefoonnummer", nullable = true)
	@JsonProperty("phone")
	private String telefoonnummer;
}
