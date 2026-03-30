import { SupabaseClient } from "@supabase/supabase-js";

// 1. Definimos los actores principales
export type EntityType = "customers" | "drivers" | "merchants";

export interface UploadResult {
	url: string | null;
	error: string | null;
}

const BUCKET = "coco-media";

export class StorageRepository {
	constructor(private readonly supabase: SupabaseClient) {}

	/**
	 * Sube un archivo organizándolo por Entidad > ID > Subcarpetas
	 * @param fileUri - URI local de la imagen
	 * @param entity - 'customers' | 'drivers' | 'merchants'
	 * @param entityId - El ID del usuario, repartidor o negocio
	 * @param subPath - Segmentos internos (ej. ['products', 'prod_123'] o ['logo'])
	 */
	async uploadImage(
		fileUri: string,
		entity: EntityType,
		entityId: string,
		subPath: string[] = [],
		customFileName?: string,
	): Promise<UploadResult> {
		try {
			const fileExt = fileUri.split(".").pop()?.toLowerCase() ?? "jpg";

			// Si mandas un nombre fijo, lo usamos. Si no, usamos el timestamp.
			const nameToUse = customFileName
				? `${customFileName}.${fileExt}`
				: `img_${Date.now()}.${fileExt}`;

			const pathSegments = [entity, entityId];
			if (subPath.length > 0) pathSegments.push(...subPath);
			pathSegments.push(nameToUse);

			const fullPath = pathSegments.join("/");

			const formData = new FormData();
			formData.append("file", {
				uri: fileUri,
				name: nameToUse,
				type: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
			} as any);

			const { error: uploadError } = await this.supabase.storage
				.from(BUCKET)
				.upload(fullPath, formData, {
					contentType: `image/${fileExt}`,
					upsert: true,
				});

			if (uploadError) throw uploadError;

			const { data } = this.supabase.storage
				.from(BUCKET)
				.getPublicUrl(fullPath);

			return { url: data.publicUrl, error: null };
		} catch (err: any) {
			return {
				url: null,
				error: err.message ?? "Error en la carga de imagen",
			};
		}
	}
}
