import React, { useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, 
  RefreshControl, TouchableOpacity 
} from 'react-native';
import { useStore } from '../store/useStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RiskFilter } from '../types';

type RootStackParamList = {
  StrategyList: undefined;
  StrategyDetail: { strategyId: number };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StrategyList'>;
};

export const StrategyListScreen: React.FC<Props> = ({ navigation }) => {
  const { strategies, isLoading, error, riskFilter, setRiskFilter, fetchStrategies } = useStore();

  useEffect(() => {
    fetchStrategies();
  }, [riskFilter]);

  const renderFilterButton = (filter: RiskFilter) => (
    <TouchableOpacity 
      style={[styles.filterButton, riskFilter === filter && styles.filterButtonActive]}
      onPress={() => setRiskFilter(filter)}
    >
      <Text style={[styles.filterText, riskFilter === filter && styles.filterTextActive]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && strategies.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderFilterButton('All')}
        {renderFilterButton('Low')}
        {renderFilterButton('Medium')}
        {renderFilterButton('High')}
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStrategies}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={strategies}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchStrategies} />
          }
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('StrategyDetail', { strategyId: item.id })}
            >
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{item.category}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Risk:</Text>
                <Text style={[
                  styles.value, 
                  item.riskLevel === 'High' ? styles.riskHigh : 
                  item.riskLevel === 'Medium' ? styles.riskMedium : styles.riskLow
                ]}>{item.riskLevel}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Return:</Text>
                <Text style={styles.returnText}>{item.returnPercentage}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Min Capital:</Text>
                <Text style={styles.value}>${item.minCapital.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { 
    flexDirection: 'row', justifyContent: 'space-around', 
    padding: 10, backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0' },
  filterButtonActive: { backgroundColor: '#0066cc' },
  filterText: { color: '#475569', fontWeight: 'bold' },
  filterTextActive: { color: 'white' },
  listContainer: { padding: 16, gap: 16 },
  card: { 
    backgroundColor: 'white', borderRadius: 12, padding: 16, 
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 16
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#64748b', fontSize: 14 },
  value: { color: '#334155', fontSize: 14, fontWeight: '500' },
  returnText: { color: '#10b981', fontSize: 14, fontWeight: 'bold' },
  riskLow: { color: '#10b981' },
  riskMedium: { color: '#f59e0b' },
  riskHigh: { color: '#ef4444' },
  errorContainer: { padding: 20, alignItems: 'center' },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center' },
  retryButton: { padding: 10, backgroundColor: '#0066cc', borderRadius: 8 },
  retryText: { color: 'white', fontWeight: 'bold' }
});
