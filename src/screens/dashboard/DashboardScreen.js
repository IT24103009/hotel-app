// src/screens/dashboard/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8', card: '#fff' };

const StatCard = ({ icon, label, value, color, bg }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [rooms, reservations, bills] = await Promise.all([
        api.get('/rooms'),
        api.get('/reservations'),
        api.get('/billing'),
      ]);

      const roomData = rooms.data.data || [];
      const resData  = reservations.data.data || [];
      const billData = bills.data.data || [];

      setStats({
        totalRooms:     roomData.length,
        available:      roomData.filter(r => r.status === 'available').length,
        occupied:       roomData.filter(r => r.status === 'occupied').length,
        maintenance:    roomData.filter(r => r.status === 'maintenance').length,
        reservations:   resData.length,
        checkedIn:      resData.filter(r => r.status === 'checked_in').length,
        pendingBills:   billData.filter(b => b.payment_status === 'pending').length,
        totalRevenue:   billData.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0),
      });
    } catch (e) {
      console.log('Dashboard error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = () => { setRefreshing(true); loadStats(); };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{user?.full_name || user?.username} 👋</Text>
          <Text style={styles.role}>{(user?.role || '').toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>📊 Quick Overview</Text>

        {stats && (
          <>
            <StatCard icon="bed-outline"      label="Total Rooms"    value={stats.totalRooms}              color="#3498db" bg="#ebf5fb" />
            <StatCard icon="checkmark-circle" label="Available"      value={stats.available}               color="#27ae60" bg="#eafaf1" />
            <StatCard icon="people"           label="Occupied"       value={stats.occupied}                color="#e74c3c" bg="#fdedec" />
            <StatCard icon="construct-outline" label="Maintenance"   value={stats.maintenance}             color="#f39c12" bg="#fef9e7" />
            <StatCard icon="calendar-outline"  label="Reservations"  value={stats.reservations}            color="#9b59b6" bg="#f5eef8" />
            <StatCard icon="enter-outline"    label="Checked In"     value={stats.checkedIn}               color="#1abc9c" bg="#e8f8f5" />
            <StatCard icon="card-outline"     label="Pending Bills"  value={stats.pendingBills}            color="#e67e22" bg="#fef5e7" />
            <StatCard icon="cash-outline"     label="Total Revenue"  value={`LKR ${stats.totalRevenue.toLocaleString()}`} color="#16a085" bg="#e8f8f5" />
          </>
        )}

        <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        <View style={styles.actions}>
          {[
            { icon: 'calendar-outline', label: 'New Reservation', tab: 'Reservations', screen: 'CreateReservation' },
            { icon: 'bed-outline',      label: 'Manage Rooms',    tab: 'Rooms',        screen: 'RoomList' },
            { icon: 'card-outline',     label: 'View Bills',      tab: 'Billing',      screen: 'BillingList' },
            { icon: 'construct-outline',label: 'Maintenance',     tab: 'Maintenance',  screen: 'MaintenanceList' },
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={() => navigation.getParent()?.navigate(a.tab, { screen: a.screen })}
            >
              <Ionicons name={a.icon} size={28} color={COLORS.primary} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { backgroundColor: COLORS.primary, padding: 24, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { color: '#aac4e0', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8, gap: 4 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  body: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginVertical: 12 },
  statCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statLabel: { color: '#888', fontSize: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, alignItems: 'center', width: '46%', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  actionLabel: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center' },
});
