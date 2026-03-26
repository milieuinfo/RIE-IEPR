package be.vlaanderen.omgeving.mjv.model.structuur;


/**
 * ISysteem
 * <a href="http://www.w3.org/ns/ssn/System">System</a>
 **/
public interface ISysteem {
	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId">uuid</a>
	String getUuid();
	void setUuid(String uuid);

	// <a href="http://example.org/vocab/uri">uri</a>
	String getUri();
	void setUri(String uri);

	// <a href="https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend">ingediend</a>
	Boolean isIngediend();
	void setIngediend(Boolean ingediend);

}
