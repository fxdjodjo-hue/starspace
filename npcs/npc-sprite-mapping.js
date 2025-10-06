// 🎨 Mapping Sprite NPC - Configurazione Completa
// Questo file mappa ogni tipo di NPC al suo sprite corrispondente

export const NPCSpriteMapping = {
    // X1 - Streuner
    'npc_vru_7': 'SpritesNPC/Streuner/alien10.png',
    'npc_mmo_7': 'SpritesNPC/Streuner/alien10.png',
    'npc_eic_7': 'SpritesNPC/Streuner/alien10.png',
    
    // X2 - Streuner + Lordakia
    'npc_vru_6': 'SpritesNPC/Streuner/alien10.png',
    'npc_mmo_6': 'SpritesNPC/Streuner/alien10.png',
    'npc_eic_6': 'SpritesNPC/Streuner/alien10.png',
    
    'npc_x2_lordakia': 'SpritesNPC/Lordakia/alien20.png',
    'npc_vru_lordakia': 'SpritesNPC/Lordakia/alien20.png',
    'npc_mmo_lordakia': 'SpritesNPC/Lordakia/alien20.png',
    'npc_eic_lordakia': 'SpritesNPC/Lordakia/alien20.png',
    
    // X3 - Saimon + Mordon + Devolarium + Sibelon
    'npc_vru_saimon': 'SpritesNPC/Saimon/alien30.png',
    'npc_mmo_saimon': 'SpritesNPC/Saimon/alien30.png',
    'npc_eic_saimon': 'SpritesNPC/Saimon/alien30.png',
    
    'npc_vru_mordon': 'SpritesNPC/Mordon/alien40.png',
    'npc_mmo_mordon': 'SpritesNPC/Mordon/alien40.png',
    'npc_eic_mordon': 'SpritesNPC/Mordon/alien40.png',
    
    'npc_vru_devolarium': 'SpritesNPC/Devolarium/alien50.png',
    'npc_mmo_devolarium': 'SpritesNPC/Devolarium/alien50.png',
    'npc_eic_devolarium': 'SpritesNPC/Devolarium/alien50.png',
    
    'npc_vru_sibelon': 'SpritesNPC/Sibelon/motron.png',
    'npc_mmo_sibelon': 'SpritesNPC/Sibelon/motron.png',
    'npc_eic_sibelon': 'SpritesNPC/Sibelon/motron.png',
    
    // X4 - Sibelonit + Lordakium
    'npc_vru_sibelonit': 'SpritesNPC/Sibelonit/alien60.png',
    'npc_mmo_sibelonit': 'SpritesNPC/Sibelonit/alien60.png',
    'npc_eic_sibelonit': 'SpritesNPC/Sibelonit/alien60.png',
    
    'npc_vru_lordakium': 'SpritesNPC/Lordakium/alien70.png',
    'npc_mmo_lordakium': 'SpritesNPC/Lordakium/alien70.png',
    'npc_eic_lordakium': 'SpritesNPC/Lordakium/alien70.png',
    
    // X5 - Kristallin + Kristallon
    'npc_vru_kristallin': 'SpritesNPC/Kristallin/alien60.png',
    'npc_mmo_kristallin': 'SpritesNPC/Kristallin/alien60.png',
    'npc_eic_kristallin': 'SpritesNPC/Kristallin/alien60.png',
    
    'npc_vru_kristallon': 'SpritesNPC/Kristallon/alien90.png',
    'npc_mmo_kristallon': 'SpritesNPC/Kristallon/alien90.png',
    'npc_eic_kristallon': 'SpritesNPC/Kristallon/alien90.png',
    
    // X6 - Cubikon
    'npc_vru_cubikon': 'SpritesNPC/Cubikon/cubikon.png',
    'npc_mmo_cubikon': 'SpritesNPC/Cubikon/cubikon.png',
    'npc_eic_cubikon': 'SpritesNPC/Cubikon/cubikon.png'
};

// 🚀 Funzione per ottenere il percorso sprite
export function getNPCSpritePath(npcType) {
    return NPCSpriteMapping[npcType] || 'alien/alien1/alien60.png'; // Fallback
}

// 📋 Lista completa per aggiornamento automatico
export const NPCSpriteUpdates = [
    // Mordon
    { type: 'npc_vru_mordon', sprite: 'SpritesNPC/Mordon/alien40.png' },
    { type: 'npc_mmo_mordon', sprite: 'SpritesNPC/Mordon/alien40.png' },
    { type: 'npc_eic_mordon', sprite: 'SpritesNPC/Mordon/alien40.png' },
    
    // Devolarium
    { type: 'npc_vru_devolarium', sprite: 'SpritesNPC/Devolarium/alien50.png' },
    { type: 'npc_mmo_devolarium', sprite: 'SpritesNPC/Devolarium/alien50.png' },
    { type: 'npc_eic_devolarium', sprite: 'SpritesNPC/Devolarium/alien50.png' },
    
    // Sibelon
    { type: 'npc_vru_sibelon', sprite: 'SpritesNPC/Sibelon/motron.png' },
    { type: 'npc_mmo_sibelon', sprite: 'SpritesNPC/Sibelon/motron.png' },
    { type: 'npc_eic_sibelon', sprite: 'SpritesNPC/Sibelon/motron.png' },
    
    // Sibelonit
    { type: 'npc_vru_sibelonit', sprite: 'SpritesNPC/Sibelonit/alien60.png' },
    { type: 'npc_mmo_sibelonit', sprite: 'SpritesNPC/Sibelonit/alien60.png' },
    { type: 'npc_eic_sibelonit', sprite: 'SpritesNPC/Sibelonit/alien60.png' },
    
    // Lordakium
    { type: 'npc_vru_lordakium', sprite: 'SpritesNPC/Lordakium/alien70.png' },
    { type: 'npc_mmo_lordakium', sprite: 'SpritesNPC/Lordakium/alien70.png' },
    { type: 'npc_eic_lordakium', sprite: 'SpritesNPC/Lordakium/alien70.png' },
    
    // Kristallin
    { type: 'npc_vru_kristallin', sprite: 'SpritesNPC/Kristallin/alien60.png' },
    { type: 'npc_mmo_kristallin', sprite: 'SpritesNPC/Kristallin/alien60.png' },
    { type: 'npc_eic_kristallin', sprite: 'SpritesNPC/Kristallin/alien60.png' },
    
    // Kristallon
    { type: 'npc_vru_kristallon', sprite: 'SpritesNPC/Kristallon/alien90.png' },
    { type: 'npc_mmo_kristallon', sprite: 'SpritesNPC/Kristallon/alien90.png' },
    { type: 'npc_eic_kristallon', sprite: 'SpritesNPC/Kristallon/alien90.png' },
    
    // Cubikon
    { type: 'npc_vru_cubikon', sprite: 'SpritesNPC/Cubikon/cubikon.png' },
    { type: 'npc_mmo_cubikon', sprite: 'SpritesNPC/Cubikon/cubikon.png' },
    { type: 'npc_eic_cubikon', sprite: 'SpritesNPC/Cubikon/cubikon.png' }
];
