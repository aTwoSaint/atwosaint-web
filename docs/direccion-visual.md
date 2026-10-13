# Dirección visual de ATWOSAINT

Propia, inspirada en la estructura de las referencias (rejilla densa de imágenes, navegación mínima, índices) sin copiar su código, recursos ni identidad. No se usa el concepto de sistema operativo retro de another-chapter ni el logotipo o composición de YMH.

## Principios

- **Editorial y minimalista:** mucho espacio negativo, imagen como protagonista, texto contenido.
- **Cultura digital en los detalles:** índices numerados en monoespaciada (`001`), contador de referencias `(05)`, un único acento de "señal".
- **Un solo lugar para cambiar la identidad:** `src/styles/tokens.css`.

## Tokens

| Token | Claro | Oscuro |
|---|---|---|
| `--paper` | `#efeee9` | `#0d0d0c` |
| `--ink` | `#111111` | `#ecebe6` |
| `--muted` | `#6b6b66` | `#8f8f88` |
| `--line` | `#d6d5cf` | `#2a2a27` |
| `--accent` | `#ff3b1f` | `#ff3b1f` |

Tipografía: Geist Sans (texto y títulos) y Geist Mono (índices y etiquetas), autoalojadas mediante el paquete `geist`; no dependen de Google Fonts.

## Composición

- **Logotipo provisional:** palabra `ATWOSAINT` en mayúsculas con espaciado amplio y un cuadrado de acento, arriba a la izquierda. Sustituible por un SVG propio cuando exista.
- **Navegación:** una sola entrada (Referencias), igual en todos los tamaños.
- **Rejilla:** 2 columnas en móvil, 3 desde tableta (768 px) y 4 desde 1536 px. Imágenes 4:5 con recorte `cover`.
- **Hover:** si una referencia tiene imagen alternativa, aparece al pasar el cursor o con el foco del teclado (fundido de 300 ms). Se desactiva con `prefers-reduced-motion`.
- **Ficha:** página propia `/referencias/[slug]` con imágenes, categoría, título, descripción y enlaces a la anterior y la siguiente.
- **Estados:** carga (marcadores 4:5), sin referencias, error con reintento y 404.
- **Footer:** mínimo (marca y año).

## Contenido de ejemplo

Las 5 referencias actuales son composiciones abstractas generadas para el proyecto (`public/ejemplos/`). Se sustituyen por contenido real en la Fase 4.
