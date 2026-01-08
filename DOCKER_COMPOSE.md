# Docker Compose

## Iniciar la aplicación
```bash
docker-compose up
```

## En otra terminal, prueba
```bash
curl http://localhost:3000
curl http://localhost:3000/api/info
```

## Ver logs
```bash
docker-compose logs -f
```

## Detener
```bash
docker-compose down
```

## Reconstruir después de cambios en Dockerfile
```bash
docker-compose up --build
```

## Acceso desde el navegador
```
http://localhost:3000
```
