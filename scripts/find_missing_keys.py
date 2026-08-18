import re, json, glob

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    existing = set(json.load(f).keys())

# Only match t('word' or t('word_with_underscores' — simple key-like literals
pattern = re.compile(r"\bt\('([^']+)'\)")
bad_chars = set('*@/:,+.?!()[]{}<>=; \t\n"')

t_calls = set()
for path in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    if 'node_modules' in path:
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in pattern.finditer(content):
        key = m.group(1)
        if not key:
            continue
        if any(c in bad_chars for c in key):
            continue
        if len(key) < 2:
            continue
        t_calls.add(key)

missing = sorted(t_calls - existing)
print(f'Total plausible t() keys: {len(t_calls)}')
print(f'Existing keys: {len(existing)}')
print(f'Missing keys: {len(missing)}')
for k in missing:
    print(k)
