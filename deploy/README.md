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
        ip: 192.168.137.35

Install kind:
```bash
kind create cluster --config local/kind-cluster.yaml 
kubectl config use-contest kind-kind
# install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
# Add "127.0.0.1   kind.local" to  /etc/hosts  and C:\Windows\System32\drivers\etc
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Deploy 

### K8s

```bash
kubectl create secret docker-registry gatewaysecrets --docker-server=https://registry.atosresearch.eu:18488 --docker-username=REPLACE --docker-password=REPLACE -n famquest
kubectl create secret docker-registry guigomchasecrets --docker-server=https://ghcr.io --docker-username=REPLACE --docker-password=REPLACE -n famquest
```
<!-- 
```bash
helm install db oci://registry-1.docker.io/bitnamicharts/postgresql -n famquest
# To get the password for "postgres" run:
export POSTGRES_PASSWORD=$(kubectl get secret --namespace famquest db-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)
kubectl port-forward --namespace famquest svc/db-postgresql 5432:5432 &
    PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 5432
``` -->

kubectl apply -f deploy/k8s/dbs/minio.yaml -n famquest
kubectl apply -f deploy/k8s/dbs/postgresql.yaml -n famquest
kubectl apply -f deploy/k8s/dbs/pgadmin.yaml -n famquest
kubectl apply -f deploy/k8s/components/dbmanager.yaml -n famquest
kubectl apply -f deploy/k8s/components/frontmanager.yaml -n famquest
helm install gateway  OCI://registry.atosresearch.eu:18488/gateway --version 1.3.0 -n famquest -f deploy/k8s/gateway/values.yaml

### Local

Docker-compose 

Refs:
- https://github.com/oauth2-proxy/oauth2-proxy/tree/master/contrib/local-environment
