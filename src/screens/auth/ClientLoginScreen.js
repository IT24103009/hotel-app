// src/screens/auth/ClientLoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#1a3c5e', accent: '#27ae60' };

export default function ClientLoginScreen({ navigation }) {
  const { clientLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Validation', 'Please fill in all fields.');
    setLoading(true);
    try {
      await clientLogin(username.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={72} color={COLORS.accent} />
          <Text style={styles.title}>Guest Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guest Login</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#aaa" />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPwd} placeholderTextColor="#aaa" />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 8 }}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? Register →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.link, { marginTop: 8 }]} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: '#888' }]}>← Staff Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 8 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 16, backgroundColor: '#f9f9f9', paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#333', fontSize: 15 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 14, alignItems: 'center' },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
