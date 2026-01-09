# Secular Hub App

Plataforma de análisis de Bloomberg Investment Outlooks construida con Next.js, TypeScript, Prisma y SQLite.

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

### 3️⃣ Configurar la Base de Datos

Ejecuta los siguientes comandos para configurar Prisma y crear las tablas de la base de datos:

```bash
npx prisma generate
npx prisma db push
```

**Nota:** Si el servidor de desarrollo está corriendo, deténlo antes de ejecutar estos comandos (presiona `Ctrl+C` en la terminal).

### 4️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará en: **http://localhost:3000**

¡Listo! Abre tu navegador y accede a la aplicación.

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
├── components/        # Componentes React reutilizables
├── lib/              # Utilidades, queries de BD, y helpers
├── prisma/           # Esquema y archivos de base de datos
├── public/           # Archivos estáticos
├── types/            # Definiciones de tipos TypeScript
└── ...
```

## 🗄️ Base de Datos

El proyecto usa **SQLite** con **Prisma ORM**. La base de datos se encuentra en `prisma/dev.db`.

### Restaurar Datos de Ejemplo

Si existe un backup con datos de ejemplo (`prisma/dev.db.backup`), puedes restaurarlo:

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
```

### Error: "The table main.outlook_calls does not exist..."

**Solución:** Sincroniza la base de datos. Si el servidor está corriendo, deténlo primero (`Ctrl+C`):
```bash
npx prisma db push
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
