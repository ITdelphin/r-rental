import re, json, glob

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

existing = set(en.keys())

t_calls = set()
# Also track t(variable) patterns
for path in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    if 'node_modules' in path:
        continue
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        # literal t('key')
        for m in re.finditer(r"t\('([^']+)'\)", content):
            t_calls.add(m.group(1))
        # t("key")
        for m in re.finditer(r't\("([^"]+)"\)', content):
            t_calls.add(m.group(1))
    except Exception as e:
        pass

# Also collect variable-based keys from specific arrays
# These are passed as t(variable) so won't show up in regex
extra_keys = {
    'kigali', 'eastern', 'western', 'northern', 'southern',
    'house', 'apartment', 'villa', 'cottage', 'studio', 'commercial',
    'rent', 'sale', 'short_term',
    'approved', 'cancelled', 'completed',
    'open', 'resolved', 'closed',
    'pending_approval', 'published',
    'rejected', 'rented', 'sold', 'draft',
    'wifi', 'internet',
}
t_calls |= extra_keys

missing = sorted(t_calls - existing)

# Remove noise keys (Supabase query strings, special chars)
def is_valid_key(k):
    if any(c in k for c in '*(),:!@/.`'):
        return False
    if k.startswith('@/'):
        return False
    if k in ('T',):
        return False
    return True

missing = [k for k in missing if is_valid_key(k)]

print(f"Missing valid keys: {len(missing)}")
for k in missing:
    print(k)
