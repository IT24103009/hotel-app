// src/screens/staff/StaffListScreen.js  — Student 3: Staff Management
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const ROLE_COLORS = {
  admin:         { bg: '#fdedec', text: '#e74c3c' },
  receptionist:  { bg: '#ebf5fb', text: '#3498db' },
  staff:         { bg: '#eafaf1', text: '#27ae60' },
};

export default function StaffListScreen({ navigation }) {
  const [staff, setStaff]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [filterRole, setFilter] = useState('all');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setStaff(data.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = staff;
    if (filterRole !== 'all') list = list.filter(s => s.role === filterRole);
    if (search) list = list.filter(s =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [staff, search, filterRole]);

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/users/${id}`, { is_active: !current });
      load();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const deleteStaff = (id) => {
    Alert.alert('Delete Staff', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/users/${id}`); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const Card = ({ item }) => {
    const r = ROLE_COLORS[item.role] || ROLE_COLORS.staff;
    const initials = item.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: r.bg }]}>
            <Text style={[styles.badgeText, { color: r.text }]}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={14} color="#888" />
          <Text style={styles.infoText}> {item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name={item.is_active ? 'checkmark-circle' : 'close-circle'} size={14} color={item.is_active ? '#27ae60' : '#e74c3c'} />
          <Text style={[styles.infoText, { color: item.is_active ? '#27ae60' : '#e74c3c' }]}>
            {' '}{item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddStaff', { staff: item })}>
            <Ionicons name="pencil" size={13} color="#fff" /><Text style={styles.btnTxt}> Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: item.is_active ? '#f39c12' : '#27ae60' }]} onPress={() => toggleActive(item._id, item.is_active)}>
            <Ionicons name={item.is_active ? 'pause' : 'play'} size={13} color="#fff" />
            <Text style={styles.btnTxt}> {item.is_active ? 'Deactivate' : 'Activate'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteStaff(item._id)}>
            <Ionicons name="trash" size={13} color="#fff" />
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
        <TextInput style={styles.searchInput} placeholder="Search staff..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>
      <View style={styles.filters}>
        {['all', 'admin', 'receptionist', 'staff'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterRole === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filterRole === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No staff found.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddStaff', {})}>
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
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  username: { color: '#888', fontSize: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#888', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
