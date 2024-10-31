# Deploy and Use Guidelines

## Pre-requisites

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
helm install db oci://registry-1.docker.io/bitnamicharts/postgresql
# To get the password for "postgres" run:
export POSTGRES_PASSWORD=$(kubectl get secret --namespace default db-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)
kubectl port-forward --namespace default svc/db-postgresql 5432:5432 &
    PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 5432
```
## Usage

EDIT: Instructions on how to use the project, including any relevant examples.
