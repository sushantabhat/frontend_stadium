import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchUsers, createUser } from '../../services/adminService';

const ROLES = ['user', 'staff', 'admin'];
const ROLE_COLORS = { user: colors.primary, staff: colors.success, admin: colors.accent };

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [filter, setFilter] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchUsers(filter);
      setUsers(data);
    } catch (e) {
      console.log('Users error:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  React.useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = () => { setIsRefreshing(true); loadData(); };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing fields', 'Name, email, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setCreating(true);
    try {
      await createUser(form);
      Alert.alert('Success', `${form.name} has been created as ${form.role}.`);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'user' });
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const totalFans = users.filter(u => u.role === 'user').length;
  const totalStaff = users.filter(u => u.role === 'staff').length;
  const totalAdmin = users.filter(u => u.role === 'admin').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Users"
        subtitle="Manage accounts"
        rightAction={<TouchableOpacity onPress={() => setShowCreate(true)} activeOpacity={0.7}><Text style={styles.addBtn}>+ Add</Text></TouchableOpacity>}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Stats */}
        <View style={styles.statRow}>
          {[
            { label: 'Fans', value: String(totalFans), icon: '🎟️', color: colors.primary },
            { label: 'Staff', value: String(totalStaff), icon: '🛡️', color: colors.success },
            { label: 'Admins', value: String(totalAdmin), icon: '👑', color: colors.accent },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {[null, 'user', 'staff', 'admin'].map((r) => (
            <TouchableOpacity
              key={r || 'all'}
              style={[styles.filterPill, filter === r && styles.filterPillActive]}
              onPress={() => { setFilter(r); setIsLoading(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === r && styles.filterTextActive]}>
                {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User list */}
        {isLoading ? (
          <View style={styles.loadingWrap}><ActivityIndicator color={colors.primary} /></View>
        ) : users.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {users.map((user, idx) => (
              <View key={user._id || idx} style={[styles.userItem, idx < users.length - 1 && styles.userItemBorder]}>
                <View style={styles.userLeft}>
                  <View style={[styles.userAvatar, { backgroundColor: `${ROLE_COLORS[user.role]}20` }]}>
                    <Text style={[styles.userInitial, { color: ROLE_COLORS[user.role] }]}>
                      {(user.name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.userRight}>
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[user.role]}20`, borderColor: `${ROLE_COLORS[user.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create User</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)} activeOpacity={0.7}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={colors.textMuted}
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(t) => setForm({ ...form, email: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={form.password}
                  onChangeText={(t) => setForm({ ...form, password: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleOption, form.role === r && { backgroundColor: `${ROLE_COLORS[r]}25`, borderColor: `${ROLE_COLORS[r]}40` }]}
                      onPress={() => setForm({ ...form, role: r })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roleOptionText, form.role === r && { color: ROLE_COLORS[r] }]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreate}
              disabled={creating}
              activeOpacity={0.85}
            >
              <LinearGradient colors={colors.gradientPurple} style={styles.createBtnInner}>
                {creating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.createBtnText}>Create User</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.md },

  addBtn: { color: colors.primaryLight, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  statRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: spacing.sm },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  statLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600' },

  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  filterPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.primarySurface, borderColor: `${colors.primary}40` },
  filterText: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  filterTextActive: { color: colors.primaryLight },

  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },

  listCard: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, marginHorizontal: spacing.xl, overflow: 'hidden' },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2 },
  userItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  userAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  userEmail: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  userRight: {},
  rolePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  roleText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },

  formGroup: { marginBottom: spacing.xl },
  formLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surfaceElevated, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, borderRadius: radii.md, fontSize: typography.body.fontSize, borderWidth: 1, borderColor: colors.border },

  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleOption: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  roleOptionText: { color: colors.textMuted, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  createBtn: { borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.md },
  createBtnInner: { paddingVertical: spacing.lg, alignItems: 'center' },
  createBtnText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
