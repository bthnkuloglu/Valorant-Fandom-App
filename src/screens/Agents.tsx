import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getAgents } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';

type AgentsNav = NativeStackNavigationProp<RootStackParamList, 'Agents'>;

type Agent = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  bustPortrait?: string | null;
  fullPortrait?: string | null;
  role?: { displayName: string } | null;
};

const HEADER_HEIGHT = 56;

export default function Agents() {
  const navigation = useNavigation<AgentsNav>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: Agent[] = await getAgents();
        if (mounted) setAgents(data);
      } catch (e) {
        if (mounted) setError('Ajanlar alınırken bir sorun oluştu.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Go Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>


        <View pointerEvents="none" style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Ajanlar
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.helperText}>Yükleniyor...</Text>
          </View>
        )}

        {!!error && !loading && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={agents}
            keyExtractor={(item) => item.uuid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const img =
                item.displayIcon || item.bustPortrait || item.fullPortrait || undefined;

              return (
                <Card
                  title={item.displayName}
                  subtitle={item.role?.displayName ?? undefined}
                  imageUri={img}
                  onPress={() => navigation.navigate('AgentsDetail', { id: item.uuid })}

                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  // HEADER
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left:24,  
  },
  titleWrap: {
    position: 'absolute',
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  content: { flex: 1, paddingHorizontal: 8, paddingTop: 20 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { color: '#ccc', marginTop: 8 },
  errorText: { color: '#ff9aa2', fontSize: 14 },
  listContent: { paddingBottom: 24 },
});
