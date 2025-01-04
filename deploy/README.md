# Deploy and Use Guidelines

## Pre-requisites

You will need a k8s cluster to deploy everything. My setup has:
- semi-static public IP provided by DIGI (+1€/month)
  - Port forwarding for 80 (needed for TLS challenge), 443 (HTTPS), 16443 (K8s control plane)
- Old HP laptop with a Ubuntu Desktop 24.04.1 LTS from a bootable USB https://ubuntu.com/tutorials/install-ubuntu-desktop#1-overview
- Free domain using https://dynv6.com/
  - wildcard A record in my zone to redirect all subdomains to my zone (my k8s ingress is the one that does the redirecting)
  - TODO: Implement the hook to automaticlly update the IP if anything changes
  -  TODO: add the k3s command used once the tls works in the home lab
    - Had to configure coredns to follow 8.8.8.8 instead of /etc/resolv.conf

## Deploy 

- Search and replace:
  + REPLACE_USER
  + REPLACE_PASSWORD
  + REPLACE_BASE_DOMAIN

### K8s

```bash
kubectl create ns famquest
kubectl create secret docker-registry gatewaysecrets --docker-server=https://registry.atosresearch.eu:18488 --docker-username=REPLACE --docker-password=REPLACE -n famquest
kubectl create secret docker-registry guigomchasecrets --docker-server=https://ghcr.io --docker-username=REPLACE --docker-password=REPLACE -n famquest
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml
# install the monitoring stack
```
If your cluster cannot resolve public DNS, make sure the cert-manager and the oauth container in the gateway pod have this config
```yaml
    hostAliases:
      - hostnames:
        - api.REPLACE_BASE_DOMAIN
        - portal.REPLACE_BASE_DOMAIN
        - pgadmin.REPLACE_BASE_DOMAIN
        - minio.REPLACE_BASE_DOMAIN
        - minioapi.REPLACE_BASE_DOMAIN
        - monitoring.REPLACE_BASE_DOMAIN
        - auth.REPLACE_BASE_DOMAIN
        - grafana.REPLACE_BASE_DOMAIN
        - prometheus.REPLACE_BASE_DOMAIN
        - keycloak.REPLACE_BASE_DOMAIN
        ip: REPLACE_YOUR_PRIVATE_IP
```
Install the core workloads
```bash
kubectl apply -f deploy/k8s/dbs/minio.yaml -n famquest 
kubectl apply -f deploy/k8s/dbs/postgresql.yaml -n famquest
kubectl apply -f deploy/k8s/dbs/pgadmin.yaml -n famquest
kubectl apply -f deploy/k8s/gateway/keycloak.yaml -n famquest
kubectl apply -f deploy/k8s/gateway/keycloak-ingress.yaml -n famquest
```
- Create the realm, openid connect client with an "audience" mapper in a custom scope
- Get keys and tokens for auth

```bash
# e.g., create Oauth secretToken
dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | tr -d -- '\n' | tr -- '+/' '-_';
```

- Adapt the remaining manifests

```bash
kubectl apply -f deploy/k8s/components/dbmanager.yaml -n famquest
kubectl apply -f deploy/k8s/components/frontmanager.yaml -n famquest
```
Expose it to the outside
```bash
# Note: the current values and confimap overlay expect to have the monitoring stack already installed
helm install gateway  OCI://ghcr.io/guigomcha/famquest/gateway --version 1.3.0 -n famquest -f deploy/k8s/gateway/values.yaml
kubectl apply -f deploy/k8s/gateway/gateway-cm.yaml -n famquest
kubectl edit deployments.apps -n famquest gateway-deployment
# add the hostAliases to the manifest if needed
kubectl rollout restart deployment -n famquest gateway-deployment
```

- Create also the famquest db (https://pgadmin.REPLACE_BASE_DOMAIN). TODO: Ensure both DBs are created automatically
- Go inside minio (https://minio.REPLACE_BASE_DOMAIN) and create a user "demo" with password "REPLACE_PASSWORD" and read/write permission


Refs:
- https://dev.to/ileriayo/adding-free-ssltls-on-kubernetes-using-certmanager-and-letsencrypt-a1l#:~:text=Install%20Cert-manager%20onto%20your%20cluster%20Add%20LetsEncrypt%20as,by%20checking%20the%20cert-manager%20namespace%20for%20running%20pods
- https://fullstackdeveloper.guru/2022/03/16/how-to-set-up-keycloak-for-oauth2-client-credentials-flow/#:~:text=Below%20is%20the%20algorithm%20to%20set%20up%20client,7%3A%20Test%20You%20can%20download%20keycloak%20from%20here

### Local (OUTDATED)

Docker-compose 

Refs:
- https://github.com/oauth2-proxy/oauth2-proxy/tree/master/contrib/local-environment

## Monitoring stack

There is a monitoring stack automatically available
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install promstack -n monitoring --create-namespace prometheus-community/kube-prometheus-stack
```
Expose UIs privately (Else use gateway to expose by ingress)
```bash
kubectl apply -f deploy/k8s/gateway/prom-svc-nodeports.yaml -n monitoring
kubectl get secret promstack-grafana -o jsonpath="{.data.admin-password}" -n monitoring  | base64 --decode ; echo
```

(Optional as it is not used but it is helpful)
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Refs:
- https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md

## Manual Backups

postgres famquest DB 
```bash
kubectl exec -it -n famquest postgresql-deployment-REPLACE -- sh -c "mkdir -p backups && pg_dump -U REPLACE_USER -h localhost famquest > backups/backup-$(date +"%m-%d-%Y-%H-%M").sql"
kubectl cp --retries=-1 famquest/postgresql-deployment-REPLACE:backups backups
```
minio DB
```bash
kubectl exec -it minio-deployment-7cf8ff6b7c-gh5mt -n famquest -- sh -c "mkdir -p /opt/bitnami/minio-client/backups && tar -czf /opt/bitnami/minio-client/backups/data-$(date +"%m-%d-%Y-%H-%M").tar.gz /data"
kubectl cp --retries=-1 famquest/minio-deployment-7cf8ff6b7c-gh5mt:/opt/bitnami/minio-client/backups backups
```