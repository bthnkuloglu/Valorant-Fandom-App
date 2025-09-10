import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getAgentById } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

type AgentsDetailRoute = RouteProp<RootStackParamList, 'AgentsDetail'>;

type AgentDetailType = {
  uuid: string;
  displayName: string;
  description?: string;
  displayIcon?: string;
  fullPortrait?: string;
  role?: { displayName: string; description?: string };
};

const { width } = Dimensions.get('window');

export default function AgentsDetail() {
  const { params: { id } } = useRoute<AgentsDetailRoute>();
  const navigation = useNavigation();

  const [agent, setAgent] = useState<AgentDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAgentById(id);
        if (alive) setAgent(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Agent bulunamadı</Text>
      </View>
    );
  }

  const imgUri = agent.fullPortrait || agent.displayIcon;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Go Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {imgUri && <Image source={{ uri: imgUri }} style={styles.image} resizeMode="contain" />}
        <Text style={styles.name}>{agent.displayName}</Text>
        {agent.role?.displayName && <Text style={styles.role}>{agent.role.displayName}</Text>}
        {agent.role?.description && <Text style={styles.roleDesc}>{agent.role.description}</Text>}
        {agent.description && <Text style={styles.desc}>{agent.description}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  backButton: {
    position: 'absolute',
    top: 75,
    left: 24,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  image: {
    width: Math.min(width * 0.8, 360),
    height: Math.min(width * 0.8, 360),
  },
  name: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  role: { fontSize: 16, color: '#d1d5db', textAlign: 'center' },
  roleDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  desc: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#e5e7eb',
    textAlign: 'center',
    maxWidth: 700,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
