// src/screens/reservations/ReservationListScreen.js  — Student 2: Bookings
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const STATUS_COLOR = {
  reserved:    { bg: '#ebf5fb', text: '#3498db' },
  checked_in:  { bg: '#eafaf1', text: '#27ae60' },
  checked_out: { bg: '#f5eef8', text: '#9b59b6' },
  cancelled:   { bg: '#fdedec', text: '#e74c3c' },
};

export default function ReservationListScreen({ navigation }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilter]       = useState('all');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const isClient = user?.role === 'client';

  const load = useCallback(async () => {
    try {
      const endpoint = isClient ? `/reservations?client=${user.id}` : '/reservations';
      const { data } = await api.get(endpoint);
      setReservations(data.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [isClient, user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = reservations;
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus);
    if (search) list = list.filter(r =>
      r.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.room?.room_number?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [reservations, search, filterStatus]);

  const cancelReservation = (id) => {
    Alert.alert('Cancel Reservation', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await api.put(`/reservations/${id}/cancel`);
          load();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const Card = ({ item }) => {
    const s = STATUS_COLOR[item.status] || STATUS_COLOR.reserved;
    const nights = item.check_in_date && item.check_out_date
      ? Math.ceil((new Date(item.check_out_date) - new Date(item.check_in_date)) / 86400000) : 0;

    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ReservationDetail', { reservation: item })}>
        <View style={styles.cardTop}>
          <Text style={styles.guestName}>{item.guest_name}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="bed-outline" size={15} color="#888" />
          <Text style={styles.info}> Room {item.room?.room_number || '—'} ({item.room?.room_type?.type_name || ''})</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={15} color="#888" />
          <Text style={styles.info}> {new Date(item.check_in_date).toLocaleDateString()} → {new Date(item.check_out_date).toLocaleDateString()} ({nights} nights)</Text>
        </View>
        {item.guest_phone && (
          <View style={styles.row}>
            <Ionicons name="call-outline" size={15} color="#888" />
            <Text style={styles.info}> {item.guest_phone}</Text>
          </View>
        )}
        {(item.status === 'reserved' || item.status === 'checked_in') && (
          <View style={styles.actionRow}>
            {!isClient && item.status === 'reserved' && (
              <TouchableOpacity style={styles.checkInBtn} onPress={async () => {
                try { await api.put(`/reservations/${item._id}/checkin`); load(); }
                catch (e) { Alert.alert('Error', e.message); }
              }}>
                <Text style={styles.btnText}>Check In</Text>
              </TouchableOpacity>
            )}
            {!isClient && item.status === 'checked_in' && (
              <TouchableOpacity style={styles.checkOutBtn} onPress={async () => {
                try { await api.put(`/reservations/${item._id}/checkout`); load(); }
                catch (e) { Alert.alert('Error', e.message); }
              }}>
                <Text style={styles.btnText}>Check Out</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelReservation(item._id)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search guest or room..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>

      <View style={styles.filters}>
        {['all', 'reserved', 'checked_in', 'checked_out', 'cancelled'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterStatus === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filterStatus === f && styles.chipTextActive]}>{f.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No reservations found.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateReservation')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, height: 44, marginLeft: 8, color: '#333' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  guestName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  info: { color: '#888', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  checkInBtn: { backgroundColor: '#27ae60', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  checkOutBtn: { backgroundColor: '#9b59b6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  cancelBtn: { backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
