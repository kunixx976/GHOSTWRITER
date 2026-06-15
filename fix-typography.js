const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const dirs = [path.join(__dirname, 'app'), path.join(__dirname, 'src/components')];
let files = [];
dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        files = files.concat(walkSync(dir));
    }
});

const regexMap = [
    { pattern: /\btext-\[(?:7|8|9|10|11|12|13)px\]\b/g, replacement: 'text-sm' },
    { pattern: /\btext-xs\b/g, replacement: 'text-sm' },
    { pattern: /\btext-\[1[456]px\]\b/g, replacement: 'text-base' },
    { pattern: /\btext-\[1[78]px\]\b/g, replacement: 'text-lg' },
    { pattern: /\btext-\[19px\]\b/g, replacement: 'text-xl' },
    { pattern: /\btext-\[2[0-9]px\]\b/g, replacement: 'text-xl' },
    { pattern: /\btext-2xl\b/g, replacement: 'text-xl' },
    { pattern: /\btext-[456789]xl\b/g, replacement: 'text-3xl' },
    { pattern: /\btext-\[clamp\([^)]+\)\]\b/g, replacement: 'text-3xl' },
    { pattern: /\bfont-display\b/g, replacement: '' }
];

let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    regexMap.forEach(rule => {
        content = content.replace(rule.pattern, rule.replacement);
    });
    
    // Clean up multiple spaces that might have been introduced by empty replacements
    content = content.replace(/ +/g, ' ');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nUpdated ${changedCount} files.`);
