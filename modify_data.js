const fs = require('fs');

let content = fs.readFileSync('src/data.js', 'utf-8');

// Simple regex replace to add image and url to mustSee and localSpots
content = content.replace(/\{ name: '([^']+)', description: '([^']+)' \}/g, (match, name, description) => {
    const keyword = encodeURIComponent(name.split(' ')[0].toLowerCase());
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' Japan')}`;
    return `{ name: '${name}', description: '${description}', image: 'https://loremflickr.com/400/300/${keyword},japan', url: '${searchUrl}' }`;
});

content = content.replace(/\{ name: '([^']+)', type: '([^']+)', description: '([^']+)' \}/g, (match, name, type, description) => {
    const keyword = encodeURIComponent(name.split(' ')[0].toLowerCase());
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' Japan')}`;
    return `{ name: '${name}', type: '${type}', description: '${description}', image: 'https://loremflickr.com/400/300/${keyword},japan', url: '${searchUrl}' }`;
});

fs.writeFileSync('src/data.js', content);
console.log('Done');
