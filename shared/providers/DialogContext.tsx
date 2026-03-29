import React, { createContext, useState, useContext, ReactNode } from "react";
import { AppDialog } from "@coco/shared/components/AppDialog";

interface DialogOptions {
	title: string;
	message: string;
	type?: "info" | "options";
	confirmText?: string;
	cancelText?: string;
	intent?: "primary" | "success" | "warning" | "error" | "info";
	onConfirm?: () => void;
}

interface DialogContextProps {
	showDialog: (options: DialogOptions) => void;
	hideDialog: () => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
	const [visible, setVisible] = useState(false);
	const [options, setOptions] = useState<DialogOptions>({
		title: "",
		message: "",
	});

	const showDialog = (newOptions: DialogOptions) => {
		setOptions(newOptions);
		setVisible(true);
	};

	const hideDialog = () => {
		setVisible(false);
	};

	return (
		<DialogContext.Provider value={{ showDialog, hideDialog }}>
			{children}

			<AppDialog
				visible={visible}
				onClose={hideDialog}
				title={options.title}
				message={options.message}
				type={options.type}
				confirmText={options.confirmText}
				cancelText={options.cancelText}
				intent={options.intent}
				onConfirm={options.onConfirm || (() => {})}
			/>
		</DialogContext.Provider>
	);
};

export const useDialog = () => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error("useDialog debe ser usado dentro de un DialogProvider");
	}
	return context;
};
