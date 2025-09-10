import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getMaps } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MapsNav = NativeStackNavigationProp<RootStackParamList, 'Maps'>;

type ValorantMap = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  listViewIcon?: string | null;
  splash?: string | null;
  mapUrl?: string | null;
  assetPath?: string | null;
};

const HEADER_HEIGHT = 56;

// TDM Maps
const KNOWN_TDM_MAPS = new Set(['Piazza', 'District', 'Kasbah', 'Drift']);

// Exclude Map Pool
const EXCLUDE_FROM_POOL = new Set(['The Range', 'Range', 'Basic Training','POLİGON','Temel Eğitim']);

type TabKey = 'pool' | 'tdm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 12;        
const TILE_GAP = 10;           
const NUM_COLUMNS = 2;
const TILE_WIDTH = Math.floor(
  (SCREEN_WIDTH - H_PADDING * 2 - TILE_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);
const TILE_ASPECT_RATIO = 3 / 4; 
const TILE_HEIGHT = Math.round(TILE_WIDTH / (4 / 3)); 

export default function Maps() {
  const navigation = useNavigation<MapsNav>();
  const [maps, setMaps] = useState<ValorantMap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('pool'); // Default : Map Pool

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: ValorantMap[] = await getMaps();
        if (mounted) setMaps(data || []);
      } catch (e) {
        if (mounted) setError('Haritalar alınırken bir sorun oluştu.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isTDM = useCallback((m: ValorantMap) => {
    if (KNOWN_TDM_MAPS.has(m.displayName)) return true;
    const hay = `${m.assetPath ?? ''} ${m.mapUrl ?? ''}`.toLowerCase();
    return hay.includes('teamdeathmatch') || hay.includes('tdm') || hay.includes('hurm') || hay.includes('deathmatch');
  }, []);

  const imageOf = (m: ValorantMap) => m.splash || m.listViewIcon || m.displayIcon || undefined;

  const filteredMaps = useMemo(() => {
    const base = (maps || []).slice();

    if (activeTab === 'tdm') {
      return base
        .filter((m) => isTDM(m))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
    }

    
    return base
      .filter(
        (m) =>
          !EXCLUDE_FROM_POOL.has(m.displayName) &&
          !isTDM(m)
      )
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [maps, activeTab, isTDM]);

  const renderItem = useCallback(
    ({ item }: { item: ValorantMap }) => (
      <MapTile
        key={item.uuid}
        title={item.displayName}
        imageUri={imageOf(item)}

        onPress={() => {

        }}
      />
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>

        <View pointerEvents="none" style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Mapler
          </Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pool' && styles.tabActive]}
          onPress={() => setActiveTab('pool')}
        >
          <Text style={[styles.tabText, activeTab === 'pool' && styles.tabTextActive]}>MAP POOL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tdm' && styles.tabActive]}
          onPress={() => setActiveTab('tdm')}
        >
          <Text style={[styles.tabText, activeTab === 'tdm' && styles.tabTextActive]}>TDM</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
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
            data={filteredMaps}
            keyExtractor={(item) => item.uuid}
            showsVerticalScrollIndicator={false}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={{ gap: TILE_GAP }}
            contentContainerStyle={[styles.listContent, { paddingHorizontal: H_PADDING }]}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Text style={styles.helperText}>Bu sekmede görüntülenecek harita bulunamadı.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* GRID System */
function MapTile({
  title,
  imageUri,
  onPress,
}: {
  title: string;
  imageUri?: string;
  onPress?: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Pressable onPress={onPress} style={styles.tileWrap}>
      <ImageBackground
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.tileBg}
        imageStyle={styles.tileImage}
        onLoadEnd={() => setImgLoaded(true)}
        resizeMode="cover"
      >
        {!imgLoaded && (
          <View style={styles.tileLoading}>
            <ActivityIndicator />
          </View>
        )}
        {/* Alt koyu bant */}
        <View style={styles.tileOverlay} />
        <View style={styles.tileTitleWrap}>
          <Text numberOfLines={1} style={styles.tileTitle}>
            {title}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  // HEADER
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  backButton: { position: 'absolute', left: 24 },
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

  // TABS
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  tabActive: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  tabText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: { color: '#fff' },

  // CONTENT
  content: { flex: 1, paddingTop: 12 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { color: '#ccc', marginTop: 8 },
  errorText: { color: '#ff9aa2', fontSize: 14 },
  listContent: { paddingBottom: 24 },

  // TILE
  tileWrap: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#161616',
    marginBottom: 25,
  },
  tileBg: { flex: 1, justifyContent: 'flex-end' },
  tileImage: { width: '100%', height: '100%' },
  tileLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  tileOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tileTitleWrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
  },
  tileTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
});
