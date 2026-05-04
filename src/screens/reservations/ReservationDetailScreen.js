// src/screens/reservations/ReservationDetailScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const STATUS_COLOR = {
  reserved:    { bg: '#ebf5fb', text: '#3498db' },
  checked_in:  { bg: '#eafaf1', text: '#27ae60' },
  checked_out: { bg: '#f5eef8', text: '#9b59b6' },
  cancelled:   { bg: '#fdedec', text: '#e74c3c' },
};

export default function ReservationDetailScreen({ route, navigation }) {
  const { reservation: r } = route.params;
  const s = STATUS_COLOR[r.status] || STATUS_COLOR.reserved;
  const nights = r.check_in_date && r.check_out_date
    ? Math.ceil((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000) : 0;

  const Row = ({ icon, label, value }) => (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={COLORS.primary} style={{ width: 22 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{r.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <Text style={styles.guestName}>{r.guest_name}</Text>
        <Text style={styles.roomInfo}>Room {r.room?.room_number} · {r.room?.room_type?.type_name}</Text>
        <Text style={styles.nights}>{nights} Night{nights !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Guest Information</Text>
        <Row icon="person-outline"   label="Name"  value={r.guest_name} />
        <Row icon="mail-outline"     label="Email" value={r.guest_email} />
        <Row icon="call-outline"     label="Phone" value={r.guest_phone} />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Stay Details</Text>
        <Row icon="log-in-outline"   label="Check-in"  value={new Date(r.check_in_date).toDateString()} />
        <Row icon="log-out-outline"  label="Check-out" value={new Date(r.check_out_date).toDateString()} />
        <Row icon="moon-outline"     label="Nights"    value={String(nights)} />
        <Row icon="bed-outline"      label="Room"      value={`#${r.room?.room_number}`} />
        <Row icon="home-outline"     label="Type"      value={r.room?.room_type?.type_name} />
        <Row icon="cash-outline"     label="Rate"      value={`LKR ${r.room?.price_per_night?.toLocaleString()} / night`} />
      </View>

      {r.special_requests ? (
        <View style={styles.card}>
          <Text style={styles.section}>Special Requests</Text>
          <Text style={styles.notes}>{r.special_requests}</Text>
        </View>
      ) : null}

      {r.cancellation_reason ? (
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#e74c3c' }]}>
          <Text style={[styles.section, { color: '#e74c3c' }]}>Cancellation Reason</Text>
          <Text style={styles.notes}>{r.cancellation_reason}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.section}>Booking Info</Text>
        <Row icon="calendar-outline"  label="Booked On"   value={new Date(r.createdAt).toDateString()} />
        <Row icon="person-circle-outline" label="Created By" value={r.created_by?.full_name || 'Guest'} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center' },
  badge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 10 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  guestName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  roomInfo: { color: '#aac4e0', fontSize: 15, marginTop: 4 },
  nights: { color: COLORS.accent, fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, elevation: 2 },
  section: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderColor: '#f8f8f8' },
  rowLabel: { color: '#888', fontSize: 13, flex: 1, marginLeft: 6 },
  rowValue: { color: '#2c3e50', fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },
  notes: { color: '#555', fontSize: 14, lineHeight: 21 },
});
