import re, json, glob

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    existing = set(json.load(f).keys())

t_calls = set()
for path in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    if 'node_modules' in path:
        continue
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        for m in re.finditer(r"t\('([^']+)'\)", content):
            t_calls.add(m.group(1))
    except Exception as e:
        print(f"Error reading {path}: {e}")

missing = sorted(t_calls - existing)
print(f'Total t() calls: {len(t_calls)}')
print(f'Existing keys: {len(existing)}')
print(f'Missing keys: {len(missing)}')
for k in missing:
    print(k)
