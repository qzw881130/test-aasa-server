import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProductScreen() {
    // 获取URL参数
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Product Page</ThemedText>
            <ThemedText>Product ID: {id}</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
}); 