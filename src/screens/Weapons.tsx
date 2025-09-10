import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getWeapons, type Weapon } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

type WeaponsNav = NativeStackNavigationProp<RootStackParamList, 'Weapons'>;

// CATEGORY LIST
const CATEGORY_ORDER: string[] = [
  'EEquippableCategory::Sidearm', // Beylik Silahlar
  'EEquippableCategory::SMG',     // Hafif Makineliler
  'EEquippableCategory::Shotgun', // Pompalı Tüfekler
  'EEquippableCategory::Rifle',   // Taarruz Tüfekleri
  'EEquippableCategory::Sniper',  // Keskin Nişancı Silahlar
  'EEquippableCategory::Heavy',   // Ağır Silahlar
  'EEquippableCategory::Melee',   // Yakın Dövüş
];

// CATEGORY TITLES
const CATEGORY_TITLES: Record<string, string> = {
  'EEquippableCategory::Sidearm': 'Beylik Silahlar',
  'EEquippableCategory::SMG': 'Hafif Makineliler',
  'EEquippableCategory::Shotgun': 'Pompalı Tüfekler',
  'EEquippableCategory::Rifle': 'Taarruz Tüfekleri',
  'EEquippableCategory::Sniper': 'Keskin Nişancı Silahlar',
  'EEquippableCategory::Heavy': 'Ağır Silahlar',
  'EEquippableCategory::Melee': 'Yakın Dövüş',
};

// shopData.category / categoryText 
const RAW_TO_ENUM = (raw?: string | null): string | null => {
  if (!raw) return null;
  const s = raw.trim();
  if (s.startsWith('EEquippableCategory::')) return s;
  const t = s.toLowerCase();

  if (['pistol', 'pistols', 'sidearm', 'sidearms', 'beylik silahlar'].includes(t))
    return 'EEquippableCategory::Sidearm';
  if (['smg', 'smgs', 'hafif makineliler', 'hafif makineli', 'hafif makineli tüfek'].includes(t))
    return 'EEquippableCategory::SMG';
  if (['shotgun', 'shotguns', 'pompalı tüfekler', 'pompalı tüfek', 'pompalı'].includes(t))
    return 'EEquippableCategory::Shotgun';
  if (['rifle', 'rifles', 'assault rifle', 'assault rifles', 'taarruz tüfekleri', 'taarruz tüfeği'].includes(t))
    return 'EEquippableCategory::Rifle';
  if (['sniper', 'snipers', 'sniper rifle', 'sniper rifles', 'keskin nişancı', 'keskin nişancı silahlar'].includes(t))
    return 'EEquippableCategory::Sniper';
  if (['heavy', 'heavy weapons', 'ağır', 'ağır silahlar'].includes(t))
    return 'EEquippableCategory::Heavy';
  if (['melee', 'yakın dövüş', 'knife', 'bıçak'].includes(t))
    return 'EEquippableCategory::Melee';

  return null;
};

// CARD
const WeaponCard = ({ item, onPress }: { item: Weapon; onPress?: () => void }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
    {item.displayIcon ? (
      <Image source={{ uri: item.displayIcon }} style={styles.icon} resizeMode="contain" />
    ) : (
      <View style={[styles.icon, styles.placeholder]} />
    )}
    <Text style={styles.name} numberOfLines={1}>{item.displayName}</Text>
    {typeof item.shopData?.cost === 'number' && (
      <Text style={styles.meta}>Cost: {item.shopData.cost}</Text>
    )}
  </TouchableOpacity>
);

export default function Weapons() {
  const navigation = useNavigation<WeaponsNav>();
  const [rawWeapons, setRawWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setErr(null);
      const data = await getWeapons();
      setRawWeapons(data);
    } catch (e) {
      setErr('Silahlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // GROUP 
  const grouped = useMemo(() => {
    const out: Record<string, Weapon[]> = {};
    rawWeapons.forEach((w) => {
      const catEnum =
        w.category?.startsWith('EEquippableCategory::')
          ? w.category
          : RAW_TO_ENUM(w.shopData?.category) ||
            RAW_TO_ENUM(w.shopData?.categoryText) ||
            'Unknown';
      if (!out[catEnum]) out[catEnum] = [];
      out[catEnum].push(w);
    });
    Object.keys(out).forEach((k) => {
      out[k].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '', 'tr'));
    });
    return out;
  }, [rawWeapons]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Yükleniyor…</Text>
      </SafeAreaView>
    );
  }

  if (err) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{err}</Text>
        <TouchableOpacity style={styles.retry} onPress={fetchData}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ÜST BAR (senin kullandığın geri butonu) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Silahlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {CATEGORY_ORDER.map((catKey) => {
          const list = grouped[catKey] || [];
          if (list.length === 0) return null;

          return (
            <View key={catKey} style={{ marginBottom: 22 }}>
              <Text style={styles.sectionHeader}>{CATEGORY_TITLES[catKey] ?? catKey}</Text>

              {/* 2 sütun grid */}
              <View style={styles.grid}>
                {list.map((w) => (
                  <View key={w.uuid} style={styles.gridItem}>
                    <WeaponCard
                      item={w}
                      onPress={() => {
                        navigation.navigate('WeaponDetails', { uuid: w.uuid }); 
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_H = 160;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backButton: {
    paddingRight: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f14' },
  loadingText: { marginTop: 8, color: '#fff' },
  error: { color: '#ff6b6b', marginBottom: 12, fontSize: 16 },
  retry: { backgroundColor: '#1f6feb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },

  sectionHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 6,
  },

  // GRID
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  // CARD
  card: {
    backgroundColor: '#111923',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: { width: '100%', height: CARD_H - 80, marginBottom: 8 },
  placeholder: { backgroundColor: '#223', borderRadius: 12, height: CARD_H - 80, marginBottom: 8 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { color: '#b8c1cc', fontSize: 12 },
});
