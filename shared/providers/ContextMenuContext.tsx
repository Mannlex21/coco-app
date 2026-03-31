import { ContextMenuItem, CustomContextMenu } from "@coco/shared/components";
import React, { createContext, useState, useContext } from "react";

interface ContextMenuContextType {
	showContextMenu: (
		title: string,
		items: ContextMenuItem[],
		subtitle?: string,
	) => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(
	undefined,
);

export const ContextMenuProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
	const [items, setItems] = useState<ContextMenuItem[]>([]);

	const showContextMenu = (
		newTitle: string,
		newItems: ContextMenuItem[],
		newSubtitle?: string,
	) => {
		setTitle(newTitle);
		setItems(newItems);
		setSubtitle(newSubtitle);
		setVisible(true);
	};

	const handleClose = () => setVisible(false);

	return (
		<ContextMenuContext.Provider value={{ showContextMenu }}>
			{children}
			{/* El modal vive aquí globalmente */}
			<CustomContextMenu
				visible={visible}
				onClose={handleClose}
				title={title}
				subtitle={subtitle}
				items={items}
			/>
		</ContextMenuContext.Provider>
	);
};

// Hook para usarlo en tus pantallas
export const useContextMenu = () => {
	const context = useContext(ContextMenuContext);
	if (!context)
		throw new Error(
			"useContextMenu debe usarse dentro de ContextMenuProvider",
		);
	return context;
};
