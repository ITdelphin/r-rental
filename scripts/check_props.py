import re
with open('src/pages/public/PropertiesPage.tsx', 'r') as f:
    content = f.read()
for m in re.findall(r"t\('([^']+)'\)", content):
    print(m)
