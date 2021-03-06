module.exports = {
  verbose: true,
  silent: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^~/(.*)$": "<rootDir>/$1",
    "^vue$": "vue/dist/vue.common.js"
  },
  moduleFileExtensions: ["js", "vue", "json", "ts"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
    ".*\\.(vue)$": "vue-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/components/**/*.vue", "<rootDir>/pages/**/*.vue", "<rootDir>/js/**/*.ts", "<rootDir>/mixins/**/*.js"]
};
