# Deploy and Use Guidelines

## Pre-requisites

If needed, make sure the cert-manager has 
    hostAliases:
      - hostnames:
        - api.famquest.REPLACE_BASE_DOMAIN
        - portal.famquest.REPLACE_BASE_DOMAIN
        - pgadmin.famquest.REPLACE_BASE_DOMAIN
        - minio.famquest.REPLACE_BASE_DOMAIN
        - minioapi.famquest.REPLACE_BASE_DOMAIN
        - monitoring.famquest.REPLACE_BASE_DOMAIN
        - auth.famquest.REPLACE_BASE_DOMAIN
        ip: REPLACE


## Deploy 

### K8s

```bash
kubectl create secret docker-registry guigomchasecrets --docker-server=https://ghcr.io --docker-username=REPLACE --docker-password=REPLACE -n famquest
```

kubectl apply -f deploy/k8s/dbs/minio.yaml -n famquest
kubectl apply -f deploy/k8s/dbs/postgresql.yaml -n famquest
kubectl apply -f deploy/k8s/dbs/pgadmin.yaml -n famquest
kubectl apply -f deploy/k8s/components/dbmanager.yaml -n famquest
kubectl apply -f deploy/k8s/components/frontmanager.yaml -n famquest
helm install gateway  OCI://ghcr.io/guigomcha/famquest --version 1.3.0 -n famquest -f deploy/k8s/gateway/values.yaml
kubectl apply -f deploy/k8s/gateway/gateway-cm.yaml -n famquest

### Local (OUTDATED)

Docker-compose 

Refs:
- https://github.com/oauth2-proxy/oauth2-proxy/tree/master/contrib/local-environment
