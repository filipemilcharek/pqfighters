#!/bin/bash
# PQ Fighters - Deploy to Cloud Run with pre-deploy backup
set -e

BACKUP_DIR="$HOME/backups/pqfighters"
DB_NAME="pqfighters"
PROJECT="pqfighters"
REGION="us-central1"
IMAGE="gcr.io/$PROJECT/$PROJECT"

mkdir -p "$BACKUP_DIR"

echo "=== 1. Backup do banco de dados ==="
FILENAME="${DB_NAME}_predeploy_$(date +%Y%m%d_%H%M%S).sql"
turso db shell "$DB_NAME" .dump > "$BACKUP_DIR/$FILENAME"
if [ ! -s "$BACKUP_DIR/$FILENAME" ]; then
  echo "ERRO: Backup falhou (arquivo vazio). Deploy cancelado."
  rm -f "$BACKUP_DIR/$FILENAME"
  exit 1
fi
echo "Backup salvo: $BACKUP_DIR/$FILENAME ($(du -h "$BACKUP_DIR/$FILENAME" | cut -f1))"

echo ""
echo "=== 2. Build da imagem Docker ==="
docker build -t "$IMAGE" .

echo ""
echo "=== 3. Push da imagem ==="
docker push "$IMAGE"

echo ""
echo "=== 4. Deploy no Cloud Run ==="
gcloud run deploy "$PROJECT" \
  --image "$IMAGE" \
  --region "$REGION" \
  --project "$PROJECT"

echo ""
echo "=== Deploy concluído! ==="
