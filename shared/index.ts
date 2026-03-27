// Entities
export * from "@coco/shared/core/entities";

// Repositories (interfaces)
export * from "@coco/shared/core/repositories";

// Infrastructure
export { FirebaseOrderRepository } from "@coco/shared/infrastructure/firebase/FirebaseOrderRepository";
export { FirebaseBusinessRepository } from "@coco/shared/infrastructure/firebase/FirebaseBusinessRepository";
export { FirebaseProductRepository } from "@coco/shared/infrastructure/firebase/FirebaseProductRepository";
export { FirebaseChatRepository } from "@coco/shared/infrastructure/firebase/FirebaseChatRepository";
export { FirebaseTrackingRepository } from "@coco/shared/infrastructure/firebase/FirebaseTrackingRepository";
export { FirebaseDriverRepository } from "@coco/shared/infrastructure/firebase/FirebaseDriverRepository";

// Hooks
export { useAppStore } from "@coco/shared/hooks/useAppStore";
export {
	useClientOrders,
	useBusinessOrders,
	useDriverOrders,
	useTracking,
	useChat,
} from "@coco/shared/hooks/useOrders";

// Constants
export * from "@coco/shared/constants";

// Theme
export * from "@coco/shared/config/theme";
