# TeleTrack Kubernetes

Manifiestos Kubernetes utilizados para desplegar TeleTrack.

## Componentes

- PostgreSQL StatefulSet
- API FastAPI
- Processor
- Frontend React/Nginx
- Kubernetes Services
- Persistent Volume
- Horizontal Pod Autoscaler
- Traefik Ingress
- TLS mediante cert-manager y Let's Encrypt

## Arquitectura

Internet
|
Traefik
|
Frontend
|
API
|
PostgreSQL
|
Processor

## Réplicas

API:

- mínimo: 2
- máximo: 5

Frontend:

- mínimo: 2
- máximo: 4

Processor:

- 1

PostgreSQL:

- 1

## Seguridad

Los secretos de producción no se almacenan en Git.

Se crean directamente en Kubernetes mediante Secret resources.

PostgreSQL utiliza únicamente un Service ClusterIP y no se publica directamente en Internet.

## Persistencia

PostgreSQL utiliza un PersistentVolumeClaim mediante la StorageClass `local-path` de K3s.

## HTTPS

Traefik recibe las conexiones externas.

cert-manager solicita certificados TLS mediante Let's Encrypt.
