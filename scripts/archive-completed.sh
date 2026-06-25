#!/bin/bash
echo "📦 Buscando cambios completados..."

CHANGES=$(openspec list --json | jq -r '.changes[].name')
ARCHIVED=0

for change in $CHANGES; do
    STATUS=$(openspec status --change "$change" --json)
    COMPLETE=$(echo "$STATUS" | jq '.isComplete')
    
    if [ "$COMPLETE" = "true" ]; then
        echo "Archivando $change..."
        openspec archive "$change" --yes
        ARCHIVED=$((ARCHIVED + 1))
    fi
done

echo "✅ Archivados $ARCHIVED cambios"