// src/screens/staff/AddStaffScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

export default function AddStaffScreen({ route, navigation }) {
  const existing = route.params?.staff;
  const isEdit   = !!existing;

  const [form, setForm] = useState({
    username:  existing?.username  || '',
    password:  '',
    full_name: existing?.full_name || '',
    email:     existing?.email     || '',
    role:      existing?.role      || 'staff',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.username.trim()) return 'Username is required.';
    if (!isEdit && form.password.length < 6) return 'Password must be at least 6 characters.';
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.includes('@')) return 'Valid email is required.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) {
        await api.put(`/users/${existing._id}`, payload);
        Alert.alert('Updated', 'Staff member updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await api.post('/users', payload);
        Alert.alert('Created', 'Staff member added.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const Field = ({ label, icon, secureToggle, ...props }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputGroup}>
        <Ionicons name={icon} size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput style={[styles.input, { flex: 1 }]} placeholderTextColor="#aaa" {...props} />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 8 }}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Field label="Username *"    icon="person-outline"     placeholder="username"        value={form.username}  onChangeText={set('username')}  autoCapitalize="none" />
        <Field label={isEdit ? "New Password (leave blank to keep)" : "Password *"} icon="lock-closed-outline" placeholder="••••••••" value={form.password} onChangeText={set('password')} secureTextEntry={!showPwd} secureToggle />
        <Field label="Full Name *"   icon="text-outline"       placeholder="John Doe"        value={form.full_name} onChangeText={set('full_name')} />
        <Field label="Email *"       icon="mail-outline"       placeholder="email@hotel.com" value={form.email}     onChangeText={set('email')}     keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Role *</Text>
        <View style={styles.roleRow}>
          {['admin', 'receptionist', 'staff'].map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.roleChip, form.role === role && styles.roleChipActive]}
              onPress={() => set('role')(role)}
            >
              <Ionicons
                name={role === 'admin' ? 'shield-checkmark-outline' : role === 'receptionist' ? 'desktop-outline' : 'person-outline'}
                size={16}
                color={form.role === role ? '#fff' : '#555'}
              />
              <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                {' '}{role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="save-outline" size={20} color="#fff" /><Text style={styles.saveBtnText}>  {isEdit ? 'Update Staff' : 'Add Staff'}</Text></>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  fieldWrap: { marginBottom: 16 },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dde6f0' },
  input: { height: 48, color: '#333', fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#dde6f0' },
  roleChipActive: { backgroundColor: COLORS.primary },
  roleText: { color: '#555', fontWeight: '600', fontSize: 12 },
  roleTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
