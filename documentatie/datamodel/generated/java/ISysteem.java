package be.vlaanderen.omgeving.mjv.model.structuur;


/**
 * ISysteem
 * <a href="http://www.w3.org/ns/ssn/System">System</a>
 **/
public interface ISysteem {
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
