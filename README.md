# TeleTrack

Plataforma cloud-native de telemetría y geolocalización vehicular en tiempo real.

## Caso de negocio

TeleTrack permite a organizaciones administrar vehículos y consultar información de geolocalización y telemetría utilizando dispositivos móviles Android como unidades GPS.

La plataforma permite registrar clientes, usuarios y vehículos, asociar un dispositivo móvil a un vehículo y transmitir periódicamente datos de posición mediante Internet.

Entre los datos tratados se encuentran:

- Fecha y hora.
- Latitud.
- Longitud.
- Altitud.
- Velocidad.
- Precisión GPS.
- Rumbo.

Los usuarios autorizados pueden consultar posiciones, historial de recorrido y estadísticas desde una aplicación web.

## Objetivo

Diseñar una solución orientada a entornos cloud-native utilizando microservicios, contenedores, automatización DevOps y tecnologías independientes del proveedor para favorecer:

- Escalabilidad.
- Resiliencia.
- Portabilidad.
- Seguridad.
- Automatización.
- Optimización de recursos.
- Desacoplamiento de componentes.

## Arquitectura

La solución está compuesta por varios componentes independientes:

### Frontend

Aplicación web desarrollada con React y Vite.

Es servida mediante Nginx, que también funciona como reverse proxy hacia la API.

### API

Servicio desarrollado con FastAPI encargado de:

- Autenticación.
- Autorización por roles.
- Administración de clientes.
- Administración de usuarios.
- Administración de vehículos.
- Activación de dispositivos.
- Recepción de telemetría.
- Consulta de posiciones.
- Consulta de historial.
- Consulta de estadísticas.

### Processor

Servicio independiente encargado de procesar las posiciones almacenadas y generar estadísticas por vehículo.

Calcula, entre otros:

- Cantidad de posiciones.
- Velocidad promedio.
- Velocidad máxima.
- Altitud mínima.
- Altitud máxima.
- Distancia recorrida.

### Base de datos

PostgreSQL almacena:

- Clientes.
- Usuarios.
- Vehículos.
- Dispositivos.
- Ubicaciones.
- Estadísticas.
- Refresh tokens.

### TeleTrack Mobile

Aplicación Android desarrollada con Flutter.

El dispositivo móvil funciona como unidad de telemetría del vehículo.

El proceso es:

1. El ingeniero registra un vehículo.
2. TeleTrack genera un código de vehículo y un secreto de activación.
3. El dispositivo móvil se activa mediante esos datos.
4. La API entrega un token de dispositivo.
5. El token se almacena mediante almacenamiento seguro.
6. El celular obtiene información GPS.
7. La aplicación transmite periódicamente la telemetría a la API mediante Internet.

## Roles

### Ingeniero

Puede:

- Crear clientes.
- Administrar vehículos.
- Consultar ubicaciones.
- Consultar estadísticas.
- Gestionar la infraestructura de TeleTrack.

### Cliente

Puede:

- Consultar únicamente sus vehículos.
- Ver su ubicación.
- Consultar historial.
- Consultar estadísticas.

La autorización se realiza en el backend y no depende únicamente de la interfaz web.

## Seguridad

La plataforma incorpora:

- Contraseñas almacenadas mediante hash.
- JWT para autenticación.
- Refresh tokens.
- Roles de usuario.
- Separación de información por cliente.
- Tokens independientes para dispositivos.
- Secretos de activación protegidos.
- Variables sensibles fuera del código fuente.
- Archivo `.env` excluido de Git.
- HTTPS previsto para despliegue público.
- PostgreSQL sin exposición pública en el despliegue de producción.

## Tecnologías

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Psycopg
- JWT

### Frontend

- React
- Vite
- React Router
- Leaflet
- OpenStreetMap
- Nginx

### Mobile

- Flutter
- Dart
- Geolocator
- Flutter Secure Storage
- HTTP

### Infraestructura

- Docker
- Docker Compose
- Kubernetes / K3s
- Nginx
- GitHub
- GitHub Actions

## Contenedores

Actualmente la solución local utiliza los siguientes servicios:

```text
teletrack-frontend
teletrack-api
teletrack-processor
teletrack-postgres