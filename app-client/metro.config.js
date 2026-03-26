const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// 1. Obtenemos la configuración base de Expo
const config = getDefaultConfig(__dirname);

// 2. Definimos dónde está la carpeta 'shared' (un nivel arriba)
const sharedRoot = path.resolve(__dirname, "../shared");
const projectRoot = __dirname;

// 3. Le decimos a Metro que vigile AMBAS carpetas
config.watchFolders = [projectRoot, sharedRoot];

// 4. Aseguramos que Metro encuentre las librerías (node_modules)
// Prioriza las locales de la app
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(sharedRoot, "node_modules"),
];

// 5. Evitamos conflictos si tienes la misma librería en dos lugares
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
