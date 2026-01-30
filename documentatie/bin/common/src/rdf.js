import fs from 'fs';
import N3 from 'n3';

export async function parseTurtleFile(filePath) {
  const parser = new N3.Parser({ format: 'Turtle' });
  const store = new N3.Store();
  const ttlContent = fs.readFileSync(filePath, 'utf8');

  await new Promise((resolve, reject) => {
    parser.parse(ttlContent, (error, quad, prefixes) => {
      if (error) reject(error);
      else if (quad) store.addQuad(quad);
      else resolve(prefixes);
    });
  });

  return store;
}

export async function parseTurtleString(turtle) {
  const parser = new N3.Parser({ format: 'Turtle' });
  const store = new N3.Store();

  await new Promise((resolve, reject) => {
    parser.parse(turtle, (error, quad) => {
      if (error) reject(error);
      else if (quad) store.addQuad(quad);
      else resolve();
    });
  });

  return store;
}
