// Use Next's native flat exports: the repository's legacy FlatCompat config fails before linting.
import { ESLint } from 'eslint';
import vitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [...vitals, ...typescript] });
const results = await eslint.lintFiles([
  'src/app/page.tsx', 'src/components/GardenView.tsx', 'src/components/GrowthProgress.tsx',
  'src/components/PlantDisplay.tsx', 'src/components/MissionCard.tsx', 'src/lib/plantState.ts',
  'src/__tests__/growthExperience.test.ts', 'scripts/verify-growth-lint.mjs',
]);
console.log(JSON.stringify(results.map(({ filePath, errorCount, warningCount, messages }) => ({ filePath, errorCount, warningCount, messages })), null, 2));
if (results.some(result => result.errorCount || result.warningCount)) process.exitCode = 1;
