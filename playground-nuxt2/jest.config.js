module.exports = {
  collectCoverage: true,
  testEnvironment: "node",
  transform: {
    "\\.(j|t)s$": [
      "babel-jest",
      {
        presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
        plugins: ["@babel/plugin-transform-runtime"]
      }
    ]
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@lit-labs|nuxt-webfontloader|nuxt-i18n|lit|lit-element|lit-html)/)"
  ]
};
