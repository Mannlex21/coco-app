import { ref, set, onValue, remove, Database } from "firebase/database";
import {
	ITrackingRepository,
	Unsubscribe,
} from "@coco/shared/core/repositories";
import { TrackingLocation } from "@coco/shared/core/entities/Driver";
import { RTDB_PATHS } from "@coco/shared/constants";

export class FirebaseTrackingRepository implements ITrackingRepository {
	constructor(private rtdb: Database) {}

	async updateLocation(location: TrackingLocation): Promise<void> {
		const trackingRef = ref(
			this.rtdb,
			RTDB_PATHS.TRACKING(location.orderId),
		);
		await set(trackingRef, {
			...location,
			updatedAt: Date.now(),
		});
	}

	listenDriverLocation(
		orderId: string,
		callback: (location: TrackingLocation | null) => void,
	): Unsubscribe {
		const trackingRef = ref(this.rtdb, RTDB_PATHS.TRACKING(orderId));
		const unsub = onValue(trackingRef, (snapshot) => {
			callback(
				snapshot.exists() ? (snapshot.val() as TrackingLocation) : null,
			);
		});
		return unsub;
	}

	async clearLocation(orderId: string): Promise<void> {
		await remove(ref(this.rtdb, RTDB_PATHS.TRACKING(orderId)));
	}
}
