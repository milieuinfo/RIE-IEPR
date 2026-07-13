package be.vlaanderen.omgeving.mjv.model.structuur;


/**
 * IGebeurtenis
 * <a href="http://www.w3.org/ns/sosa/FeatureOfInterest">FeatureOfInterest</a>
 **/
public interface IGebeurtenis {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	String getUuid();
	void setUuid(String uuid);

	// <a href="http://example.org/vocab/uri">uri</a>
	String getUri();
	void setUri(String uri);

}
