# Database Backups

This directory contains automated PostgreSQL database backups.

## Backup Strategy

- **Frequency**: Daily at midnight (container time)
- **Format**: PostgreSQL custom format (`.dump`)
- **Retention**: 7 days (configurable via `BACKUP_RETENTION_DAYS` env var)
- **Location**: `./backups/` directory on host machine

## Backup Files

Backups are named with timestamp: `backup_YYYYMMDD_HHMMSS.dump`

Example: `backup_20241223_000000.dump`

## Restore Database

To restore from a backup:

```bash
# 1. Stop the API to prevent writes
docker-compose stop api

# 2. Restore the backup (replace BACKUP_FILE with actual filename)
docker exec -i elearn_db pg_restore -h localhost -U postgres -d elearn_db -c -v /backups/BACKUP_FILE.dump

# 3. Restart the API
docker-compose start api
```

Alternative restore from host:

```bash
docker exec -i elearn_db pg_restore -h localhost -U ${DB_USER} -d ${DB_NAME} -c < ./backups/BACKUP_FILE.dump
```

## Manual Backup

To create a manual backup:

```bash
docker exec elearn_db pg_dump -U ${DB_USER} -d ${DB_NAME} -F c -f /backups/manual_$(date +%Y%m%d_%H%M%S).dump
```

## Configuration

Set retention period in `.env`:

```env
BACKUP_RETENTION_DAYS=7  # Keep backups for 7 days (default)
```

## Monitoring

View backup logs:

```bash
docker logs elearn_db_backup
```

Check backup files:

```bash
ls -lh ./backups/
```

## Security Notes

- ⚠️ **Backup files contain sensitive data** - protect this directory
- Consider encrypting backups for production environments
- Store backups on separate storage/server for disaster recovery
- Use `.gitignore` to prevent committing backup files

## Production Recommendations

For production environments:

1. **Off-site backups**: Use S3, Azure Blob, or similar cloud storage
2. **Encryption**: Encrypt backups at rest
3. **Monitoring**: Set up alerts for failed backups
4. **Testing**: Regularly test backup restoration procedures
5. **Retention policy**: Adjust based on compliance requirements

Example S3 sync (add to backup script):

```bash
aws s3 sync /backups s3://your-bucket/db-backups/ --delete
```
