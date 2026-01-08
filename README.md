# Secular Hub App

Pequeña guía para instalar y ejecutar la aplicación localmente.

## Resumen
Proyecto Next.js para análisis de Bloomberg Investment Outlooks. Usa Prisma con SQLite (archivo `prisma/dev.db`).

## Requisitos
- Node.js (recomendado LTS: 18.16+ o 20+)
- npm (incluido con Node)

## Instalación rápida
Desde la raíz del repositorio:

```powershell
npm install
npx prisma generate
npx prisma db push
```

Si no existe `.env.local`, crea uno con:

```text
DATABASE_URL="file:./prisma/dev.db"
```

(O ya existe en el repo si usaste el asistente.)

## Ejecutar en desarrollo

```powershell
npm run dev
```

Next arrancará en `http://localhost:3000` por defecto; si el puerto está en uso intentará puertos alternativos.

## Restaurar o usar datos de ejemplo
- Hay un backup local: `prisma/dev.db.backup`.
  - Para restaurarlo simplemente copia el archivo sobre `prisma/dev.db`:

```powershell
copy prisma\dev.db.backup prisma\dev.db
```

- Si quieres empezar con la base de datos vacía, basta con `npx prisma db push` (crea las tablas en `prisma/dev.db`).

## Añadir una tercera Container App (dev)

El proyecto incluye infraestructura Terraform para `prd` y `uat`. Para crear una tercera app (por ejemplo `dev`) provisionada en Azure se añadió:

- Un ACR adicional: variable `container_registry_name_dev`.
- Un `container_app_environment` nuevo: `env_dev`.
- Un `azurerm_container_app` nuevo: `app_dev`.
- Un `azurerm_role_assignment` para entregar el rol `AcrPush` al Service Principal cuya `object id` se configure en la variable `service_principal_object_id`.

Pasos rápidos para construir y push de la imagen al registro dev (local / PowerShell):

```powershell
# Obtener login server desde terraform outputs (tras `terraform apply`)
 $registry = "<login-server>.azurecr.io"

# Login ACR (opcional, si usas admin-enabled)
az acr login --name <registryName>

# Construir y pushear
.\scripts\build-and-push.ps1 -RegistryLoginServer $registry -ImageName "secular-hub-app" -Tag "dev"
```

Luego aplica Terraform para crear recursos:

```powershell
cd infra
terraform init
terraform apply -var "service_principal_object_id=<OBJECT_ID>" -auto-approve
```

Esto devolverá el `container_registry_login_server_dev` en los outputs; úsalo para pushear la imagen.

NOTA: No encontré un script automático de seed en el repo; si necesitas que escriba un script para poblar datos demo, puedo crearlo.

## Prisma
- Generar el cliente: `npx prisma generate`
- Aplicar esquema: `npx prisma db push`
- Abrir Prisma Studio: `npm run db:studio`

## Comandos útiles
- `npm run typecheck` — Ejecuta `tsc --noEmit` para revisar tipos.
- `npm run build` — Typecheck + `next build`.
- `npm start` — Iniciar build de producción (requiere `npm run build`).

## Variables de entorno importantes
- `DATABASE_URL` — ruta a la base de datos SQLite (por ejemplo `file:./prisma/dev.db`).
- Revisa `README-AI.md` para variables relacionadas con servicios AI (OpenAI/Azure/HuggingFace).

## Problemas comunes
- Puerto en uso: Next intentará puertos siguientes (3001, 3002...).
- Si ves errores de Prisma similares a "table does not exist": asegúrate de haber ejecutado `npx prisma db push` y que `DATABASE_URL` apunte al archivo correcto.

## ¿Qué hice en este entorno?
- Instalé dependencias (`npm install`).
- Generé cliente Prisma y apliqué esquema (`npx prisma generate` / `npx prisma db push`).
- Creé `.env.local` apuntando a `prisma/dev.db` (si no existía).
- Parcheé una protección en `lib/db/queries.ts` para evitar excepciones cuando la DB está vacía.

Si quieres, puedo:
- Crear un script de seed y poblar `prisma/dev.db` con datos demo.
- Restaurar `prisma/dev.db` desde `prisma/dev.db.backup` ahora.
- Añadir instrucciones específicas para despliegue en Docker/Azure.

---
Última actualización automática: tarea ejecutada desde el entorno local del repositorio.
