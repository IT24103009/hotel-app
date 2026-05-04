// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#1a3c5e', accent: '#27ae60' };

const Field = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }) => (
  <View style={styles.inputGroup}>
    <Ionicons name={icon} size={18} color="#888" style={{ marginRight: 8 }} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType || 'default'}
      autoCapitalize={autoCapitalize || 'sentences'}
    />
  </View>
);

export default function RegisterScreen({ navigation }) {
  const { clientRegister } = useAuth();
  const [form, setForm] = useState({
    username: '', password: '', full_name: '', email: '',
    phone: '', id_type: 'passport', id_number: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.username.trim()) return 'Username is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.includes('@')) return 'Valid email is required.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    setLoading(true);
    try {
      await clientRegister(form);
      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('ClientLogin') },
      ]);
    } catch (e) {
      Alert.alert('Registration Failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={60} color={COLORS.accent} />
          <Text style={styles.title}>Create Account</Text>
        </View>
        <View style={styles.card}>
          <Field icon="person-outline"         placeholder="Username"      value={form.username}   onChangeText={set('username')}   autoCapitalize="none" />
          <Field icon="lock-closed-outline"    placeholder="Password"      value={form.password}   onChangeText={set('password')}   secureTextEntry />
          <Field icon="text-outline"           placeholder="Full Name"     value={form.full_name}  onChangeText={set('full_name')} />
          <Field icon="mail-outline"           placeholder="Email"         value={form.email}      onChangeText={set('email')}      keyboardType="email-address" autoCapitalize="none" />
          <Field icon="call-outline"           placeholder="Phone (optional)" value={form.phone}   onChangeText={set('phone')}      keyboardType="phone-pad" />

          <Text style={styles.label}>ID Type</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={form.id_type} onValueChange={set('id_type')} style={styles.picker}>
              <Picker.Item label="Passport"         value="passport" />
              <Picker.Item label="National ID Card" value="id_card" />
              <Picker.Item label="Driving License"  value="driving_license" />
            </Picker>
          </View>

          <Field icon="card-outline" placeholder="ID Number" value={form.id_number} onChangeText={set('id_number')} />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', paddingVertical: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 8 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 14, backgroundColor: '#f9f9f9', paddingHorizontal: 12 },
  input: { flex: 1, height: 46, color: '#333', fontSize: 14 },
  label: { color: '#555', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  pickerWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 14, overflow: 'hidden' },
  picker: { height: 50 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
