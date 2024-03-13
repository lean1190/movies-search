module.exports = {
    '*.{ts}': ['npm run lint:fix', () => 'npx tsc --skipLibCheck --noEmit']
};
