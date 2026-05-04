// src/screens/events/AddEventScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };
const EVENT_TYPES = ['wedding', 'conference', 'party', 'meeting', 'other'];
const STATUSES    = ['scheduled', 'completed', 'cancelled'];

export default function AddEventScreen({ route, navigation }) {
  const existing = route.params?.event;
  const isEdit   = !!existing;

  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    title:        existing?.title        || '',
    event_type:   existing?.event_type   || 'meeting',
    hall:         existing?.hall?._id    || '',
    client_name:  existing?.client_name  || '',
    client_email: existing?.client_email || '',
    event_date:   existing?.event_date   ? existing.event_date.slice(0, 10) : '',
    start_time:   existing?.start_time   || '',
    end_time:     existing?.end_time     || '',
    guest_count:  existing?.guest_count?.toString() || '',
    package:      existing?.package?._id || '',
    total_price:  existing?.total_price?.toString() || '',
    status:       existing?.status       || 'scheduled',
    notes:        existing?.notes        || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([api.get('/events/halls'), api.get('/events/packages')]).then(([h, p]) => {
      setHalls(h.data.data || []);
      setPackages(p.data.data || []);
      if (!isEdit && h.data.data?.length) set('hall')(h.data.data[0]._id);
    }).catch(() => {});
  }, []);

  const validate = () => {
    if (!form.title.trim())    return 'Event title is required.';
    if (!form.hall)            return 'Please select a hall.';
    if (!form.event_date)      return 'Event date is required.';
    if (!form.start_time)      return 'Start time is required. (HH:MM)';
    if (!form.end_time)        return 'End time is required. (HH:MM)';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    setLoading(true);
    try {
      const payload = {
        ...form,
        guest_count: form.guest_count ? parseInt(form.guest_count) : undefined,
        total_price: form.total_price ? parseFloat(form.total_price) : undefined,
        package:     form.package || undefined,
      };
      if (isEdit) {
        await api.put(`/events/${existing._id}`, payload);
        Alert.alert('Updated', 'Event updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await api.post('/events', payload);
        Alert.alert('Created', 'Event created.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const Field = ({ label, icon, ...props }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputGroup}>
        <Ionicons name={icon} size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput style={styles.input} placeholderTextColor="#aaa" {...props} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <Field label="Event Title *"  icon="text-outline"        placeholder="e.g. Annual Conference 2026" value={form.title}        onChangeText={set('title')} />
        <Field label="Client Name"    icon="person-outline"       placeholder="Client full name"            value={form.client_name}  onChangeText={set('client_name')} />
        <Field label="Client Email"   icon="mail-outline"         placeholder="client@email.com"            value={form.client_email} onChangeText={set('client_email')} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Event Date *"   icon="calendar-outline"     placeholder="YYYY-MM-DD"                  value={form.event_date}   onChangeText={set('event_date')} />
        <Field label="Start Time *"   icon="time-outline"         placeholder="09:00"                       value={form.start_time}   onChangeText={set('start_time')} />
        <Field label="End Time *"     icon="time-outline"         placeholder="17:00"                       value={form.end_time}     onChangeText={set('end_time')} />
        <Field label="Guest Count"    icon="people-outline"       placeholder="e.g. 150"                    value={form.guest_count}  onChangeText={set('guest_count')} keyboardType="numeric" />
        <Field label="Total Price (LKR)" icon="cash-outline"     placeholder="e.g. 250000"                 value={form.total_price}  onChangeText={set('total_price')} keyboardType="numeric" />
        <Field label="Notes"          icon="chatbox-outline"      placeholder="Any additional notes..."     value={form.notes}        onChangeText={set('notes')} multiline />

        {/* Event Type */}
        <Text style={styles.label}>Event Type *</Text>
        <View style={styles.chipsRow}>
          {EVENT_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, form.event_type === t && styles.chipActive]} onPress={() => set('event_type')(t)}>
              <Text style={[styles.chipText, form.event_type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hall */}
        <Text style={styles.label}>Select Hall *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {halls.map(h => (
            <TouchableOpacity key={h._id} style={[styles.hallCard, form.hall === h._id && styles.hallCardActive]} onPress={() => set('hall')(h._id)}>
              <Text style={[styles.hallName, form.hall === h._id && { color: '#fff' }]}>{h.name}</Text>
              <Text style={[styles.hallCap, form.hall === h._id && { color: '#cce0f0' }]}>Cap: {h.capacity}</Text>
              <Text style={[styles.hallPrice, form.hall === h._id && { color: COLORS.accent }]}>LKR {h.price_per_hour}/hr</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status (edit only) */}
        {isEdit && (
          <>
            <Text style={styles.label}>Status</Text>
            <View style={styles.chipsRow}>
              {STATUSES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, form.status === s && styles.chipActive]} onPress={() => set('status')(s)}>
                  <Text style={[styles.chipText, form.status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="save-outline" size={20} color="#fff" /><Text style={styles.saveBtnText}>  {isEdit ? 'Update Event' : 'Create Event'}</Text></>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  fieldWrap: { marginBottom: 14 },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dde6f0' },
  input: { flex: 1, height: 48, color: '#333', fontSize: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#dde6f0' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  hallCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 10, width: 140, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  hallCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  hallName: { fontWeight: 'bold', fontSize: 14, color: COLORS.primary, textAlign: 'center', marginBottom: 4 },
  hallCap: { color: '#888', fontSize: 11 },
  hallPrice: { color: '#27ae60', fontWeight: 'bold', fontSize: 11, marginTop: 4 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4, marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
