/**
 * AtmosphericBackground Component
 * Provides subtle radial highlights and gradient depth on Web and Native.
 */
import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import Theme from '../constants/theme';

interface AtmosphericBackgroundProps {
  children: React.ReactNode;
  variant?: 'obsidian' | 'canvas' | 'translucent';
  style?: ViewStyle;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  children,
  variant = 'canvas',
  style,
}) => {
  const isWeb = Platform.OS === 'web';

  const getContainerStyle = () => {
    switch (variant) {
      case 'obsidian':
        return [styles.obsidianBase, style];
      case 'translucent':
        return [styles.translucentBase, style];
      case 'canvas':
      default:
        return [styles.canvasBase, style];
    }
  };

  return (
    <View style={[styles.root, getContainerStyle()]}>
      {/* Decorative ambient glowing orbs for visual depth */}
      {isWeb && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: variant === 'obsidian' 
                ? 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(9, 13, 22, 0) 70%)'
                : 'radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, rgba(241, 245, 249, 0) 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: variant === 'obsidian'
                ? 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, rgba(9, 13, 22, 0) 70%)'
                : 'radial-gradient(circle, rgba(2, 132, 199, 0.06) 0%, rgba(241, 245, 249, 0) 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  canvasBase: {
    backgroundColor: Theme.colors.canvas,
  },
  obsidianBase: {
    backgroundColor: Theme.colors.obsidian,
  },
  translucentBase: {
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
  },
});

export default AtmosphericBackground;
