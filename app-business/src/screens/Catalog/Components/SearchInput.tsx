import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, FontSize, Spacing } from "@coco/shared/config/theme";

interface SearchInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onSearch?: () => void;
	onClear?: () => void;
	colors: any;
	placeholder?: string;
}

export const SearchInput = ({
	value,
	onChangeText,
	onSearch,
	onClear,
	colors,
	placeholder = "Buscar...",
}: SearchInputProps) => {
	return (
		<View
			style={[
				styles.searchContainer,
				{
					backgroundColor: colors.surfaceLight,
				},
			]}
		>
			<View
				style={[
					styles.searchInputWrapper,
					{ backgroundColor: colors.inputBg },
				]}
			>
				<Ionicons
					name="search"
					size={16}
					color={colors.textSecondaryLight}
					style={styles.searchIcon}
				/>
				<TextInput
					style={[
						styles.searchInput,
						{ color: colors.textPrimaryLight },
					]}
					placeholder={placeholder}
					placeholderTextColor={colors.textSecondaryLight}
					value={value}
					onChangeText={onChangeText}
					returnKeyType="search"
					onSubmitEditing={onSearch}
					clearButtonMode="while-editing"
				/>
				{value.length > 0 && onClear && (
					<TouchableOpacity onPress={onClear}>
						<Ionicons
							name="close-circle"
							size={20}
							color={colors.textSecondaryLight}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	searchInputWrapper: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		height: 38,
		borderRadius: BorderRadius.md,
		paddingHorizontal: Spacing.sm,
	},
	searchIcon: {
		marginRight: Spacing.xs,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSize.sm,
		height: "100%",
	},
});
