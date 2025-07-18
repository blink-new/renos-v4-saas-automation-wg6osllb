# RenOS v4 Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying RenOS v4 to production, including infrastructure setup, configuration, and monitoring.

## 🏗️ Infrastructure Requirements

### Minimum System Requirements
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps
- **OS**: Ubuntu 20.04 LTS or newer

### Recommended Production Setup
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1 Gbps
- **Load Balancer**: Nginx or Cloudflare
- **CDN**: Cloudflare or AWS CloudFront

## 🐳 Docker Deployment

### 1. Production Docker Setup

#### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "run", "start:prod"]
```

#### Docker Compose Production
```yaml
version: '3.8'

services:
  app:
    build: 
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
      - BILLY_API_KEY=${BILLY_API_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge
```

### 2. Nginx Configuration

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name rendetalje.dk www.rendetalje.dk;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name rendetalje.dk www.rendetalje.dk;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## ☁️ Cloud Deployment Options

### 1. AWS Deployment

#### ECS Fargate Setup
```yaml
# docker-compose.aws.yml
version: '3.8'

services:
  app:
    image: your-registry/renos:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/renos
        awslogs-region: eu-west-1
        awslogs-stream-prefix: ecs
```

#### Terraform Configuration
```hcl
# main.tf
provider "aws" {
  region = "eu-west-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "renos-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "renos-postgres"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "renos"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "renos-final-snapshot"

  tags = {
    Name = "renos-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "renos-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "renos-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name = "renos-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "renos-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "renos-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "renos-app"
      image = "your-registry/renos:latest"
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}:5432/renos"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = "eu-west-1"
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "renos-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "renos-app"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.app]
}
```

### 2. Google Cloud Platform Deployment

#### Cloud Run Setup
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/renos:$COMMIT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/renos:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'renos'
      - '--image'
      - 'gcr.io/$PROJECT_ID/renos:$COMMIT_SHA'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

#### Cloud SQL Setup
```bash
# Create Cloud SQL instance
gcloud sql instances create renos-postgres \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=europe-west1

# Create database
gcloud sql databases create renos --instance=renos-postgres

# Create user
gcloud sql users create renos-user \
    --instance=renos-postgres \
    --password=secure-password
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/renos
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://rendetalje.dk/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
GEMINI_API_KEY=your-gemini-api-key

# Twilio SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+45xxxxxxxx

# Billy Invoicing
BILLY_API_KEY=your-billy-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@rendetalje.dk
SMTP_PASS=your-app-password

# Security
CORS_ORIGIN=https://rendetalje.dk
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
ENABLE_SWAGGER=false
ENABLE_METRICS=true
```

### Secrets Management

#### Using Docker Secrets
```yaml
# docker-compose.secrets.yml
version: '3.8'

services:
  app:
    image: renos:latest
    secrets:
      - jwt_secret
      - db_password
      - google_client_secret
      - twilio_auth_token
      - billy_api_key
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
  google_client_secret:
    file: ./secrets/google_client_secret.txt
  twilio_auth_token:
    file: ./secrets/twilio_auth_token.txt
  billy_api_key:
    file: ./secrets/billy_api_key.txt
```

#### Using AWS Secrets Manager
```typescript
// secrets.service.ts
import { SecretsManager } from 'aws-sdk';

@Injectable()
export class SecretsService {
  private secretsManager = new SecretsManager({ region: 'eu-west-1' });

  async getSecret(secretName: string): Promise<string> {
    try {
      const result = await this.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();
      
      return result.SecretString!;
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }
}
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### Sentry Configuration
```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

#### Prometheus Metrics
```typescript
// metrics.service.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route']
  });

  private activeLeads = new Gauge({
    name: 'active_leads_total',
    help: 'Total number of active leads'
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  updateActiveLeads(count: number) {
    this.activeLeads.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

### 2. Log Aggregation

#### ELK Stack Configuration
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### Logstash Configuration
```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "renos" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    mutate {
      add_field => { "service" => "renos" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "renos-logs-%{+YYYY.MM.dd}"
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build application
        run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v3
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/renos
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting RenOS deployment..."

# Pull latest changes
git pull origin main

# Build new Docker image
docker build -t renos:latest .

# Stop existing containers
docker-compose down

# Start new containers
docker-compose up -d

# Run database migrations
docker-compose exec app npm run migration:run

# Health check
echo "⏳ Waiting for application to start..."
sleep 30

if curl -f http://localhost:3000/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed - rolling back..."
    docker-compose down
    docker-compose up -d --scale app=0
    exit 1
fi

# Cleanup old images
docker image prune -f

echo "🎉 RenOS deployment completed successfully!"
```

## 🔒 Security Hardening

### SSL/TLS Configuration
```bash
# Generate SSL certificate with Let's Encrypt
certbot certonly --webroot \
    -w /var/www/html \
    -d rendetalje.dk \
    -d www.rendetalje.dk \
    --email info@rendetalje.dk \
    --agree-tos \
    --non-interactive

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Firewall Configuration
```bash
# UFW firewall setup
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban for SSH protection
apt-get install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Database Security
```sql
-- Create read-only user for monitoring
CREATE USER monitoring WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE renos TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;

-- Enable row-level security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY lead_access_policy ON leads
    FOR ALL TO app_user
    USING (true);
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_leads_status_created ON leads(status, created_at);
CREATE INDEX CONCURRENTLY idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX CONCURRENTLY idx_activities_created_type ON activities(created_at, type);

-- Analyze tables
ANALYZE leads;
ANALYZE bookings;
ANALYZE invoices;
ANALYZE activities;
```

### Redis Caching
```typescript
// cache.config.ts
export const cacheConfig = {
  ttl: 300, // 5 minutes
  max: 1000, // Maximum items in cache
  
  // Cache keys
  keys: {
    leads: (query: string) => `leads:${query}`,
    stats: 'dashboard:stats',
    activities: 'recent:activities'
  }
};
```

### CDN Configuration
```javascript
// Cloudflare configuration
const cloudflareConfig = {
  // Cache static assets
  "rules": [
    {
      "expression": "(http.request.uri.path matches \"^/static/.*\")",
      "action": "cache",
      "cache_level": "cache_everything",
      "edge_cache_ttl": 31536000 // 1 year
    }
  ]
};
```

## 🔄 Backup & Recovery

### Database Backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="renos"

# Create backup
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/renos_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/renos_$DATE.sql.gz s3://renos-backups/

# Keep only last 30 days of local backups
find $BACKUP_DIR -name "renos_*.sql.gz" -mtime +30 -delete

echo "Backup completed: renos_$DATE.sql.gz"
```

### Automated Backup Cron
```bash
# Add to crontab
0 2 * * * /opt/renos/scripts/backup.sh >> /var/log/renos-backup.log 2>&1
```

### Disaster Recovery Plan
```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop application
docker-compose down

# Restore database
gunzip -c $BACKUP_FILE | psql -h localhost -U postgres renos

# Start application
docker-compose up -d

echo "Restore completed from $BACKUP_FILE"
```

## 📋 Post-Deployment Checklist

### Immediate Checks
- [ ] Application starts successfully
- [ ] Health check endpoint responds
- [ ] Database connection works
- [ ] Redis connection works
- [ ] SSL certificate is valid
- [ ] All environment variables are set
- [ ] Logs are being generated
- [ ] Monitoring is active

### Functional Tests
- [ ] User can log in
- [ ] Lead creation works
- [ ] Email processing functions
- [ ] SMS sending works
- [ ] Calendar integration works
- [ ] Invoice generation works
- [ ] Dashboard loads correctly

### Performance Tests
- [ ] Response times are acceptable
- [ ] Database queries are optimized
- [ ] Memory usage is normal
- [ ] CPU usage is normal
- [ ] Load balancer is working

### Security Tests
- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] Rate limiting is active
- [ ] Authentication is working
- [ ] Authorization is enforced

This deployment guide provides comprehensive instructions for deploying RenOS v4 to production with proper security, monitoring, and backup procedures.