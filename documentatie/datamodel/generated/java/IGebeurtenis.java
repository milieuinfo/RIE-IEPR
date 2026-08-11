package be.vlaanderen.omgeving.mjv.model.structuur;


/**
 * IGebeurtenis
 * <a href="http://www.w3.org/ns/sosa/FeatureOfInterest">FeatureOfInterest</a>
 **/
public interface IGebeurtenis {
	/**
	 * uuid
	 * <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	 * UUID
	 */
	String getUuid();
	void setUuid(String uuid);

	/**
	 * uri
	 * <a href="http://example.org/vocab/uri">uri</a>
	 * URI
	 */
	String getUri();
	void setUri(String uri);

}
