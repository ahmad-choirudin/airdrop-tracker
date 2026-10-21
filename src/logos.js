import ekiden from './logos/ekiden.webp'
import ecash from './logos/ecash.webp'
import lens from './logos/lens.webp'
import melee from './logos/melee.webp'
import qfex from './logos/qfex.webp'
import fhenix from './logos/fhenix.webp'
const L=[['ekiden',ekiden],['ecash',ecash],['lens',lens],['melee',melee],['qfex',qfex],['fhenix',fhenix]]
export const logoFor=n=>{const k=(n||'').toLowerCase();const m=L.find(([a])=>k.includes(a));return m?m[1]:null}
