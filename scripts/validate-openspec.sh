#!/bin/bash
echo "🔍 Validando OpenSpec..."

OUTPUT=$(openspec validate --all --json 2>/dev/null)
INVALID=$(echo "$OUTPUT" | jq '.summary.totals.failed // 0')

if [ "$INVALID" -eq "0" ]; then
    echo "✅ Todos los cambios son válidos"
    exit 0
else
    echo "❌ Se encontraron $INVALID cambios inválidos:"
    echo "$OUTPUT" | jq -r '.items[] | select(.valid == false) | "  - \(.id): \(.issues[].message)"'
    exit 1
fi