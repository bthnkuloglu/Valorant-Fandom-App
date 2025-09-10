import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getGameModes } from '../api/api';

type GameModesNav = NativeStackNavigationProp<RootStackParamList, 'GameModes'>;

type GameMode = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
};

export default function GameModes() {
  const navigation = useNavigation<GameModesNav>();
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchGameModes = async () => {
      try {
        const data = await getGameModes();
        if (mounted) setGameModes(data);
      } catch (err) {
        setError('Oyun modları yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameModes();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4655" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Oyun Modları</Text>

      <FlatList
  data={gameModes}
  keyExtractor={(item) => item.uuid}
  numColumns={2}
  contentContainerStyle={styles.list}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GameModesDetails', { modeId: item.uuid })}
    >
      {item.displayIcon ? (
        <Image
          source={
            typeof item.displayIcon === 'string'
              ? { uri: item.displayIcon }
              : item.displayIcon
          }
          style={styles.image}
        />
      ) : (
        <Ionicons name="game-controller-outline" size={50} color="#fff" />
      )}
      <Text style={styles.name}>{item.displayName}</Text>
    </TouchableOpacity>
  )}
/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
    paddingHorizontal: 10,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#1F2A35',
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
