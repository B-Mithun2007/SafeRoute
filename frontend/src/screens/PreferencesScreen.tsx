/**
 * PreferencesScreen
 * Personalized routing preferences (well-lit roads, public activity, incident avoidance,
 * safety vs travel time tradeoff).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { usePreferences } from '../context/PreferencesContext';

export const PreferencesScreen = ({ navigation }: any) => {
  const { preferences, updatePreferences, resetToDefaults } = usePreferences();
  const [isSaving, setIsSaving] = useState(false);

  const [preferWellLit, setPreferWellLit] = useState(preferences.preferWellLit);
  const [avoidIsolated, setAvoidIsolated] = useState(preferences.avoidIsolated);
  const [preferPublicActivity, setPreferPublicActivity] = useState(preferences.preferPublicActivity);
  const [avoidRecentIncidents, setAvoidRecentIncidents] = useState(preferences.avoidRecentIncidents);
  const [safetyPriority, setSafetyPriority] = useState(preferences.safetyPriority);
  const [autoNotifyContacts, setAutoNotifyContacts] = useState(preferences.autoNotifyContacts);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        preferWellLit,
        avoidIsolated,
        preferPublicActivity,
        avoidRecentIncidents,
        safetyPriority,
        autoNotifyContacts,
      });
      Alert.alert('Preferences Saved', 'Your safe routing filters have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Unable to save preferences locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const priorityOptions = [
    {
      key: 'safety_first',
      title: 'Safety First (Highest Priority)',
      desc: 'Routes stay strictly on well-lit boulevards with public surveillance, even if it adds 10-15 minutes.',
      icon: 'shield-checkmark',
    },
    {
      key: 'balanced',
      title: 'Balanced Approach',
      desc: 'Smart balance between travel duration and safety factors. Avoids known hazardous corridors.',
      icon: 'scale-outline',
    },
    {
      key: 'fastest',
      title: 'Shortest Route Priority',
      desc: 'Prioritizes shortest travel time while providing safety warnings along the path.',
      icon: 'flash-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Travel Safety Preferences"
        subtitle="Customize how AI algorithms evaluate routes"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Core Environmental Switches */}
        <Text style={styles.sectionHeader}>Navigation Safeguards</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <View style={styles.rowTitle}>
                <Ionicons name="sunny" size={18} color={Colors.safetyYellow} />
                <Text style={styles.switchTitle}>Prefer Well-Lit Roads</Text>
              </View>
              <Text style={styles.switchSub}>
                Reroute away from paths with dim or broken street lighting after dusk.
              </Text>
            </View>
            <Switch
              value={preferWellLit}
              onValueChange={setPreferWellLit}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={preferWellLit ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <View style={styles.rowTitle}>
                <Ionicons name="walk" size={18} color={Colors.primary} />
                <Text style={styles.switchTitle}>Avoid Isolated Streets</Text>
              </View>
              <Text style={styles.switchSub}>
                Prevent directions through narrow alleyways, empty industrial yards, or dead ends.
              </Text>
            </View>
            <Switch
              value={avoidIsolated}
              onValueChange={setAvoidIsolated}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={avoidIsolated ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <View style={styles.rowTitle}>
                <Ionicons name="people" size={18} color={Colors.primary} />
                <Text style={styles.switchTitle}>Prefer Public Activity</Text>
              </View>
              <Text style={styles.switchSub}>
                Prioritize roads alongside open retail shops, transit hubs, and pedestrian foot traffic.
              </Text>
            </View>
            <Switch
              value={preferPublicActivity}
              onValueChange={setPreferPublicActivity}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={preferPublicActivity ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <View style={styles.rowTitle}>
                <Ionicons name="warning" size={18} color={Colors.safetyRed} />
                <Text style={styles.switchTitle}>Avoid Recent Incident Zones</Text>
              </View>
              <Text style={styles.switchSub}>
                Exclude corridors with community hazard reports submitted in the last 48 hours.
              </Text>
            </View>
            <Switch
              value={avoidRecentIncidents}
              onValueChange={setAvoidRecentIncidents}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={avoidRecentIncidents ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        {/* Safety vs Duration Tradeoff Strategy */}
        <Text style={styles.sectionHeader}>Optimization Strategy</Text>
        <View style={styles.card}>
          {priorityOptions.map((opt, idx) => {
            const isSelected = safetyPriority === opt.key;
            return (
              <React.Fragment key={opt.key}>
                {idx > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[styles.priorityOption, isSelected && styles.selectedPriority]}
                  onPress={() => setSafetyPriority(opt.key as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.priorityIconCircle, isSelected && styles.selectedPriorityIcon]}>
                    <Ionicons
                      name={opt.icon as any}
                      size={18}
                      color={isSelected ? Colors.white : Colors.primary}
                    />
                  </View>
                  <View style={styles.priorityTexts}>
                    <Text style={[styles.priorityTitle, isSelected && { color: Colors.primary }]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.priorityDesc}>{opt.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Emergency Sharing Preference */}
        <Text style={styles.sectionHeader}>Emergency Sharing</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <Text style={styles.switchTitle}>Auto-Notify Trusted Contacts</Text>
              <Text style={styles.switchSub}>
                Automatically prompt to share live trip location with primary contact when traveling after 10 PM.
              </Text>
            </View>
            <Switch
              value={autoNotifyContacts}
              onValueChange={setAutoNotifyContacts}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={autoNotifyContacts ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        {/* Buttons */}
        <CustomButton
          title="Save Travel Preferences"
          onPress={handleSave}
          isLoading={isSaving}
          size="large"
          style={styles.saveBtn}
        />

        <TouchableOpacity onPress={resetToDefaults} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset All Filters to Recommended Defaults</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray900,
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTexts: {
    flex: 1,
    marginRight: 14,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
    marginLeft: 6,
  },
  switchSub: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 4,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectedPriority: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  priorityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedPriorityIcon: {
    backgroundColor: Colors.primary,
  },
  priorityTexts: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  priorityDesc: {
    fontSize: 11,
    color: Colors.gray600,
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedRadioCircle: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  saveBtn: {
    width: '100%',
    marginTop: 10,
  },
  resetBtn: {
    alignSelf: 'center',
    marginTop: 14,
    padding: 8,
  },
  resetText: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '600',
  },
});

export default PreferencesScreen;
