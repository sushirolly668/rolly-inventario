# Rolli Sushi — Inventario

App web para control de inventario con alertas de stock mínimo. Diseñada para uso en celular (iOS y Android).

## Estructura

- `/` — pantalla de selección de estación
- `/sushi` — estación Sushi
- `/caliente` — estación Caliente + Empanizados + Loza
- `/verduras` — estación Verduras + Carnes/Pescados
- `/unicel` — estación Unicel
- `/mesas` — estación Mesas

## Cómo subir a Vercel (deploy)

### Paso 1: Subir a GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Crea un repositorio nuevo: nombre `rolli-inventario`, público o privado (ambos funcionan)
3. **No** inicialices con README, .gitignore ni license
4. En la terminal de tu computadora, entra a la carpeta del proyecto:
   ```bash
   cd rolli-app
   git init
   git add .
   git commit -m "Versión inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/rolli-inventario.git
   git push -u origin main
   ```
   (Reemplaza `TU_USUARIO` con tu usuario real de GitHub)

### Paso 2: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y entra con tu cuenta de GitHub
2. Pica "Add New..." > "Project"
3. Encuentra el repositorio `rolli-inventario` y pica "Import"
4. No cambies ninguna configuración, solo pica "Deploy"
5. Espera ~1 minuto
6. Obtendrás un link tipo `rolli-inventario-xxx.vercel.app`

### Paso 3: Links para empleados

Cada empleado abre su link directo. Ejemplos (reemplaza con tu dominio real):

- Sushi: `https://tu-app.vercel.app/sushi`
- Caliente: `https://tu-app.vercel.app/caliente`
- Verduras: `https://tu-app.vercel.app/verduras`
- Unicel: `https://tu-app.vercel.app/unicel`
- Mesas: `https://tu-app.vercel.app/mesas`

Los empleados pueden agregar la app a su pantalla de inicio para que se vea como una app nativa.

## Cómo editar productos o mínimos

Todo está en `src/data.js`. Editas ahí, haces commit, push, y Vercel redespliega automáticamente.

## Desarrollo local

```bash
npm install
npm run dev
```

## Construir para producción

```bash
npm run build
```
