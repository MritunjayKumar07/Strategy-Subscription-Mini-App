import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useStore } from '../store/useStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  StrategyList: undefined;
  StrategyDetail: { strategyId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'StrategyDetail'>;

export const StrategyDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { strategyId } = route.params;
  const { strategies, subscribeToStrategy } = useStore();
  const strategy = strategies.find(s => s.id === strategyId);

  const [capital, setCapital] = useState<string>(strategy ? strategy.minCapital.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!strategy) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Strategy not found.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubscribe = async () => {
    const allocatedCapital = parseFloat(capital);
    if (isNaN(allocatedCapital) || allocatedCapital < strategy.minCapital) {
      Alert.alert('Invalid Capital', `Minimum capital required is $${strategy.minCapital}`);
      return;
    }

    setIsSubmitting(true);
    const result = await subscribeToStrategy(strategy.id, allocatedCapital);
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>{strategy.name}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>{strategy.category}</Text>
            <Text style={[
              styles.badge, 
              strategy.riskLevel === 'High' ? styles.riskHighBg : 
              strategy.riskLevel === 'Medium' ? styles.riskMediumBg : styles.riskLowBg
            ]}>
              {strategy.riskLevel} Risk
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Return</Text>
              <Text style={styles.statValueReturn}>{strategy.returnPercentage}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Min Capital</Text>
              <Text style={styles.statValue}>${strategy.minCapital}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Allocated Capital ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={capital}
            onChangeText={setCapital}
            placeholder={`Min $${strategy.minCapital}`}
          />
          <Text style={styles.helperText}>
            Must be at least ${strategy.minCapital.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.subscribeButton, isSubmitting && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.subscribeText}>Subscribe to Strategy</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollContainer: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { 
    backgroundColor: 'white', borderRadius: 12, padding: 20, 
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, textAlign: 'center' },
  badgeContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  badge: { backgroundColor: '#e2e8f0', color: '#475569', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  riskLowBg: { backgroundColor: '#d1fae5', color: '#065f46' },
  riskMediumBg: { backgroundColor: '#fef3c7', color: '#92400e' },
  riskHighBg: { backgroundColor: '#fee2e2', color: '#991b1b' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#1e293b', fontSize: 18, fontWeight: 'bold' },
  statValueReturn: { color: '#10b981', fontSize: 18, fontWeight: 'bold' },
  inputContainer: { marginBottom: 24 },
  inputLabel: { color: '#475569', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 16, fontSize: 16, color: '#1e293b' },
  helperText: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  subscribeButton: { backgroundColor: '#0066cc', padding: 16, borderRadius: 8, alignItems: 'center' },
  subscribeButtonDisabled: { backgroundColor: '#94a3b8' },
  subscribeText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#ef4444', fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#0066cc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});
