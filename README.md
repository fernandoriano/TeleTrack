# TeleTrack

**Plataforma cloud-native de telemetría y geolocalización vehicular en tiempo real**

TeleTrack es una plataforma diseñada para registrar, procesar, consultar y visualizar información de geolocalización vehicular en tiempo real. El sistema utiliza dispositivos móviles como fuentes de telemetría GPS y aplica principios de arquitectura cloud-native mediante microservicios, contenedores, Kubernetes, automatización CI/CD, escalabilidad, resiliencia y procesamiento serverless.

## Objetivo

Construir una solución de telemetría vehicular portable, escalable y desacoplada que permita registrar vehículos, clientes y usuarios; recibir posiciones GPS desde dispositivos móviles; almacenar históricos; calcular estadísticas; visualizar información geográfica y administrar la infraestructura mediante tecnologías cloud-native.

## Arquitectura general

```text
Aplicación móvil Flutter
        |
        | HTTPS
        v
Internet
        |
        v
Azure Public IP
        |
        v
Traefik Ingress
        |
        v
Frontend React + Nginx
        |
        | /api
        v
FastAPI
        |
        +----------------------+
        |                      |
        v                      v
PostgreSQL               Processor
                               |
                               v
                     Estadísticas vehiculares

Azure Function
TeleTrackHealthMonitor
        |
        | cada 5 minutos
        v
Endpoint /health
        |
        v
Application Insights
```

## Componentes

### Aplicación móvil

Desarrollada con Flutter para Android.

Funciones principales:

- Activación del dispositivo mediante código del vehículo y clave de activación.
- Almacenamiento seguro del token del dispositivo.
- Obtención de ubicación GPS.
- Envío de latitud, longitud, altitud, velocidad, precisión y rumbo.
- Comunicación HTTPS con la plataforma desplegada en Azure.

### Frontend

Desarrollado con React y Vite.

Permite:

- Autenticación.
- Administración de clientes.
- Administración de usuarios.
- Administración de vehículos.
- Consulta de telemetría.
- Visualización geográfica mediante Leaflet y OpenStreetMap.
- Consulta de estadísticas e históricos.

Nginx sirve la aplicación y funciona además como proxy inverso para las solicitudes `/api`.

### API

Backend desarrollado con FastAPI.

Gestiona:

- Autenticación.
- Autorización por roles.
- Clientes.
- Usuarios.
- Vehículos.
- Activación de dispositivos.
- Recepción de telemetría.
- Historial de posiciones.
- Estadísticas vehiculares.

### Processor

Servicio independiente encargado del procesamiento periódico de las posiciones almacenadas.

Calcula:

- Cantidad de posiciones.
- Velocidad promedio.
- Velocidad máxima.
- Altitud mínima.
- Altitud máxima.
- Distancia recorrida.
- Última actualización.

### PostgreSQL

Base de datos relacional encargada de persistir:

- clientes;
- usuarios;
- vehículos;
- dispositivos;
- posiciones;
- estadísticas;
- tokens de actualización.

Las migraciones de base de datos se administran mediante Alembic.

## Roles

### Ingeniero

Puede administrar clientes, usuarios y vehículos, consultar el estado general de la plataforma y revisar telemetría.

### Cliente

Puede consultar únicamente los vehículos pertenecientes a su organización.

La API controla el acceso a la información y evita que un cliente consulte vehículos de otro cliente.

## Contenedores

Los principales componentes se empaquetan mediante Docker:

```text
teletrack-api
teletrack-processor
teletrack-frontend
postgres:17
```

Las imágenes de la aplicación se publican automáticamente en GitHub Container Registry.

## Kubernetes

El entorno cloud utiliza K3s como distribución ligera de Kubernetes.

Namespace:

```text
teletrack
```

Arquitectura desplegada:

```text
API          -> mínimo 2 réplicas
Frontend     -> mínimo 2 réplicas
Processor    -> 1 réplica
PostgreSQL   -> StatefulSet
```

PostgreSQL utiliza almacenamiento persistente mediante un PersistentVolumeClaim.

## Escalabilidad automática

TeleTrack utiliza Horizontal Pod Autoscaler.

API:

```text
Mínimo: 2 pods
Máximo: 5 pods
Umbral CPU: 65 %
```

Frontend:

```text
Mínimo: 2 pods
Máximo: 4 pods
Umbral CPU: 70 %
```

Durante la prueba de carga de la API, el consumo superó el umbral configurado y Kubernetes escaló automáticamente desde 2 hasta 5 pods.

## Resiliencia

Se realizó una prueba eliminando manualmente una instancia de la API.

Kubernetes detectó que el número de réplicas era inferior al estado deseado y creó automáticamente un nuevo pod.

La segunda réplica permaneció disponible mientras Kubernetes recuperaba la instancia eliminada.

Esta prueba demuestra autorrecuperación y resiliencia a nivel de aplicación.

> El entorno académico utiliza un único nodo K3s. Para alta disponibilidad a nivel de infraestructura se recomienda un clúster Kubernetes multinodo en producción.

## HTTPS

La aplicación utiliza Traefik como Ingress Controller.

Los certificados TLS son administrados mediante cert-manager y Let's Encrypt.

URL desplegada:

```text
https://teletrack.135-232-245-103.sslip.io
```

## Serverless

TeleTrack incorpora Azure Functions como componente serverless.

Function App:

```text
teletrack-serverless-fernando
```

Función:

```text
TeleTrackHealthMonitor
```

Tipo:

```text
Timer Trigger
```

Programación:

```text
Cada 5 minutos
```

La función consulta automáticamente el endpoint público `/health` de TeleTrack y registra el resultado mediante Application Insights.

Esto permite demostrar ejecución bajo demanda, automatización y monitoreo mediante una arquitectura serverless independiente del núcleo de la plataforma.

## CI/CD

GitHub Actions automatiza el ciclo de integración y despliegue.

El pipeline realiza:

```text
Push a main
    |
    v
Validate Backend
    |
Validate Processor
    |
Build Frontend
    |
Validate Flutter
    |
Build Docker Images
    |
Push a GHCR
    |
SSH hacia Azure
    |
Actualizar K3s
    |
Ejecutar migraciones
    |
Rolling update
    |
TeleTrack actualizado
```

Los trabajos configurados son:

```text
Validate Backend
Validate Processor
Build Frontend
Validate Flutter
Build and Publish Docker Images
Deploy to Azure K3s
```

El despliegue automático permite actualizar la aplicación en Azure después de un push exitoso a la rama `main`.

## Cloud

El entorno demostrativo está desplegado en Microsoft Azure.

Infraestructura principal:

```text
Región: North Central US
Sistema operativo: Ubuntu 24.04 LTS
Kubernetes: K3s
Servidor: 2 vCPU / 4 GiB RAM
```

La arquitectura del núcleo de TeleTrack evita una dependencia fuerte de servicios propietarios, debido a que utiliza tecnologías portables como Docker, Kubernetes, PostgreSQL, FastAPI, React y Flutter.

## Cloud-native

TeleTrack implementa los principales conceptos solicitados para una arquitectura nativa de la nube:

```text
Microservicios
Contenedores
Kubernetes
Escalabilidad horizontal
Autorrecuperación
Persistencia
CI/CD
Serverless
HTTPS
Observabilidad
Automatización
Portabilidad
Separación de responsabilidades
```

## Seguridad

La solución incorpora:

- HTTPS.
- Autenticación mediante JWT.
- Refresh tokens.
- Contraseñas almacenadas mediante hash.
- Tokens de dispositivo almacenados mediante hash.
- Separación por roles.
- Separación de datos por cliente.
- Secrets de Kubernetes.
- Variables sensibles fuera del repositorio.
- Claves SSH almacenadas como GitHub Actions Secrets.

## Estructura del repositorio

```text
TeleTrack/
|
|-- backend/
|   |-- app/
|   |-- migrations/
|   |-- Dockerfile
|   `-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |-- Dockerfile
|   `-- nginx.conf
|
|-- mobile/
|   |-- lib/
|   `-- android/
|
|-- processor/
|   |-- main.py
|   `-- Dockerfile
|
|-- serverless/
|   |-- function_app.py
|   |-- host.json
|   `-- requirements.txt
|
|-- k8s/
|   |-- namespace.yaml
|   |-- database.yaml
|   |-- migrate-job.yaml
|   |-- api.yaml
|   |-- processor.yaml
|   |-- frontend.yaml
|   |-- autoscaling.yaml
|   |-- cluster-issuer.yaml
|   `-- ingress-template.yaml
|
|-- .github/
|   `-- workflows/
|       `-- ci-cd.yml
|
|-- compose.yaml
|-- .env.example
`-- README.md
```

## Ejecución local

Crear `.env` a partir de:

```text
.env.example
```

Levantar los servicios:

```bash
docker compose up -d --build
```

Comprobar:

```bash
docker compose ps
```

Frontend:

```text
http://localhost:8080
```

API:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Estado del proyecto

La plataforma dispone actualmente de:

```text
Backend funcional
Frontend funcional
Aplicación Android funcional
PostgreSQL persistente
Procesamiento de estadísticas
Docker
Kubernetes/K3s
Autoscaling
Prueba de resiliencia
HTTPS
CI/CD automático
Azure Functions
Application Insights
Despliegue en Microsoft Azure
```

TeleTrack demuestra un flujo completo desde la captura de posición en un dispositivo móvil hasta el procesamiento, almacenamiento y visualización de información en una arquitectura cloud-native.