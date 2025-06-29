function getCode(name) {
    const parts = name.trim().split(/\s+/);
    const firstInitial = parts[0]?.[0]?.toUpperCase() || 'X';
    const lastInitial = parts[1]?.[0]?.toUpperCase() || 'X';
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    return firstInitial + lastInitial + digits;
}

module.exports = getCode