import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageStyle,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import VCTLogo from '../../assets/VCTLogo.png';
import api from '../api/api';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type TileProps = {
  label: string;
  bg: string;
  onPress: () => void;
  imageUri?: string | null;
  imageStyle?: ImageStyle;
};

export default function Home() {
  const navigation = useNavigation<HomeNav>();

  const [jettImg, setJettImg] = useState<string | null>(null);
  const [standardImg, setStandardImg] = useState<string | null>(null);
  const [vandalImg, setVandalImg] = useState<string | null>(null);
  const [lotusImg, setLotusImg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 1) Jett Image
        const agentsRes = await api.get('/agents', {
          params: { isPlayableCharacter: true },
        });
        const agents: any[] = agentsRes.data?.data ?? [];
        const jett =
          agents.find(a => (a.displayName || '').toLowerCase() === 'jett') ||
          agents.find(a => (a.displayName || '').toLowerCase() === 'jett (mirror)');
        const jettUri =
          jett?.fullPortrait ||
          jett?.bustPortrait ||
          jett?.fullPortraitV2 ||
          jett?.displayIcon ||
          null;

        // 2) Game Modes 
        const modesRes = await api.get('/gamemodes');
        const modes: any[] = modesRes.data?.data ?? [];
        const standard =
          modes.find(m => {
            const name = (m.displayName || '').toLowerCase();
            return name.includes('standard') || name.includes('unrated') || name.includes('standart');
          }) || null;
        const standardUri = standard?.displayIcon || standard?.listViewIconTall || standard?.listViewIcon || null;

        // 3) Weapons > Vandal 
        const weaponsRes = await api.get('/weapons');
        const weapons: any[] = weaponsRes.data?.data ?? [];
        const vandal = weapons.find(w => (w.displayName || '').toLowerCase() === 'vandal');
        const vandalUri = vandal?.displayIcon || vandal?.shopData?.newImage || null;

        // 4) Maps > Lotus 
        const mapsRes = await api.get('/maps');
        const maps: any[] = mapsRes.data?.data ?? [];
        const lotus = maps.find(m => (m.displayName || '').toLowerCase() === 'lotus');
        const lotusUri = lotus?.splash;

        if (!alive) return;
        setJettImg(jettUri ?? null);
        setStandardImg(standardUri ?? null);
        setVandalImg(vandalUri ?? null);
        setLotusImg(lotusUri ?? null);
      } catch (e) {
        if (!alive) return;
        setJettImg(null);
        setStandardImg(null);
        setVandalImg(null);
        setLotusImg(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Top Boxes */}
        <View style={styles.row}>
          <Tile
            label="AJANLAR"
            bg="#111923"
            onPress={() => navigation.navigate('Agents')}
            imageUri={jettImg}
            imageStyle={{ width: 200, height: 200 }}
          />
          <Tile
            label="HARİTALAR"
            bg="#111923"
            onPress={() => navigation.navigate('Maps')}
            imageUri={lotusImg}
            imageStyle={{ width: 200, height: 200 }}
          />
        </View>

        {/* Middle Boxes */}
        <View style={styles.row}>
          <Tile
            label="OYUN MODLARI"
            bg="#111923"
            onPress={() => navigation.navigate('GameModes')}
            imageUri={standardImg}
            imageStyle={{ width: 100, height: 150 }}
          />
          <Tile
            label="SİLAHLAR"
            bg="#111923"
            onPress={() => navigation.navigate('Weapons')}
            imageUri={vandalImg}
            imageStyle={{ width: 200, height: 150 }}
          />
        </View>

        {/* Bottom Box */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Esports')}
          style={[styles.fullRow, { backgroundColor: '#111923' }]}
        >
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Image
              source={VCTLogo}
              style={{ width: 200, height: 200, resizeMode: 'contain' }}
            />
            <Text style={styles.title}>ESPOR</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Tile({ label, bg, onPress, imageUri, imageStyle }: TileProps) {
  const isLocal = typeof imageUri !== 'string'; 

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.tile, { backgroundColor: bg }]}>
      <View style={styles.tileInner}>
        {imageUri ? (
          isLocal ? (
            <Image source={imageUri as any} style={[styles.tileImage, imageStyle]} resizeMode="contain" />
          ) : (
            <Image source={{ uri: imageUri }} style={[styles.tileImage, imageStyle]} resizeMode="contain" />
          )
        ) : null}
        <Text style={styles.title}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0f14' },
  container: {
    flex: 1,
    padding: 8,
    gap: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    borderRadius: 12,
  },
  tileInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  tileImage: {
    width: 52,
    height: 52,
    marginBottom: 4,
  },
  fullRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
