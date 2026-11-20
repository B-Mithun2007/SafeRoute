/**
 * SOSScreen
 * Dedicated emergency assistance screen featuring prominent SOS trigger with accidental-activation safeguards,
 * verified contact alert dispatcher, live location sharing toggle, and instant helpline dialing.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import EmergencyService from '../services/emergencyService';
import { useLocation } from '../context/LocationContext';
import { EmergencyContact } from '../types/user';

export const SOSScreen = ({ navigation }: any) => {
  const { currentLocation, currentAddress, hasPermission } = useLocation();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLocationSharingActive, setIsLocationSharingActive] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [alertSuccessPayload, setAlertSuccessPayload] = useState<{
    timestamp: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const list = await EmergencyService.getContacts();
    setContacts(list);
  };

  const handleTriggerSOS = async () => {
    setIsDispatching(true);
    try {
      const res = await EmergencyService.triggerSOS(currentLocation);
      setAlertSuccessPayload({
        timestamp: res.timestamp,
        message: res.smsMessage,
      });
      setIsLocationSharingActive(true);
      setShowConfirmModal(false);
    } catch {
      Alert.alert('Dispatch Error', 'Unable to transmit emergency alert. Please dial helpline directly.');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCallHelpline = () => {
    // 911 or localized women's emergency helpline (1091 in India, 911 in US)
    EmergencyService.dialNumber('911');
  };

  const handleCallContact = (phone: string) => {
    EmergencyService.dialNumber(phone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Emergency SOS Assistance"
        subtitle="Immediate safety response & contact alerts"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Prominent SOS Activation Center */}
        <View style={styles.sosCenterCard}>
          <Text style={styles.sosWarning}>PRESS FOR EMERGENCY ASSISTANCE</Text>
          <Text style={styles.sosSubWarning}>
            Dual-confirmation safeguard prevents accidental activation
          </Text>

          <TouchableOpacity
            style={styles.sosMainButton}
            activeOpacity={0.85}
            onPress={() => setShowConfirmModal(true)}
          >
            <View style={styles.sosInnerCircle}>
              <Ionicons name="alert" size={46} color={Colors.white} />
              <Text style={styles.sosButtonText}>SOS</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.sosTapNotice}>Tap button to prepare emergency broadcast</Text>
        </View>

        {/* Live Status Banner after alert */}
        {alertSuccessPayload && (
          <View style={styles.dispatchedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.safetyGreen} />
            <View style={styles.dispatchedTexts}>
              <Text style={styles.dispatchedTitle}>Emergency Alert Broadcasted</Text>
              <Text style={styles.dispatchedSub}>
                Logged at {alertSuccessPayload.timestamp}. Prepared SMS payload for {contacts.length} trusted contacts.
              </Text>
            </View>
          </View>
        )}

        {/* Current Location & Sharing Status */}
        <View style={styles.card}>
          <View style={styles.locationHeaderRow}>
            <View style={styles.locationTitleRow}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Live Location Status</Text>
            </View>
            <View
              style={[
                styles.liveStatusBadge,
                isLocationSharingActive ? styles.liveStatusActive : styles.liveStatusInactive,
              ]}
            >
              <Text
                style={[
                  styles.liveStatusText,
                  isLocationSharingActive ? { color: Colors.safetyGreen } : { color: Colors.gray500 },
                ]}
              >
                {isLocationSharingActive ? 'SHARING ACTIVE' : 'SHARING IDLE'}
              </Text>
            </View>
          </View>

          <Text style={styles.addressDisplay} numberOfLines={2}>
            {currentAddress}
          </Text>

          {hasPermission === false && (
            <Text style={styles.permWarning}>
              GPS permission is not enabled. Sharing accuracy will be limited until permission is granted.
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.toggleTitle}>Share Live Coordinates</Text>
              <Text style={styles.toggleSub}>
                Transmit live GPS coordinates to primary emergency contact
              </Text>
            </View>
            <Switch
              value={isLocationSharingActive}
              onValueChange={setIsLocationSharingActive}
              trackColor={{ false: Colors.gray300, true: Colors.safetyGreenBorder }}
              thumbColor={isLocationSharingActive ? Colors.safetyGreen : Colors.white}
            />
          </View>
        </View>

        {/* Direct Helpline Buttons */}
        <View style={styles.helplineRow}>
          <TouchableOpacity
            style={[styles.helplineBtn, { backgroundColor: Colors.sosRed }]}
            activeOpacity={0.8}
            onPress={handleCallHelpline}
          >
            <Ionicons name="call" size={20} color={Colors.white} />
            <View style={styles.helplineTexts}>
              <Text style={styles.helplineTitle}>Dial 911 / Police</Text>
              <Text style={styles.helplineSub}>Immediate emergency call</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.helplineBtn, { backgroundColor: Colors.primaryDark }]}
            activeOpacity={0.8}
            onPress={() => EmergencyService.dialNumber('1091')}
          >
            <Ionicons name="shield-half" size={20} color={Colors.white} />
            <View style={styles.helplineTexts}>
              <Text style={styles.helplineTitle}>Women's Helpline</Text>
              <Text style={styles.helplineSub}>National safety support</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts List */}
        <View style={styles.card}>
          <View style={styles.contactsHeaderRow}>
            <Text style={styles.cardTitle}>Trusted Emergency Contacts</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Add Contact',
                  'To add additional contacts, visit your Profile & Settings screen.'
                )
              }
            >
              <Text style={styles.manageLink}>Manage</Text>
            </TouchableOpacity>
          </View>

          {contacts.map((contact, idx) => (
            <View key={contact.id}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarLetter}>{contact.name.charAt(0)}</Text>
                </View>

                <View style={styles.contactTexts}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callIconBtn}
                  onPress={() => handleCallContact(contact.phone)}
                >
                  <Ionicons name="call" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Safeguard Modal to prevent accidental triggers */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalAlertIcon}>
              <Ionicons name="warning" size={36} color={Colors.sosRed} />
            </View>
            <Text style={styles.modalTitle}>Confirm Emergency Broadcast</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to trigger the SOS alert? This will log an emergency broadcast and transmit your current coordinates to your trusted contacts:
            </Text>

            <View style={styles.modalContactsBox}>
              {contacts.map((c) => (
                <Text key={c.id} style={styles.modalContactItem}>
                  • {c.name} ({c.phone})
                </Text>
              ))}
            </View>

            <View style={styles.modalButtonsRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowConfirmModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title="Send SOS Now"
                variant="danger"
                onPress={handleTriggerSOS}
                isLoading={isDispatching}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  sosCenterCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
    shadowColor: Colors.sosRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sosWarning: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.sosRed,
    letterSpacing: 0.8,
  },
  sosSubWarning: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  sosMainButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sosInnerCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.sosRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.sosRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  sosTapNotice: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '500',
  },
  dispatchedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safetyGreenBg,
    borderColor: Colors.safetyGreenBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  dispatchedTexts: {
    marginLeft: 10,
    flex: 1,
  },
  dispatchedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.safetyGreen,
  },
  dispatchedSub: {
    fontSize: 11,
    color: Colors.gray700,
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray900,
    marginLeft: 6,
  },
  liveStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveStatusActive: {
    backgroundColor: Colors.safetyGreenBg,
  },
  liveStatusInactive: {
    backgroundColor: Colors.gray100,
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressDisplay: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray800,
    marginVertical: 4,
  },
  permWarning: {
    fontSize: 11,
    color: Colors.safetyRed,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray900,
  },
  toggleSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  helplineRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  helplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  helplineTexts: {
    marginLeft: 8,
    flex: 1,
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
  },
  helplineSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manageLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  contactTexts: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray900,
  },
  primaryBadge: {
    backgroundColor: Colors.safetyGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.safetyGreen,
  },
  contactPhone: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalAlertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.safetyRedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalContactsBox: {
    backgroundColor: Colors.gray50,
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalContactItem: {
    fontSize: 12,
    color: Colors.gray700,
    fontWeight: '600',
    marginVertical: 2,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});

export default SOSScreen;
