const VALID_TLDS = [
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
  'co', 'io', 'me', 'app', 'dev', 'tech', 'online', 'site', 'store', 'blog',
  'uk', 'us', 'ca', 'au', 'in', 'de', 'fr', 'jp', 'br', 'nl', 'it', 'es',
  'ru', 'cn', 'kr', 'se', 'no', 'fi', 'dk', 'pl', 'cz', 'at', 'ch',
  'ie', 'nz', 'za', 'mx', 'ar', 'cl', 'pt', 'gr', 'tr', 'il', 'sg',
  'hk', 'tw', 'th', 'ph', 'my', 'id', 'vn', 'pk', 'bd', 'lk',
  'info', 'biz', 'name', 'pro', 'mobi', 'travel', 'museum', 'aero',
  'coop', 'jobs', 'cat', 'tel', 'asia', 'xxx',
];

const COMMON_DOMAIN_TYPOS = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.om': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'iclod.com': 'icloud.com',
  'icoud.com': 'icloud.com',
};

function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const trimmed = email.trim().toLowerCase();

  // Must contain exactly one @
  const atIndex = trimmed.indexOf('@');
  if (atIndex === -1 || trimmed.indexOf('@', atIndex + 1) !== -1) {
    return 'Invalid email format';
  }

  // Basic format check
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return 'Invalid email format';
  }

  const parts = trimmed.split('@');
  const localPart = parts[0];
  const domain = parts[1];

  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return 'Invalid email format';
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Invalid email format';
  }
  if (localPart.includes('..')) {
    return 'Invalid email format';
  }

  // Domain validation
  if (!domain || !domain.includes('.')) {
    return 'Invalid email domain';
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  // TLD must be at least 2 characters, only letters
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return 'Invalid email domain';
  }

  // TLD must be a known valid TLD
  if (!VALID_TLDS.includes(tld)) {
    return 'Invalid email domain';
  }

  // Domain name (before TLD) must not be empty
  const domainName = domainParts.slice(0, -1).join('.');
  if (!domainName || domainName.length === 0) {
    return 'Invalid email domain';
  }

  // Domain must not contain numbers (catches gmai2.co, etc.)
  if (/\d/.test(domainName)) {
    return 'Invalid email domain';
  }

  // Domain must not start or end with a hyphen
  if (domainName.startsWith('-') || domainName.endsWith('-')) {
    return 'Invalid email domain';
  }

  // Check for common typos
  if (COMMON_DOMAIN_TYPOS[domain]) {
    return `Did you mean ${COMMON_DOMAIN_TYPOS[domain]}?`;
  }

  return null;
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

function validateName(name) {
  if (!name || !name.trim()) {
    return 'Full name is required';
  }
  if (name.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }
  return null;
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  return null;
}

function validateLoginForm({ email, password }) {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };
  const isValid = !errors.email && !errors.password;
  return { errors, isValid };
}

function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };
  const isValid = !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
  return { errors, isValid };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateLoginForm,
  validateRegisterForm,
  VALID_TLDS,
  COMMON_DOMAIN_TYPOS,
};
