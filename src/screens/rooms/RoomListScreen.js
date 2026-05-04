// src/screens/rooms/RoomListScreen.js  — Student 1: Room Management
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8', card: '#fff' };

const STATUS_COLORS = {
  available:   { bg: '#eafaf1', text: '#27ae60' },
  occupied:    { bg: '#fdedec', text: '#e74c3c' },
  maintenance: { bg: '#fef9e7', text: '#f39c12' },
};

export default function RoomListScreen({ navigation }) {
  const { user } = useAuth();
  const [rooms, setRooms]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'receptionist';

  const loadRooms = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  useEffect(() => {
    let list = rooms;
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus);
    if (search) list = list.filter(r => r.room_number.toLowerCase().includes(search.toLowerCase()) || r.room_type?.type_name?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [rooms, search, filterStatus]);

  const deleteRoom = (id) => {
    Alert.alert('Delete Room', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/rooms/${id}`);
            loadRooms();
          } catch (e) { Alert.alert('Error', e.message); }
        }
      }
    ]);
  };

  const RoomCard = ({ item }) => {
    const s = STATUS_COLORS[item.status] || STATUS_COLORS.available;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RoomDetail', { room: item })}>
        <View style={styles.cardHeader}>
          <View style={styles.roomNumBadge}>
            <Text style={styles.roomNum}>#{item.room_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.roomType}>{item.room_type?.type_name || 'N/A'}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="people-outline" size={15} color="#888" />
          <Text style={styles.cardInfo}> Max: {item.room_type?.max_occupancy || '—'}  |  Floor: {item.floor || '—'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="cash-outline" size={15} color="#27ae60" />
          <Text style={styles.price}>  LKR {(item.price_per_night || 0).toLocaleString()} / night</Text>
        </View>
        {item.amenities?.length > 0 && (
          <Text style={styles.amenities} numberOfLines={1}>✦ {item.amenities.join('  •  ')}</Text>
        )}
        {isAdmin && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddRoom', { room: item })}>
              <Ionicons name="pencil" size={14} color="#fff" /><Text style={styles.editText}> Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteRoom(item._id)}>
              <Ionicons name="trash" size={14} color="#fff" /><Text style={styles.deleteText}> Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search room or type..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {['all', 'available', 'occupied', 'maintenance'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterStatus === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filterStatus === f && styles.chipTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <RoomCard item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRooms(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No rooms found.</Text>}
      />

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRoom', {})}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, height: 44, marginLeft: 8, color: '#333' },
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomNumBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  roomNum: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  roomType: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardInfo: { color: '#888', fontSize: 13 },
  price: { color: '#27ae60', fontSize: 14, fontWeight: '700' },
  amenities: { color: '#aaa', fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  editText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
