package be.vlaanderen.omgeving.mjv.model.structuur;

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
 * Status
 * <a href="http://www.w3.org/ns/adms#Status">Status</a>
 **/
public enum Status {
	DEFINITIEF_UIT_DIENST = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#definitief_uit_dienst",
	IN_GEBRUIK = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#in_gebruik",
	ONTMANTELD = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ontmanteld",
	TIJDELIJK_UIT_DIENST = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#tijdelijk_uit_dienst",
	VOORGESTELD = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#voorgesteld",
}
