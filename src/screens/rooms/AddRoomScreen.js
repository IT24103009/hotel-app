// src/screens/rooms/AddRoomScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

export default function AddRoomScreen({ route, navigation }) {
  const existing = route.params?.room;
  const isEdit   = !!existing;

  const [roomTypes, setRoomTypes] = useState([]);
  const [form, setForm] = useState({
    room_number:     existing?.room_number     || '',
    room_type:       existing?.room_type?._id  || '',
    price_per_night: existing?.price_per_night?.toString() || '',
    floor:           existing?.floor?.toString() || '',
    amenities:       existing?.amenities?.join(', ') || '',
    status:          existing?.status || 'available',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/rooms/types').then(({ data }) => {
      setRoomTypes(data.data || []);
      if (!isEdit && data.data?.length) setForm(f => ({ ...f, room_type: data.data[0]._id }));
    }).catch(() => {});
  }, []);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.room_number.trim()) return 'Room number is required.';
    if (!form.room_type)         return 'Please select a room type.';
    if (!form.price_per_night || isNaN(form.price_per_night)) return 'Valid price is required.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);

    setLoading(true);
    try {
      const payload = {
        room_number:     form.room_number.trim(),
        room_type:       form.room_type,
        price_per_night: parseFloat(form.price_per_night),
        floor:           form.floor ? parseInt(form.floor) : undefined,
        amenities:       form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        status:          form.status,
      };

      if (isEdit) {
        await api.put(`/rooms/${existing._id}`, payload);
        Alert.alert('Success', 'Room updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await api.post('/rooms', payload);
        Alert.alert('Success', 'Room created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, placeholder, value, onChangeText, keyboardType }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputGroup}>
        <Ionicons name={icon} size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Field label="Room Number *"      icon="keypad-outline"  placeholder="e.g. 101"       value={form.room_number}     onChangeText={set('room_number')} />
        <Field label="Price Per Night *"  icon="cash-outline"    placeholder="e.g. 5000"      value={form.price_per_night} onChangeText={set('price_per_night')} keyboardType="numeric" />
        <Field label="Floor"              icon="layers-outline"  placeholder="e.g. 2"          value={form.floor}           onChangeText={set('floor')}           keyboardType="numeric" />
        <Field label="Amenities (comma-separated)" icon="star-outline" placeholder="WiFi, AC, TV" value={form.amenities} onChangeText={set('amenities')} />

        {/* Room Type */}
        <Text style={styles.fieldLabel}>Room Type *</Text>
        <View style={styles.chipsRow}>
          {roomTypes.map(t => (
            <TouchableOpacity key={t._id} style={[styles.typeChip, form.room_type === t._id && styles.typeChipActive]} onPress={() => set('room_type')(t._id)}>
              <Text style={[styles.typeChipText, form.room_type === t._id && styles.typeChipTextActive]}>{t.type_name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status */}
        <Text style={styles.fieldLabel}>Status</Text>
        <View style={styles.chipsRow}>
          {['available', 'occupied', 'maintenance'].map(s => (
            <TouchableOpacity key={s} style={[styles.typeChip, form.status === s && styles.typeChipActive]} onPress={() => set('status')(s)}>
              <Text style={[styles.typeChipText, form.status === s && styles.typeChipTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="save-outline" size={20} color="#fff" /><Text style={styles.saveBtnText}>  {isEdit ? 'Update Room' : 'Create Room'}</Text></>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dde6f0' },
  input: { flex: 1, height: 48, color: '#333', fontSize: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#dde6f0' },
  typeChipActive: { backgroundColor: COLORS.primary },
  typeChipText: { color: '#555', fontWeight: '600', fontSize: 13 },
  typeChipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
