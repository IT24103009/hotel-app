// src/screens/billing/BillDetailScreen.js — Full billing + QR + Card payment
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const COLORS = { primary: '#1a3c5e', accent: '#e8a045', bg: '#f0f4f8' };

// ── QR Code simulator (SVG-like pattern using View boxes) ──
function QRDisplay({ amount }) {
  const rows = 7;
  // Deterministic pattern based on amount
  const pattern = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: rows }, (_, c) => {
      if (r === 0 || r === rows - 1) return true;
      if (c === 0 || c === cols - 1) return true;
      return ((r * 3 + c * 7 + amount) % 3 === 0);
    })
  );
  const cols = rows;
  return (
    <View style={qr.container}>
      <View style={qr.frame}>
        {Array.from({ length: rows }).map((_, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {Array.from({ length: cols }).map((_, c) => {
              const filled = (r === 0 || r === rows-1 || c === 0 || c === cols-1)
                ? true : ((r * 13 + c * 7 + (amount % 11)) % 3 !== 1);
              return (
                <View key={c} style={[qr.cell, filled ? qr.filled : qr.empty]} />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={qr.label}>Scan to Pay  •  LKR {amount.toLocaleString()}</Text>
      <Text style={qr.sublabel}>PromptPay / LankaQR</Text>
    </View>
  );
}

const qr = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  frame: { backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 4, borderWidth: 2, borderColor: COLORS.primary },
  cell: { width: 16, height: 16, margin: 1 },
  filled: { backgroundColor: COLORS.primary, borderRadius: 2 },
  empty: { backgroundColor: '#fff' },
  label: { marginTop: 12, fontWeight: 'bold', color: COLORS.primary, fontSize: 15 },
  sublabel: { color: '#888', fontSize: 12, marginTop: 2 },
});

// ── Card payment form ──
function CardForm({ amount, onPay, loading }) {
  const [card, setCard]   = useState('');
  const [name, setName]   = useState('');
  const [exp,  setExp]    = useState('');
  const [cvv,  setCvv]    = useState('');

  const formatCard = (t) => {
    const d = t.replace(/\D/g, '').slice(0, 16);
    return d.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExp = (t) => {
    const d = t.replace(/\D/g, '').slice(0, 4);
    if (d.length >= 3) return d.slice(0, 2) + '/' + d.slice(2);
    return d;
  };

  const handlePay = () => {
    if (card.replace(/\s/g,'').length < 16) return Alert.alert('Invalid', 'Enter a valid 16-digit card number.');
    if (!name.trim()) return Alert.alert('Invalid', 'Enter cardholder name.');
    if (exp.length < 5) return Alert.alert('Invalid', 'Enter expiry date (MM/YY).');
    if (cvv.length < 3) return Alert.alert('Invalid', 'Enter 3-digit CVV.');
    onPay('card');
  };

  return (
    <View style={cf.wrap}>
      {/* Card preview */}
      <View style={cf.cardPreview}>
        <Ionicons name="card" size={28} color="rgba(255,255,255,0.8)" />
        <Text style={cf.cardNum}>{card || '•••• •••• •••• ••••'}</Text>
        <View style={cf.cardBottom}>
          <View>
            <Text style={cf.cardSmall}>CARDHOLDER</Text>
            <Text style={cf.cardName}>{name || 'YOUR NAME'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={cf.cardSmall}>EXPIRES</Text>
            <Text style={cf.cardName}>{exp || 'MM/YY'}</Text>
          </View>
        </View>
      </View>

      <Text style={cf.label}>Card Number</Text>
      <View style={cf.inputRow}>
        <Ionicons name="card-outline" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput style={cf.input} placeholder="1234 5678 9012 3456" placeholderTextColor="#aaa" value={card} onChangeText={t => setCard(formatCard(t))} keyboardType="number-pad" maxLength={19} />
      </View>

      <Text style={cf.label}>Cardholder Name</Text>
      <View style={cf.inputRow}>
        <Ionicons name="person-outline" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput style={cf.input} placeholder="As on card" placeholderTextColor="#aaa" value={name} onChangeText={setName} autoCapitalize="characters" />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={cf.label}>Expiry</Text>
          <View style={cf.inputRow}>
            <TextInput style={cf.input} placeholder="MM/YY" placeholderTextColor="#aaa" value={exp} onChangeText={t => setExp(formatExp(t))} keyboardType="number-pad" maxLength={5} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cf.label}>CVV</Text>
          <View style={cf.inputRow}>
            <TextInput style={cf.input} placeholder="123" placeholderTextColor="#aaa" value={cvv} onChangeText={t => setCvv(t.replace(/\D/g,'').slice(0,3))} keyboardType="number-pad" maxLength={3} secureTextEntry />
          </View>
        </View>
      </View>

      <TouchableOpacity style={cf.payBtn} onPress={handlePay} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <><Ionicons name="lock-closed" size={18} color="#fff" /><Text style={cf.payBtnText}>  Pay LKR {amount.toLocaleString()}</Text></>
        )}
      </TouchableOpacity>
      <Text style={cf.secure}>🔒 Secured with 256-bit SSL encryption</Text>
    </View>
  );
}

const cf = StyleSheet.create({
  wrap: { padding: 4 },
  cardPreview: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 4 },
  cardNum: { color: '#fff', fontSize: 20, letterSpacing: 3, fontWeight: 'bold', marginTop: 20, marginBottom: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSmall: { color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: 1 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  label: { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 12, height: 48 },
  input: { flex: 1, color: '#333', fontSize: 15 },
  payBtn: { backgroundColor: '#27ae60', borderRadius: 12, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secure: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 8 },
});

// ── Main screen ──
export default function BillDetailScreen({ route, navigation }) {
  const { reservation: res, bill: initialBill } = route.params;

  const [bill, setBill]           = useState(initialBill);
  const [loading, setLoading]     = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('cash'); // cash | card | qr_code
  const [showPayModal, setShowPayModal] = useState(false);

  // Bill generation form
  const [extraCharges, setExtraCharges]   = useState('0');
  const [extraDesc,    setExtraDesc]      = useState('');
  const [taxRate,      setTaxRate]        = useState('10');
  const [discountPct,  setDiscountPct]    = useState('0');

  const nights = res.check_in_date && res.check_out_date
    ? Math.ceil((new Date(res.check_out_date) - new Date(res.check_in_date)) / 86400000) : 1;

  const roomCharges   = (res.room?.price_per_night || 0) * nights;
  const extra         = parseFloat(extraCharges) || 0;
  const subtotal      = roomCharges + extra;
  const taxAmt        = subtotal * ((parseFloat(taxRate) || 10) / 100);
  const discountAmt   = subtotal * ((parseFloat(discountPct) || 0) / 100);
  const estimatedTotal = subtotal + taxAmt - discountAmt;

  // Generate bill
  const generateBill = async () => {
    setGenLoading(true);
    try {
      const { data } = await api.post('/billing', {
        reservation_id:   res._id,
        extra_charges:    parseFloat(extraCharges) || 0,
        extra_description: extraDesc,
        tax_rate:         parseFloat(taxRate) || 10,
        discount_percent: parseFloat(discountPct) || 0,
        payment_method:   payMethod,
      });
      // Fetch the created bill
      const billRes = await api.get(`/billing/reservation/${res._id}`);
      setBill(billRes.data.data);
      Alert.alert('Bill Generated! 🧾', `Total: LKR ${data.total?.toLocaleString()}`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setGenLoading(false); }
  };

  // Mark as paid
  const markPaid = async (method) => {
    if (!bill) return Alert.alert('Error', 'Please generate the bill first.');
    setLoading(true);
    try {
      await api.put(`/billing/${bill._id}/pay`, { payment_method: method });
      const billRes = await api.get(`/billing/reservation/${res._id}`);
      setBill(billRes.data.data);
      setShowPayModal(false);
      Alert.alert('Payment Confirmed! ✅', `Payment via ${method.replace('_',' ')} successful!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const Row = ({ label, value, green, bold }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, green && { color: '#27ae60' }, bold && { fontWeight: 'bold', fontSize: 16, color: COLORS.primary }]}>{value}</Text>
    </View>
  );

  const isPaid = bill?.payment_status === 'paid';

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={44} color={COLORS.accent} />
        <Text style={styles.guestName}>{res.guest_name}</Text>
        <Text style={styles.roomInfo}>Room #{res.room?.room_number}  ·  {nights} Night{nights !== 1 ? 's' : ''}</Text>
        {bill && (
          <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#eafaf1' : '#fef9e7' }]}>
            <Text style={[styles.statusText, { color: isPaid ? '#27ae60' : '#f39c12' }]}>
              {isPaid ? '✅ PAID' : '⏳ PENDING'}
            </Text>
          </View>
        )}
      </View>

      {/* Stay summary */}
      <View style={styles.card}>
        <Text style={styles.section}>📅 Stay Details</Text>
        <Row label="Check-in"  value={new Date(res.check_in_date).toDateString()} />
        <Row label="Check-out" value={new Date(res.check_out_date).toDateString()} />
        <Row label="Nights"    value={String(nights)} />
        <Row label="Rate/Night" value={`LKR ${(res.room?.price_per_night || 0).toLocaleString()}`} />
        <Row label="Room Charges" value={`LKR ${roomCharges.toLocaleString()}`} bold />
      </View>

      {/* Bill already exists */}
      {bill ? (
        <>
          <View style={styles.card}>
            <Text style={styles.section}>💰 Bill Breakdown</Text>
            <Row label="Room Charges"   value={`LKR ${(bill.room_charges || 0).toLocaleString()}`} />
            <Row label="Extra Charges"  value={`LKR ${(bill.extra_charges || 0).toLocaleString()}`} />
            {bill.extra_description ? <Text style={styles.note}>Note: {bill.extra_description}</Text> : null}
            <Row label={`Tax (${bill.tax_rate || 10}%)`} value={`LKR ${(bill.tax_amount || 0).toLocaleString()}`} />
            {bill.discount_amount > 0 && <Row label={`Discount (${bill.discount_percent}%)`} value={`- LKR ${bill.discount_amount.toLocaleString()}`} green />}
            <View style={styles.totalDivider} />
            <Row label="TOTAL" value={`LKR ${(bill.total_amount || 0).toLocaleString()}`} bold />
          </View>

          {!isPaid && (
            <View style={styles.card}>
              <Text style={styles.section}>💳 Pay Now</Text>
              {/* Payment method selector */}
              <View style={styles.methodRow}>
                {[
                  { val: 'cash',     label: '💵 Cash',       icon: 'cash-outline' },
                  { val: 'card',     label: '💳 Card',       icon: 'card-outline' },
                  { val: 'qr_code',  label: '📱 QR Pay',    icon: 'qr-code-outline' },
                ].map(m => (
                  <TouchableOpacity
                    key={m.val}
                    style={[styles.methodChip, payMethod === m.val && styles.methodChipActive]}
                    onPress={() => setPayMethod(m.val)}
                  >
                    <Text style={[styles.methodText, payMethod === m.val && styles.methodTextActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cash payment */}
              {payMethod === 'cash' && (
                <TouchableOpacity style={styles.payBtn} onPress={() => markPaid('cash')} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <><Ionicons name="cash-outline" size={20} color="#fff" /><Text style={styles.payBtnText}>  Confirm Cash Payment  •  LKR {(bill.total_amount || 0).toLocaleString()}</Text></>
                  )}
                </TouchableOpacity>
              )}

              {/* Card payment */}
              {payMethod === 'card' && (
                <CardForm amount={bill.total_amount || 0} onPay={markPaid} loading={loading} />
              )}

              {/* QR payment */}
              {payMethod === 'qr_code' && (
                <View>
                  <QRDisplay amount={bill.total_amount || 0} />
                  <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#8e44ad', marginTop: 12 }]} onPress={() => markPaid('qr_code')} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                      <><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.payBtnText}>  Confirm QR Payment Received</Text></>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {isPaid && (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <Ionicons name="checkmark-circle" size={56} color="#27ae60" />
              <Text style={styles.paidTitle}>Payment Complete!</Text>
              <Text style={styles.paidSub}>Paid via {(bill.payment_method || '').replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.paidSub}>on {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : '—'}</Text>
            </View>
          )}
        </>
      ) : (
        /* No bill yet — show generation form */
        <View style={styles.card}>
          <Text style={styles.section}>🧾 Generate Bill</Text>

          <Text style={styles.fieldLabel}>Extra Charges (LKR)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="add-circle-outline" size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#aaa" value={extraCharges} onChangeText={setExtraCharges} keyboardType="numeric" />
          </View>

          <Text style={styles.fieldLabel}>Extra Description</Text>
          <View style={styles.inputRow}>
            <Ionicons name="chatbox-outline" size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput style={styles.input} placeholder="e.g. Mini-bar, Laundry..." placeholderTextColor="#aaa" value={extraDesc} onChangeText={setExtraDesc} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Tax Rate (%)</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} placeholder="10" placeholderTextColor="#aaa" value={taxRate} onChangeText={setTaxRate} keyboardType="numeric" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Discount (%)</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#aaa" value={discountPct} onChangeText={setDiscountPct} keyboardType="numeric" />
              </View>
            </View>
          </View>

          {/* Live preview */}
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Bill Preview</Text>
            <Row label="Room Charges"  value={`LKR ${roomCharges.toLocaleString()}`} />
            <Row label="Extra"         value={`LKR ${extra.toLocaleString()}`} />
            <Row label={`Tax (${taxRate}%)`}   value={`LKR ${taxAmt.toFixed(0)}`} />
            <Row label={`Discount (${discountPct}%)`} value={`- LKR ${discountAmt.toFixed(0)}`} green />
            <View style={styles.totalDivider} />
            <Row label="ESTIMATED TOTAL" value={`LKR ${estimatedTotal.toFixed(0)}`} bold />
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={generateBill} disabled={genLoading}>
            {genLoading ? <ActivityIndicator color="#fff" /> : (
              <><Ionicons name="receipt-outline" size={20} color="#fff" /><Text style={styles.payBtnText}>  Generate Bill</Text></>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center' },
  guestName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  roomInfo: { color: '#aac4e0', fontSize: 14, marginTop: 4 },
  statusBadge: { marginTop: 10, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6 },
  statusText: { fontWeight: 'bold', fontSize: 13 },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, elevation: 3 },
  section: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 14, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderColor: '#f8f8f8' },
  rowLabel: { color: '#888', fontSize: 13 },
  rowValue: { color: '#2c3e50', fontSize: 14, fontWeight: '500' },
  note: { color: '#aaa', fontSize: 12, fontStyle: 'italic', marginVertical: 4 },
  totalDivider: { borderTopWidth: 1.5, borderColor: COLORS.primary, marginVertical: 8 },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  methodChip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f0f4f8', alignItems: 'center', borderWidth: 1, borderColor: '#dde6f0' },
  methodChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  methodText: { color: '#555', fontWeight: '700', fontSize: 12 },
  methodTextActive: { color: '#fff' },
  payBtn: { backgroundColor: COLORS.accent, borderRadius: 12, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  generateBtn: { backgroundColor: COLORS.primary, borderRadius: 12, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, elevation: 3 },
  fieldLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#dde6f0', marginBottom: 12, height: 48 },
  input: { flex: 1, color: '#333', fontSize: 14 },
  previewBox: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: '#dde6f0' },
  previewTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13, marginBottom: 8 },
  paidTitle: { fontSize: 20, fontWeight: 'bold', color: '#27ae60', marginTop: 10 },
  paidSub: { color: '#888', fontSize: 13, marginTop: 4 },
});
