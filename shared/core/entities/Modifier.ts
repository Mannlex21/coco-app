// 1. Las opciones individuales dentro de un grupo (ej: "Coca-Cola", "Tocino", "Término Medio")
export interface ModifierChoice {
	id: string;
	name: string;
	extraPrice?: number; // Costo adicional (ej: 15.00), opcional si es gratis
	isAvailable: boolean; // Para ocultar la opción si se agota el ingrediente
}

// 2. El grupo que contiene las opciones (ej: "Escoge tu refresco", "Ingredientes Extra")
export interface ModifierGroup {
	id: string;
	name: string;
	minSelectable: number; // 0 si es opcional, 1 o más si es obligatorio
	maxSelectable: number; // Cuántas opciones máximo puede marcar el cliente
	choices: ModifierChoice[]; // Array con las opciones disponibles
}
