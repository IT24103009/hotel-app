// src/screens/reservations/CreateReservationScreen.js — FIXED v3
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

function DatePickerModal({ visible, title, onSelect, onClose }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day,   setDay]   = useState(today.getDate());
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const confirm = () => {
    const pad = n => String(n).padStart(2, '0');
    onSelect(`${year}-${pad(month + 1)}-${pad(day)}`);
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dp.overlay}>
        <View style={dp.modal}>
          <Text style={dp.title}>{title}</Text>
          <Text style={dp.label}>Year</Text>
          <View style={dp.row}>
            {[2026, 2027, 2028].map(y => (
              <Pressable key={y} style={[dp.chip, year === y && dp.chipActive]} onPress={() => setYear(y)}>
                <Text style={[dp.chipText, year === y && dp.chipTextActive]}>{y}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={dp.label}>Month</Text>
          <View style={dp.row}>
            {MONTHS.map((m, i) => (
              <Pressable key={i} style={[dp.chip, month === i && dp.chipActive]} onPress={() => setMonth(i)}>
                <Text style={[dp.chipText, month === i && dp.chipTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={dp.label}>Day</Text>
          <View style={dp.dayGrid}>
            {days.map(d => (
              <Pressable key={d} style={[dp.dayChip, day === d && dp.chipActive]} onPress={() => setDay(d)}>
                <Text style={[dp.chipText, day === d && dp.chipTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <View style={dp.btnRow}>
            <Pressable style={dp.cancelBtn} onPress={onClose}>
              <Text style={dp.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={dp.confirmBtn} onPress={confirm}>
              <Text style={dp.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CreateReservationScreen({ navigation }) {
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [showCheckIn,  setShowCheckIn]  = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [guestName,       setGuestName]       = useState('');
  const [guestEmail,      setGuestEmail]      = useState('');
  const [guestPhone,      setGuestPhone]      = useState('');
  const [checkInDate,     setCheckInDate]     = useState('');
  const [checkOutDate,    setCheckOutDate]    = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedRoomId,  setSelectedRoomId]  = useState('');
  const [selectedRoom,    setSelectedRoom]    = useState(null);

  useEffect(() => {
    api.get('/rooms/available')
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => Alert.alert('Error', 'Could not load rooms'));
  }, []);

  // pick a room — use both id string and object
  const pickRoom = (room) => {
    console.log('Room picked:', room._id, room.room_number);
    setSelectedRoomId(String(room._id));
    setSelectedRoom(room);
  };

  const validate = () => {
    if (!guestName.trim())  return 'Guest name is required.';
    if (!selectedRoomId)    return 'Please select a room below.';
    if (!checkInDate)       return 'Please select a check-in date.';
    if (!checkOutDate)      return 'Please select a check-out date.';
    if (new Date(checkInDate) >= new Date(checkOutDate))
      return 'Check-out date must be after check-in date.';
    return null;
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) return Alert.alert('Missing Info', err);
    setLoading(true);
    try {
      const payload = {
        guest_name:       guestName.trim(),
        guest_email:      guestEmail.trim(),
        guest_phone:      guestPhone.trim(),
        room_id:          selectedRoomId,
        check_in_date:    checkInDate,
        check_out_date:   checkOutDate,
        special_requests: specialRequests.trim(),
      };
      console.log('Creating reservation:', payload);
      await api.post('/reservations', payload);
      Alert.alert('Success! 🎉', 'Reservation created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const nights = checkInDate && checkOutDate
    ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000) : 0;
  const totalCost = selectedRoom && nights > 0 ? selectedRoom.price_per_night * nights : 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Guest Name */}
        <Text style={styles.label}>Guest Name *</Text>
        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#aaa" value={guestName} onChangeText={setGuestName} />
        </View>

        {/* Email */}
        <Text style={styles.label}>Guest Email</Text>
        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#aaa" value={guestEmail} onChangeText={setGuestEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        {/* Phone */}
        <Text style={styles.label}>Guest Phone</Text>
        <View style={styles.inputGroup}>
          <Ionicons name="call-outline" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput style={styles.input} placeholder="07X XXX XXXX" placeholderTextColor="#aaa" value={guestPhone} onChangeText={setGuestPhone} keyboardType="phone-pad" />
        </View>

        {/* Check-in */}
        <Text style={styles.label}>Check-in Date *</Text>
        <Pressable style={styles.dateBtn} onPress={() => setShowCheckIn(true)}>
          <Ionicons name="calendar-outline" size={18} color={checkInDate ? COLORS.primary : '#aaa'} style={{ marginRight: 8 }} />
          <Text style={[styles.dateBtnText, !checkInDate && { color: '#aaa' }]}>
            {checkInDate || 'Tap to select date'}
          </Text>
          <Ionicons name="chevron-down-outline" size={16} color="#888" />
        </Pressable>

        {/* Check-out */}
        <Text style={styles.label}>Check-out Date *</Text>
        <Pressable style={styles.dateBtn} onPress={() => setShowCheckOut(true)}>
          <Ionicons name="calendar-outline" size={18} color={checkOutDate ? COLORS.primary : '#aaa'} style={{ marginRight: 8 }} />
          <Text style={[styles.dateBtnText, !checkOutDate && { color: '#aaa' }]}>
            {checkOutDate || 'Tap to select date'}
          </Text>
          <Ionicons name="chevron-down-outline" size={16} color="#888" />
        </Pressable>

        {/* Nights banner */}
        {nights > 0 && (
          <View style={styles.nightsBanner}>
            <Ionicons name="moon-outline" size={16} color={COLORS.accent} />
            <Text style={styles.nightsText}>  {nights} Night{nights !== 1 ? 's' : ''}</Text>
            {totalCost > 0 && <Text style={styles.nightsText}>  ·  Est. LKR {totalCost.toLocaleString()}</Text>}
          </View>
        )}

        {/* Special requests */}
        <Text style={styles.label}>Special Requests</Text>
        <View style={[styles.inputGroup, { alignItems: 'flex-start', paddingTop: 10 }]}>
          <Ionicons name="chatbox-outline" size={18} color="#888" style={{ marginRight: 8, marginTop: 2 }} />
          <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Any special requests?" placeholderTextColor="#aaa" value={specialRequests} onChangeText={setSpecialRequests} multiline />
        </View>

        {/* ── ROOM SELECTION — vertical list, no nested scroll ── */}
        <Text style={styles.label}>Select Room * {selectedRoomId ? '✅' : '(required)'}</Text>

        {rooms.length === 0 && (
          <Text style={{ color: '#aaa', marginBottom: 12 }}>No available rooms found.</Text>
        )}

        {rooms.map(r => {
          const isSelected = selectedRoomId === String(r._id);
          return (
            <Pressable
              key={String(r._id)}
              style={[styles.roomRow, isSelected && styles.roomRowActive]}
              onPress={() => pickRoom(r)}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roomRowNum, isSelected && { color: '#fff' }]}>
                  Room #{r.room_number}  —  {r.room_type?.type_name}
                </Text>
                <Text style={[styles.roomRowPrice, isSelected && { color: COLORS.accent }]}>
                  LKR {r.price_per_night?.toLocaleString()} / night  ·  Floor {r.floor || '—'}
                </Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />}
            </Pressable>
          );
        })}

        {/* Create button */}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="calendar-outline" size={20} color="#fff" /><Text style={styles.btnText}>  Create Reservation</Text></>
          }
        </Pressable>
      </ScrollView>

      <DatePickerModal visible={showCheckIn}  title="Check-in Date"  onSelect={setCheckInDate}  onClose={() => setShowCheckIn(false)} />
      <DatePickerModal visible={showCheckOut} title="Check-out Date" onSelect={setCheckOutDate} onClose={() => setShowCheckOut(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 14 },
  input: { flex: 1, height: 48, color: '#333', fontSize: 14 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 14 },
  dateBtnText: { flex: 1, color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  nightsBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8ee', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#f5d5a0' },
  nightsText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  // Room rows — vertical list, easy to tap
  roomRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  roomRowActive: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#bbb', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  roomRowNum: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  roomRowPrice: { fontSize: 12, color: '#27ae60', marginTop: 2, fontWeight: '600' },
  btn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4, marginTop: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

const dp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16, textAlign: 'center' },
  label: { color: '#888', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#f0f4f8' },
  dayChip: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: '#555', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  cancelText: { color: '#888', fontWeight: '600' },
  confirmBtn: { flex: 1, borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.accent },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
