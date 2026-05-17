package be.vlaanderen.omgeving.riepr.model.structuur;

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
 * Transactie
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie">Transactie</a>
 **/
@Getter
@Setter
@Entity(name = "Transactie")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transactie")
public class Transactie {
	// <a href="http://example.org/vocab/uri">uri</a>
	@Column(name = "uri", nullable = true)
	@JsonProperty("uri")
	private String uri;
	// <a href="http://www.w3.org/ns/prov#endedAtTime">endedAtTime</a>
	@Column(name = "einddatum", nullable = true)
	@JsonProperty("endedAtTime")
	private LocalDateTime einddatum;
	// <a href="http://www.w3.org/ns/prov#startedAtTime">startedAtTime</a>
	@Column(name = "startdatum", nullable = true)
	@JsonProperty("startedAtTime")
	private LocalDateTime startdatum;
	// <a href="http://www.w3.org/ns/prov#wasAssociatedWith">wasAssociatedWith</a>
	@JsonProperty("wasAssociatedWith")
	private Exploitant verantwoordelijke;
	// <a href="https://data.vlaanderen.be/ns/dossier#genereert">genereert</a>
	@JsonProperty("genereert")
	private List<Aangifte> genereert;
}
