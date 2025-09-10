import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageStyle,
  GestureResponderEvent,
} from 'react-native';

export type AppCardProps = {
  title: string;
  subtitle?: string | null;
  imageUri?: string | null;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  right?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function Card({
  title,
  subtitle,
  imageUri,
  onPress,
  style,
  imageStyle,
  right,
  contentStyle,
}: AppCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.card, style]}
    >
      {/* Left */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.icon, imageStyle]} resizeMode="contain" />
      ) : (
        <View style={[styles.icon, styles.iconPlaceholder, imageStyle]}>
          <Text style={styles.iconPlaceholderText}>No Image</Text>
        </View>
      )}

      {/* Middle */}
      <View style={[styles.textArea, contentStyle]}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right */}
      {right ? <View style={styles.right}>{right}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080707',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: '#ffffff',
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  icon: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#0f0f0f',
  },
  iconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    color: '#777',
    fontSize: 10,
  },
  textArea: { flex: 1 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', marginTop: 2 },
  right: { marginLeft: 8, alignSelf: 'center' },
});
