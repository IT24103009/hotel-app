// src/screens/billing/BillingListScreen.js — FULLY FIXED
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

const PAY_COLOR = {
  pending:  { bg: '#fef9e7', text: '#f39c12', icon: 'time-outline' },
  paid:     { bg: '#eafaf1', text: '#27ae60', icon: 'checkmark-circle' },
  refunded: { bg: '#f5eef8', text: '#9b59b6', icon: 'refresh-circle' },
  no_bill:  { bg: '#fdedec', text: '#e74c3c', icon: 'alert-circle-outline' },
};

export default function BillingListScreen({ navigation }) {
  const [items,      setItems]      = useState([]); // mixed: bills + unbilled checkouts
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [filterTab,  setFilterTab]  = useState('all');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals,     setTotals]     = useState({ pending: 0, paid: 0 });

  const load = useCallback(async () => {
    try {
      // 1. Get all reservations that are checked_out or checked_in
      const resRes = await api.get('/reservations');
      const reservations = (resRes.data.data || []).filter(
        r => r.status === 'checked_out' || r.status === 'checked_in'
      );

      // 2. For each reservation, try to fetch its bill
      const combined = await Promise.all(
        reservations.map(async (res) => {
          try {
            const billRes = await api.get(`/billing/reservation/${res._id}`);
            const bill = billRes.data.data;
            if (bill) {
              return { type: 'bill', bill, reservation: res };
            }
          } catch (_) {}
          // No bill yet
          return { type: 'no_bill', reservation: res };
        })
      );

      setItems(combined);

      // Compute totals from bills only
      const bills = combined.filter(i => i.type === 'bill').map(i => i.bill);
      setTotals({
        pending: bills.filter(b => b.payment_status === 'pending').reduce((s, b) => s + (b.total_amount || 0), 0),
        paid:    bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0),
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = items;
    if (filterTab === 'no_bill') list = list.filter(i => i.type === 'no_bill');
    else if (filterTab === 'pending') list = list.filter(i => i.type === 'bill' && i.bill.payment_status === 'pending');
    else if (filterTab === 'paid')    list = list.filter(i => i.type === 'bill' && i.bill.payment_status === 'paid');

    if (search) {
      list = list.filter(i =>
        i.reservation?.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.reservation?.room?.room_number?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [items, filterTab, search]);

  const Card = ({ item }) => {
    const res = item.reservation;
    const bill = item.bill;
    const nights = res.check_in_date && res.check_out_date
      ? Math.ceil((new Date(res.check_out_date) - new Date(res.check_in_date)) / 86400000) : 1;

    if (item.type === 'no_bill') {
      // Unbilled checkout — show "Generate Bill" button
      return (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.guestName}>{res.guest_name}</Text>
              <Text style={styles.roomInfo}>Room #{res.room?.room_number}  ·  {nights} night{nights !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#fdedec' }]}>
              <Text style={[styles.badgeText, { color: '#e74c3c' }]}>NO BILL</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color="#888" />
            <Text style={styles.infoText}> {new Date(res.check_in_date).toDateString()} → {new Date(res.check_out_date).toDateString()}</Text>
          </View>
          <Text style={styles.estText}>
            Est. LKR {((res.room?.price_per_night || 0) * nights).toLocaleString()} + tax
          </Text>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => navigation.navigate('BillDetail', { reservation: res, bill: null })}
          >
            <Ionicons name="receipt-outline" size={16} color="#fff" />
            <Text style={styles.generateBtnText}> Generate Bill & Pay</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Has a bill
    const p = PAY_COLOR[bill.payment_status] || PAY_COLOR.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BillDetail', { reservation: res, bill })}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestName}>{res.guest_name}</Text>
            <Text style={styles.roomInfo}>Room #{res.room?.room_number}  ·  {nights} night{nights !== 1 ? 's' : ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: p.bg }]}>
            <Text style={[styles.badgeText, { color: p.text }]}>{bill.payment_status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.amount}>LKR {(bill.total_amount || 0).toLocaleString()}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={13} color="#888" />
          <Text style={styles.infoText}> {(bill.payment_method || 'cash').replace('_', ' ').toUpperCase()}</Text>
          {bill.paid_at && <Text style={styles.infoText}>  ·  Paid {new Date(bill.paid_at).toLocaleDateString()}</Text>}
        </View>
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to view / pay →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Summary bar */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#f39c12' }]}>LKR {totals.pending.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: '#27ae60' }]}>LKR {totals.paid.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Unbilled</Text>
          <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>{items.filter(i => i.type === 'no_bill').length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search guest or room..." value={search} onChangeText={setSearch} placeholderTextColor="#aaa" />
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {['all', 'no_bill', 'pending', 'paid'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterTab === f && styles.chipActive]} onPress={() => setFilterTab(f)}>
            <Text style={[styles.chipText, filterTab === f && styles.chipTextActive]}>
              {f === 'no_bill' ? '⚠️ No Bill' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i, idx) => i.bill?._id || i.reservation?._id || String(idx)}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={<Text style={styles.empty}>No billing records found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#aac4e0', fontSize: 11, marginBottom: 4 },
  summaryValue: { fontWeight: 'bold', fontSize: 14 },
  summaryDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, height: 44, marginLeft: 8, color: '#333' },
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  guestName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  roomInfo: { color: '#888', fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  amount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#888', fontSize: 12 },
  estText: { color: '#f39c12', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
  generateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tapHint: { alignItems: 'flex-end', marginTop: 4 },
  tapHintText: { color: '#bbb', fontSize: 11 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48 },
});
