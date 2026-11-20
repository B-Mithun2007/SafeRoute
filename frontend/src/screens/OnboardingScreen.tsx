/**
 * OnboardingScreen
 * 3-slide interactive onboarding experience showcasing safe routing, community alerts, and SOS.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'navigate-circle-outline',
    title: 'Discover Personalized Safer Routes',
    subtitle:
      'Unlike standard maps that only prioritize speed, SafeRoute-AI evaluates street lighting, pedestrian activity, and safety metrics to guide you securely.',
    badge: 'AI-Powered Safety Scoring',
  },
  {
    id: '2',
    icon: 'shield-half-outline',
    title: 'Stay Informed with Community Alerts',
    subtitle:
      'Real-time crowdsourced reports highlight broken streetlights, deserted stretches, and recent incidents before you enter unknown corridors.',
    badge: 'Live Hazard Heatmaps',
  },
  {
    id: '3',
    icon: 'call-outline',
    title: 'Instant SOS & Trusted Contact Support',
    subtitle:
      'One-tap emergency response with dual-confirmation safeguards, live location sharing, and direct hotline dialing whenever you feel uncomfortable.',
    badge: '24/7 Emergency Assistance',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    navigation.replace('Auth');
  };

  const slide = SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header with Skip */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.brandName}>SafeRoute-AI</Text>
          </View>
          {!isLastSlide ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Slide Visual Content */}
        <View style={styles.slideContainer}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{slide.badge}</Text>
          </View>

          <View style={styles.iconCircle}>
            <Ionicons name={slide.icon} size={72} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* Bottom Pagination & Action Buttons */}
        <View style={styles.footer}>
          {/* Indicator dots */}
          <View style={styles.paginationDots}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlideIndex ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <CustomButton
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
            iconName={isLastSlide ? 'checkmark-circle' : 'arrow-forward'}
            iconPosition="right"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginLeft: 6,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray500,
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  badgePill: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 28,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 2,
    borderColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    paddingBottom: 24,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray200,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  actionButton: {
    width: '100%',
  },
});

export default OnboardingScreen;
