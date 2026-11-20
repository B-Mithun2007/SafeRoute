/**
 * IncidentReportScreen (Reports Tab)
 * Community hazard reporting interface with category selector, description,
 * location confirmation, anonymous submission option, and input validation.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import IncidentService from '../services/incidentService';
import { useLocation } from '../context/LocationContext';
import { IncidentCategory, IncidentSeverity } from '../types/incident';

interface CategoryOption {
  key: IncidentCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    key: 'poor_lighting',
    label: 'Poor Lighting',
    icon: 'flashlight-outline',
    description: 'Broken, dim, or missing street lamps',
  },
  {
    key: 'harassment',
    label: 'Harassment',
    icon: 'hand-left-outline',
    description: 'Catcalling, stalking, or inappropriate behavior',
  },
  {
    key: 'isolated_road',
    label: 'Isolated Road',
    icon: 'walk-outline',
    description: 'Deserted alleyways or dead-end passages',
  },
  {
    key: 'suspicious_activity',
    label: 'Suspicious Activity',
    icon: 'eye-outline',
    description: 'Loitering or hostile presence',
  },
  {
    key: 'unsafe_crowd',
    label: 'Unruly Crowd',
    icon: 'people-outline',
    description: 'Aggressive gatherings or blocked walkways',
  },
  {
    key: 'other',
    label: 'Other Concern',
    icon: 'alert-circle-outline',
    description: 'General environmental or urban hazard',
  },
];

export const IncidentReportScreen = ({ navigation }: any) => {
  const { currentLocation, currentAddress } = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('poor_lighting');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [photoAttached, setPhotoAttached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setErrorText('Please provide a brief description of the safety concern.');
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    try {
      await IncidentService.submitReport({
        category: selectedCategory,
        description: description.trim(),
        latitude: currentLocation?.latitude || 37.7749,
        longitude: currentLocation?.longitude || -122.4194,
        severity,
        anonymous: isAnonymous,
      });
      setIsSuccess(true);
    } catch {
      setErrorText('Failed to transmit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setPhotoAttached(false);
    setIsSuccess(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Report Safety Hazard"
        subtitle="Help keep your fellow travelers safe"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isSuccess ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={42} color={Colors.safetyGreen} />
            </View>
            <Text style={styles.successTitle}>Report Submitted Successfully</Text>
            <Text style={styles.successBody}>
              Thank you for contributing to community safety. Your report has been added to our live safety routing database.
            </Text>
            <CustomButton
              title="Submit Another Hazard"
              onPress={handleReset}
              variant="outline"
              style={{ width: '100%', marginBottom: 12 }}
            />
            <CustomButton
              title="Return to Home"
              onPress={() => navigation.navigate('HomeTab')}
              style={{ width: '100%' }}
            />
          </View>
        ) : (
          <>
            {/* Location Banner */}
            <View style={styles.locationBanner}>
              <Ionicons name="location-sharp" size={20} color={Colors.primary} />
              <View style={styles.locationTexts}>
                <Text style={styles.locationTitle}>Report Location</Text>
                <Text style={styles.locationSub} numberOfLines={1}>
                  {currentAddress || 'Locating GPS...'}
                </Text>
              </View>
            </View>

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Select Concern Category</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key)}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.selectedCategoryCard,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={isSelected ? Colors.primary : Colors.gray600}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.selectedCategoryLabel,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Severity Level */}
            <Text style={styles.fieldLabel}>Perceived Risk Severity</Text>
            <View style={styles.severityRow}>
              {(['low', 'medium', 'high'] as IncidentSeverity[]).map((level) => {
                const isSelected = severity === level;
                const label = level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'Urgent';
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSeverity(level)}
                    style={[
                      styles.severityButton,
                      isSelected &&
                        (level === 'high'
                          ? styles.severityHigh
                          : level === 'medium'
                          ? styles.severityMedium
                          : styles.severityLow),
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        isSelected && { color: Colors.white, fontWeight: '700' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description Input */}
            <Text style={styles.fieldLabel}>Hazard Description</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                placeholder="Describe what feels unsafe (e.g. non-functional lights for 100 meters, secluded construction area)..."
                placeholderTextColor={Colors.gray400}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  setErrorText(null);
                }}
                style={styles.textArea}
              />
            </View>

            {errorText && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.safetyRed} />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            )}

            {/* Optional Photo Attachment */}
            <TouchableOpacity
              style={styles.photoAttachBox}
              activeOpacity={0.7}
              onPress={() => {
                setPhotoAttached(!photoAttached);
                Alert.alert(
                  'Photo Evidence',
                  photoAttached ? 'Attachment removed.' : 'Mock photo attached safely from camera roll.'
                );
              }}
            >
              <Ionicons
                name={photoAttached ? 'checkmark-circle' : 'camera-outline'}
                size={22}
                color={photoAttached ? Colors.safetyGreen : Colors.primary}
              />
              <Text style={styles.photoAttachText}>
                {photoAttached ? 'Photo Attached (1 item)' : 'Attach Photo Evidence (Optional)'}
              </Text>
            </TouchableOpacity>

            {/* Anonymous Toggle */}
            <View style={styles.anonymousRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.anonTitle}>Submit Anonymously</Text>
                <Text style={styles.anonSub}>
                  Your name and identity will never be visible on public maps.
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
                thumbColor={isAnonymous ? Colors.primary : Colors.white}
              />
            </View>

            {/* Submit Button */}
            <CustomButton
              title="Submit Safety Hazard"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              iconName="send"
              size="large"
              style={styles.submitBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 18,
  },
  locationTexts: {
    marginLeft: 10,
    flex: 1,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  locationSub: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 10,
    marginTop: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  selectedCategoryCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray700,
    marginTop: 6,
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  severityButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
    alignItems: 'center',
  },
  severityLow: {
    backgroundColor: Colors.safetyGreen,
    borderColor: Colors.safetyGreen,
  },
  severityMedium: {
    backgroundColor: Colors.safetyYellow,
    borderColor: Colors.safetyYellow,
  },
  severityHigh: {
    backgroundColor: Colors.safetyRed,
    borderColor: Colors.safetyRed,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
  },
  textAreaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    fontSize: 14,
    color: Colors.gray900,
    height: 90,
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safetyRedBg,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.safetyRed,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  photoAttachBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  photoAttachText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  anonymousRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 20,
  },
  anonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  anonSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  submitBtn: {
    width: '100%',
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.safetyGreenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  successBody: {
    fontSize: 13,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
});

export default IncidentReportScreen;
