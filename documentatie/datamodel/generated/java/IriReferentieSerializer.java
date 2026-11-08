package be.vlaanderen.omgeving.mjv.model.structuur;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import java.io.IOException;

/**
 * Serializes a reference to an entity as its URI instead of as a nested object.
 **/
public class IriReferentieSerializer extends StdSerializer<Object> {

	public IriReferentieSerializer() {
		super(Object.class);
	}

	@Override
	public void serialize(Object value, JsonGenerator gen, SerializerProvider provider)
			throws IOException {
		if (value instanceof IriReferentie reference) {
			gen.writeString(reference.getUri());
		} else {
			provider.defaultSerializeValue(value, gen);
		}
	}
}
