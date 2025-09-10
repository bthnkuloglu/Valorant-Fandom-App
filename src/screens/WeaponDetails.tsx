import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getWeaponById } from "../api/api";
import Ionicons from "react-native-vector-icons/Ionicons";

type WeaponDetailsNav = NativeStackNavigationProp<
  RootStackParamList,
  "WeaponDetails"
>;

export default function WeaponDetails() {
  const route = useRoute<any>();
  const navigation = useNavigation<WeaponDetailsNav>();
  const { uuid } = route.params;

  const [weapon, setWeapon] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        const data = await getWeaponById(uuid);
        setWeapon(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeapon();
  }, [uuid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!weapon) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Silah bulunamadı.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER Sabit */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{weapon.displayName}</Text>
        <View style={{ width: 36 }} /> {/* sağ tarafı dengelemek için */}
      </View>

      {/* Scroll Olan İçerik */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Silah görseli */}
        {weapon.displayIcon && (
          <Image
            source={{ uri: weapon.displayIcon }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {/* Damage Ranges Grid */}
        {weapon.weaponStats?.damageRanges?.length > 0 && (
          <View style={styles.damageContainer}>
            <Text style={styles.sectionTitle}>Hasar Mesafeleri</Text>

            {/* Tablo Başlıkları */}
            <View style={[styles.gridRow, styles.gridHeader]}>
              <Text style={[styles.gridCell, styles.gridHeaderText]}>Mesafe</Text>
              <Text style={[styles.gridCell, styles.gridHeaderText]}>Baş</Text>
              <Text style={[styles.gridCell, styles.gridHeaderText]}>Gövde</Text>
              <Text style={[styles.gridCell, styles.gridHeaderText]}>Bacak</Text>
            </View>

            {/* Satırlar */}
            {weapon.weaponStats.damageRanges.map((range: any, idx: number) => (
              <View key={idx} style={styles.gridRow}>
                <Text style={styles.gridCell}>
                  {range.rangeStartMeters} - {range.rangeEndMeters}m
                </Text>
                <Text style={styles.gridCell}>{range.headDamage}</Text>
                <Text style={styles.gridCell}>{range.bodyDamage}</Text>
                <Text style={styles.gridCell}>{range.legDamage}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skins Grid */}
        {weapon.skins?.length > 0 && (
          <View style={styles.skinsContainer}>
            <Text style={styles.sectionTitle}>Skinler</Text>
            <View style={styles.skinsGrid}>
              {weapon.skins
                .filter(
                  (skin: any) =>
                    !skin.displayName.toLowerCase().includes("random favorite skins")
                )
                .map((skin: any) => {
                  const skinImage =
                    skin.displayName.toLowerCase().includes("standard") &&
                    weapon.displayIcon
                      ? weapon.displayIcon
                      : skin.displayIcon;

                  if (!skinImage) return null;

                  return (
                    <View key={skin.uuid} style={styles.skinCard}>
                      <Image
                        source={{ uri: skinImage }}
                        style={styles.skinImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.skinName} numberOfLines={1}>
                        {skin.displayName}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0f14" },

  // HEADER
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#0b0f14",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: { paddingRight: 6 },

  scrollContent: { padding: 16, paddingBottom: 40, alignItems: "center" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 300, height: 150, marginBottom: 20 },
  errorText: { color: "red" },


  // Damage Range Grid
  damageContainer: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "#111923",
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  gridCell: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
  },
  gridHeader: {
    borderBottomWidth: 2,
    borderBottomColor: "#444",
    marginBottom: 6,
  },
  gridHeaderText: {
    fontWeight: "bold",
    color: "#ff4655",
  },

  // SKINS GRID
  skinsContainer: {
    marginTop: 20,
    width: "100%",
  },
  skinsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skinCard: {
    width: "48%",
    backgroundColor: "#111923",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  skinImage: { width: "100%", height: 100, marginBottom: 8 },
  skinName: { color: "#fff", fontSize: 12, textAlign: "center" },
});
