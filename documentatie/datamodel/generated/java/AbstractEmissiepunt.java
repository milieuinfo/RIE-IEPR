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
 * AbstractEmissiepunt
 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt">AbstractEmissiepunt</a>
 **/
@Getter
@Setter
@Entity(name = "AbstractEmissiepunt")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "abstract_emissiepunt")
public class AbstractEmissiepunt extends Emissiepunt {
}
