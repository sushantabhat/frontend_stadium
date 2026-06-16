import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/adminService';

const ROLES = ['user', 'staff', 'admin'];
const ROLE_COLORS = { user: colors.primary, staff: colors.success, admin: colors.accent };
const STATUS_COLORS = { active: colors.success, suspended: colors.danger };
const FILTERS = [
  { key: null, label: 'All' },
  { key: 'user', label: 'Fans' },
  { key: 'staff', label: 'Staff' },
  { key: 'admin', label: 'Admins' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', status: 'active' });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.log('Users error:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = () => { setIsRefreshing(true); loadData(); };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (filter === 'active') list = list.filter(u => u.status === 'active');
    else if (filter === 'suspended') list = list.filter(u => u.status === 'suspended');
    else if (filter) list = list.filter(u => u.role === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  const stats = useMemo(() => ({
    total: users.length,
    fans: users.filter(u => u.role === 'user').length,
    staff: users.filter(u => u.role === 'staff').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
  }), [users]);

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      Alert.alert('Missing fields', 'Name, email, and password are required.');
      return;
    }
    if (createForm.password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setCreating(true);
    try {
      await createUser(createForm);
      Alert.alert('Success', `${createForm.name} has been created.`);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      Alert.alert('Missing fields', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateUser(showEdit._id, editForm);
      Alert.alert('Success', 'User updated.');
      setShowEdit(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUser(showDelete._id);
      Alert.alert('Deleted', `${showDelete.name} has been removed.`);
      setShowDelete(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (user) => {
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status || 'active' });
    setShowEdit(user);
  };

  const getInitial = (name) => (name || '?')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Users"
        subtitle="Manage accounts"
        rightAction={
          <TouchableOpacity onPress={() => setShowCreate(true)} activeOpacity={0.7}>
            <Text style={styles.addBtn}>+ Add</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Stats */}
        <View style={styles.statRow}>
          {[
            { label: 'Total', value: stats.total, icon: '👥', color: colors.textPrimary },
            { label: 'Fans', value: stats.fans, icon: '🎟️', color: colors.primary },
            { label: 'Staff', value: stats.staff, icon: '🛡️', color: colors.success },
            { label: 'Admins', value: stats.admins, icon: '👑', color: colors.accent },
            { label: 'Active', value: stats.active, icon: '🟢', color: colors.success },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or role..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key || 'all'}
              style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* User list */}
        {isLoading ? (
          <View style={styles.loadingWrap}><ActivityIndicator color={colors.primary} /></View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filteredUsers.map((user, idx) => (
              <TouchableOpacity
                key={user._id || idx}
                style={[styles.userItem, idx < filteredUsers.length - 1 && styles.userItemBorder]}
                onPress={() => setShowDetail(user)}
                activeOpacity={0.7}
              >
                <View style={styles.userLeft}>
                  <View style={[styles.userAvatar, { backgroundColor: `${ROLE_COLORS[user.role]}20` }]}>
                    <Text style={[styles.userInitial, { color: ROLE_COLORS[user.role] }]}>{getInitial(user.name)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.userRight}>
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[user.role]}20`, borderColor: `${ROLE_COLORS[user.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>{user.role.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[user.status] || colors.success }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(null)} activeOpacity={0.7}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {showDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailAvatar}>
                  <LinearGradient colors={[`${ROLE_COLORS[showDetail.role]}40`, `${ROLE_COLORS[showDetail.role]}15`]} style={styles.detailAvatarInner}>
                    <Text style={styles.detailAvatarText}>{getInitial(showDetail.name)}</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.detailName}>{showDetail.name}</Text>
                <Text style={styles.detailEmail}>{showDetail.email}</Text>
                <View style={styles.detailRow}>
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[showDetail.role]}20`, borderColor: `${ROLE_COLORS[showDetail.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[showDetail.role] }]}>{showDetail.role.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[showDetail.status] || colors.success}20`, borderColor: `${STATUS_COLORS[showDetail.status] || colors.success}30` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[showDetail.status] || colors.success }]}>{(showDetail.status || 'active').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.detailMeta}>Joined {formatDate(showDetail.createdAt)}</Text>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailActionBtn} onPress={() => { setShowDetail(null); openEdit(showDetail); }} activeOpacity={0.7}>
                    <LinearGradient colors={[`${colors.primary}25`, `${colors.primary}10`]} style={styles.detailActionInner}>
                      <Text style={styles.detailActionIcon}>✏️</Text>
                      <Text style={styles.detailActionLabel}>Edit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailActionBtn} onPress={() => { setShowDetail(null); setShowDelete(showDetail); }} activeOpacity={0.7}>
                    <LinearGradient colors={[`${colors.danger}25`, `${colors.danger}10`]} style={styles.detailActionInner}>
                      <Text style={styles.detailActionIcon}>🗑️</Text>
                      <Text style={[styles.detailActionLabel, { color: colors.danger }]}>Delete</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setShowEdit(null)} activeOpacity={0.7}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>NAME</Text>
                <TextInput style={styles.input} value={editForm.name} onChangeText={(t) => setEditForm({ ...editForm, name: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EMAIL</Text>
                <TextInput style={styles.input} value={editForm.email} onChangeText={(t) => setEditForm({ ...editForm, email: t })} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity key={r} style={[styles.roleOption, editForm.role === r && { backgroundColor: `${ROLE_COLORS[r]}25`, borderColor: `${ROLE_COLORS[r]}40` }]} onPress={() => setEditForm({ ...editForm, role: r })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, editForm.role === r && { color: ROLE_COLORS[r] }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>STATUS</Text>
                <View style={styles.roleRow}>
                  {['active', 'suspended'].map((s) => (
                    <TouchableOpacity key={s} style={[styles.roleOption, editForm.status === s && { backgroundColor: `${STATUS_COLORS[s]}25`, borderColor: `${STATUS_COLORS[s]}40` }]} onPress={() => setEditForm({ ...editForm, status: s })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, editForm.status === s && { color: STATUS_COLORS[s] }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.createBtn} onPress={handleEdit} disabled={saving} activeOpacity={0.85}>
              <LinearGradient colors={colors.gradientPurple} style={styles.createBtnInner}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.createBtnText}>Save Changes</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!showDelete} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteCard}>
            <Text style={styles.deleteIcon}>⚠️</Text>
            <Text style={styles.deleteTitle}>Delete User</Text>
            <Text style={styles.deleteMsg}>
              Are you sure you want to delete <Text style={{ fontWeight: '800' }}>{showDelete?.name}</Text>?{'\n\n'}This action is irreversible and all their data will be permanently removed.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.deleteCancel} onPress={() => setShowDelete(null)} activeOpacity={0.7}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirm} onPress={handleDelete} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.deleteConfirmText}>Delete Permanently</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textMuted} value={createForm.name} onChangeText={(t) => setCreateForm({ ...createForm, name: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EMAIL</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={createForm.email} onChangeText={(t) => setCreateForm({ ...createForm, email: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PASSWORD</Text>
                <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor={colors.textMuted} secureTextEntry value={createForm.password} onChangeText={(t) => setCreateForm({ ...createForm, password: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity key={r} style={[styles.roleOption, createForm.role === r && { backgroundColor: `${ROLE_COLORS[r]}25`, borderColor: `${ROLE_COLORS[r]}40` }]} onPress={() => setCreateForm({ ...createForm, role: r })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, createForm.role === r && { color: ROLE_COLORS[r] }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating} activeOpacity={0.85}>
              <LinearGradient colors={colors.gradientPurple} style={styles.createBtnInner}>
                {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.createBtnText}>Create User</Text>}
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

  // Stats
  statRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' },
  statIcon: { fontSize: 14, marginBottom: spacing.xs },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  statLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600' },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.caption.fontSize },
  searchClear: { color: colors.textMuted, fontSize: 14, marginLeft: spacing.sm },

  // Filters
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  filterPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.primarySurface, borderColor: `${colors.primary}40` },
  filterText: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  filterTextActive: { color: colors.primaryLight },

  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },

  // List
  listCard: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, marginHorizontal: spacing.xl, overflow: 'hidden' },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2 },
  userItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  userAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  userEmail: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  userRight: { alignItems: 'flex-end', gap: spacing.xs },
  rolePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  roleText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  // Modal shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },

  // Detail modal
  detailAvatar: { alignItems: 'center', marginBottom: spacing.lg },
  detailAvatarInner: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  detailName: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs },
  detailEmail: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center', marginBottom: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  statusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  detailMeta: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', marginBottom: spacing.xxl },
  detailActions: { flexDirection: 'row', gap: spacing.md },
  detailActionBtn: { flex: 1, borderRadius: radii.lg, overflow: 'hidden' },
  detailActionInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  detailActionIcon: { fontSize: 16 },
  detailActionLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  // Delete modal
  deleteCard: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, alignItems: 'center' },
  deleteIcon: { fontSize: 40, marginBottom: spacing.lg },
  deleteTitle: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', marginBottom: spacing.md },
  deleteMsg: { color: colors.textSecondary, fontSize: typography.caption.fontSize, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl },
  deleteActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  deleteCancel: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  deleteCancelText: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  deleteConfirm: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.danger },
  deleteConfirmText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  // Forms
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
