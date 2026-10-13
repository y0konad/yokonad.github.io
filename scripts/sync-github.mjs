import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.resolve(__dirname, '../src/data/github-contributions.json');

console.log('Sincronizando contribuciones oficiales de GitHub...');

// 1. Obtener la cuadrícula base de 53 semanas de GraphQL
const baseQuery = `query {
  viewer {
    login
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
            contributionLevel
          }
        }
      }
    }
  }
}`;

let baseData;
try {
  const gqlOutput = execSync(`gh api graphql -f query='${baseQuery.replace(/\n/g, ' ')}'`).toString();
  baseData = JSON.parse(gqlOutput);
} catch (e) {
  console.error('Error al consultar GraphQL:', e.message);
  process.exit(1);
}

const calendar = baseData.data.viewer.contributionsCollection.contributionCalendar;
const dateMap = new Map();

// Cargar commits iniciales del calendario
calendar.weeks.forEach(w => {
  w.contributionDays.forEach(d => {
    if (d.contributionCount > 0) {
      dateMap.set(d.date, d.contributionCount);
    }
  });
});

// 2. Extraer commits por autor/correo para incluir organizaciones y repositorios adicionales
const queries = [
  'search/commits?q=author-email:danramos939@gmail.com&per_page=100',
  'search/commits?q=author:y0konad&per_page=100'
];

for (const q of queries) {
  for (let page = 1; page <= 6; page++) {
    try {
      const out = execSync(`gh api "${q}&page=${page}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const res = JSON.parse(out);
      if (!res.items || res.items.length === 0) break;
      res.items.forEach(it => {
        const d = it.commit.author.date.split('T')[0];
        dateMap.set(d, (dateMap.get(d) || 0) + 1);
      });
    } catch {
      break;
    }
  }
}

// 3. Fusionar datos y calcular niveles cromáticos
let total = 0;
calendar.weeks.forEach(w => {
  w.contributionDays.forEach(d => {
    const count = dateMap.get(d.date) || 0;
    d.contributionCount = count;
    if (count === 0) {
      d.contributionLevel = 'NONE';
    } else if (count <= 3) {
      d.contributionLevel = 'FIRST_QUARTILE';
    } else if (count <= 8) {
      d.contributionLevel = 'SECOND_QUARTILE';
    } else if (count <= 18) {
      d.contributionLevel = 'THIRD_QUARTILE';
    } else {
      d.contributionLevel = 'FOURTH_QUARTILE';
    }
    total += count;
  });
});

calendar.totalContributions = total;
fs.writeFileSync(jsonPath, JSON.stringify(baseData, null, 2));
console.log(`✓ Sincronización completa: ${total} commits distribuidos en las 53 semanas.`);
