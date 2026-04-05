import React, { useState, useMemo } from "react";
import {
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
	Spacing,
	FontSize,
	BorderRadius,
	Shadow,
} from "@coco/shared/config/theme";
import { SearchInput } from "@/components/SearchInput";

interface DropdownOption {
	label: string;
	value: string;
}

interface CustomDropdownProps {
	placeholder?: string;
	options: DropdownOption[];
	value: string | null;
	onChange: (value: string | null) => void;
	colors: any;
}

export const CustomDropdown = ({
	placeholder = "Selecciona una opción",
	options,
	value,
	onChange,
	colors,
}: CustomDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const selectedOption = options.find((opt) => opt.value === value);

	const handleSelect = (val: string) => {
		onChange(val);
		setIsOpen(false);
		setSearchQuery("");
	};

	const handleClearSelection = () => {
		onChange(null);
	};

	// Filtro en tiempo real por el label
	const filteredOptions = useMemo(() => {
		if (!searchQuery.trim()) return options;
		return options.filter((option) =>
			option.label.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery, options]);

	return (
		<View style={styles.container}>
			{/* Botón principal */}
			<View
				style={[
					styles.dropdownButton,
					{
						backgroundColor: colors.surfaceLight,
						borderColor: colors.borderLight,
					},
				]}
			>
				<TouchableOpacity
					style={styles.dropdownButtonText}
					onPress={() => setIsOpen(true)}
					activeOpacity={0.7}
				>
					<Text
						style={[
							styles.selectedText,
							{
								color: selectedOption
									? colors.textPrimaryLight
									: colors.textSecondaryLight,
							},
						]}
						numberOfLines={1}
					>
						{selectedOption ? selectedOption.label : placeholder}
					</Text>
				</TouchableOpacity>

				{selectedOption ? (
					<TouchableOpacity
						onPress={handleClearSelection}
						style={styles.actionIcon}
					>
						<MaterialIcons
							name="close"
							size={20}
							color={colors.textSecondaryLight}
						/>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={() => setIsOpen(true)}
						style={styles.actionIcon}
					>
						<MaterialIcons
							name={isOpen ? "arrow-drop-up" : "arrow-drop-down"}
							size={24}
							color={colors.textSecondaryLight}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* Modal para mostrar las opciones */}
			<Modal
				visible={isOpen}
				transparent={true}
				animationType="fade"
				onRequestClose={() => {
					setIsOpen(false);
					setSearchQuery("");
				}}
			>
				<TouchableWithoutFeedback
					onPress={() => {
						setIsOpen(false);
						setSearchQuery("");
					}}
				>
					<View style={styles.modalOverlay}>
						<View
							style={[
								styles.modalContent,
								{ backgroundColor: colors.surfaceLight },
								Shadow.md,
							]}
						>
							<View
								style={[
									styles.header,
									{ borderBottomColor: colors.borderLight },
								]}
							>
								<Text
									style={[
										styles.headerTitle,
										{ color: colors.textPrimaryLight },
									]}
								>
									{placeholder}
								</Text>
								<TouchableOpacity
									onPress={() => {
										setIsOpen(false);
										setSearchQuery("");
									}}
								>
									<MaterialIcons
										name="close"
										size={22}
										color={colors.textSecondaryLight}
									/>
								</TouchableOpacity>
							</View>

							{/* 🔍 AQUÍ ESTÁ TU COMPONENTE SEARCHINPUT */}
							<View style={styles.searchWrapper}>
								<SearchInput
									placeholder="Buscar..."
									value={searchQuery}
									onChangeText={setSearchQuery}
									colors={colors}
								/>
							</View>

							<FlatList
								data={filteredOptions}
								keyExtractor={(item) => item.value}
								contentContainerStyle={styles.listContent}
								keyboardShouldPersistTaps="handled"
								renderItem={({ item }) => {
									const isSelected = item.value === value;
									return (
										<TouchableOpacity
											style={[
												styles.optionItem,
												isSelected && {
													backgroundColor:
														colors.inputBg,
												},
											]}
											onPress={() =>
												handleSelect(item.value)
											}
										>
											<Text
												style={[
													styles.optionText,
													{
														color: isSelected
															? colors.clientBg
															: colors.textPrimaryLight,
														fontWeight: isSelected
															? "600"
															: "400",
													},
												]}
											>
												{item.label}
											</Text>
											{isSelected && (
												<MaterialIcons
													name="check"
													size={20}
													color={colors.clientBg}
												/>
											)}
										</TouchableOpacity>
									);
								}}
								ListEmptyComponent={
									<View style={styles.emptyContainer}>
										<Text
											style={{
												color: colors.textSecondaryLight,
												fontSize: FontSize.md,
											}}
										>
											No se encontraron resultados
										</Text>
									</View>
								}
							/>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	dropdownButton: {
		height: 48,
		borderWidth: 1,
		borderRadius: BorderRadius.sm,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	dropdownButtonText: {
		flex: 1,
		height: "100%",
		justifyContent: "center",
		paddingHorizontal: Spacing.md,
	},
	actionIcon: {
		height: "100%",
		justifyContent: "center",
		paddingHorizontal: Spacing.md,
	},
	selectedText: {
		fontSize: FontSize.md,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "center",
		alignItems: "center",
		padding: Spacing.xl,
	},
	modalContent: {
		width: "100%",
		maxHeight: "60%",
		borderRadius: BorderRadius.md,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	headerTitle: {
		fontSize: FontSize.lg,
		fontWeight: "600",
	},
	searchWrapper: {
		padding: Spacing.md, // Le damos aire al rededor de tu componente
	},
	listContent: {
		paddingVertical: Spacing.xs,
	},
	optionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.md,
	},
	optionText: {
		fontSize: FontSize.md,
		flex: 1,
	},
	emptyContainer: {
		padding: Spacing.lg,
		alignItems: "center",
	},
});
