package be.vlaanderen.omgeving.mjv.model.structuur;

import java.time.LocalDate;
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
 * AangifteBundel
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AangifteBundel">AangifteBundel</a>
 **/
@Getter
@Setter
@Entity(name = "AangifteBundel")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aangifte_bundel")
public class AangifteBundel {
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
	@Column(name = "aangemaakt_op", nullable = true)
	@JsonProperty("created")
	private LocalDate aangemaaktOp;
	// <a href="http://purl.org/dc/terms/creator">creator</a>
	@JoinColumn(name = "uuid", nullable = true)
	@JsonProperty("creator")
	private Exploitant creator;
	// <a href="http://purl.org/dc/terms/modified">modified</a>
	@Column(name = "aangepast_op", nullable = true)
	@JsonProperty("modified")
	private LocalDate aangepastOp;
	// <a href="http://purl.org/dc/terms/type">type</a>
	@Column(name = "type", nullable = true)
	@JsonProperty("type")
	private String type;
	// <a href="http://www.w3.org/ns/adms#status">status</a>
	@JsonProperty("status")
	private Status status;
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId">vlaanderenId</a>
	@Column(name = "vlaanderen_id", nullable = false)
	@JsonProperty("vlaanderenId")
	private String vlaanderenId;
}
