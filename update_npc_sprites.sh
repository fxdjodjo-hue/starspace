#!/bin/bash
# Script per aggiornare tutti i percorsi sprite NPC rimanenti

# Devolarium
sed -i "s/'npc_vru_devolarium': {[^}]*sprite: 'alien'/'npc_vru_devolarium': {\n                name: 'VRU Devolarium',\n                description: 'Devolarium della Venus Research Union',\n                sprite: 'SpritesNPC\/Devolarium\/alien50.png'/g" src/entities/NPCTypes.js

# Sibelon
sed -i "s/'npc_vru_sibelon': {[^}]*sprite: 'alien'/'npc_vru_sibelon': {\n                name: 'VRU Sibelon',\n                description: 'Sibelon della Venus Research Union',\n                sprite: 'SpritesNPC\/Sibelon\/motron.png'/g" src/entities/NPCTypes.js

# Sibelonit
sed -i "s/'npc_vru_sibelonit': {[^}]*sprite: 'alien'/'npc_vru_sibelonit': {\n                name: 'VRU Sibelonit',\n                description: 'Sibelonit della Venus Research Union',\n                sprite: 'SpritesNPC\/Sibelonit\/alien60.png'/g" src/entities/NPCTypes.js

# Lordakium
sed -i "s/'npc_vru_lordakium': {[^}]*sprite: 'alien'/'npc_vru_lordakium': {\n                name: 'VRU Lordakium',\n                description: 'Lordakium della Venus Research Union',\n                sprite: 'SpritesNPC\/Lordakium\/alien70.png'/g" src/entities/NPCTypes.js

# Kristallin
sed -i "s/'npc_vru_kristallin': {[^}]*sprite: 'alien'/'npc_vru_kristallin': {\n                name: 'VRU Kristallin',\n                description: 'Kristallin della Venus Research Union',\n                sprite: 'SpritesNPC\/Kristallin\/alien60.png'/g" src/entities/NPCTypes.js

# Kristallon
sed -i "s/'npc_vru_kristallon': {[^}]*sprite: 'alien'/'npc_vru_kristallon': {\n                name: 'VRU Kristallon',\n                description: 'Kristallon della Venus Research Union',\n                sprite: 'SpritesNPC\/Kristallon\/alien90.png'/g" src/entities/NPCTypes.js

# Cubikon
sed -i "s/'npc_vru_cubikon': {[^}]*sprite: 'alien'/'npc_vru_cubikon': {\n                name: 'VRU Cubikon',\n                description: 'Cubikon della Venus Research Union',\n                sprite: 'SpritesNPC\/Cubikon\/cubikon.png'/g" src/entities/NPCTypes.js

echo "✅ Tutti gli sprite NPC aggiornati!"
