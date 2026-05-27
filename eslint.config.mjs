import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "dist/**",
      "*.min.js",
      "*.tsbuildinfo",
    ],
  },
];

export default eslintConfig;
