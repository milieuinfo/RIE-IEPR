package be.vlaanderen.omgeving.mjv.model.structuur;

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
 * Status
 * <a href="http://www.w3.org/ns/adms#Status">Status</a>
 **/
public enum Status {
	DEFINITIEF_UIT_DIENST("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/definitief_uit_dienst"),
	IN_GEBRUIK("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst"),
	ONTMANTELD("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/ontmanteld"),
	TIJDELIJK_UIT_DIENST("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/tijdelijk_uit_dienst"),
	VERKEERDE_REGISTRATIE("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/verkeerde_registratie"),
	VOORGESTELD("https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/voorgesteld");

	private final String uri;

	Status(String uri) {
		this.uri = uri;
	}

	public String getUri() {
		return uri;
	}
}
