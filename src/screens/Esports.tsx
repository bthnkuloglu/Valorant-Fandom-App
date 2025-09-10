import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ValorantLogo from "../../assets/valorant-logo.png";

import {
  getVlrMatches,
  getVlrRankings,
  getVlrNews,
  type VlrMatch,
  type VlrRanking,
  type VlrNewsItem,
} from "../api/esports";


const REGION_MAP: Record<string, string | null> = {
  World: null,
  EU: "eu",
  NA: "na",
  AP: "ap",
  KR: "kr",
  BR: "br",
  "LA-N": "la-n",
  "LA-S": "la-s",
  JP: "jp",
  CN: "cn",
};

type TabKey = "live" | "upcoming" | "results" | "rankings" | "news";

const REGION_KEYS: Record<keyof typeof REGION_MAP, RegExp[]> = {
  World: [],
  EU: [/\b(europe|emea|eu(?![a-z]))\b/i],
  NA: [
    /\bnorth america\b/i,
    /\bna (challengers|stage|split|open|qualifier|lcq)\b/i,
    /\b(challengers|stage|split|open|qualifier|lcq) na\b/i,
    /\bna(?![a-z])/i,
  ],
  AP: [/\b(apac|asia pacific|ap(?![a-z]))\b/i],
  KR: [/\b(korea|kr(?![a-z]))\b/i],
  BR: [/\b(brazil|brasil|brazilian|challengers brazil|br(?![a-z]))\b/i],
  "LA-N": [/\b(latam north|la-?n|latin america north)\b/i],
  "LA-S": [/\b(latam south|la-?s|latin america south)\b/i],
  JP: [/\b(japan|jp(?![a-z]))\b/i],
  CN: [/\b(china|cn(?![a-z]))\b/i],
};

const BAD_TOKENS_FOR_NA = /\b(final|finals|international|invitational|nation|lan)\b/i;

function belongsToRegionByText(regionLabel: keyof typeof REGION_MAP, text: string) {
  if (regionLabel === "World") return true;
  const patterns = REGION_KEYS[regionLabel] ?? [];
  if (regionLabel === "NA" && BAD_TOKENS_FOR_NA.test(text)) return false;
  return patterns.some((re) => re.test(text));
}

function belongsToRegion(m: VlrMatch, regionLabel: keyof typeof REGION_MAP, regionCode: string | null) {
  if (!regionCode || regionLabel === "World") return true;
  const f1 = (m.flag1 || "").toLowerCase();
  const f2 = (m.flag2 || "").toLowerCase();
  if (f1 === regionCode || f2 === regionCode) return true;
  const t = `${m.tournament_name ?? ""} ${m.match_event ?? ""}`.toLowerCase();
  return belongsToRegionByText(regionLabel, t);
}

function regionEmoji(label: keyof typeof REGION_MAP) {
  switch (label) {
    case "EU": return "🇪🇺";
    case "NA": return "🇺🇸";
    case "AP": return "🌏";
    case "KR": return "🇰🇷";
    case "BR": return "🇧🇷";
    case "LA-N": return "🌎";
    case "LA-S": return "🌎";
    case "JP": return "🇯🇵";
    case "CN": return "🇨🇳";
    default: return "🌐";
  }
}

// Logo Func: If logo is null, Valorant Logo fallback 
function Logo({ uri, size = 24, rounded = true, style }: { uri?: string | null; size?: number; rounded?: boolean; style?: any }) {
  const [error, setError] = useState(false);
  if (!uri || error) {
    return (
      <Image
        source={ValorantLogo}
        style={[{ width: size, height: size, borderRadius: rounded ? size / 2 : 6, backgroundColor: "#0f1218" }, style]}
        resizeMode="contain"
      />
    );
  }
  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius: rounded ? size / 2 : 6, backgroundColor: "#0f1218" }, style]}
      resizeMode="contain"
      onError={() => setError(true)}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="information-circle-outline" size={20} color="#9aa3b2" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export default function Esports() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<TabKey>("live");
  const [regionLabel, setRegionLabel] = useState<keyof typeof REGION_MAP>("World");
  const regionCode = REGION_MAP[regionLabel];
  const [loading, setLoading] = useState(false);
  const [matchesRaw, setMatchesRaw] = useState<VlrMatch[]>([]);
  const [rankings, setRankings] = useState<VlrRanking[]>([]);
  const [news, setNews] = useState<VlrNewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);

  const matches = useMemo(() => {
    if (!regionCode || regionLabel === "World") return matchesRaw;
    return matchesRaw.filter((m) => belongsToRegion(m, regionLabel, regionCode));
  }, [matchesRaw, regionCode, regionLabel]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      if (tab === "rankings") {
        const apiRegion = regionCode ?? "eu";
        setRankings(await getVlrRankings(apiRegion));
      } else if (tab === "news") {
        setNews(await getVlrNews());
      } else {
        const q = tab === "live" ? "live_score" : tab;
        const data = await getVlrMatches(q);
        setMatchesRaw(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab, regionCode]);

  const tabs: { key: TabKey; label: string; live?: boolean }[] = [
    { key: "live", label: "Canlı", live: true },
    { key: "upcoming", label: "Yaklaşan" },
    { key: "results", label: "Sonuçlar" },
    { key: "rankings", label: "Sıralama" },
    { key: "news", label: "Haberler" },
  ];

  const regionOptions = Object.keys(REGION_MAP) as (keyof typeof REGION_MAP)[];

  const emptyMessage = tab === "upcoming"
    ? "Şu anda yaklaşan maç bulunmuyor."
    : tab === "live"
    ? "Şu anda canlı maç yok."
    : "Bu kriterlerde maç bulunamadı.";

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Espor</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs + Region Selector */}
      <View style={styles.tabRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {tabs.map((t) => (
            <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.active]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.tabText}>{t.label}</Text>
                {t.live && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "red" }} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dropdown */}
        <View style={{ marginLeft: 12 }}>
          <TouchableOpacity style={styles.regionBtn} onPress={() => setRegionOpen((v) => !v)} activeOpacity={0.8}>
            <Text style={styles.regionEmoji}>{regionEmoji(regionLabel)}</Text>
            <Text style={styles.regionText}>{regionLabel}</Text>
            <Ionicons name={regionOpen ? "chevron-up" : "chevron-down"} size={16} color="#9aa3b2" />
          </TouchableOpacity>

          {regionOpen && (
            <View style={styles.regionMenu}>
              {regionOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.regionItem, opt === regionLabel && styles.regionItemActive]}
                  onPress={() => { setRegionLabel(opt); setRegionOpen(false); }}
                >
                  <Text style={styles.regionItemText}>{regionEmoji(opt)} {opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {!!error && <Text style={styles.err}>Hata: {error}</Text>}

      {tab === "rankings" ? (
        <FlatList
          contentContainerStyle={styles.listPad}
          data={rankings}
          keyExtractor={(it, i) => `${it.team}-${i}`}
          renderItem={({ item }) => (
            <View style={[styles.card, styles.row, { alignItems: "center" }]}>
              <Logo uri={item.logo} size={28} rounded style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>#{item.rank} {item.team}</Text>
                <Text style={styles.meta}>{item.country} • Kayıt: {item.record} • Kazanç: {item.earnings}</Text>
              </View>

            </View>
          )}
        />
      ) : tab === "news" ? (
        <FlatList
          contentContainerStyle={styles.listPad}
          data={news}
          keyExtractor={(it, i) => `${it.title}-${i}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.author} • {item.date}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.listPad}
          data={matches}
          keyExtractor={(it, i) => `${itemKey(matches[i])}-${i}`}
          renderItem={({ item }) => (
            <View style={[styles.card, styles.matchCard]}>
              <View style={[styles.row, { alignItems: "center" }]}>
                <Logo uri={item.team1_logo} size={28} rounded style={{ marginRight: 8 }} />
                <Text style={[styles.title, { flex: 1 }]} numberOfLines={1}>{item.team1}</Text>
                <Text style={styles.vs}>vs</Text>
                <Text style={[styles.title, { flex: 1, textAlign: "right" }]} numberOfLines={1}>{item.team2}</Text>
                <Logo uri={item.team2_logo} size={28} rounded style={{ marginLeft: 8 }} />
              </View>

              <View style={[styles.row, { marginTop: 8, justifyContent: "center" }]}>
                {item.score1
                  ? <Text style={styles.score}>{item.score1} - {item.score2}</Text>
                  : <Text style={styles.meta}>{item.time_until_match ?? item.time_completed ?? item.round_info ?? item.match_series}</Text>}
              </View>

              <View style={[styles.row, { marginTop: 8, alignItems: "center" }]}>
                <Logo uri={item.tournament_icon || undefined} size={18} rounded={false} style={{ marginRight: 6 }} />
                <Text style={[styles.meta, { flex: 1 }]} numberOfLines={1}>{item.tournament_name ?? item.match_event}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={!loading && <EmptyState message={emptyMessage} />}
        />
      )}
    </SafeAreaView>
  );
}

function itemKey(m?: VlrMatch) {
  if (!m) return "m";
  return m.match_page || `${m.team1}-${m.team2}`;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0e0f12" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6, paddingBottom: 6, paddingHorizontal: 16 },
  backButton: { padding: 2 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },

  tabRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#1b1e24", marginRight: 8 },
  active: { backgroundColor: "#2d3340" },
  tabText: { color: "#e5e7eb", fontWeight: "600" },

  regionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#1b1e24", borderRadius: 8 },
  regionEmoji: { fontSize: 14, marginRight: 2 },
  regionText: { color: "#e5e7eb", fontWeight: "600" },

  regionMenu: { position: "absolute", top: 42, right: 0, backgroundColor: "#141820", borderRadius: 10, paddingVertical: 6, minWidth: 140, borderWidth: 1, borderColor: "#242b36", zIndex: 10 },
  regionItem: { paddingVertical: 8, paddingHorizontal: 12 },
  regionItemActive: { backgroundColor: "#1f2530" },
  regionItemText: { color: "#e5e7eb", fontWeight: "600" },

  listPad: { paddingBottom: 16, paddingHorizontal: 16 },
  card: { padding: 12, borderRadius: 10, backgroundColor: "#15171c", marginTop: 12 },
  matchCard: { borderWidth: 1, borderColor: "#242b36" },
  row: { flexDirection: "row" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  meta: { color: "#aab0bf", marginTop: 2 },
  score: { color: "#fff", fontSize: 18, fontWeight: "800" },
  vs: { color: "#9aa3b2", fontWeight: "800", marginHorizontal: 8 },
  err: { color: "#f87171", marginTop: 12, fontWeight: "600" },
  emptyBox: { marginTop: 24, padding: 16, borderRadius: 10, backgroundColor: "#141820", borderWidth: 1, borderColor: "#242b36", flexDirection: "row", alignItems: "center", gap: 8 },
  emptyText: { color: "#cbd5e1", fontWeight: "600" },
});
