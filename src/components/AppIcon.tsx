import React from 'react';
import { StyleSheet, View } from 'react-native';

export type AppIconName = 'home' | 'ticket' | 'info' | 'sparkle' | 'arrowUpRight' | 'chevron';

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: number;
}

export function AppIcon({ name, color, size = 22 }: AppIconProps): React.ReactElement {
  if (name === 'home') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={[styles.roofLeft, { backgroundColor: color, width: size * 0.48, left: size * 0.03, top: size * 0.31 }]} />
        <View style={[styles.roofRight, { backgroundColor: color, width: size * 0.48, right: size * 0.03, top: size * 0.31 }]} />
        <View style={[styles.house, { borderColor: color, left: size * 0.2, top: size * 0.48, width: size * 0.6, height: size * 0.42 }]} />
        <View style={[styles.door, { borderColor: color, left: size * 0.42, top: size * 0.65, width: size * 0.17, height: size * 0.25 }]} />
      </View>
    );
  }

  if (name === 'ticket') {
    return (
      <View style={[styles.ticket, { width: size * 0.82, height: size * 0.68, borderColor: color, borderRadius: size * 0.12 }]}>
        <View style={[styles.ticketHole, { backgroundColor: color, left: size * 0.2, top: size * 0.14 }]} />
        <View style={[styles.ticketLine, { backgroundColor: color, left: size * 0.42, top: size * 0.18, width: size * 0.23 }]} />
        <View style={[styles.ticketLine, { backgroundColor: color, left: size * 0.42, top: size * 0.4, width: size * 0.23 }]} />
      </View>
    );
  }

  if (name === 'info') {
    return (
      <View style={[styles.infoCircle, { width: size * 0.82, height: size * 0.82, borderColor: color, borderRadius: size }]}>
        <View style={[styles.infoDot, { width: size * 0.1, height: size * 0.1, borderRadius: size, backgroundColor: color }]} />
        <View style={[styles.infoStem, { width: size * 0.1, height: size * 0.32, borderRadius: size, backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'sparkle') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={[styles.sparkleVertical, { backgroundColor: color, left: size * 0.44, top: size * 0.13, height: size * 0.74 }]} />
        <View style={[styles.sparkleHorizontal, { backgroundColor: color, left: size * 0.13, top: size * 0.44, width: size * 0.74 }]} />
        <View style={[styles.sparkleSmallVertical, { backgroundColor: color, right: size * 0.02, top: size * 0.08, height: size * 0.34 }]} />
        <View style={[styles.sparkleSmallHorizontal, { backgroundColor: color, right: 0, top: size * 0.23, width: size * 0.34 }]} />
      </View>
    );
  }

  if (name === 'arrowUpRight') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={[styles.arrowLine, { backgroundColor: color, width: size * 0.68, left: size * 0.12, top: size * 0.57, transform: [{ rotate: '-45deg' }] }]} />
        <View style={[styles.arrowHead, { borderColor: color, width: size * 0.34, height: size * 0.34, right: size * 0.08, top: size * 0.08 }]} />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.chevron, { borderColor: color, width: size * 0.36, height: size * 0.36 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  roofLeft: { position: 'absolute', height: 2, transform: [{ rotate: '-42deg' }] },
  roofRight: { position: 'absolute', height: 2, transform: [{ rotate: '42deg' }] },
  house: { position: 'absolute', borderWidth: 2, borderTopWidth: 0 },
  door: { position: 'absolute', borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2 },
  ticket: { borderWidth: 1.8, alignSelf: 'center' },
  ticketHole: { position: 'absolute', width: 3, height: 3, borderRadius: 2 },
  ticketLine: { position: 'absolute', height: 1.5, borderRadius: 1 },
  infoCircle: { borderWidth: 1.8, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  infoDot: { marginBottom: 2 },
  infoStem: {},
  sparkleVertical: { position: 'absolute', width: 2, borderRadius: 2 },
  sparkleHorizontal: { position: 'absolute', height: 2, borderRadius: 2 },
  sparkleSmallVertical: { position: 'absolute', width: 1.5, borderRadius: 2 },
  sparkleSmallHorizontal: { position: 'absolute', height: 1.5, borderRadius: 2 },
  arrowLine: { position: 'absolute', height: 2, borderRadius: 1 },
  arrowHead: { position: 'absolute', borderRightWidth: 2, borderTopWidth: 2 },
  chevron: { borderRightWidth: 2, borderTopWidth: 2, transform: [{ rotate: '45deg' }] },
});
