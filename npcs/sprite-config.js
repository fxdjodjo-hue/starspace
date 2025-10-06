// 🎨 NPC Sprite Paths Configuration
// Questo file mappa ogni tipo di NPC al suo sprite corrispondente

export const NPCSpritePaths = {
    // Streuner (X1-X2) - NPC base
    'npc_vru_7': 'npcs/streuner/vru/streuner_vru.png',
    'npc_mmo_7': 'npcs/streuner/mmo/streuner_mmo.png',
    'npc_eic_7': 'npcs/streuner/eic/streuner_eic.png',
    
    'npc_vru_6': 'npcs/streuner/vru/streuner_vru.png',
    'npc_mmo_6': 'npcs/streuner/mmo/streuner_mmo.png',
    'npc_eic_6': 'npcs/streuner/eic/streuner_eic.png',
    
    // Lordakia (X2, X4) - NPC aggressivo
    'npc_vru_lordakia': 'npcs/lordakia/vru/lordakia_vru.png',
    'npc_mmo_lordakia': 'npcs/lordakia/mmo/lordakia_mmo.png',
    'npc_eic_lordakia': 'npcs/lordakia/eic/lordakia_eic.png',
    
    // Saimon (X3) - NPC intermedio
    'npc_vru_saimon': 'npcs/saimon/vru/saimon_vru.png',
    'npc_mmo_saimon': 'npcs/saimon/mmo/saimon_mmo.png',
    'npc_eic_saimon': 'npcs/saimon/eic/saimon_eic.png',
    
    // Mordon (X3) - NPC intermedio
    'npc_vru_mordon': 'npcs/mordon/vru/mordon_vru.png',
    'npc_mmo_mordon': 'npcs/mordon/mmo/mordon_mmo.png',
    'npc_eic_mordon': 'npcs/mordon/eic/mordon_eic.png',
    
    // Devolarium (X3) - NPC intermedio
    'npc_vru_devolarium': 'npcs/devolarium/vru/devolarium_vru.png',
    'npc_mmo_devolarium': 'npcs/devolarium/mmo/devolarium_mmo.png',
    'npc_eic_devolarium': 'npcs/devolarium/eic/devolarium_eic.png',
    
    // Sibelon (X3) - NPC intermedio
    'npc_vru_sibelon': 'npcs/sibelon/vru/sibelon_vru.png',
    'npc_mmo_sibelon': 'npcs/sibelon/mmo/sibelon_mmo.png',
    'npc_eic_sibelon': 'npcs/sibelon/eic/sibelon_eic.png',
    
    // Sibelonit (X4) - NPC avanzato
    'npc_vru_sibelonit': 'npcs/sibelonit/vru/sibelonit_vru.png',
    'npc_mmo_sibelonit': 'npcs/sibelonit/mmo/sibelonit_mmo.png',
    'npc_eic_sibelonit': 'npcs/sibelonit/eic/sibelonit_eic.png',
    
    // Lordakium (X4, X6) - NPC avanzato
    'npc_vru_lordakium': 'npcs/lordakium/vru/lordakium_vru.png',
    'npc_mmo_lordakium': 'npcs/lordakium/mmo/lordakium_mmo.png',
    'npc_eic_lordakium': 'npcs/lordakium/eic/lordakium_eic.png',
    
    // Kristalling (X5) - NPC elite
    'npc_vru_kristalling': 'npcs/kristalling/vru/kristalling_vru.png',
    'npc_mmo_kristalling': 'npcs/kristalling/mmo/kristalling_mmo.png',
    'npc_eic_kristalling': 'npcs/kristalling/eic/kristalling_eic.png',
    
    // Kristallon (X5, X6) - NPC elite
    'npc_vru_kristallon': 'npcs/kristallon/vru/kristallon_vru.png',
    'npc_mmo_kristallon': 'npcs/kristallon/mmo/kristallon_mmo.png',
    'npc_eic_kristallon': 'npcs/kristallon/eic/kristallon_eic.png',
    
    // Cubikon (X6) - NPC boss
    'npc_vru_cubikon': 'npcs/cubikon/vru/cubikon_vru.png',
    'npc_mmo_cubikon': 'npcs/cubikon/mmo/cubikon_mmo.png',
    'npc_eic_cubikon': 'npcs/cubikon/eic/cubikon_eic.png'
};

// 🎨 Palette Colori per Fazioni
export const FactionColors = {
    vru: {
        primary: '#8e44ad',
        secondary: '#7d3c98',
        shield: '#a569bd'
    },
    mmo: {
        primary: '#e74c3c',
        secondary: '#c0392b',
        shield: '#ec7063'
    },
    eic: {
        primary: '#3498db',
        secondary: '#2980b9',
        shield: '#5dade2'
    }
};

// 📏 Dimensioni Progressive per Livelli
export const NPCSizes = {
    // X1-X2 (Streuner)
    'streuner': { radius: 16, hitboxRadius: 42, baseSize: 64 },
    
    // X3 (Saimon, Mordon, Devolarium, Sibelon)
    'saimon': { radius: 20, hitboxRadius: 50, baseSize: 80 },
    'mordon': { radius: 22, hitboxRadius: 55, baseSize: 88 },
    'devolarium': { radius: 24, hitboxRadius: 60, baseSize: 96 },
    'sibelon': { radius: 20, hitboxRadius: 50, baseSize: 80 },
    
    // X4 (Sibelonit, Lordakium)
    'sibelonit': { radius: 24, hitboxRadius: 60, baseSize: 96 },
    'lordakium': { radius: 28, hitboxRadius: 70, baseSize: 112 },
    
    // X5 (Kristalling, Kristallon)
    'kristalling': { radius: 28, hitboxRadius: 70, baseSize: 112 },
    'kristallon': { radius: 32, hitboxRadius: 80, baseSize: 128 },
    
    // X6 (Cubikon)
    'cubikon': { radius: 36, hitboxRadius: 90, baseSize: 144 }
};

// 🚀 Funzione per ottenere il percorso sprite
export function getNPCSpritePath(npcType) {
    return NPCSpritePaths[npcType] || 'alien/alien1/alien60.png'; // Fallback
}

// 🎨 Funzione per ottenere i colori della fazione
export function getFactionColors(faction) {
    return FactionColors[faction] || FactionColors.vru; // Fallback VRU
}

// 📏 Funzione per ottenere le dimensioni dell'NPC
export function getNPCSize(npcType) {
    // Estrai il tipo base dal nome (es: 'npc_vru_saimon' -> 'saimon')
    const baseType = npcType.split('_').pop();
    return NPCSizes[baseType] || NPCSizes.streuner; // Fallback Streuner
}
