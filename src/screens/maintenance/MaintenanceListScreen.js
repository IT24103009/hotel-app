// src/screens/maintenance/MaintenanceListScreen.js  — Student 5: Maintenance System
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const STATUS_COLOR = {
  ongoing:   { bg: '#fef9e7', text: '#f39c12', icon: 'construct' },
  completed: { bg: '#eafaf1', text: '#27ae60', icon: 'checkmark-circle' },
};

export default function MaintenanceListScreen({ navigation }) {
  const [records, setRecords]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms/maintenance');
      setRecords(data.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = records;
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus);
    if (search) list = list.filter(r =>
      r.room?.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [records, search, filterStatus]);

  const markComplete = (id) => {
    Alert.alert('Complete Maintenance', 'Mark this maintenance as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: async () => {
        try { await api.put(`/rooms/maintenance/${id}/complete`); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const Card = ({ item }) => {
    const s = STATUS_COLOR[item.status] || STATUS_COLOR.ongoing;
    const daysSince = item.start_date
      ? Math.ceil((Date.now() - new Date(item.start_date)) / 86400000) : 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.roomBadge}>
            <Text style={styles.roomNum}>Room #{item.room?.room_number || '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={12} color={s.text} />
            <Text style={[styles.statusText, { color: s.text }]}> {item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.reason}>{item.reason}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.infoText}> Started: {new Date(item.start_date).toDateString()}</Text>
        </View>
        {item.end_date && (
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={14} color="#888" />
            <Text style={styles.infoText}> Completed: {new Date(item.end_date).toDateString()}</Text>
          </View>
        )}
        {item.assigned_staff && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color="#888" />
            <Text style={styles.infoText}> Assigned to: {item.assigned_staff.full_name}</Text>
          </View>
        )}
        {item.status === 'ongoing' && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={daysSince > 3 ? '#e74c3c' : '#f39c12'} />
            <Text style={[styles.infoText, { color: daysSince > 3 ? '#e74c3c' : '#f39c12' }]}>
              {' '}{daysSince} day{daysSince !== 1 ? 's' : ''} ongoing
            </Text>
          </View>
        )}

        {item.status === 'ongoing' && (
          <TouchableOpacity style={styles.completeBtn} onPress={() => markComplete(item._id)}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={styles.completeBtnText}> Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const ongoingCount   = records.filter(r => r.status === 'ongoing').length;
  const completedCount = records.filter(r => r.status === 'completed').length;

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: '#f39c12' }]}>{ongoingCount}</Text>
          <Text style={styles.statLabel}>Ongoing</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: '#27ae60' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: '#fff' }]}>{records.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search room or reason..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>
      <View style={styles.filters}>
        {['all', 'ongoing', 'completed'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterStatus === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filterStatus === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No maintenance records.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddMaintenance')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsBar: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#aac4e0', fontSize: 11 },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, height: 44, marginLeft: 8, color: '#333' },
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roomBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roomNum: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  reason: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#888', fontSize: 12 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27ae60', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10, alignSelf: 'flex-start' },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
