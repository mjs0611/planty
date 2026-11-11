import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next 16은 플랫 설정을 직접 내보낸다. FlatCompat 경유는 순환 참조로 깨진다.
const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "out/**", "node_modules/**", "scripts/**"] },
];

export default eslintConfig;
