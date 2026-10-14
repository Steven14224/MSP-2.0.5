# Sermaínca: sitio web

Reconstrucción y mejora de https://sermainca.com/. Sitio estático en HTML, CSS y JavaScript, sin dependencias ni paso de compilación.

## Ver en local

```bash
cd sermainca
python3 -m http.server 8000
# abrir http://localhost:8000
```

Para publicar, suba la carpeta completa a cualquier hosting estático (cPanel, Netlify, Vercel, GitHub Pages…).

## Configuración

Edite el objeto `CONFIG` al inicio de `js/main.js`:

| Clave | Para qué sirve |
|---|---|
| `whatsapp` | Número que reciben el formulario, los tickets y el botón flotante (formato `593…`, sin `+`). |
| `emailContacto` / `emailProyectos` | Correos de la alternativa por correo del formulario. |
| `formEndpoint` | Opcional. URL de Formspree, Getform o un backend propio. Si la llena, el formulario envía los datos por POST en JSON en lugar de abrir WhatsApp. |
| `horario` | Días y horas de atención. Controlan el indicador "Atendiendo ahora". |
| `redes` | URLs de LinkedIn, Facebook e Instagram. Las que queden vacías no se muestran. |
| `zonas` | Sectores que acepta el verificador de cobertura. |

Si cambia el teléfono, actualícelo también en `index.html` (enlace `tel:`, botón flotante y JSON-LD).

## Funciones

**Incluidas del sitio original:** menú fijo, hero con estadísticas, tarjetas de servicios, servicios detallados, clientes, casos de éxito, sección Acerca de con estándares de calidad, formulario de contacto con mensaje de éxito y pie de página.

**Nuevas:**
- El formulario de contacto envía de verdad: abre WhatsApp con la solicitud y ofrece la alternativa por correo, o usa un endpoint configurable. Valida cada campo, tiene trampa anti-spam y contador de caracteres.
- Mesa de ayuda: los clientes generan tickets con número de seguimiento (`SM-AAMMDD-XXXX`) que se envían por WhatsApp. El navegador guarda un historial local.
- Calculadora de ahorro para el alquiler de impresoras HP.
- Pólizas de soporte (Esencial, Empresarial, Integral). Cada botón preselecciona el servicio en el formulario.
- Verificador de cobertura por sector y mapa de Quito.
- Filtro de casos de éxito y KPIs por caso.
- Sección "Cómo trabajamos" y preguntas frecuentes.
- Tema claro/oscuro guardado, botón flotante de WhatsApp, botón "volver arriba" y barra de progreso.
- Menú que resalta la sección visible, contadores y barras animadas.
- SEO: metaetiquetas, Open Graph, datos estructurados `LocalBusiness`, `sitemap.xml` y `robots.txt`.
- Accesibilidad: enlace "saltar al contenido", pestañas operables con teclado, foco visible y respeto a `prefers-reduced-motion`.
- Una sola página con secciones en lugar de pestañas ocultas, para que Google indexe todo el contenido. No carga Tailwind por CDN.
