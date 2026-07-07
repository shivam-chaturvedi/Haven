import os
import re

screens_dir = 'src/screens'
for filename in os.listdir(screens_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(screens_dir, filename)
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove SafeAreaView from react-native import
        if 'SafeAreaView' in content and 'react-native-safe-area-context' not in content:
            # Matches: SafeAreaView, or , SafeAreaView or SafeAreaView ,
            content = re.sub(r',\s*SafeAreaView', '', content)
            content = re.sub(r'SafeAreaView\s*,', '', content)
            content = re.sub(r'\{\s*SafeAreaView\s*\}', '{}', content)
            
            # Now add import { SafeAreaView } from 'react-native-safe-area-context';
            # Find the last react-native import line
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'react-native' in line and 'import' in line and 'lucide' not in line:
                    lines.insert(i + 1, "import { SafeAreaView } from 'react-native-safe-area-context';")
                    break
            
            with open(filepath, 'w') as f:
                f.write('\n'.join(lines))
                
print('Done fixing SafeAreaView imports.')
