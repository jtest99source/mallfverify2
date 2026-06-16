 CODEX.md — Mallorca Verified MVP

## 1. Objetivo del proyecto

Construir el MVP de **Mallorca Verified**, una web editorial/directorio sobre Mallorca enfocada en SEO y GEO.

La web debe servir para:

1. Publicar rankings y guías tipo:
   - Top 5 restaurantes desconocidos en Mallorca
   - Mejores beach clubs de Mallorca
   - Mejores hoteles boutique en Mallorca
   - Mejores rutas en barco desde Palma
   - Mejores calas para llegar en barco

2. Crear fichas estructuradas de negocios:
   - Restaurantes
   - Hoteles
   - Beach clubs
   - Empresas de alquiler de barcos
   - Actividades
   - Playas/calas

3. Preparar la web para SEO/GEO desde el día 1:
   - URLs limpias
   - metadatos por página
   - schema.org JSON-LD
   - FAQs
   - estructura semántica clara
   - contenido indexable
   - sitemap
   - robots.txt

4. Permitir escalar a varios idiomas en el futuro:
   - español
   - inglés
   - alemán

No construir todavía login, panel complejo, pagos ni marketplace. Primero queremos una web rápida, bien estructurada y fácil de alimentar con contenido.

---

## 2. Stack recomendado

Usar:

- Next.js con App Router
- TypeScript
- Tailwind CSS
- MDX o archivos de datos locales al principio
- Zod para validar datos
- next-sitemap o generación propia de sitemap

Prioridades:

- rendimiento
- SEO
- estructura limpia
- componentes reutilizables
- fácil migración futura a CMS

No usar todavía:

- autenticación
- base de datos compleja
- Stripe
- dashboard de clientes
- funciones serverless innecesarias

---

## 3. Estructura de carpetas deseada

Crear una estructura similar a esta:

```txt
/src
  /app
    /[locale]
      page.tsx
      /restaurants
        page.tsx
        /[slug]
          page.tsx
      /hotels
        page.tsx
        /[slug]
          page.tsx
      /beach-clubs
        page.tsx
        /[slug]
          page.tsx
      /boats
        page.tsx
        /[slug]
          page.tsx
      /activities
        page.tsx
        /[slug]
          page.tsx
      /beaches
        page.tsx
        /[slug]
          page.tsx
      /guides
        page.tsx
        /[slug]
          page.tsx
      /rankings
        page.tsx
        /[slug]
          page.tsx
    sitemap.ts
    robots.ts
    layout.tsx
    globals.css

  /components
    Header.tsx
    Footer.tsx
    Hero.tsx
    BusinessCard.tsx
    RankingCard.tsx
    GuideCard.tsx
    FAQ.tsx
    MapPlaceholder.tsx
    Breadcrumbs.tsx
    CTABox.tsx
    JsonLd.tsx

  /data
    restaurants.ts
    hotels.ts
    beachClubs.ts
    boats.ts
    activities.ts
    beaches.ts
    guides.ts
    rankings.ts

  /lib
    seo.ts
    schema.ts
    slugs.ts
    i18n.ts
    data.ts

  /types
    business.ts
    guide.ts
    ranking.ts
```

---

## 4. Idiomas

Preparar la web para estos locales:

```ts
const locales = ['es', 'en', 'de'] as const;
const defaultLocale = 'es';
```

La versión inicial puede tener contenido real solo en español, pero la arquitectura debe soportar URLs como:

```txt
/es/restaurants
/en/restaurants
/de/restaurants
```

No traducir automáticamente todavía. Usar placeholders o fallback al español si no existe traducción.

---

## 5. Modelo de datos para negocios

Crear un tipo `Business` reutilizable.

```ts
export type BusinessCategory =
  | 'restaurant'
  | 'hotel'
  | 'beach-club'
  | 'boat-rental'
  | 'activity'
  | 'beach';

export type PriceLevel = '€' | '€€' | '€€€' | '€€€€';

export type Business = {
  id: string;
  slug: string;
  name: string;
  category: BusinessCategory;
  shortDescription: string;
  description: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  instagram?: string;
  phone?: string;
  priceLevel?: PriceLevel;
  tags: string[];
  bestFor: string[];
  image?: string;
  gallery?: string[];
  openingHours?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
};
```

Ejemplo de negocio:

```ts
export const restaurants: Business[] = [
  {
    id: 'vandal-palma',
    slug: 'vandal-palma',
    name: 'Vandal Palma',
    category: 'restaurant',
    shortDescription: 'Restaurante creativo en Palma con cocina internacional y platos para compartir.',
    description: 'Vandal Palma es uno de los restaurantes más conocidos de Palma para quienes buscan una experiencia gastronómica creativa, moderna y diferente.',
    area: 'Palma',
    address: 'Santa Catalina, Palma de Mallorca',
    website: '',
    instagram: '',
    priceLevel: '€€€',
    tags: ['cocina creativa', 'palma', 'cena', 'parejas'],
    bestFor: ['cena especial', 'parejas', 'foodies'],
    image: '/images/placeholder-restaurant.jpg',
    faqs: [
      {
        question: '¿Vandal Palma es recomendable para una cena especial?',
        answer: 'Sí, es una buena opción para una cena diferente en Palma, especialmente si buscas platos creativos y ambiente animado.'
      }
    ],
    seo: {
      title: 'Vandal Palma: opinión, ubicación y consejos | Mallorca Verified',
      description: 'Guía rápida de Vandal Palma: qué esperar, para quién es recomendable y consejos antes de reservar.'
    },
    updatedAt: '2026-06-07'
  }
];
```

---

## 6. Modelo de datos para rankings

Crear un tipo `Ranking`.

```ts
export type Ranking = {
  id: string;
  slug: string;
  locale: 'es' | 'en' | 'de';
  title: string;
  hook: string;
  intro: string;
  category: 'restaurants' | 'hotels' | 'beach-clubs' | 'boats' | 'activities' | 'beaches';
  area?: string;
  items: {
    position: number;
    businessId?: string;
    name: string;
    description: string;
    whyWePickedIt: string;
    bestFor: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
};
```

Ejemplo:

```ts
export const rankings: Ranking[] = [
  {
    id: 'top-restaurantes-desconocidos-mallorca',
    slug: 'top-restaurantes-desconocidos-mallorca',
    locale: 'es',
    title: 'Top 5 restaurantes desconocidos en Mallorca',
    hook: 'Después de probar cientos de restaurantes en Mallorca, estos son 5 sitios que mucha gente todavía no conoce.',
    intro: 'Mallorca tiene restaurantes muy famosos, pero también hay lugares menos obvios que merecen mucha más atención. Esta selección está pensada para quienes quieren salir de los típicos sitios turísticos.',
    category: 'restaurants',
    items: [
      {
        position: 1,
        name: 'Restaurante ejemplo',
        description: 'Un restaurante pequeño con cocina mediterránea y producto local.',
        whyWePickedIt: 'Lo incluimos porque combina buena comida, ambiente auténtico y una experiencia menos turística.',
        bestFor: ['cena tranquila', 'producto local', 'parejas']
      }
    ],
    faqs: [
      {
        question: '¿Cuál es la mejor zona para encontrar restaurantes poco turísticos en Mallorca?',
        answer: 'Palma, Sóller, Artà y algunos pueblos del interior suelen tener opciones interesantes fuera del circuito más turístico.'
      }
    ],
    seo: {
      title: 'Top 5 restaurantes desconocidos en Mallorca | Mallorca Verified',
      description: 'Una selección de restaurantes menos conocidos en Mallorca para comer bien fuera de los sitios más turísticos.'
    },
    updatedAt: '2026-06-07'
  }
];
```

---

## 7. Páginas principales

### Home

Ruta:

```txt
/[locale]
```

Debe incluir:

- Hero con propuesta clara:
  - “Mallorca verificada con datos reales”
  - en español: “Mallorca verificada con datos reales”
- Buscador simple visual, aunque todavía no sea funcional avanzado
- Secciones:
  - Restaurantes
  - Hoteles
  - Beach clubs
  - Barcos
  - Actividades
  - Playas
- Últimos rankings
- Últimas guías
- CTA para negocios:
  - “¿Tienes un negocio en Mallorca? Solicita aparecer en Mallorca Verified.”

### Listados de categoría

Rutas:

```txt
/[locale]/restaurants
/[locale]/hotels
/[locale]/beach-clubs
/[locale]/boats
/[locale]/activities
/[locale]/beaches
```

Cada listado debe tener:

- H1 claro
- texto introductorio SEO
- cards de negocios
- filtros simples por zona/tag, aunque sean client-side
- enlaces internos a rankings relacionados
- FAQ al final

### Página de negocio

Ruta:

```txt
/[locale]/restaurants/[slug]
```

Debe incluir:

- H1 con nombre del negocio
- descripción corta
- zona
- tags
- imagen placeholder
- sección “Ideal para”
- descripción larga
- FAQs
- ficha rápida:
  - zona
  - precio
  - web
  - Instagram
  - teléfono
- negocios relacionados
- JSON-LD LocalBusiness

### Rankings

Ruta:

```txt
/[locale]/rankings/[slug]
```

Debe incluir:

- H1
- hook
- intro
- lista numerada
- cada item con:
  - nombre
  - descripción
  - por qué lo elegimos
  - ideal para
- FAQ
- enlaces a fichas de negocios si existen
- JSON-LD ItemList + FAQPage

### Guías

Ruta:

```txt
/[locale]/guides/[slug]
```

Debe servir para artículos evergreen tipo:

- Qué hacer en Mallorca en 3 días
- Mejor época para visitar Mallorca
- Ruta en barco desde Palma
- Dónde alojarse en Mallorca por zonas

---

## 8. SEO técnico obligatorio

Implementar helper `generateSeoMetadata` en `/lib/seo.ts`.

Cada página importante debe tener:

- title
- description
- canonical
- Open Graph
- Twitter Card
- alternates por idioma cuando aplique

Ejemplo de title:

```txt
Top 5 restaurantes desconocidos en Mallorca | Mallorca Verified
```

Ejemplo de description:

```txt
Descubre 5 restaurantes menos conocidos en Mallorca para comer bien fuera de los sitios turísticos habituales.
```

Crear:

- `/sitemap.xml`
- `/robots.txt`

El sitemap debe incluir:

- home por idioma
- categorías
- fichas de negocios
- rankings
- guías

---

## 9. GEO obligatorio

La web debe estar pensada para que modelos de IA entiendan claramente las entidades.

Instrucciones:

1. Usar nombres reales y consistentes de negocios.
2. No abusar de texto genérico.
3. Cada ficha debe responder preguntas concretas.
4. Cada ranking debe explicar por qué aparece cada sitio.
5. Usar schema JSON-LD:
   - LocalBusiness
   - Restaurant
   - Hotel
   - TouristAttraction
   - FAQPage
   - ItemList
   - BreadcrumbList
6. Añadir fecha `updatedAt` visible en rankings y guías.
7. Añadir bloques FAQ en todas las páginas clave.
8. Añadir enlaces internos entre:
   - rankings
   - fichas
   - guías
   - categorías

Crear archivo `/lib/schema.ts` con funciones:

```ts
createLocalBusinessSchema(business)
createFAQSchema(faqs)
createItemListSchema(ranking)
createBreadcrumbSchema(items)
```

---

## 10. Diseño

Estilo visual:

- premium pero editorial
- limpio
- mucho espacio blanco
- tarjetas grandes
- imágenes grandes
- tipografía elegante
- mobile-first

Inspiración conceptual:

- guía editorial de viajes
- medio local premium
- no parecer un directorio barato

Componentes clave:

### BusinessCard

Debe mostrar:

- imagen
- nombre
- zona
- descripción corta
- tags
- CTA “Ver guía”

### RankingCard

Debe mostrar:

- título
- hook corto
- categoría
- fecha de actualización

### CTABox

Texto:

```txt
¿Tienes un negocio en Mallorca?
Solicita aparecer en Mallorca Verified y mejora tu visibilidad en buscadores e IA.
```

Botón:

```txt
Solicitar inclusión
```

De momento el botón puede llevar a:

```txt
mailto:hola@mallorcaverified.com
```

---

## 11. Contenido inicial mínimo

Crear datos iniciales de ejemplo:

- 10 restaurantes
- 5 hoteles
- 5 beach clubs
- 5 empresas de barcos
- 5 playas/calas
- 3 rankings
- 3 guías

Importante:

- Usar placeholders donde falten datos.
- No inventar claims demasiado específicos.
- No poner “el mejor” como hecho absoluto; usar lenguaje editorial:
  - “uno de los más recomendables”
  - “una buena opción para...”
  - “destaca por...”

Rankings iniciales:

1. Top 5 restaurantes desconocidos en Mallorca
2. Mejores beach clubs de Mallorca
3. Mejores rutas en barco desde Palma

Guías iniciales:

1. Dónde alojarse en Mallorca según tu tipo de viaje
2. Qué hacer en Mallorca en 3 días
3. Guía básica para alquilar un barco en Mallorca

---

## 12. Reglas de contenido

El tono debe ser:

- directo
- útil
- editorial
- con criterio
- no demasiado corporativo
- no sonar a texto SEO barato

Evitar frases como:

- “Mallorca es un destino paradisíaco...”
- “Nuestra misión es ofrecer...”
- “Sumérgete en una experiencia inolvidable...”

Preferir frases como:

- “Si buscas una cena tranquila lejos de las zonas más turísticas, este sitio tiene sentido.”
- “No es el beach club más barato, pero destaca por ubicación y ambiente.”
- “Esta ruta funciona especialmente bien si es tu primera vez alquilando barco en Mallorca.”

---

## 13. URLs deseadas

Usar slugs limpios.

Ejemplos:

```txt
/es/restaurants/vandal-palma
/es/rankings/top-restaurantes-desconocidos-mallorca
/es/guides/guia-alquilar-barco-mallorca
/es/beach-clubs/nikki-beach-mallorca
/es/boats/alquiler-barcos-palma
```

No usar IDs numéricos en URLs.

---

## 14. Performance

Obligatorio:

- usar imágenes optimizadas con `next/image`
- lazy loading cuando aplique
- evitar librerías pesadas innecesarias
- componentes server-first por defecto
- client components solo para filtros/interactividad

---

## 15. Analytics y tracking

Preparar estructura para añadir más adelante:

- Google Analytics
- Google Search Console
- Meta Pixel
- TikTok Pixel

De momento crear un archivo:

```txt
/src/lib/analytics.ts
```

con funciones placeholder.

---

## 16. Formularios futuros

No crear backend todavía.

Pero preparar una página:

```txt
/[locale]/business
```

Con contenido:

- “Aparece en Mallorca Verified”
- explicación de ficha gratuita
- beneficios:
  - visibilidad
  - presencia en guías
  - SEO/GEO
  - contenido editorial
- CTA por email

Más adelante este formulario se podrá conectar a Airtable, Notion, Supabase o CRM.

---

## 17. Entregable esperado

Codex debe construir:

1. Proyecto Next.js funcional.
2. Home usable.
3. Páginas de categorías.
4. Páginas individuales de negocios.
5. Páginas de rankings.
6. Páginas de guías.
7. SEO metadata.
8. JSON-LD básico.
9. Sitemap y robots.
10. Datos iniciales.
11. Diseño responsive.

El resultado debe poder ejecutarse con:

```bash
npm install
npm run dev
```

Y abrir en:

```txt
http://localhost:3000/es
```

---

## 18. Orden de implementación sugerido para Codex

Seguir este orden:

1. Crear proyecto base con Next.js, TypeScript y Tailwind.
2. Crear tipos en `/types`.
3. Crear datos iniciales en `/data`.
4. Crear helpers de SEO y schema.
5. Crear componentes base.
6. Crear layout general.
7. Crear home.
8. Crear páginas de categoría.
9. Crear páginas de negocio dinámicas.
10. Crear rankings dinámicos.
11. Crear guías dinámicas.
12. Crear sitemap y robots.
13. Revisar responsive.
14. Revisar metadata.
15. Revisar errores TypeScript.

---

## 19. Criterios de calidad

Antes de terminar, comprobar:

- `npm run build` funciona.
- No hay errores TypeScript.
- Todas las rutas principales cargan.
- Hay H1 único en cada página.
- Cada página tiene title y description.
- Los JSON-LD se renderizan correctamente.
- Mobile se ve bien.
- Las fichas enlazan a rankings y viceversa.
- No hay contenido duplicado excesivo.

---

## 20. Importante: mentalidad del MVP

No intentar construir todo.

El objetivo de esta primera versión es:

- parecer una marca real
- tener una estructura SEO/GEO sólida
- publicar rápido
- convertir reels de Instagram/TikTok en páginas indexables
- preparar la base para vender visibilidad a negocios más adelante

La web debe sentirse como una guía premium de Mallorca, no como un directorio vacío.
