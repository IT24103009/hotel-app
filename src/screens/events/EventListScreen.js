// src/screens/events/EventListScreen.js  — Student 6: Events & Visitor Tracking
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const EVENT_COLORS = {
  wedding:    { bg: '#fdf2f8', text: '#c0392b', icon: '💍' },
  conference: { bg: '#ebf5fb', text: '#2980b9', icon: '🎤' },
  party:      { bg: '#fef9e7', text: '#d68910', icon: '🎉' },
  meeting:    { bg: '#eafaf1', text: '#1e8449', icon: '📋' },
  other:      { bg: '#f0f4f8', text: '#717d7e', icon: '📅' },
};
const STATUS_COLOR = {
  scheduled:  { bg: '#ebf5fb', text: '#2980b9' },
  completed:  { bg: '#eafaf1', text: '#27ae60' },
  cancelled:  { bg: '#fdedec', text: '#e74c3c' },
};

export default function EventListScreen({ navigation }) {
  const [events, setEvents]       = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filterType, setFilter]   = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = events;
    if (filterType !== 'all') list = list.filter(e => e.event_type === filterType);
    if (search) list = list.filter(e =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.client_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [events, search, filterType]);

  const deleteEvent = (id) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/events/${id}`); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const Card = ({ item }) => {
    const ec = EVENT_COLORS[item.event_type] || EVENT_COLORS.other;
    const sc = STATUS_COLOR[item.status] || STATUS_COLOR.scheduled;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.eventIcon}>{ec.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: ec.bg }]}>
              <Text style={[styles.typeText, { color: ec.text }]}>{item.event_type.toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.infoText}> {new Date(item.event_date).toDateString()}</Text>
          <Text style={styles.infoText}>  {item.start_time} – {item.end_time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={14} color="#888" />
          <Text style={styles.infoText}> {item.hall?.name || '—'}  (Capacity: {item.hall?.capacity || '—'})</Text>
        </View>
        {item.client_name && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color="#888" />
            <Text style={styles.infoText}> {item.client_name}</Text>
          </View>
        )}
        {item.guest_count && (
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={14} color="#888" />
            <Text style={styles.infoText}> {item.guest_count} guests</Text>
          </View>
        )}
        {item.total_price > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={14} color="#27ae60" />
            <Text style={[styles.infoText, { color: '#27ae60', fontWeight: '700' }]}> LKR {item.total_price?.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEvent', { event: item })}>
            <Ionicons name="pencil" size={13} color="#fff" /><Text style={styles.btnTxt}> Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteEvent(item._id)}>
            <Ionicons name="trash" size={13} color="#fff" /><Text style={styles.btnTxt}> Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search events..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>
      <View style={styles.filters}>
        {['all', 'wedding', 'conference', 'party', 'meeting', 'other'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterType === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filterType === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No events found.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEvent', {})}>
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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  eventIcon: { fontSize: 28 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: 'bold' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#888', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  btnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
