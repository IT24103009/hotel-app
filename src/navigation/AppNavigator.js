// src/navigation/AppNavigator.js
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen        from '../screens/auth/LoginScreen';
import OtpScreen          from '../screens/auth/OtpScreen';
import ClientLoginScreen  from '../screens/auth/ClientLoginScreen';
import RegisterScreen     from '../screens/auth/RegisterScreen';
import DashboardScreen         from '../screens/dashboard/DashboardScreen';
import RoomListScreen          from '../screens/rooms/RoomListScreen';
import RoomDetailScreen        from '../screens/rooms/RoomDetailScreen';
import AddRoomScreen           from '../screens/rooms/AddRoomScreen';
import ReservationListScreen   from '../screens/reservations/ReservationListScreen';
import CreateReservationScreen from '../screens/reservations/CreateReservationScreen';
import ReservationDetailScreen from '../screens/reservations/ReservationDetailScreen';
import StaffListScreen         from '../screens/staff/StaffListScreen';
import AddStaffScreen          from '../screens/staff/AddStaffScreen';
import BillingListScreen       from '../screens/billing/BillingListScreen';
import BillDetailScreen        from '../screens/billing/BillDetailScreen';
import MaintenanceListScreen   from '../screens/maintenance/MaintenanceListScreen';
import AddMaintenanceScreen    from '../screens/maintenance/AddMaintenanceScreen';
import EventListScreen         from '../screens/events/EventListScreen';
import AddEventScreen          from '../screens/events/AddEventScreen';
import FeedbackScreen          from '../screens/feedback/FeedbackScreen';
import ReportsScreen           from '../screens/reports/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const COLORS = { primary: '#1a3c5e', accent: '#e8a045' };
const HEADER = { headerStyle:{backgroundColor:COLORS.primary}, headerTintColor:'#fff', headerTitleStyle:{fontWeight:'bold'} };

const DashboardStack    = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="DashboardMain"    component={DashboardScreen}         options={{title:'🏨 Dashboard'}}/></Stack.Navigator>);
const RoomsStack        = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="RoomList"         component={RoomListScreen}          options={{title:'Rooms'}}/><Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{title:'Room Details'}}/><Stack.Screen name="AddRoom" component={AddRoomScreen} options={{title:'Add / Edit Room'}}/></Stack.Navigator>);
const ReservationsStack = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="ReservationList"  component={ReservationListScreen}   options={{title:'Reservations'}}/><Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{title:'New Reservation'}}/><Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{title:'Details'}}/></Stack.Navigator>);
const StaffStack        = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="StaffList"        component={StaffListScreen}         options={{title:'Staff'}}/><Stack.Screen name="AddStaff" component={AddStaffScreen} options={{title:'Add / Edit Staff'}}/></Stack.Navigator>);
const BillingStack      = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="BillingList"      component={BillingListScreen}       options={{title:'Billing'}}/><Stack.Screen name="BillDetail" component={BillDetailScreen} options={{title:'Bill & Payment'}}/></Stack.Navigator>);
const MaintenanceStack  = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="MaintenanceList"  component={MaintenanceListScreen}   options={{title:'Maintenance'}}/><Stack.Screen name="AddMaintenance" component={AddMaintenanceScreen} options={{title:'Schedule'}}/></Stack.Navigator>);
const EventsStack       = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="EventList"        component={EventListScreen}         options={{title:'Events'}}/><Stack.Screen name="AddEvent" component={AddEventScreen} options={{title:'Add Event'}}/></Stack.Navigator>);
const FeedbackStack     = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="FeedbackMain"     component={FeedbackScreen}          options={{title:'Guest Feedback'}}/></Stack.Navigator>);
const ReportsStack      = () => (<Stack.Navigator screenOptions={HEADER}><Stack.Screen name="ReportsMain"      component={ReportsScreen}           options={{title:'Reports'}}/></Stack.Navigator>);

const TAB_ICONS = {
  Dashboard:['grid','grid-outline'], Rooms:['bed','bed-outline'], Reservations:['calendar','calendar-outline'],
  Staff:['people','people-outline'], Billing:['card','card-outline'], Maintenance:['construct','construct-outline'],
  Events:['musical-notes','musical-notes-outline'], Feedback:['star','star-outline'], Reports:['bar-chart','bar-chart-outline'],
};

function MainTabs({ user }) {
  const isClient = user?.role === 'client';
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: '#888',
      tabBarStyle: { backgroundColor: COLORS.primary, borderTopColor: '#2d5986', height: 62, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      tabBarIcon: ({ focused, color, size }) => {
        const [a, i] = TAB_ICONS[route.name] || ['ellipse','ellipse-outline'];
        return <Ionicons name={focused ? a : i} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Dashboard"    component={DashboardStack} />
      <Tab.Screen name="Rooms"        component={RoomsStack} />
      <Tab.Screen name="Reservations" component={ReservationsStack} />
      {!isClient && <Tab.Screen name="Staff"       component={StaffStack} />}
      {!isClient && <Tab.Screen name="Billing"     component={BillingStack} />}
      {!isClient && <Tab.Screen name="Maintenance" component={MaintenanceStack} />}
      <Tab.Screen name="Events"    component={EventsStack} />
      <Tab.Screen name="Feedback"  component={FeedbackStack} />
      {!isClient && <Tab.Screen name="Reports" component={ReportsStack} />}
    </Tab.Navigator>
  );
}

const AuthStack = () => (
  <Stack.Navigator screenOptions={HEADER}>
    <Stack.Screen name="Login"       component={LoginScreen}       options={{title:'Staff Login', headerLeft:()=>null}} />
    <Stack.Screen name="OTP"         component={OtpScreen}         options={{title:'Verify OTP'}} />
    <Stack.Screen name="ClientLogin" component={ClientLoginScreen} options={{title:'Guest Login'}} />
    <Stack.Screen name="Register"    component={RegisterScreen}    options={{title:'Create Account'}} />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:COLORS.primary}}><ActivityIndicator size="large" color={COLORS.accent}/></View>;
  return <NavigationContainer>{user ? <MainTabs user={user}/> : <AuthStack/>}</NavigationContainer>;
}
