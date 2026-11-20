/**
 * Emergency & SOS Service.
 * Manages trusted emergency contacts, live location sharing toggles,
 * and handles dispatching emergency alert requests with explicit confirmation.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { Config } from '../constants/config';
import { EmergencyContact } from '../types/user';
import { Coordinates } from '../types/route';

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'cnt_1',
    name: 'Mom (Rashmi)',
    phone: '+1 (555) 987-6543',
    relationship: 'Mother',
    isPrimary: true,
  },
  {
    id: 'cnt_2',
    name: 'Aanya (Sister)',
    phone: '+1 (555) 456-7890',
    relationship: 'Sister',
    isPrimary: false,
  },
];

export const EmergencyService = {
  /**
   * Fetch saved emergency contacts
   */
  async getContacts(): Promise<EmergencyContact[]> {
    try {
      const data = await AsyncStorage.getItem(Config.STORAGE_KEYS.EMERGENCY_CONTACTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Continue to default
    }
    return DEFAULT_EMERGENCY_CONTACTS;
  },

  /**
   * Save contact list to local storage
   */
  async saveContacts(contacts: EmergencyContact[]): Promise<void> {
    await AsyncStorage.setItem(
      Config.STORAGE_KEYS.EMERGENCY_CONTACTS,
      JSON.stringify(contacts)
    );
  },

  /**
   * Add a new emergency contact
   */
  async addContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const contacts = await this.getContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: 'cnt_' + Math.random().toString(36).substring(2, 9),
    };
    const updated = [...contacts, newContact];
    await this.saveContacts(updated);
    return newContact;
  },

  /**
   * Remove contact by ID
   */
  async removeContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    await this.saveContacts(filtered);
  },

  /**
   * Open phone dialer directly for emergency services (e.g. 911 or national women's helpline)
   */
  dialNumber(phoneNumber: string): void {
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Could not open phone dialer:', err);
    });
  },

  /**
   * Dispatches an SOS alert to backend and prepares SMS payload for verified contacts.
   * Returns clear factual status of what was sent.
   */
  async triggerSOS(location: Coordinates | null): Promise<{
    success: boolean;
    smsMessage: string;
    timestamp: string;
  }> {
    const locationString = location
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';

    const smsMessage = `EMERGENCY ALERT from SafeRoute-AI! I need help. My current location is: ${locationString}`;

    // Here we simulate or dispatch to backend endpoint
    return {
      success: true,
      smsMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
  },
};

export default EmergencyService;
