interface IngredientArt {
  name: string;
  match: RegExp;
  wash: string;
}

const ingredients: IngredientArt[] = [
  { name: 'limon', match: /lim[oó]n|limonada|lemonade|mojito/, wash: '#edf2cf' },
  { name: 'fresa', match: /fresa/, wash: '#f8e3dd' },
  { name: 'naranja', match: /naranja/, wash: '#f9ebd4' },
  { name: 'lavanda', match: /lavanda/, wash: '#eee7f4' },
  { name: 'blueberries', match: /blueberr|berries|frutos rojos/, wash: '#e6eaf4' },
  { name: 'menta', match: /menta|hierbabuena|mojito/, wash: '#e6efdf' },
  { name: 'mango', match: /mango/, wash: '#f8e8c9' },
  { name: 'maracuya', match: /maracuya/, wash: '#f3e4d3' },
  { name: 'mandarina', match: /mandarina/, wash: '#fae8d2' },
  { name: 'platano', match: /platano/, wash: '#f6efce' },
  { name: 'coco', match: /coco/, wash: '#f1e8d9' },
  { name: 'guanabana', match: /guanabana/, wash: '#e8efd8' },
  { name: 'rosa', match: /petalos|rosa(?!do)/, wash: '#f4e2e7' },
  { name: 'guayaba', match: /guayaba/, wash: '#f6e5dc' },
  { name: 'tamarindo', match: /tamarindo/, wash: '#eee4d6' },
  { name: 'jengibre', match: /jengibre/, wash: '#f1e8d7' },
  { name: 'pina', match: /pina/, wash: '#f4edcc' },
  { name: 'jamaica', match: /jamaica|jamaiquita/, wash: '#f2e0e5' },
  { name: 'pepino', match: /pepino/, wash: '#e6eedc' },
  { name: 'toronja', match: /toronja/, wash: '#f9e5db' },
  { name: 'romero', match: /romero/, wash: '#e6eddf' },
  { name: 'frambuesa', match: /frambuesa/, wash: '#f4dfe6' },
  { name: 'uva', match: /vino|tinto/, wash: '#eee3f0' },
  { name: 'horchata', match: /horchata/, wash: '#f2e9d7' },
];

export function flavorArtwork(flavor: string) {
  const name = flavor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  const matches = ingredients
    .map((art) => ({ ...art, position: art.match.exec(name)?.index ?? -1 }))
    .filter((art) => art.position >= 0)
    .sort((a, b) =>
      a.name === 'horchata' ? 1 : b.name === 'horchata' ? -1 : a.position - b.position,
    );
  const first = matches[0];
  const path = (ingredient: string) => `/assets/illustrations/flavors/${ingredient}.svg`;
  return {
    ingredients: matches.map((art) => art.name),
    wash: name.includes('pink lemonade')
      ? '#f4e0e4'
      : name.includes('black lemonade')
        ? '#e6e8e1'
        : (first?.wash ?? '#e9efdf'),
    background: (matches.length ? matches : [{ name: 'hoja' }])
      .map((ingredient) => `url("${path(ingredient.name)}")`)
      .join(', '),
  };
}
