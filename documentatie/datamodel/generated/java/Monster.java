package be.vlaanderen.omgeving.mjv.model.structuur;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
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
 * Monster
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Monster">Monster</a>
 * Een monster is een deel van een onderzochte materie dat door een monstername wordt verkregen.
 **/
@Getter
@Setter
@Entity(name = "Monster")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "monster")
public class Monster implements IriReferentie {
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
	private String aangemaaktOp;
	/**
	 * issued
	 * <a href="http://purl.org/dc/terms/issued">issued</a>
	 */
	@Column(name = "geldig_van", nullable = false)
	@JsonProperty("issued")
	private String geldigVan;

	@jakarta.persistence.Transient
	@JsonProperty(value = "@type", access = JsonProperty.Access.READ_ONLY)
	public String getRdfType() {
		return "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Monster";
	}
}
