// src/screens/maintenance/AddMaintenanceScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

export default function AddMaintenanceScreen({ navigation }) {
  const [rooms, setRooms]   = useState([]);
  const [staff, setStaff]   = useState([]);
  const [form, setForm]     = useState({ room_id: '', reason: '', start_date: '', assigned_staff_id: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/users')]).then(([roomRes, userRes]) => {
      setRooms((roomRes.data.data || []).filter(r => r.status !== 'maintenance'));
      setStaff((userRes.data.data || []).filter(s => s.is_active));
    }).catch(() => {});
  }, []);

  const validate = () => {
    if (!form.room_id)        return 'Please select a room.';
    if (!form.reason.trim())  return 'Reason is required.';
    if (!form.start_date)     return 'Start date is required. (YYYY-MM-DD)';
    return null;
  };

  const handleSchedule = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    setLoading(true);
    try {
      await api.post('/rooms/maintenance', form);
      Alert.alert('Scheduled', 'Maintenance has been scheduled and room marked as under maintenance.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Select Room */}
        <Text style={styles.label}>Select Room *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {rooms.map(r => (
            <TouchableOpacity
              key={r._id}
              style={[styles.roomCard, form.room_id === r._id && styles.roomCardActive]}
              onPress={() => set('room_id')(r._id)}
            >
              <Text style={[styles.roomNum, form.room_id === r._id && { color: '#fff' }]}>#{r.room_number}</Text>
              <Text style={[styles.roomType, form.room_id === r._id && { color: '#cce0f0' }]}>{r.room_type?.type_name}</Text>
              <View style={[styles.roomStatus, { backgroundColor: r.status === 'available' ? '#eafaf1' : '#fdedec' }]}>
                <Text style={{ color: r.status === 'available' ? '#27ae60' : '#e74c3c', fontSize: 10, fontWeight: '700' }}>{r.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {rooms.length === 0 && <Text style={{ color: '#aaa', padding: 8 }}>No available rooms</Text>}
        </ScrollView>

        {/* Reason */}
        <Text style={styles.label}>Reason / Description *</Text>
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the maintenance work needed..."
            placeholderTextColor="#aaa"
            value={form.reason}
            onChangeText={set('reason')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Start Date */}
        <Text style={styles.label}>Start Date * (YYYY-MM-DD)</Text>
        <View style={styles.inputGroup}>
          <Ionicons name="calendar-outline" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="2026-04-15"
            placeholderTextColor="#aaa"
            value={form.start_date}
            onChangeText={set('start_date')}
          />
        </View>

        {/* Assign Staff */}
        <Text style={styles.label}>Assign Staff (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={[styles.staffChip, !form.assigned_staff_id && styles.staffChipActive]}
            onPress={() => set('assigned_staff_id')('')}
          >
            <Text style={[styles.staffChipText, !form.assigned_staff_id && styles.staffChipTextActive]}>Unassigned</Text>
          </TouchableOpacity>
          {staff.map(s => (
            <TouchableOpacity
              key={s._id}
              style={[styles.staffChip, form.assigned_staff_id === s._id && styles.staffChipActive]}
              onPress={() => set('assigned_staff_id')(s._id)}
            >
              <Text style={[styles.staffChipText, form.assigned_staff_id === s._id && styles.staffChipTextActive]}>{s.full_name}</Text>
              <Text style={[styles.staffRole, form.assigned_staff_id === s._id && { color: '#cce0f0' }]}>{s.role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.btn} onPress={handleSchedule} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="construct-outline" size={20} color="#fff" /><Text style={styles.btnText}>  Schedule Maintenance</Text></>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginBottom: 8 },
  roomCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 10, width: 110, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  roomCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  roomNum: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary },
  roomType: { color: '#888', fontSize: 11, marginVertical: 4, textAlign: 'center' },
  roomStatus: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  textAreaWrap: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 16, padding: 12 },
  textArea: { color: '#333', fontSize: 14, minHeight: 100 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 16 },
  input: { flex: 1, height: 48, color: '#333', fontSize: 14 },
  staffChip: { backgroundColor: '#dde6f0', borderRadius: 10, padding: 12, marginRight: 8, alignItems: 'center', minWidth: 90 },
  staffChipActive: { backgroundColor: COLORS.primary },
  staffChipText: { color: '#555', fontWeight: '600', fontSize: 13 },
  staffChipTextActive: { color: '#fff' },
  staffRole: { color: '#888', fontSize: 10, marginTop: 2 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
