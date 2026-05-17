package be.vlaanderen.omgeving.riepr.model.structuur;

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
 * Procedure
 * <a href="http://www.w3.org/ns/sosa/Procedure">Procedure</a>
 **/
public enum Procedure {
	EMISSIE = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#EmissieProcedure",
	MEET = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetProcedure",
	ONTTREKKING = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#OnttrekkingProcedure",
	TRANSPORT = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure",
	VERWERKING = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerwerkingProcedure",
}
