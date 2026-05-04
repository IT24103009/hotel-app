import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8', card: '#fff', error: '#e74c3c' };

export default function LoginScreen({ navigation }) {
  const { staffLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return Alert.alert('Validation', 'Please enter username and password.');
    }
    setLoading(true);
    try {
      const data = await staffLogin(username.trim(), password);
      navigation.navigate('OTP', { userId: data.userId, demoOTP: data.demoOTP });
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
          <Ionicons name="business" size={64} color={COLORS.accent} />
          <Text style={styles.title}>Hotel Management</Text>
          <Text style={styles.subtitle}>Staff Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Staff Login</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 8 }}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login & Get OTP</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ClientLogin')}>
            <Text style={styles.linkText}>Guest / Client Login →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 12 },
  subtitle: { color: '#aac4e0', fontSize: 16, marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, elevation: 8 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 16, backgroundColor: '#f9f9f9', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#333', fontSize: 15 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});