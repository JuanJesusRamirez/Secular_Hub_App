# 📦 CI/CD & Deployment Strategy  
**Azure · Terraform · GitHub · Container Apps**

---

## 1. Objetivo

Definir y documentar la estrategia de **CI/CD** e **Infraestructura como Código (IaC)** del proyecto, priorizando:
- Estabilidad en producción
- Trazabilidad de versiones
- Despliegues reproducibles
- Control explícito de cambios

---

## 2. Principios clave

- **Build once, deploy many**
- **Imágenes inmutables**
- **Separación estricta entre build y deploy**
- **Terraform como única fuente de verdad**
- **Producción protegida de automatismos**

---

## 3. Estructura de ramas

| Rama     | Rol principal                                | Build | Deploy |
|----------|----------------------------------------------|-------|--------|
| `dev`    | Integración y generación de imágenes         | ✅ Sí | DEV    |
| `uat_v1` | Validación funcional y despliegue (Terraform)| ❌ No | UAT    |
| `prd_v1` | Referencia de producción                     | ❌ No | ❌ No  |

---

## 4. Flujo general

dev ──► build image ──► Azure Container Registry
│
├──► UAT (Terraform, tag explícito)
│
└──► PRD (manual, tag aprobado)


---

## 5. DEV – Generador de imágenes

### Responsabilidad
La rama `dev` es el **único punto autorizado para construir imágenes Docker**.

### Flujo
1. Los cambios finales se integran en `dev`.
2. Cada commit:
   - Construye la imagen Docker.
   - Publica la imagen en Azure Container Registry (ACR).
3. Cada imagen se publica con un **tag inmutable** (versión, build-id o commit).
4. El entorno DEV puede usar el tag `latest` **solo para desarrollo**.

### Reglas
- `latest` **no se utiliza** en UAT ni PRD.
- `dev` representa **código integrado y estable**, no un sandbox experimental.

---

## 6. Azure Container Registry (ACR)

- ACR es **centralizado** para todos los ambientes.
- Las imágenes se construyen **una sola vez**.
- UAT y PRD consumen **exactamente la misma imagen** validada.

---

## 7. UAT – Despliegue con Terraform

### Responsabilidad
Validación funcional y técnica de versiones candidatas.

### Flujo
1. La rama `uat_v1` **ejecuta pipelines**.
2. Se ejecuta Terraform para:
   - Crear o actualizar el Container App de UAT.
   - Referenciar un **tag explícito** existente en ACR.
3. **No se construyen imágenes** en UAT.
4. Se realizan pruebas funcionales y de negocio.

### Resultado
La versión validada en UAT queda **lista para ser promovida a producción**.

---

## 8. PRD – Producción (sin pipelines)

### Responsabilidad
Ejecutar únicamente versiones **aprobadas y estables**.

### Flujo
1. La rama `prd_v1` **no ejecuta pipelines**.
2. No se construyen imágenes.
3. No se ejecuta Terraform automáticamente.
4. El despliegue a producción es:
   - **Manual y controlado**
   - Basado en el **mismo tag validado en UAT**
   - Requiere **aprobación explícita**

> Producción no es un ambiente automatizado; es un entorno protegido.

---

## 9. Infraestructura en Azure

### Recursos centralizados
- Azure Container Registry
- Bases de datos
- DNS

### Recursos por ambiente
- Azure Container Apps independientes para:
  - DEV
  - UAT
  - PRD

### Terraform
- Define toda la infraestructura.
- Usa variables por ambiente (ej. `image_tag`).
- Es la **única fuente de verdad** para despliegues.

---

## 10. Manejo de versiones

### Reglas
- Cada imagen debe tener un **tag inmutable**.
- UAT y PRD **siempre** usan tags explícitos.
- `latest` solo existe para DEV.

### Ejemplos de tags válidos
- `1.2.0`
- `build-20260112-01`
- `commit-a8f93c1`

---

## 11. Fortalezas del modelo

- ✅ Trazabilidad completa
- ✅ Reproducibilidad total
- ✅ Producción blindada
- ✅ Rollback sencillo
- ✅ Escalable a múltiples servicios

---

## 12. Riesgos y mitigaciones

| Riesgo                | Mitigación                       |
|----------------------|----------------------------------|
| Error humano en PRD  | Runbook + checklist              |
| Inestabilidad en DEV | Reglas de merge y revisión       |
| Cambios urgentes     | Proceso de excepción documentado |

---

## 13. Conclusión

Este modelo prioriza **control, estabilidad y claridad operativa** sobre velocidad extrema.  
Es adecuado para entornos empresariales donde producción debe estar protegida y auditada.

---

## 14. Próximos pasos recomendados

- Checklist formal de despliegue a PRD
- Criterios de promoción UAT → PRD
- Procedimiento de rollback documentado
- Versionado semántico estandarizado

---
