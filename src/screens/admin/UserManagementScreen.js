import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/adminService';

/* ─── Role & Status Constants ─── */
const ROLES = ['user', 'staff', 'supervisor', 'admin'];
const ROLE_COLORS = { user: glass.neonCyan, staff: glass.statusSuccessText, supervisor: glass.neonMagenta, admin: glass.neonAmber };
const STATUS_COLORS = { active: glass.statusSuccessText, suspended: glass.statusDangerText };
const FILTERS = [
  { key: null, label: 'All' },
  { key: 'user', label: 'Fans' },
  { key: 'staff', label: 'Staff' },
  { key: 'supervisor', label: 'Supervisors' },
  { key: 'admin', label: 'Admins' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

/* ─── Helper: Format date string ─── */
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UserManagementScreen() {
  /* ── Preserved: All state hooks ── */
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

  /* ── Preserved: Data loading callback ── */
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

  /* ── Preserved: Effect-based initial load + refresh handler ── */
  React.useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = () => { setIsRefreshing(true); loadData(); };

  /* ── Preserved: Filtered users memo ── */
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

  /* ── Preserved: Derived stats memo ── */
  const stats = useMemo(() => ({
    total: users.length,
    fans: users.filter(u => u.role === 'user').length,
    staff: users.filter(u => u.role === 'staff').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
  }), [users]);

  /* ── Preserved: CRUD handlers ── */
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

  /* ── Preserved: Initials helper ── */
  const getInitial = (name) => (name || '?')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="User Permissions"
        subtitle="Staff accounts & security access control"
        rightAction={
          <TouchableOpacity onPress={() => setShowCreate(true)} activeOpacity={0.7}>
            <LinearGradient
              colors={[glass.neonCyan, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addBtnGradient}
            >
              <Text style={styles.addBtn}>+ Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={glass.neonCyan} colors={[glass.neonCyan]} />}
      >
        {/* ═══ STATS GRID ═══ */}
        <View style={styles.statRow}>
          {[
            { label: 'Total', value: stats.total, icon: '👥', color: colors.textPrimary },
            { label: 'Fans', value: stats.fans, icon: '🎟️', color: glass.neonCyan },
            { label: 'Staff', value: stats.staff, icon: '🛡️', color: glass.statusSuccessText },
            { label: 'Supv', value: stats.supervisors, icon: '📋', color: glass.neonMagenta },
            { label: 'Admins', value: stats.admins, icon: '👑', color: glass.neonAmber },
            { label: 'Active', value: stats.active, icon: '🟢', color: glass.statusSuccessText },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statInner}
              >
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* ═══ SEARCH BAR ═══ */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or role..."
            placeholderTextColor={glass.textMuted}
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

        {/* ═══ FILTER PILLS ═══ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key || 'all'}
              style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              {filter === f.key ? (
                <LinearGradient
                  colors={[glass.neonCyan, glass.neonPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterPillGradient}
                >
                  <Text style={styles.filterTextActive}>{f.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>{f.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ═══ USER GRID CARDS ═══ */}
        {isLoading ? (
          <View style={styles.loadingWrap}><ActivityIndicator color={glass.neonCyan} /></View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map((user, idx) => (
            <TouchableOpacity
              key={user._id || idx}
              style={styles.userCard}
              onPress={() => setShowDetail(user)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.userCardInner}
              >
                {/* Left: Initials badge */}
                <View style={[styles.userAvatar, { borderColor: `${ROLE_COLORS[user.role]}40` }]}>
                  <LinearGradient
                    colors={[`${ROLE_COLORS[user.role]}30`, `${ROLE_COLORS[user.role]}10`]}
                    style={styles.userAvatarInner}
                  >
                    <Text style={[styles.userInitial, { color: ROLE_COLORS[user.role] }]}>
                      {getInitial(user.name)}
                    </Text>
                  </LinearGradient>
                </View>

                {/* Center: Multi-line metadata */}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userMeta}>Joined {formatDate(user.createdAt)}</Text>
                </View>

                {/* Right: Role badge + status dot */}
                <View style={styles.userRight}>
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[user.role]}18`, borderColor: `${ROLE_COLORS[user.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>{user.role.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[user.status] || glass.statusSuccessText }]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      {/* ═══ DETAIL MODAL ═══ */}
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
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[showDetail.role]}18`, borderColor: `${ROLE_COLORS[showDetail.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[showDetail.role] }]}>{showDetail.role.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[showDetail.status] || glass.statusSuccessText}18`, borderColor: `${STATUS_COLORS[showDetail.status] || glass.statusSuccessText}30` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[showDetail.status] || glass.statusSuccessText }]}>{(showDetail.status || 'active').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.detailMeta}>Joined {formatDate(showDetail.createdAt)}</Text>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailActionBtn} onPress={() => { setShowDetail(null); openEdit(showDetail); }} activeOpacity={0.7}>
                    <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} style={styles.detailActionInner}>
                      <Text style={styles.detailActionIcon}>✏️</Text>
                      <Text style={styles.detailActionLabel}>Edit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailActionBtn} onPress={() => { setShowDetail(null); setShowDelete(showDetail); }} activeOpacity={0.7}>
                    <LinearGradient colors={[glass.statusDangerFill, 'rgba(255,23,68,0.04)']} style={styles.detailActionInner}>
                      <Text style={styles.detailActionIcon}>🗑️</Text>
                      <Text style={[styles.detailActionLabel, { color: glass.statusDangerText }]}>Delete</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ═══ EDIT MODAL ═══ */}
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
                    <TouchableOpacity key={r} style={[styles.roleOption, editForm.role === r && { backgroundColor: `${ROLE_COLORS[r]}20`, borderColor: `${ROLE_COLORS[r]}40` }]} onPress={() => setEditForm({ ...editForm, role: r })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, editForm.role === r && { color: ROLE_COLORS[r] }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>STATUS</Text>
                <View style={styles.roleRow}>
                  {['active', 'suspended'].map((s) => (
                    <TouchableOpacity key={s} style={[styles.roleOption, editForm.status === s && { backgroundColor: `${STATUS_COLORS[s]}20`, borderColor: `${STATUS_COLORS[s]}40` }]} onPress={() => setEditForm({ ...editForm, status: s })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, editForm.status === s && { color: STATUS_COLORS[s] }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.createBtn} onPress={handleEdit} disabled={saving} activeOpacity={0.85}>
              <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnInner}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.createBtnText}>Save Changes</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
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

      {/* ═══ CREATE USER MODAL ═══ */}
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
                <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={glass.textMuted} value={createForm.name} onChangeText={(t) => setCreateForm({ ...createForm, name: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EMAIL</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor={glass.textMuted} keyboardType="email-address" autoCapitalize="none" value={createForm.email} onChangeText={(t) => setCreateForm({ ...createForm, email: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PASSWORD</Text>
                <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor={glass.textMuted} secureTextEntry value={createForm.password} onChangeText={(t) => setCreateForm({ ...createForm, password: t })} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity key={r} style={[styles.roleOption, createForm.role === r && { backgroundColor: `${ROLE_COLORS[r]}20`, borderColor: `${ROLE_COLORS[r]}40` }]} onPress={() => setCreateForm({ ...createForm, role: r })} activeOpacity={0.7}>
                      <Text style={[styles.roleOptionText, createForm.role === r && { color: ROLE_COLORS[r] }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating} activeOpacity={0.85}>
              <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnInner}>
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
  /* ── Canvas ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingTop: spacing.md },

  /* ── Add button ── */
  addBtnGradient: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: radii.lg, minHeight: 36, alignItems: 'center', justifyContent: 'center',
  },
  addBtn: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  /* ── Stats Grid ── */
  statRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  statCard: { flex: 1, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  statInner: { padding: spacing.md, alignItems: 'center' },
  statIcon: { fontSize: 14, marginBottom: spacing.xs },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  statLabel: { color: glass.textMuted, fontSize: 8, fontWeight: '600' },

  /* ── Search ── */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    backgroundColor: glass.surface, borderRadius: radii.md, borderWidth: 1, borderColor: glass.border,
    paddingHorizontal: spacing.lg, height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.caption.fontSize },
  searchClear: { color: glass.textMuted, fontSize: 14, marginLeft: spacing.sm },

  /* ── Filter Pills ── */
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  filterPill: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full,
    backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border,
  },
  filterPillActive: { borderWidth: 0, padding: 0, paddingHorizontal: 0, paddingVertical: 0 },
  filterPillGradient: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
  },
  filterText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },

  /* ── User Cards (isolated grid, not compressed list) ── */
  userCard: {
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border,
  },
  userCardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.xl, gap: spacing.lg,
  },

  /* Left: Initials badge with high-contrast outline */
  userAvatar: {
    width: 48, height: 48, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1.5,
  },
  userAvatarInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  /* Center: Multi-line metadata */
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', marginBottom: 2 },
  userEmail: { color: glass.textMuted, fontSize: 9, marginBottom: 2 },
  userMeta: { color: glass.textSecondary, fontSize: 8, fontFamily: glass.monoFont },

  /* Right: Role pill + status dot */
  userRight: { alignItems: 'flex-end', gap: spacing.sm },
  rolePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  roleText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  /* ═══ MODAL SHARED ═══ */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, maxHeight: '85%', borderWidth: 1, borderColor: glass.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: glass.textMuted, fontSize: 20, fontWeight: '600' },

  /* ── Detail Modal ── */
  detailAvatar: { alignItems: 'center', marginBottom: spacing.lg },
  detailAvatarInner: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  detailName: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs },
  detailEmail: { color: glass.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center', marginBottom: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  statusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  detailMeta: { color: glass.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', marginBottom: spacing.xxl },
  detailActions: { flexDirection: 'row', gap: spacing.md },
  detailActionBtn: { flex: 1, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  detailActionInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  detailActionIcon: { fontSize: 16 },
  detailActionLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  /* ── Delete Modal ── */
  deleteCard: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: glass.border,
  },
  deleteIcon: { fontSize: 40, marginBottom: spacing.lg },
  deleteTitle: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', marginBottom: spacing.md },
  deleteMsg: { color: glass.textSecondary, fontSize: typography.caption.fontSize, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl },
  deleteActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  deleteCancel: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border,
  },
  deleteCancelText: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  deleteConfirm: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.md, alignItems: 'center', backgroundColor: glass.statusDangerText },
  deleteConfirmText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  /* ── Forms ── */
  formGroup: { marginBottom: spacing.xl },
  formLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.md, fontSize: typography.body.fontSize,
    borderWidth: 1, borderColor: glass.border,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleOption: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: glass.border,
  },
  roleOptionText: { color: glass.textMuted, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  createBtn: { borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.md },
  createBtnInner: { paddingVertical: spacing.lg, alignItems: 'center' },
  createBtnText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
