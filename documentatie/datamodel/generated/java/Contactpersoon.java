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
 * Contactpersoon
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon">Contactpersoon</a>
 * Contactpersoon zijn de gegevens van een persoon die optreedt als contact binnen een bepaalde functie voor een exploitant.
 **/
@Getter
@Setter
@Entity(name = "Contactpersoon")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contactpersoon")
public class Contactpersoon {
	/**
	 * id
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id">id</a>
	 */
	@Id
	@Column(name = "id", nullable = false)
	@JsonProperty("id")
	private String id;
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
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
	 * created
	 * <a href="http://purl.org/dc/terms/created">created</a>
	 */
	@Column(name = "aangemaakt_op", nullable = false)
	@JsonProperty("created")
	private LocalDateTime aangemaaktOp;
	/**
	 * issued
	 * <a href="http://purl.org/dc/terms/issued">issued</a>
	 */
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private String geldigVan;
	/**
	 * modified
	 * <a href="http://purl.org/dc/terms/modified">modified</a>
	 * Contactgegevens kunnen een modificatie datum hebben
	 */
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDateTime aangepastOp;
	/**
	 * type
	 * <a href="http://purl.org/dc/terms/type">type</a>
	 * Contactpersonen kunnen een telefoonnummer hebben
	 */
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	/**
	 * comment
	 * <a href="http://www.w3.org/2000/01/rdf-schema#comment">comment</a>
	 * Contactpersonen kunnen een opmerking hebben
	 */
	@Column(name = "beschrijving", nullable = true)
	@JsonProperty("comment")
	private String beschrijving;
	/**
	 * hasTarget
	 * <a href="http://www.w3.org/ns/oa#hasTarget">hasTarget</a>
	 * Contactpersonen moeten gekoppeld zijn aan exact één exploitant
	 */
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("hasTarget")
	private Exploitatie hasTarget;
	/**
	 * mbox
	 * <a href="http://xmlns.com/foaf/0.1/mbox">mbox</a>
	 * Contactpersonen kunnen een e-mail adres hebben
	 */
	@Column(name = "email", nullable = true)
	@JsonProperty("mbox")
	private String email;
	/**
	 * name
	 * <a href="http://xmlns.com/foaf/0.1/name">name</a>
	 * Contactpersonen moeten een naam hebben
	 */
	@Column(name = "name", nullable = true)
	@JsonProperty("name")
	private List<String> name;
	/**
	 * phone
	 * <a href="http://xmlns.com/foaf/0.1/phone">phone</a>
	 * Contactpersonen kunnen een telefoonnummer hebben
	 */
	@Column(name = "telefoonnummer", nullable = true)
	@JsonProperty("phone")
	private String telefoonnummer;
}
