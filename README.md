# Secular Hub App

Plataforma de análisis de Bloomberg Investment Outlooks construida con Next.js, TypeScript, Prisma y **PostgreSQL**.

## 📋 Requisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión recomendada -> 24+
  - Verifica tu versión: `node --version`
  - Descarga desde: https://nodejs.org/
- **npm** (incluido con Node.js)
  - Verifica tu versión: `npm --version`
- **Git** (para clonar el repositorio)
  - Verifica: `git --version`

## 🚀 Instalación Paso a Paso

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/JuanJesusRamirez/Secular_Hub_App.git
cd Secular_Hub_App
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias (Next.js, React, Prisma, etc.). Puede tardar unos minutos.

### 3️⃣ Configurar Variables de Entorno

**IMPORTANTE:** Solicita el archivo `.env.local` al equipo de desarrollo. Este archivo contiene la configuración de conexión a la base de datos PostgreSQL:

```env
DATABASE_URL="postgres://usuario:password@servidor.postgres.database.azure.com:5432/nombre_db"
```

Coloca el archivo `.env.local` en la raíz del proyecto (mismo nivel que `package.json`).

⚠️ **Nota de Seguridad:** El archivo `.env.local` contiene credenciales sensibles y **no debe ser compartido públicamente** ni subido a Git.

### 4️⃣ Configurar la Base de Datos

Una vez que tengas el archivo `.env.local`, ejecuta los siguientes comandos para generar el cliente de Prisma:

```bash
npx prisma generate
```

**Importante:** Si el servidor de desarrollo está corriendo, deténlo antes de ejecutar este comando (presiona `Ctrl+C` en la terminal).

**¿Qué hace este comando?**
- Genera el cliente TypeScript de Prisma que permite comunicarse con PostgreSQL
- Lee el esquema de `prisma/schema.prisma` y crea las interfaces de TypeScript
- Es **necesario ejecutarlo** cada vez que se actualiza el esquema de la base de datos

**Nota:** No necesitas ejecutar `prisma db push` ya que las tablas ya existen en la base de datos PostgreSQL en Azure.

### 5️⃣ Verificar la Conexión a la Base de Datos (Opcional)

Puedes verificar que la conexión a PostgreSQL funciona correctamente:

```bash
node test-db-connection.js
```

Deberías ver un mensaje confirmando la conexión y el número de registros en la base de datos.

### 6️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará en: **http://localhost:3000**

¡Listo! Abre tu navegador y accede a la aplicación. Deberías ver los datos cargados desde PostgreSQL.

## 🛠️ Comandos Útiles

### Desarrollo
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Crear build de producción
- `npm start` - Iniciar servidor en modo producción (requiere build previo)
- `npm run lint` - Ejecutar linter
- `npm run typecheck` - Verificar tipos de TypeScript

### Base de Datos (Prisma)
- `npm run db:generate` - Generar cliente de Prisma
- `npm run db:push` - Sincronizar esquema con la base de datos
- `npm run db:studio` - Abrir Prisma Studio (interfaz visual de la BD)

## 📁 Estructura del Proyecto

```
Secular_Hub_App/
├── app/               # Páginas y rutas de Next.js (App Router)
├── components/   PostgreSQL** en **Azure Database** con **Prisma ORM** como cliente de base de datos.

### Conexión a PostgreSQL

La aplicación se conecta a una base de datos PostgreSQL alojada en Azure. La configuración de conexión está definida en el archivo `.env.local` (ver paso 3 de instalación).

**Esquema:** El esquema de la base de datos se encuentra en `prisma/schema.prisma`

### Migración desde SQLite (Solo para Referencia)

El proyecto originalmente usaba SQLite (`prisma/dev.db`). Si necesitas migrar datos desde SQLite a PostgreSQL, existe un script:

```bash
python scripts/migrate_sqlite_to_pg.py
```

**Nota:** Este paso ya fue completado. Los datos ya están en PostgreSQL.existe un backup con datos de ejemplo (`prisma/dev.db.backup`), puedes restaurarlo:

**Windows (PowerShell):**
```powershell
copy prisma\dev.db.backup prisma\dev.db
```

**Mac/Linux:**
```bash
cp prisma/dev.db.backup prisma/dev.db
```

### Explorar la Base de Datos

Para ver y editar los datos visualmente:

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en tu navegador.

## ⚠️ Solución de Problemas Comunes

### Error: "next no se reconoce como un comando..."

**Solución:** Instala las dependencias primero:
```bash
npm install
```No se muestran datos en la aplicación

**Posibles causas:**

1. **No has ejecutado `npx prisma generate`**
   ```bash
   npx prisma generate
   npm run dev
   ```

2. **Falta el archivo `.env.local`**
   - Solicita el archivo al equipo de desarrollo
   - Verifica que esté en la raíz del proyecto

3. **Error de conexión a Postg con "EPERM: operation not permitted":

1. Detén todos los procesos de Node:
   ```powershell
   taskkill /F /IM node.exe
   ```

2. Espera 2 segundos y vuelve a ejecutar:
   ```bash
   npx prisma generate
   ```

### Error: "Environment variable not found: DATABASE_URL"

**Solución:** Falta el archivo `.env.local` o la variable no está definida correctamente.

1. Verifica que existe el archivo `.env.local` en la raíz del proyecto
2. Asegúrate que contiene la línea:
   ```env
   DATABASE_URL="postgres://..."
   ```
3. Reinicia el servidor después de agregar/modificar el archivo
   - Ejecuta `node test-db-connection.js` para verificar la conexión
   - Revisa que el `DATABASE_URL` en `.env.local` sea correcto prisma db push
npm run dev
```

### El puerto 3000 está en uso

Next.js automáticamente intentará usar puertos alternativos (3001, 3002, etc.). Verás el puerto asignado en la terminal.

### Error de permisos con Prisma en Windows

Si `npx prisma generate` falla, detén el servidor de desarrollo primero y vuelve a intentarlo.

## 📚 Documentación Adicional

- [README-AI.md](README-AI.md) - Configuración de servicios de AI
- [README-FRONTEND.md](README-FRONTEND.md) - Detalles del frontend
- [README-BACKEND.md](README-BACKEND.md) - Detalles del backend
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Guía de despliegue

## 🌐 Despliegue

Para información sobre despliegue en Azure Container Apps, consulta la documentación de Terraform en la carpeta `terraform/`.

## 🤝 Contribuir

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.

## 📄 Licencia

ISC
- Generé cliente Prisma y apliqué esquema (`npx prisma generate` / `npx prisma db push`).
- Creé `.env.local` apuntando a `prisma/dev.db` (si no existía).
- Parcheé una protección en `lib/db/queries.ts` para evitar excepciones cuando la DB está vacía.

Si quieres, puedo:
- Crear un script de seed y poblar `prisma/dev.db` con datos demo.
- Restaurar `prisma/dev.db` desde `prisma/dev.db.backup` ahora.
- Añadir instrucciones específicas para despliegue en Docker/Azure.

---
Última actualización automática: tarea ejecutada desde el entorno local del repositorio.
