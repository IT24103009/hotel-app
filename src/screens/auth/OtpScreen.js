// src/screens/auth/OtpScreen.js  — Staff Login Step 2
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045' };

export default function OtpScreen({ route }) {
  const { userId, demoOTP } = route.params;
  const { verifyOTP } = useAuth();
  const [otp, setOtp]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return Alert.alert('Invalid', 'Enter the 6-digit OTP.');
    setLoading(true);
    try {
      await verifyOTP(userId, otp);
      // Navigation handled by AuthContext state change
    } catch (err) {
      Alert.alert('OTP Failed', err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.inner}>
        <Ionicons name="mail-open-outline" size={72} color={COLORS.accent} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.sub}>A 6-digit OTP was sent to your registered email address.</Text>

        {demoOTP ? (
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>🔑 Demo OTP: {demoOTP}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#aaa"
          textAlign="center"
        />

        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  inner: { flex: 1, justifyContent: 'center', padding: 32 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  sub: { color: '#aac4e0', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  demoBanner: { backgroundColor: '#f39c12', borderRadius: 8, padding: 12, marginBottom: 20, alignItems: 'center' },
  demoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  otpInput: { backgroundColor: '#fff', borderRadius: 12, height: 64, fontSize: 32, fontWeight: 'bold', letterSpacing: 12, color: COLORS.primary, marginBottom: 24 },
  btn: { backgroundColor: COLORS.accent, borderRadius: 10, height: 52, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
