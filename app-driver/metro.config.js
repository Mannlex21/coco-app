const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ya no necesitamos watchFolders ni extraNodeModules
// porque todo lo que la app necesita está en su propia carpeta /src

module.exports = config;
