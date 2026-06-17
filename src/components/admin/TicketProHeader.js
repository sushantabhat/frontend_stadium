import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

export default function TicketProHeader({ showLive = false, rightAction }) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
        <Text style={styles.name}>TICKETPRO</Text>
      </View>
      <View style={styles.right}>
        {showLive && (
          <View style={styles.live}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {rightAction}
      </View>
    </View>
  );
}

export function AdminPageTitle({ eyebrow, title, action }) {
  return (
    <View style={titleStyles.row}>
      <View style={titleStyles.text}>
        {eyebrow ? <Text style={titleStyles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={titleStyles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function AdminSearchBar({
  value,
  onChangeText,
  placeholder,
  onClear,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={searchStyles.bar}>
      <Text style={searchStyles.icon}>⌕</Text>
      <TextInput
        style={searchStyles.input}
        placeholder={placeholder}
        placeholderTextColor={glass.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Text style={searchStyles.clear}>×</Text>
        </TouchableOpacity>
      ) : null}
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={8}>
          <Text style={searchStyles.filter}>{rightIcon}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
export function AdminFilterPills({ options, value, onChange, scrollable = true }) {
  const content = (
    <View style={pillStyles.row}>
      {options.map((opt) => {
        const key = opt.key ?? opt;
        const label = opt.label ?? opt;
        const active = value === key;
        return (
          <TouchableOpacity
            key={String(key)}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
          >
            <Text style={[pillStyles.text, active && pillStyles.textActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!scrollable) return content;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pillStyles.scroll}>
      {options.map((opt) => {
        const key = opt.key ?? opt;
        const label = opt.label ?? opt;
        const active = value === key;
        return (
          <TouchableOpacity
            key={String(key)}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
          >
            <Text style={[pillStyles.text, active && pillStyles.textActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function AdminCard({ children, style }) {
  return <View style={[cardStyles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: glass.brandPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  name: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: glass.statusSuccessFill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: glass.statusSuccessText,
  },
  liveText: {
    color: glass.statusSuccessText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});

const titleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  text: { flex: 1 },
  eyebrow: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});

const searchStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: glass.card,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: glass.border,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  icon: { color: glass.textMuted, fontSize: 16, fontWeight: '600' },
  input: { flex: 1, color: colors.textPrimary, fontSize: typography.body.fontSize, paddingVertical: spacing.md },
  clear: { color: glass.textMuted, fontSize: 18, fontWeight: '500' },
  filter: { color: glass.textMuted, fontSize: 16 },
});

const pillStyles = StyleSheet.create({
  scroll: { gap: spacing.sm, paddingBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    backgroundColor: glass.card,
    borderWidth: 1,
    borderColor: glass.border,
  },
  pillActive: { backgroundColor: glass.brandPurple, borderColor: glass.brandPurple },
  text: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700' },
  textActive: { color: '#FFF' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: glass.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
  },
});
