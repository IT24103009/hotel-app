// src/screens/rooms/RoomDetailScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const STATUS_COLORS = {
  available:   { bg: '#eafaf1', text: '#27ae60' },
  occupied:    { bg: '#fdedec', text: '#e74c3c' },
  maintenance: { bg: '#fef9e7', text: '#f39c12' },
};

export default function RoomDetailScreen({ route }) {
  const { room } = route.params;
  const s = STATUS_COLORS[room.status] || STATUS_COLORS.available;

  const Row = ({ icon, label, value }) => (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={COLORS.primary} style={{ width: 26 }} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomNum}>Room #{room.room_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.text }]}>{room.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.typeName}>{room.room_type?.type_name}</Text>
        <Text style={styles.price}>LKR {(room.price_per_night || 0).toLocaleString()} / night</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Room Information</Text>
        <Row icon="layers-outline"   label="Floor"         value={String(room.floor || '—')} />
        <Row icon="people-outline"   label="Max Occupancy" value={String(room.room_type?.max_occupancy || '—')} />
        <Row icon="cash-outline"     label="Base Price"    value={`LKR ${room.room_type?.base_price || '—'}`} />
        <Row icon="information-circle-outline" label="Description" value={room.room_type?.description} />
      </View>

      {room.amenities?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a, i) => (
              <View key={i} style={styles.amenityTag}>
                <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                <Text style={styles.amenityText}> {a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center' },
  roomNum: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  typeName: { color: '#aac4e0', fontSize: 16, marginTop: 4 },
  price: { color: COLORS.accent, fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 8 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 14, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f5f5f5' },
  label: { color: '#888', fontSize: 13, flex: 1 },
  value: { color: '#2c3e50', fontSize: 14, fontWeight: '600', flex: 2, textAlign: 'right' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eafaf1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  amenityText: { color: '#27ae60', fontSize: 13, fontWeight: '600' },
});
