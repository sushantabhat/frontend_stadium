import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import FAB from '../../components/FAB';
import { AdminCard, AdminFilterPills, AdminSearchBar } from '../../components/admin/TicketProHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/adminService';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const ROLES = ['user', 'staff', 'supervisor', 'admin'];
const ROLE_LABELS = { user: 'Fan', staff: 'Staff', supervisor: 'Organizer', admin: 'VIP' };
const ROLE_COLORS = {
  user: '#4F8EF7',
  staff: glass.statusSuccessText,
  supervisor: '#F59E0B',
  admin: glass.brandPurple,
};
const AVATAR_COLORS = ['#4F8EF7', '#F59E0B', glass.brandPurple, '#22C55E', '#EC4899'];
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'Fans' },
  { key: 'staff', label: 'Staff' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kathmandu' });
}

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function UserManagementScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', status: 'active' });

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.log('Users error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  const filteredUsers = useMemo(() => {
    let list = users;
    if (filter === 'active') list = list.filter((u) => u.status === 'active');
    else if (filter === 'suspended') list = list.filter((u) => u.status === 'suspended');
    else if (filter && filter !== 'all') list = list.filter((u) => u.role === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  const stats = useMemo(() => ({
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    thisMonth: users.filter((u) => isThisMonth(u.createdAt)).length,
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

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DashboardHeader
          topLabel="MANAGEMENT"
          title="Users"
          avatarColors={['#FFD700', '#FFA000']}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('AdminProfile')}
        />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
      >

        <AdminCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: glass.statusSuccessText }]}>{stats.active.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: glass.statusDangerText }]}>{stats.suspended}</Text>
              <Text style={styles.statLabel}>Suspended</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4F8EF7' }]}>+{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>This month</Text>
            </View>
          </View>
        </AdminCard>

        <TouchableOpacity style={styles.shiftLink} onPress={() => navigation.navigate('AdminStaffShifts')} activeOpacity={0.7}>
          <Text style={styles.shiftLinkIcon}>📋</Text>
          <Text style={styles.shiftLinkText}>Manage Staff Shifts</Text>
          <Text style={styles.shiftLinkArrow}>→</Text>
        </TouchableOpacity>

        <AdminSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          onClear={() => setSearch('')}
          rightIcon="⫶"
        />

        <AdminFilterPills options={FILTERS} value={filter} onChange={setFilter} />

        <AdminCard>
          {isLoading ? (
            <View style={styles.loading}><ActivityIndicator color={glass.brandPurple} /></View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          ) : (
            filteredUsers.map((user, idx) => {
              const roleColor = ROLE_COLORS[user.role] || glass.textSecondary;
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isActive = user.status !== 'suspended';
              return (
                <TouchableOpacity
                  key={user._id || idx}
                  style={[styles.userRow, idx < filteredUsers.length - 1 && styles.userRowBorder]}
                  onPress={() => setShowDetail(user)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.avatar, { backgroundColor: `${avatarColor}22` }]}>
                    <Text style={[styles.avatarText, { color: avatarColor }]}>{getInitials(user.name)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]}>
                        <Text style={[styles.roleText, { color: roleColor }]}>{ROLE_LABELS[user.role] || user.role}</Text>
                      </View>
                      <Text style={styles.spentText}>Joined {formatDate(user.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.userRight}>
                    <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusSuspended]}>
                      <Text style={[styles.statusText, { color: isActive ? glass.statusSuccessText : glass.statusDangerText }]}>
                        {isActive ? 'Active' : 'Suspended'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowDetail(user)}
                      hitSlop={8}
                      style={styles.menuBtn}
                    >
                      <Text style={styles.menuIcon}>···</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </AdminCard>
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(null)}><Text style={styles.modalClose}>×</Text></TouchableOpacity>
            </View>
            {showDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{getInitials(showDetail.name)}</Text>
                </View>
                <Text style={styles.detailName}>{showDetail.name}</Text>
                <Text style={styles.detailEmail}>{showDetail.email}</Text>
                <Text style={styles.detailMeta}>Joined {formatDate(showDetail.createdAt)}</Text>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailBtn} onPress={() => { setShowDetail(null); openEdit(showDetail); }}>
                    <Text style={styles.detailBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailBtn, styles.detailBtnDanger]} onPress={() => { setShowDetail(null); setShowDelete(showDetail); }}>
                    <Text style={[styles.detailBtnText, { color: glass.statusDangerText }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit modal */}
      <Modal visible={!!showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setShowEdit(null)}><Text style={styles.modalClose}>×</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>NAME</Text>
              <TextInput style={styles.input} value={editForm.name} onChangeText={(t) => setEditForm({ ...editForm, name: t })} />
              <Text style={styles.formLabel}>EMAIL</Text>
              <TextInput style={styles.input} value={editForm.email} onChangeText={(t) => setEditForm({ ...editForm, email: t })} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.formLabel}>ROLE</Text>
              <View style={styles.optionRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity key={r} style={[styles.option, editForm.role === r && styles.optionActive]} onPress={() => setEditForm({ ...editForm, role: r })}>
                    <Text style={[styles.optionText, editForm.role === r && styles.optionTextActive]}>{ROLE_LABELS[r]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.formLabel}>STATUS</Text>
              <View style={styles.optionRow}>
                {['active', 'suspended'].map((s) => (
                  <TouchableOpacity key={s} style={[styles.option, editForm.status === s && styles.optionActive]} onPress={() => setEditForm({ ...editForm, status: s })}>
                    <Text style={[styles.optionText, editForm.status === s && styles.optionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleEdit} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete modal */}
      <Modal visible={!!showDelete} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteCard}>
            <Text style={styles.deleteTitle}>Delete User</Text>
            <Text style={styles.deleteMsg}>Remove {showDelete?.name}? This cannot be undone.</Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDelete(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDelete} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.confirmText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create User</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}><Text style={styles.modalClose}>×</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>NAME</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={glass.textMuted} value={createForm.name} onChangeText={(t) => setCreateForm({ ...createForm, name: t })} />
              <Text style={styles.formLabel}>EMAIL</Text>
              <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor={glass.textMuted} keyboardType="email-address" autoCapitalize="none" value={createForm.email} onChangeText={(t) => setCreateForm({ ...createForm, email: t })} />
              <Text style={styles.formLabel}>PASSWORD</Text>
              <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor={glass.textMuted} secureTextEntry value={createForm.password} onChangeText={(t) => setCreateForm({ ...createForm, password: t })} />
              <Text style={styles.formLabel}>ROLE</Text>
              <View style={styles.optionRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity key={r} style={[styles.option, createForm.role === r && styles.optionActive]} onPress={() => setCreateForm({ ...createForm, role: r })}>
                    <Text style={[styles.optionText, createForm.role === r && styles.optionTextActive]}>{ROLE_LABELS[r]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Create User</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FAB icon="+" label="Add" onPress={() => setShowCreate(true)} />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  statsCard: { marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: glass.border },
  loading: { paddingVertical: spacing.xxl, alignItems: 'center' },
  empty: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyTitle: { color: glass.textMuted, fontSize: typography.body.fontSize, fontWeight: '600' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  userRowBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: 2 },
  userEmail: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.sm },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  roleBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  roleText: { fontSize: 10, fontWeight: '800' },
  spentText: { color: glass.textMuted, fontSize: 10, fontWeight: '600' },
  userRight: { alignItems: 'flex-end', gap: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  statusActive: { backgroundColor: glass.statusSuccessFill },
  statusSuspended: { backgroundColor: glass.statusDangerFill },
  statusText: { fontSize: 10, fontWeight: '800' },
  menuBtn: { paddingHorizontal: 4 },
  menuIcon: { color: glass.textMuted, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%', borderWidth: 1, borderColor: glass.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: glass.textMuted, fontSize: 24, fontWeight: '400' },
  detailAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: glass.brandPurpleSurface, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  detailAvatarText: { color: glass.brandPurple, fontSize: 22, fontWeight: '900' },
  detailName: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs },
  detailEmail: { color: glass.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center', marginBottom: spacing.sm },
  detailMeta: { color: glass.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', marginBottom: spacing.xl },
  detailActions: { flexDirection: 'row', gap: spacing.md },
  detailBtn: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.lg, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.border, alignItems: 'center' },
  detailBtnDanger: { borderColor: 'rgba(255,23,68,0.2)' },
  detailBtnText: { color: colors.textPrimary, fontWeight: '700' },
  formLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: glass.card, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: glass.border, fontSize: typography.body.fontSize },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.border },
  optionActive: { backgroundColor: glass.brandPurpleSurface, borderColor: glass.brandPurple },
  optionText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '700', textTransform: 'capitalize' },
  optionTextActive: { color: glass.brandPurple },
  saveBtn: { backgroundColor: glass.brandPurple, borderRadius: radii.lg, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: '#FFF', fontWeight: '800' },
  deleteCard: { backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, borderWidth: 1, borderColor: glass.border },
  deleteTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.sm },
  deleteMsg: { color: glass.textSecondary, marginBottom: spacing.xl },
  deleteActions: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.lg, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.border, alignItems: 'center' },
  cancelText: { color: colors.textPrimary, fontWeight: '700' },
  confirmBtn: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.lg, backgroundColor: glass.statusDangerText, alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: '700' },
  shiftLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: spacing.xl, marginBottom: spacing.lg, padding: spacing.lg, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  shiftLinkIcon: { fontSize: 18 },
  shiftLinkText: { flex: 1, color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  shiftLinkArrow: { color: colors.textMuted, fontSize: 16 },
});
