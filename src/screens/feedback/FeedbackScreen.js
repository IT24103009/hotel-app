// src/screens/feedback/FeedbackScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
  Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

const STAR_COLORS = { 5:'#f1c40f', 4:'#f39c12', 3:'#e67e22', 2:'#e74c3c', 1:'#c0392b' };

function StarRow({ rating, size = 18, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <Pressable key={s} onPress={() => onSelect && onSelect(s)}>
          <Ionicons
            name={s <= rating ? 'star' : 'star-outline'}
            size={size}
            color={s <= rating ? '#f1c40f' : '#ccc'}
          />
        </Pressable>
      ))}
    </View>
  );
}

function AddFeedbackModal({ visible, onClose, onSubmit }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim())    return Alert.alert('Required', 'Please enter your name.');
    if (!comment.trim()) return Alert.alert('Required', 'Please write a comment.');
    setLoading(true);
    try {
      await onSubmit({ guest_name: name.trim(), guest_email: email.trim(), rating, comment: comment.trim() });
      setName(''); setEmail(''); setRating(5); setComment('');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={modal.overlay}>
          <View style={modal.box}>
            <View style={modal.header}>
              <Text style={modal.title}>✍️ Leave Feedback</Text>
              <Pressable onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></Pressable>
            </View>

            <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              {/* Star rating */}
              <Text style={modal.label}>Your Rating *</Text>
              <View style={modal.starsRow}>
                <StarRow rating={rating} size={36} onSelect={setRating} />
                <Text style={[modal.ratingText, { color: STAR_COLORS[rating] }]}>
                  {['','Terrible','Poor','Average','Good','Excellent'][rating]}
                </Text>
              </View>

              <Text style={modal.label}>Your Name *</Text>
              <View style={modal.inputRow}>
                <Ionicons name="person-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                <TextInput style={modal.input} placeholder="Full name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
              </View>

              <Text style={modal.label}>Email (optional)</Text>
              <View style={modal.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                <TextInput style={modal.input} placeholder="your@email.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <Text style={modal.label}>Your Comment *</Text>
              <View style={[modal.inputRow, { alignItems: 'flex-start', paddingTop: 10 }]}>
                <Ionicons name="chatbubble-outline" size={18} color="#888" style={{ marginRight: 8, marginTop: 2 }} />
                <TextInput
                  style={[modal.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Tell us about your experience..."
                  placeholderTextColor="#aaa"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
              </View>

              <Pressable style={modal.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <><Ionicons name="send-outline" size={18} color="#fff" /><Text style={modal.submitText}> Submit Feedback</Text></>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  box: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginBottom: 6 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  ratingText: { fontSize: 16, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 14 },
  input: { flex: 1, height: 48, color: '#333', fontSize: 14 },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default function FeedbackScreen() {
  const { user } = useAuth();
  const [feedbacks,  setFeedbacks]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [avgRating,  setAvgRating]  = useState(0);
  const [filterStar, setFilterStar] = useState(0);

  const isStaff = user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'staff';

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/feedback');
      const list = data.data || [];
      setFeedbacks(list);
      if (list.length > 0) {
        const avg = list.reduce((s, f) => s + (f.rating || 0), 0) / list.length;
        setAvgRating(avg.toFixed(1));
      }
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitFeedback = async (payload) => {
    await api.post('/feedback', payload);
    Alert.alert('Thank You! 🌟', 'Your feedback has been submitted.');
    load();
  };

  const filtered = filterStar === 0 ? feedbacks : feedbacks.filter(f => f.rating === filterStar);

  const ratingCounts = [5,4,3,2,1].map(s => ({
    star: s,
    count: feedbacks.filter(f => f.rating === s).length,
    pct: feedbacks.length ? (feedbacks.filter(f => f.rating === s).length / feedbacks.length) * 100 : 0,
  }));

  const Card = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.guest_name || 'G')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName}>{item.guest_name || 'Anonymous'}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toDateString()}</Text>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: STAR_COLORS[item.rating] + '22' }]}>
          <Ionicons name="star" size={14} color={STAR_COLORS[item.rating] || '#ccc'} />
          <Text style={[styles.ratingNum, { color: STAR_COLORS[item.rating] }]}> {item.rating}</Text>
        </View>
      </View>
      <StarRow rating={item.rating} size={14} />
      <Text style={styles.comment}>{item.comment}</Text>
      {item.guest_email ? (
        <View style={styles.emailRow}>
          <Ionicons name="mail-outline" size={12} color="#aaa" />
          <Text style={styles.emailText}> {item.guest_email}</Text>
        </View>
      ) : null}
    </View>
  );

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Summary header */}
      <View style={styles.header}>
        <View style={styles.avgBox}>
          <Text style={styles.avgNum}>{avgRating || '—'}</Text>
          <StarRow rating={Math.round(avgRating)} size={20} />
          <Text style={styles.avgSub}>{feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.barsBox}>
          {ratingCounts.map(r => (
            <Pressable key={r.star} style={styles.barRow} onPress={() => setFilterStar(filterStar === r.star ? 0 : r.star)}>
              <Text style={styles.barLabel}>{r.star}★</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${r.pct}%`, backgroundColor: STAR_COLORS[r.star] }]} />
              </View>
              <Text style={styles.barCount}>{r.count}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <Pressable style={[styles.chip, filterStar === 0 && styles.chipActive]} onPress={() => setFilterStar(0)}>
          <Text style={[styles.chipText, filterStar === 0 && styles.chipTextActive]}>All</Text>
        </Pressable>
        {[5,4,3,2,1].map(s => (
          <Pressable key={s} style={[styles.chip, filterStar === s && styles.chipActive]} onPress={() => setFilterStar(filterStar === s ? 0 : s)}>
            <Text style={[styles.chipText, filterStar === s && styles.chipTextActive]}>{s}★</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i, idx) => i._id || String(idx)}
        renderItem={({ item }) => <Card item={item} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No feedback yet.</Text>
            <Text style={styles.emptySub}>Be the first to leave a review!</Text>
          </View>
        }
      />

      {/* FAB - anyone can leave feedback */}
      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <AddFeedbackModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={submitFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 16, gap: 16 },
  avgBox: { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  avgNum: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  avgSub: { color: '#aac4e0', fontSize: 11, marginTop: 4 },
  barsBox: { flex: 1, justifyContent: 'center', gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { color: '#fff', fontSize: 11, width: 22 },
  barBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { color: '#aac4e0', fontSize: 11, width: 20, textAlign: 'right' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  guestName: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  date: { color: '#aaa', fontSize: 11 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingNum: { fontWeight: 'bold', fontSize: 14 },
  comment: { color: '#555', fontSize: 14, lineHeight: 21, marginTop: 8 },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  emailText: { color: '#aaa', fontSize: 11 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#aaa', fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub: { color: '#ccc', fontSize: 13, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
