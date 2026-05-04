// src/screens/reports/ReportsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

const StatCard = ({ icon, label, value, color, bg, sub }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  </View>
);

export default function ReportsScreen() {
  const [dashboard,  setDashboard]  = useState(null);
  const [occupancy,  setOccupancy]  = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period,     setPeriod]     = useState('weekly');

  const load = useCallback(async () => {
    try {
      const [dashRes, occRes, plRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get(`/reports/occupancy?period=${period}`),
        api.get('/reports/profit-loss'),
      ]);
      setDashboard(dashRes.data.data);
      setOccupancy(occRes.data.data || []);
      setProfitLoss(plRes.data.data);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  // Occupancy bar chart
  const maxBookings = Math.max(...occupancy.map(o => o.bookings), 1);

  const OccupancyBar = ({ item }) => (
    <View style={styles.barRow}>
      <Text style={styles.barDate}>{item.date?.slice(5)}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${(item.bookings / maxBookings) * 100}%` }]} />
      </View>
      <Text style={styles.barNum}>{item.bookings}</Text>
    </View>
  );

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const occPct = dashboard
    ? Math.round((dashboard.occupied / (dashboard.total_rooms || 1)) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={32} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Hotel Reports</Text>
        <Text style={styles.headerSub}>Live data from MongoDB Atlas</Text>
      </View>

      {/* Room Overview */}
      {dashboard && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏨 Room Overview</Text>
          <StatCard icon="bed-outline"       label="Total Rooms"    value={String(dashboard.total_rooms || 0)}  color="#3498db" bg="#ebf5fb" />
          <StatCard icon="checkmark-circle"  label="Available"      value={String(dashboard.available || 0)}    color="#27ae60" bg="#eafaf1" />
          <StatCard icon="people"            label="Occupied"       value={String(dashboard.occupied || 0)}     color="#e74c3c" bg="#fdedec"
            sub={`${occPct}% occupancy rate`} />
          <StatCard icon="construct-outline" label="Maintenance"    value={String(dashboard.maintenance || 0)}  color="#f39c12" bg="#fef9e7" />

          {/* Occupancy gauge */}
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeLabel}>Occupancy Rate</Text>
            <View style={styles.gaugeBg}>
              <View style={[styles.gaugeFill, {
                width: `${occPct}%`,
                backgroundColor: occPct > 75 ? '#27ae60' : occPct > 40 ? '#f39c12' : '#e74c3c'
              }]} />
            </View>
            <Text style={[styles.gaugePct, {
              color: occPct > 75 ? '#27ae60' : occPct > 40 ? '#f39c12' : '#e74c3c'
            }]}>{occPct}%</Text>
          </View>
        </View>
      )}

      {/* Today's Revenue */}
      {dashboard && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Today's Revenue</Text>
          <View style={styles.revenueCard}>
            <Ionicons name="cash-outline" size={36} color={COLORS.accent} />
            <Text style={styles.revenueAmount}>LKR {(dashboard.total_revenue || 0).toLocaleString()}</Text>
            <Text style={styles.revenueSub}>Collected today from paid bills</Text>
          </View>
          {dashboard.avg_rating && (
            <View style={styles.ratingCard}>
              <Ionicons name="star" size={28} color="#f1c40f" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.ratingNum}>{dashboard.avg_rating} / 5.0</Text>
                <Text style={styles.ratingSub}>Average guest rating</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Profit & Loss */}
      {profitLoss && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Profit & Loss (Last 30 Days)</Text>
          <View style={styles.plCard}>
            <View style={styles.plRow}>
              <Text style={styles.plLabel}>Room Revenue</Text>
              <Text style={[styles.plValue, { color: '#27ae60' }]}>+ LKR {(profitLoss.room_revenue || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.plRow}>
              <Text style={styles.plLabel}>Extra Revenue</Text>
              <Text style={[styles.plValue, { color: '#27ae60' }]}>+ LKR {(profitLoss.extra_revenue || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.plRow}>
              <Text style={styles.plLabel}>Tax Collected</Text>
              <Text style={[styles.plValue, { color: '#3498db' }]}>+ LKR {(profitLoss.total_tax || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.plRow}>
              <Text style={styles.plLabel}>Discounts Given</Text>
              <Text style={[styles.plValue, { color: '#e74c3c' }]}>- LKR {(profitLoss.total_discounts || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.plDivider} />
            <View style={styles.plRow}>
              <Text style={[styles.plLabel, { fontWeight: 'bold', color: COLORS.primary }]}>GROSS REVENUE</Text>
              <Text style={[styles.plValue, { color: COLORS.primary, fontWeight: 'bold', fontSize: 17 }]}>
                LKR {(profitLoss.gross_revenue || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Occupancy Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>📈 Booking Trend</Text>
          <View style={styles.periodRow}>
            {['daily','weekly','monthly'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodChip, period === p && styles.periodChipActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          {occupancy.length === 0 ? (
            <View style={styles.noData}>
              <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
              <Text style={styles.noDataText}>No booking data for this period</Text>
            </View>
          ) : (
            occupancy.map((item, i) => <OccupancyBar key={i} item={item} />)
          )}
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  headerSub: { color: '#aac4e0', fontSize: 13, marginTop: 4 },
  section: { margin: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 2 },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statLabel: { color: '#888', fontSize: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statSub: { color: '#aaa', fontSize: 11, marginTop: 2 },
  gaugeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  gaugeLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  gaugeBg: { height: 14, backgroundColor: '#f0f4f8', borderRadius: 7, overflow: 'hidden', marginBottom: 6 },
  gaugeFill: { height: '100%', borderRadius: 7 },
  gaugePct: { fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  revenueCard: { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', elevation: 3, marginBottom: 10 },
  revenueAmount: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginTop: 10 },
  revenueSub: { color: '#888', fontSize: 12, marginTop: 4 },
  ratingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  ratingNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  ratingSub: { color: '#888', fontSize: 12 },
  plCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 3 },
  plRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f5f5f5' },
  plLabel: { color: '#888', fontSize: 14 },
  plValue: { fontWeight: '700', fontSize: 14 },
  plDivider: { borderTopWidth: 2, borderColor: COLORS.primary, marginVertical: 8 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  periodRow: { flexDirection: 'row', gap: 6 },
  periodChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#dde6f0' },
  periodChipActive: { backgroundColor: COLORS.primary },
  periodText: { color: '#555', fontSize: 11, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  chartCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 3 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  barDate: { color: '#888', fontSize: 11, width: 40 },
  barBg: { flex: 1, height: 20, backgroundColor: '#f0f4f8', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 10 },
  barNum: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13, width: 24, textAlign: 'right' },
  noData: { alignItems: 'center', padding: 24 },
  noDataText: { color: '#aaa', marginTop: 8 },
});
