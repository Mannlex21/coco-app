module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"module-resolver",
				{
					root: ["./"],
					alias: {
						// Ahora '@' apunta a tu carpeta local de la app
						"@": "./src",
					},
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
			],
		],
	};
};
