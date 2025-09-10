import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getGameModes } from '../api/api';

type GameModeDetailNav = NativeStackNavigationProp<
  RootStackParamList,
  'GameModeDetail'
>;

export default function GameModeDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<GameModeDetailNav>();
  const { modeId } = route.params;

  const [mode, setMode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMode = async () => {
      const modes = await getGameModes();
      const found = modes.find((m: any) => m.uuid === modeId);
      setMode(found);
      setLoading(false);
    };
    fetchMode();
  }, [modeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4655" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!mode) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Oyun modu bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Geri butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Başlık */}
      <Text style={styles.title}>{mode.displayName}</Text>

      {/* Logo */}
      {mode.displayIcon ? (
        <Image
          source={
            typeof mode.displayIcon === 'string'
              ? { uri: mode.displayIcon }
              : mode.displayIcon
          }
          style={styles.image}
        />
      ) : null}

      {/* Description */}
      {mode.description ? (
        <Text style={styles.desc}>{mode.description}</Text>
      ) : (
        <Text style={styles.desc}>Bu oyun modu için açıklama bulunamadı.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
    paddingHorizontal: 16,
    paddingTop: 70, 
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  desc: {
    fontSize: 20,
    color: '#ddd',
    lineHeight: 30,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});
