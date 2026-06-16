# AI Editorial JSON Hardening Sample Report

Generated: 2026-06-10T10:51:40.443Z

## Scope

- Requested sample after hardening: 20 businesses across the 6 categories.
- Real LLM base calls in the measured 20-business run: 20.
- Automatic retries observed in the measured run: 0.
- Final saved outputs: 20.
- JSON/API/schema/Zod failures in measured run: 0.
- Invalid JSON ratio after hardening: 0/20 = 0%.
- Provider: OpenAI via Responses API with strict JSON schema.

## Sample Results

### Restaurant Celler Ca'n Costa Alcúdia - restaurant - Alcúdia

- **Slug:** `restaurant-celler-ca-n-costa-alcudia`
- **Generated at:** 2026-06-10T10:46:39.298+00:00

**Editorial opinion**

Destaca por una cocina mediterránea con platos de pescado, carne y tapas en un entorno clásico y cuidado, con un patio que refuerza el carácter de casa antigua. El trato sale muy bien parado en conjunto, con un servicio cercano, profesional y atento incluso en noches concurridas. Es una opción sólida para una cena tranquila o una comida especial en Alcúdia, especialmente si se busca un sitio con personalidad y platos bien resueltos.

**Highlights**

- Cocina mediterránea con especialidad en paella, pescado, tapas y carnes
- Ambiente clásico y refinado, con patio interior
- Servicio cercano, profesional y atento
- Encaja bien para cena especial o comida tranquila

**Review themes**

- Servicio atento (mood-smile)
- Cocina mediterránea (tools-kitchen-2)
- Paella (tools-kitchen-2)
- Ambiente acogedor (sparkles)
- Cena especial (sunset)
- Plan familiar (umbrella)

**Pros**

- Servicio muy amable y profesional
- Pescado, tapas y carnes bien valorados
- Ambiente agradable incluso en noches ocupadas

**Cons**

- La paella no convence a todo el mundo
- Algún servicio puede ir lento en momentos de mucha demanda
- La presentación o ubicación del plato puede ser irregular

**Services**

- Patio interior (sparkles)
- Tapas compartidas (tools-kitchen-2)
- Paella (tools-kitchen-2)
- Pescado fresco (tools-kitchen-2)
- Carne (tools-kitchen-2)
- Servicio profesional (mood-smile)
- Apto para familias (umbrella)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** cena especial; comida tranquila; ir con familia; tapas compartidas; quien busca un sitio con ambiente clásico
- **price_signal:** -
- **cuisine_types:** mediterránea; española; tapas
- **dietary_notes:** -
- **service_notes:** trato cercano; personal profesional; atento y amable; buena atención en noches concurridas
- **atmosphere_tags:** clásico; refinado; acogedor; patio interior; cena tranquila
- **signature_items:** paella de marisco; bacalao; solomillo/filete de ternera; tapas compartidas; queso de cabra
- **reservation_notes:** conviene reservar en fin de semana o en noches de mucha afluencia

**Price estimate**

amount_min=20 | amount_max=30 | currency=EUR | unit=- | label=- | source=google_places | confidence=- | note=-

**FAQ**

- ¿Para qué plan encaja? - Encaja bien para una cena tranquila, una comida especial o para compartir tapas y platos mediterráneos en un entorno clásico.
- ¿Es buena opción para cenar? - Sí, especialmente si buscas una cena cuidada con pescado, carnes y tapas, y un servicio cercano.
- ¿El ambiente es tranquilo o animado? - Tiene un ambiente más bien tranquilo y clásico, aunque puede llenarse en noches ocupadas.
- ¿Conviene reservar? - Sí, es recomendable reservar si vas en viernes o en horas de más afluencia.

**Featured reviews**

- Tracy Blake - Tapas y carnes - 5 / 5
- Kristofer Stoker - Servicio y familia - 5 / 5
- Matthias Janeck - Paella - 3 / 5

### La nueva burguesa - restaurant - Palma

- **Slug:** `la-nueva-burguesa`
- **Generated at:** 2026-06-10T10:46:50.67+00:00

**Editorial opinion**

Destaca por las hamburguesas caseras, el ambiente acogedor y un trato cercano que acompaña bien una comida informal en Palma. La cocina parece cuidada al detalle, con patatas fritas hechas en casa y opciones pensadas también para quien busca alternativas sin gluten. Es una opción interesante para una cena relajada o para ir con reserva si quieres evitar esperas.

**Highlights**

- Hamburguesas hechas al momento con buen punto de cocción
- Patatas fritas caseras y bien trabajadas
- Opciones sin gluten con atención a la contaminación cruzada
- Ambiente cálido y servicio cercano

**Review themes**

- Hamburguesas caseras (tools-kitchen-2)
- Servicio atento (mood-smile)
- Ambiente acogedor (sparkles)
- Opciones sin gluten (tools-kitchen-2)
- Reserva recomendable (map-pin)

**Pros**

- Hamburguesas sabrosas y bien hechas
- Patatas fritas caseras y crujientes
- Trato amable y recomendaciones útiles

**Cons**

- Puede llenarse bastante
- Con poco personal, el servicio puede ir justo

**Services**

- Opciones sin gluten (sparkles)
- Recomendaciones personalizadas (mood-smile)
- Comida casera (tools-kitchen-2)
- Reserva recomendada (map-pin)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** cena informal; comer hamburguesas; personas que buscan opciones sin gluten; plan relajado en Palma
- **price_signal:** -
- **cuisine_types:** hamburguesas; comida informal
- **dietary_notes:** opciones sin gluten; cuidado con la contaminación cruzada
- **service_notes:** trato muy amable; recomendaciones útiles; atención cuidada
- **atmosphere_tags:** acogedor; cálido; informal; popular
- **signature_items:** hamburguesas de pollo; patatas fritas caseras
- **reservation_notes:** conviene reservar porque puede llenarse

**Price estimate**

amount_min=10 | amount_max=20 | currency=EUR | unit=- | label=- | source=google_places | confidence=- | note=-

**FAQ**

- ¿Para qué plan encaja? - Encaja bien para una comida o cena informal centrada en hamburguesas, con un ambiente acogedor y sin pretensiones.
- ¿Conviene reservar? - Sí, es recomendable reservar si quieres ir con más tranquilidad, porque puede llenarse.
- ¿Hay opciones para personas sin gluten? - Sí, aparecen varias opciones sin gluten y se menciona cuidado con la contaminación cruzada.
- ¿El servicio es cercano? - Sí, el trato se describe como muy amable y con recomendaciones útiles.

**Featured reviews**

- Angus - Servicio - 5 / 5
- Samara Halpern - Sin gluten - 5 / 5
- Isobel Roberts - Comida - 5 / 5

### Basico Gastrobar|Alcudia Restaurant - restaurant - Alcúdia

- **Slug:** `basico-gastrobar-alcudia-restaurant`
- **Generated at:** 2026-06-10T10:47:02.66+00:00

**Editorial opinion**

Destaca por una cocina mediterránea con paellas muy bien valoradas, tapas cuidadas y un ambiente agradable para comer sin prisas. El patio trasero y la terraza exterior aportan un punto especialmente cómodo para una comida relajada, con servicio atento y un trato cercano.

**Highlights**

- Paellas muy trabajadas, con especial mención a la paella y al arroz negro
- Tapas y platos de inspiración española y europea bien resueltos
- Patio trasero y comedor exterior con ambiente agradable y poco ruidoso
- Buena opción para una comida tranquila en familia o en pareja

**Review themes**

- Paellas destacadas (tools-kitchen-2)
- Servicio atento (mood-smile)
- Patio y terraza (umbrella)
- Ambiente acogedor (sparkles)
- Cocina variada (tools-kitchen-2)

**Pros**

- Paellas muy sabrosas y bien cocinadas
- Servicio amable y atento
- Patio trasero agradable y tranquilo

**Cons**

- La carta infantil podría tener más variedad
- Hay quien percibe la cuenta como alta para lo que ofrece

**Services**

- Terraza (sun)
- Patio interior (umbrella)
- Tapas (tools-kitchen-2)
- Paella (tools-kitchen-2)
- Comida para niños (mood-smile)
- Servicio atento (mood-smile)

**Category attributes confidence:** medium

**Category attributes data**

- **best_for:** comida relajada; cena tranquila; familias; parejas; amantes de la paella
- **price_signal:** expensive
- **cuisine_types:** mediterránea; española; europea
- **dietary_notes:** -
- **service_notes:** trato atento; personal amable; servicio cuidado
- **atmosphere_tags:** acogedor; tranquilo; agradable; patio trasero; terraza exterior
- **signature_items:** paella; arroz negro; tapas; calamares; pan con tomate; ensalada de atún
- **reservation_notes:** -

**Price estimate**

amount_min=80 | amount_max=125 | currency=EUR | unit=person | label=por persona | source=reviews | confidence=medium | note=Se menciona una cuenta de 125 € para 5 personas y otra referencia de 80 € como mínimo en una cena.

**FAQ**

- ¿Para qué plan encaja? - Encaja bien para una comida tranquila, una cena relajada o un plan en familia, especialmente si apetece paella, tapas o cocina mediterránea.
- ¿Es buena opción para cenar? - Sí, por el ambiente agradable y el servicio atento, aunque también funciona muy bien al mediodía.
- ¿El ambiente es tranquilo o animado? - Más bien tranquilo y agradable, con comedor exterior y patio trasero que ayudan a una comida sin ruido excesivo.
- ¿Conviene reservar? - No hay una mención clara a reservas, pero por el tipo de sitio y el patio exterior puede ser buena idea en horas fuertes.

**Featured reviews**

- Klaudia Rydzanicz - Paella - 5 / 5
- Richard Khaldi - Patio y comida - 5 / 5
- Arne Mathiassen - Precio - 4 / 5

### Iberostar Waves Playa de Muro - hotel - Playa de Muro

- **Slug:** `iberostar-waves-playa-de-muro`
- **Generated at:** 2026-06-10T10:47:16.055+00:00

**Editorial opinion**

Destaca por un ambiente muy orientado a familias, con trato cercano y una atención especialmente resolutiva en restaurante y con niños. La estancia se apoya en habitaciones limpias, zonas comunes cuidadas y una oferta de comida amplia, con margen para pequeños detalles de mantenimiento y aislamiento acústico.

**Highlights**

- Ambiente muy familiar, con animación y opciones pensadas para niños
- Desayuno y buffet con variedad y platos que cambian a diario
- Personal amable, cercano y muy pendiente de necesidades especiales
- Instalaciones limpias y con varias comodidades para una estancia cómoda

**Review themes**

- Ambiente familiar (sparkles)
- Servicio atento (mood-smile)
- Comida variada (tools-kitchen-2)
- Limpieza (sparkles)
- Animación infantil (umbrella)
- Descanso y tranquilidad (moon)

**Pros**

- Personal muy amable y servicial
- Comida variada y de buen nivel
- Muy buena opción para familias con niños

**Cons**

- Aislamiento acústico mejorable en algunas habitaciones
- Poco espacio de estanterías en alguna habitación
- En temporada baja pueden cerrar bares o restaurantes

**Services**

- Piscina (pool)
- Spa (massage)
- Restaurante buffet (tools-kitchen-2)
- Club infantil (umbrella)
- Animación (music)
- Masajes (massage)
- Habitaciones limpias (sparkles)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** familias con niños; viajes cómodos; quien busca buena comida y trato cercano; parejas que priorizan descanso y playa
- **cautions:** en temporada baja algunos bares o restaurantes pueden estar cerrados; el spa/masajes puede resultar poco práctico para uso frecuente; el aislamiento acústico no es perfecto
- **amenities:** piscina; spa; restaurante buffet; club infantil; animación; masajes
- **stay_type:** vacaciones en familia; escapada cómoda; estancia de descanso
- **room_notes:** habitaciones limpias; aislamiento acústico mejorable; algo más de espacio de estanterías en algunas habitaciones
- **food_board_notes:** buffet con buena comida; variedad amplia; platos que cambian a diario; opciones especiales para alergias
- **location_strengths:** frente a la playa
- **service_highlights:** trato muy amable; personal resolutivo; atención cuidada en restaurantes
- **family_friendliness:** muy orientado a familias; club infantil y animación; personal atento con niños y alergias

**Price estimate**

_Sin precio_

**FAQ**

- ¿Para qué tipo de estancia encaja mejor? - Encaja sobre todo en vacaciones en familia y en una estancia cómoda de playa, con piscina, club infantil, animación y un buffet amplio.
- ¿Es buena opción para ir en pareja? - Puede encajar si buscáis una estancia tranquila y bien cuidada, pero el perfil que más destaca es el familiar.
- ¿Qué destaca de las habitaciones e instalaciones? - Las habitaciones se mantienen limpias y el hotel ofrece varias comodidades, piscina, spa, masajes y zonas pensadas para niños. Como matiz, el aislamiento acústico no es perfecto en algunas habitaciones.
- ¿La comida funciona bien para familias? - Sí, el buffet ofrece variedad y el equipo de restaurante atiende bien necesidades especiales, incluidas alergias.
- ¿Hay algo a tener en cuenta en temporada baja? - En temporada baja pueden estar cerrados algunos bares o restaurantes, así que la oferta se reduce respecto a plena temporada.

**Featured reviews**

- Andrew Cadrell - Familias y comida - 5 / 5
- Markus - Servicio y limpieza - 5 / 5
- Emily Perzan - Habitaciones y buffet - 4 / 5

### Alcudia Garden Aparthotel - hotel - Alcúdia

- **Slug:** `alcudia-garden-aparthotel`
- **Generated at:** 2026-06-10T10:47:29.225+00:00

**Editorial opinion**

Destaca por un ambiente tranquilo, habitaciones amplias y una propuesta muy pensada para familias y estancias cómodas cerca de la playa. Encaja bien si buscas un aparthotel práctico, con piscina, actividades para niños y un buffet variado, aunque conviene asumir que parte del edificio y algunas habitaciones muestran un aire algo antiguo.

**Highlights**

- A pocos pasos de la playa y en una zona tranquila
- Apartamentos amplios, limpios y con balcón en algunas unidades
- Piscina y actividades diarias para niños y adultos
- Buffet con variedad y opciones para familias

**Review themes**

- Ambiente familiar (mood-smile)
- Ubicación cómoda (map-pin)
- Piscina (pool)
- Servicio atento (sparkles)
- Instalaciones amplias (tools-kitchen-2)
- Mantenimiento mejorable (tools-kitchen-2)

**Pros**

- Personal amable y resolutivo
- Apartamentos limpios, cómodos y bien equipados
- Buffet variado y actividades para niños

**Cons**

- Algunas habitaciones y zonas se ven anticuadas
- Hay comentarios sobre necesidad de renovación
- Se menciona un incidente grave de seguridad en una habitación de planta baja

**Services**

- Piscina (pool)
- Gimnasio (tools-kitchen-2)
- Actividades infantiles (mood-smile)
- Actividades para adultos (sparkles)
- Buffet (tools-kitchen-2)
- Balcón (umbrella)
- Aparcamiento para bicicleta en la habitación (parking)
- Cunas y tronas (mood-smile)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** familias; viajes cómodos cerca de la playa; quien busca un aparthotel práctico; estancias con niños
- **cautions:** algunas zonas necesitan renovación; se menciona un incidente grave de seguridad en una habitación de planta baja; faltaría hervidor y té en la habitación
- **amenities:** piscina; gimnasio; buffet; balcón; cocina americana; actividades diarias; cunas; tronas
- **stay_type:** aparthotel; estancia familiar; escapada cómoda; viaje de playa
- **room_notes:** apartamentos amplios; limpios; cómodos; bien equipados con lo básico; algunas habitaciones están anticuadas; hay kitchenette
- **food_board_notes:** buffet variado; buena calidad; preparado para familias; con opciones para distintos gustos
- **location_strengths:** a pocos pasos de la playa; zona tranquila; supermercados cerca
- **service_highlights:** personal amable y servicial; equipo de animación infantil destacado; check-in temprano en una estancia
- **family_friendliness:** muy orientado a familias; actividades para niños y adultos; cunas disponibles; tronas en el buffet

**Price estimate**

_Sin precio_

**FAQ**

- ¿Para qué tipo de estancia encaja mejor? - Encaja sobre todo en viajes de playa y estancias cómodas en formato aparthotel, especialmente si se viaja en familia o se valora tener espacio y servicios prácticos.
- ¿Es buena opción para ir en familia? - Sí. Hay actividades para niños y adultos, cunas bajo petición y tronas en el buffet, además de un ambiente muy orientado a familias.
- ¿Qué destaca de las habitaciones? - Son amplias, limpias y cómodas, con equipamiento básico útil. A cambio, algunas se ven anticuadas y hay quien echa en falta detalles como hervidor o té.
- ¿La ubicación es cómoda para la playa? - Sí, queda a poca distancia a pie de la playa y en una zona tranquila, con supermercados cerca.

**Featured reviews**

- Ben Kwok - Habitaciones y buffet - 4 / 5
- Gizelle Vieira - Apartamento y piscina - 5 / 5
- Jess de Swart - Ubicación y limpieza - 5 / 5

### Iberostar Selection Playa de Muro Village - hotel - Playa de Muro

- **Slug:** `iberostar-selection-playa-de-muro-village`
- **Generated at:** 2026-06-10T10:47:41.023+00:00

**Editorial opinion**

Destaca por el acceso directo a una playa muy valorada, un ambiente cuidado y un trato especialmente cálido en las comidas y en la llegada. Encaja bien para una estancia cómoda en familia o en pareja, con habitaciones amplias y modernas, buena oferta de buffet y una base tranquila para descansar junto al mar.

**Highlights**

- Acceso directo a una de las playas más apreciadas de la zona
- Habitaciones amplias, modernas y con balcón grande en varias tipologías
- Buffet con mucha variedad y buena valoración general
- Personal cercano y resolutivo, con especial atención a familias y niños

**Review themes**

- Servicio atento (mood-smile)
- Playa cercana (umbrella)
- Habitaciones amplias (sparkles)
- Buffet variado (tools-kitchen-2)
- Ubicación cómoda (map-pin)
- Piscina y spa (pool)

**Pros**

- Personal muy amable y cercano
- Playa preciosa a pie del hotel
- Habitaciones amplias y modernas

**Cons**

- Problemas puntuales de hormigas en una habitación
- El jacuzzi apareció frío en una estancia
- La zona infantil se queda algo corta para niños pequeños

**Services**

- Piscina (pool)
- Spa (massage)
- Restaurante buffet (tools-kitchen-2)
- Acceso a la playa (umbrella)
- Habitaciones familiares (sparkles)
- Balcón (map-pin)
- Jacuzzi (pool)
- Atención en comidas (mood-smile)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** familias; parejas; viaje cómodo junto al mar; quien busque descanso con playa
- **cautions:** problemas puntuales de hormigas en una habitación; jacuzzi frío en una estancia; zona infantil algo limitada; el restaurante puede llenarse mucho
- **amenities:** piscina; spa; restaurante buffet; jacuzzi; acceso directo a la playa; balcón; habitaciones familiares
- **stay_type:** hotel de playa; estancia cómoda; vacaciones en familia; escapada en pareja
- **room_notes:** habitaciones amplias; habitaciones modernas; super king bed; balcón grande; ducha amplia; sin bañera en algunas habitaciones
- **food_board_notes:** buffet bueno; mucha variedad; restaurante muy concurrido en horas punta
- **location_strengths:** junto a una playa muy bonita; ubicación cómoda para ir a la playa
- **service_highlights:** personal cálido y amable; check-in acogedor; resolutivos ante incidencias; muy atentos en las comidas
- **family_friendliness:** trato muy bueno con niños; habitaciones familiares amplias; faltan algunas zonas de juego para niños pequeños

**Price estimate**

_Sin precio_

**FAQ**

- ¿Encaja para una estancia en familia? - Sí, especialmente si buscáis habitaciones amplias, acceso a la playa y un trato muy cercano con los niños. Como matiz, la zona de juego infantil parece algo limitada para los más pequeños.
- ¿Es buena opción para ir en pareja? - Sí, por el ambiente cuidado, la playa delante y la sensación de descanso que transmite el conjunto. También encaja para una escapada cómoda junto al mar.
- ¿Qué destaca de las habitaciones? - Las habitaciones se describen como amplias y modernas, con balcón grande en algunos casos, cama muy cómoda y ducha agradable. En algunas estancias no hay bañera.
- ¿La comida tiene variedad? - El buffet tiene buena valoración por variedad y calidad general, aunque el restaurante puede llenarse bastante en horas punta.

**Featured reviews**

- Alice Roma - Servicio - 5 / 5
- Jess - Habitaciones - 4 / 5
- Tan Nair - Playa y familias - 5 / 5

### Ponderosa Beach - beach-club - Can Picafort

- **Slug:** `ponderosa-beach`
- **Generated at:** 2026-06-10T10:47:52.922+00:00

**Editorial opinion**

Destaca por el acceso directo a la arena, las vistas abiertas al mar y un ambiente relajado con música suave que acompaña sin imponerse. Es un sitio pensado para alargar la comida con calma, tomar algo frente a la playa y quedarse un rato más cuando el plan pide sobremesa larga y ambiente cuidado.

**Highlights**

- Mesa prácticamente sobre la arena, con sensación de comer a pie de playa
- Vistas muy abiertas y entorno mediterráneo relajado
- Paellas y fideuà especialmente bien valoradas, junto con una carta variada
- Ambiente tranquilo y cuidado, apto para una comida larga o un plan en familia

**Review themes**

- Vistas al mar (sunset)
- Ambiente relajado (sparkles)
- Servicio atento (mood-smile)
- Comida destacada (tools-kitchen-2)
- A pie de playa (umbrella)
- Apto para familias (mood-smile)

**Pros**

- Ubicación directa sobre la playa
- Comida muy bien valorada, especialmente paella y fideuà
- Servicio atento y sin prisas
- Ambiente relajado y limpio

**Cons**

- Bebidas y café algo caros

**Services**

- Acceso directo a la playa (umbrella)
- Vistas al mar (sunset)
- Ambiente chill (music)
- Comida mediterránea (tools-kitchen-2)
- Paella (tools-kitchen-2)
- Fideuà (tools-kitchen-2)
- Apto para familias (mood-smile)
- Reserva recomendada (map-pin)

**Category attributes confidence:** high

**Category attributes data**

- **setting:** Frente a la playa; Comer con los pies en la arena; Entorno mediterráneo
- **best_for:** Comida larga; Tomar algo frente al mar; Plan en pareja; Ir con niños; Alargar la tarde
- **music_vibe:** Música suave; Chill
- **price_signal:** mixed
- **access_to_sea:** Acceso directo a la playa; Vistas al mar
- **atmosphere_tags:** Relajado; Cuidado; Beach club; Limpio
- **reservation_notes:** Conviene reservar; Puede llenarse y quedarse sin mesa
- **food_drink_highlights:** Paella; Fideuà; Carta variada con opciones mediterráneas y globales
- **daybed_or_pool_facilities:** -

**Price estimate**

amount_min=- | amount_max=- | currency=EUR | unit=person | label=por persona | source=reviews | confidence=low | note=Solo aparece una mención explícita de bebidas y café en la parte alta; no hay base suficiente para fijar un gasto total por persona.

**FAQ**

- ¿Para qué plan encaja mejor? - Encaja bien para una comida larga frente al mar, tomar algo después de la playa o alargar la tarde en un ambiente relajado.
- ¿Encaja más para comer o para tomar algo? - Encaja más para comer, porque la comida y la sobremesa aparecen como parte central del plan; también funciona para tomar algo con vistas.
- ¿El ambiente es tranquilo o animado? - Más bien tranquilo y relajado, con música suave y un ritmo sin prisas.
- ¿Es buena opción para ir en pareja? - Sí, por el entorno frente al mar y el ambiente cuidado, aunque también resulta cómodo para familias.
- ¿Conviene reservar? - Sí, conviene reservar porque puede llenarse y quedarse sin mesa.

**Featured reviews**

- illona o'shea - Reserva - 5 / 5
- Artem Valeev - Comida - 5 / 5
- Cathrine Skårsmoen - Ambiente - 5 / 5

### Mhares Sea Club - beach-club - Mallorca

- **Slug:** `mhares-sea-club`
- **Generated at:** 2026-06-10T10:48:06.114+00:00

**Editorial opinion**

Destaca por el ambiente relajado con un punto animado, las vistas abiertas al mar y el acceso directo a una zona de roca con escaleras. Encaja bien para pasar el día entre tumbonas, piscina y baño, y también para alargar la tarde con música suave y copas frente al agua.

**Highlights**

- Vistas muy abiertas a acantilados, rocas y al mar
- Acceso directo a la zona de roca y al agua por escaleras
- Piscina amplia y camas balinesas orientadas al mar
- Ambiente relajado con música house suave

**Review themes**

- Vistas al mar (sunset)
- Ambiente relajado (sparkles)
- Piscina y daybeds (pool)
- Acceso al agua (map-pin)
- Música (music)
- Servicio atento (mood-smile)

**Pros**

- Vistas muy potentes sobre acantilados y mar
- Camas balinesas y tumbonas cómodas
- Piscina grande con acceso al agua
- Ambiente agradable para pasar el día

**Cons**

- En algún momento el servicio puede tardar en aparecer

**Services**

- Tumbonas (umbrella)
- Camas balinesas (pool)
- Piscina (pool)
- Acceso al agua (map-pin)
- Cócteles (glass-cocktail)
- Música ambiente (music)

**Category attributes confidence:** high

**Category attributes data**

- **setting:** acantilado; vistas al mar; zona de roca; entorno algo resguardado
- **best_for:** pasar el día; parejas; grupos de amigos; alargar la tarde
- **music_vibe:** house suave; música de fondo con energía
- **price_signal:** mixed
- **access_to_sea:** escaleras hasta el agua; acceso directo a la zona de roca; vistas al mar
- **atmosphere_tags:** relajado; animado; exclusivo; agradable
- **reservation_notes:** la reserva no se cobra al hacerla; solo se carga si se cancela a última hora o al final de la visita; se reserva una cama para todo el día
- **food_drink_highlights:** comida; cócteles; bebidas
- **daybed_or_pool_facilities:** tumbonas; camas balinesas; cabanas; piscina grande; acceso directo al agua

**Price estimate**

amount_min=50 | amount_max=50 | currency=EUR | unit=person | label=por persona | source=reviews | confidence=medium | note=Se menciona una reserva de 50 € por persona y se compara con una media de 80 € en otra referencia.

**FAQ**

- ¿Para qué plan encaja mejor? - Para pasar el día con tumbona o cama, bañarte, tomar algo y alargar la tarde en un entorno de mar y roca.
- ¿Encaja más para comer o para tomar algo? - Encaja para ambas cosas: hay comida y bebidas, pero el conjunto está muy pensado para quedarse varias horas entre piscina, vistas y descanso.
- ¿El ambiente es tranquilo o animado? - Es una mezcla de los dos: relajado, pero con música y un punto de energía.
- ¿Es buena opción para ir en pareja? - Sí, por el entorno resguardado, las vistas y el ambiente calmado con un punto elegante.

**Featured reviews**

- Nicolas Tamayo - Ambiente - 5 / 5
- Sean Buckley - Acceso y día completo - 4 / 5
- Courtney Emerson - Piscina y cabanas - 5 / 5

### Bikkini Beach-Playa de Palma - beach-club - Palma

- **Slug:** `bikkini-beach-playa-de-palma`
- **Generated at:** 2026-06-10T10:48:18.723+00:00

**Editorial opinion**

Destaca por su ambiente de beach club abierto y amplio, con una terraza grande a un paso de la playa y una vibra muy veraniega incluso fuera de temporada. Encaja bien para alargar la tarde con algo de comer y cócteles, más que para una cena exigente, porque aquí pesan mucho más la ubicación y el ambiente que la cocina.

**Highlights**

- Terraza exterior amplia con mucho espacio para sentarse
- Acceso muy cómodo a la playa, cruzando solo una carretera
- Cócteles y platos informales para un plan de día o tarde
- Ambiente de estilo playero, agradable incluso en invierno

**Review themes**

- Ambiente playero (umbrella)
- Vistas y ubicación junto al mar (map-pin)
- Cócteles (glass-cocktail)
- Terraza amplia (sparkles)
- Comida informal (tools-kitchen-2)
- Servicio irregular (mood-smile)

**Pros**

- Ubicación excelente junto a la playa
- Terraza grande y agradable
- Cócteles y comida informal bien resueltos

**Cons**

- La calidad de la comida no siempre convence
- El servicio puede ser lento en momentos puntuales
- Algunos platos llegan secos o poco equilibrados

**Services**

- Cócteles (glass-cocktail)
- Terraza exterior (sparkles)
- Acceso a la playa (umbrella)
- Comida informal (tools-kitchen-2)
- Mucho espacio para sentarse (mood-smile)

**Category attributes confidence:** medium

**Category attributes data**

- **setting:** terraza amplia al aire libre; frente a la playa; ambiente de beach club
- **best_for:** tomar algo frente al mar; comer de forma informal; alargar la tarde
- **music_vibe:** -
- **price_signal:** mixed
- **access_to_sea:** cruzando una carretera se llega a la playa
- **atmosphere_tags:** playero; animado; veraniego; informal
- **reservation_notes:** -
- **food_drink_highlights:** burgers; poke bowls; burritos; cócteles
- **daybed_or_pool_facilities:** -

**Price estimate**

amount_min=10 | amount_max=50 | currency=EUR | unit=person | label=por persona | source=google_places | confidence=medium | note=Rango orientativo de Google Places; en las reseñas aparecen quejas por precios altos y mala relación calidad-precio.

**FAQ**

- ¿Para qué plan encaja? - Encaja para un plan de playa con comida informal, cócteles y sobremesa en terraza, especialmente si buscas estar cerca del mar.
- ¿Encaja más para comer o para tomar algo? - Funciona para ambas cosas, pero destaca más como sitio para comer algo sencillo y seguir con una copa o un cóctel.
- ¿El ambiente es tranquilo o animado? - Tiene un ambiente veraniego y agradable, con bastante presencia de terraza y vibra de beach club; no transmite un plan formal o silencioso.
- ¿Es buena opción para ir en pareja? - Sí, si buscáis un sitio informal junto a la playa para comer o tomar algo; encaja mejor para un plan relajado que para una cena muy cuidada.

**Featured reviews**

- Gonçalo Esteves Ferreira - Ubicación y ambiente - 4 / 5
- Kate P - Comida y rapidez - 5 / 5
- lucy ferguson - Servicio y calidad - 2 / 5

### Barca Samba - boat-rental - Palma

- **Slug:** `barca-samba`
- **Generated at:** 2026-06-10T10:48:29.309+00:00

**Editorial opinion**

Destaca por un formato festivo en el mar, con música alta, copas y un atardecer que funciona como gran reclamo. El trato a bordo aparece como cercano y animado, con especial peso de Rafa y un equipo atento. Conviene ir con la idea de una salida más de ambiente y fiesta que de crucero tranquilo.

**Highlights**

- Ambiente de fiesta con música y copas a bordo
- Atardecer muy presente como momento fuerte de la salida
- Trato cercano y animado por parte de la tripulación
- Formato continuo de navegación, sin paradas durante el trayecto

**Review themes**

- Atardecer (sunset)
- Ambiente festivo (music)
- Servicio cercano (mood-smile)
- Bebidas a bordo (glass-cocktail)
- Navegación continua (sailboat)
- Accesibilidad limitada (tools-kitchen-2)

**Pros**

- Atardecer muy bonito
- Personal atento y divertido
- Copas y snacks incluidos
- Ambiente animado y con música

**Cons**

- La música puede ir muy alta
- No es accesible para silla de ruedas
- No hace paradas durante el recorrido

**Services**

- Patrón (sailboat)
- Bebidas a bordo (glass-cocktail)
- Snacks incluidos (tools-kitchen-2)
- Música a bordo (music)
- Atardecer en ruta (sunset)
- Equipo atento (mood-smile)

**Category attributes confidence:** medium

**Category attributes data**

- **best_for:** Atardecer; Salida con ambiente de fiesta; Grupo de amigos
- **group_fit:** Grupos de amigos; Parejas que busquen un plan animado
- **price_signal:** mixed
- **duration_notes:** El barco navega durante todo el trayecto, sin paradas
- **route_or_stops:** -
- **experience_type:** party_boat
- **included_extras:** Una bebida gratis a bordo; Snacks incluidos
- **guided_or_skippered:** -
- **safety_or_accessibility_notes:** No es accesible para usuarios de silla de ruedas; El baño tampoco es accesible; Con muletas debería ser manejable

**Price estimate**

_Sin precio_

**FAQ**

- ¿Encaja más como plan de fiesta que como crucero tranquilo? - Sí. El formato es más de bar en un barco, con música alta y ambiente animado, que de paseo relajado con paradas.
- ¿Se puede ir con patrón o tripulación a bordo? - Sí, hay tripulación a bordo y el trato aparece como cercano y atento.
- ¿Hace falta licencia para este plan? - No hay datos suficientes para confirmarlo. Conviene verificarlo antes de reservar.
- ¿Para qué tipo de grupo encaja mejor? - Encaja mejor para grupos de amigos y para quien busque una salida animada al atardecer.
- ¿Qué conviene confirmar antes de reservar? - Si buscas un plan tranquilo, conviene confirmar el nivel de música, la accesibilidad y que el barco navega sin paradas durante todo el recorrido.

**Featured reviews**

- Hugo Félix - Trato - 5 / 5
- Ella Harriet - Formato - 4 / 5
- MsKetamaV - Accesibilidad - 4 / 5

### Pura Vida Sailing Mallorca S.L. Boat Charter in Port Andratx. Andratx - boat-rental - Andratx

- **Slug:** `pura-vida-sailing-mallorca-s-l-boat-charter-in-port-andratx-andratx`
- **Generated at:** 2026-06-10T10:48:39.785+00:00

**Editorial opinion**

Destaca por el trato cercano, la navegación privada y una experiencia muy cuidada para pasar el día en el mar sin complicaciones. El patrón transmite seguridad y calma, con paradas para baño, snorkel y paddle surf en calas tranquilas, además de una organización fluida desde la comunicación hasta el embarque.

**Highlights**

- Salida privada con patrón y trato muy personal
- Paradas para baño en calas y aguas claras
- Incluye snorkel, paddle surf y bebidas a bordo
- Buena opción para celebraciones y días en familia

**Review themes**

- Trato cercano (mood-smile)
- Navegación privada (sailboat)
- Paradas para baño (pool)
- Snorkel y paddle surf (umbrella)
- Comunicación fluida (sparkles)
- Ambiente relajado (sunset)

**Pros**

- Patrón amable y atento
- Paradas bonitas para nadar
- Experiencia cómoda y bien organizada

**Cons**

- _Sin datos_

**Services**

- Patrón (sailboat)
- Salida privada (map-pin)
- Paradas para baño (pool)
- Snorkel (umbrella)
- Paddle surf (tools-kitchen-2)
- Bebidas a bordo (glass-cocktail)
- Fotos durante la salida (sparkles)
- Comunicación previa rápida (map-route)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** Día privado en el mar; Cumpleaños; Atardecer; Familias que quieren una salida tranquila; Parejas y amigos
- **group_fit:** Familias; Parejas; Grupos pequeños de amigos; Celebraciones
- **price_signal:** mixed
- **duration_notes:** Hay salidas de 2 horas y jornadas de día completo
- **route_or_stops:** Calas tranquilas para nadar; Varias paradas panorámicas; Salida al mar para ver la puesta de sol; Paradas con snorkel y paddle surf
- **experience_type:** private_sailing
- **included_extras:** Bebidas; Snacks; Charcutería; Fruta; Tarta de cumpleaños; Paddle board; Snorkels; Fotos
- **guided_or_skippered:** Con patrón; Navegación guiada por David
- **safety_or_accessibility_notes:** Sensación de seguridad y comodidad a bordo; Embarque fácil

**Price estimate**

_Sin precio_

**FAQ**

- ¿Se puede ir con patrón? - Sí, la experiencia se hace con David como patrón y varias reseñas destacan que transmite seguridad y comodidad a bordo.
- ¿Para qué tipo de grupo encaja mejor? - Encaja bien para familias, parejas, grupos pequeños de amigos y celebraciones como cumpleaños.
- ¿Qué actividades incluye la salida? - Aparecen paradas para nadar, snorkel y paddle surf, además de bebidas y snacks a bordo.
- ¿Conviene reservarlo para un plan de día completo o para el atardecer? - Hay referencias a salidas de 2 horas al atardecer y a jornadas más largas con varias paradas, así que sirve tanto para un plan corto como para un día entero.

**Featured reviews**

- Allison Sicking - Familia y organización - 5 / 5
- Camilla Henfrey - Celebración a bordo - 5 / 5
- ally - Atardecer y rutas - 5 / 5

### Chilli Jetski Mallorca-Puerto Portals - boat-rental - Puerto Portals

- **Slug:** `chilli-jetski-mallorca-puerto-portals`
- **Generated at:** 2026-06-10T10:48:51.502+00:00

**Editorial opinion**

Destaca por una experiencia de jetski muy guiada, con instrucciones claras y un trato cercano que transmite seguridad desde el inicio. El recorrido combina velocidad, paradas para fotos y baño en el mar, con margen para disfrutar también si es la primera vez sobre una moto de agua. Encaja bien para parejas, amigos o una celebración en grupo pequeño.

**Highlights**

- Instrucciones claras antes de salir, pensadas también para principiantes
- Paradas para hacer fotos, vídeo y bañarse en el mar
- Guías cercanos y atentos a la seguridad durante la salida
- Sensación de libertad en el recorrido, con una parte divertida y otra más relajada

**Review themes**

- Trato cercano (sparkles)
- Seguridad y explicaciones claras (tools-kitchen-2)
- Ruta divertida en moto de agua (sailboat)
- Paradas para fotos y baño (sunset)
- Ideal para parejas y grupos pequeños (mood-smile)

**Pros**

- Explicaciones muy claras para principiantes
- Guías amables y profesionales
- Paradas para fotos, vídeo y baño en el mar

**Cons**

- El mar puede estar movido en algunos días
- La experiencia puede parecer cara al principio

**Services**

- Instrucción previa (tools-kitchen-2)
- Guía o monitor (sailboat)
- Paradas para fotos (camera)
- Baño en el mar (pool)
- Salida en grupo (users)
- Repetición de la actividad al día siguiente (repeat)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** Primera vez en moto de agua; Plan activo en el mar; Salida divertida con amigos; Celebraciones en grupo
- **group_fit:** Parejas; Grupos pequeños; Celebraciones de cumpleaños; Familias con hijos mayores
- **price_signal:** mixed
- **duration_notes:** -
- **route_or_stops:** Paradas para hacer fotos y vídeo; Parada para bañarse en el mar
- **experience_type:** jet_ski
- **included_extras:** Fotos tomadas durante la actividad; Tiempo para grabar vídeo
- **guided_or_skippered:** Instructor/guía que explica todo con claridad; Acompañamiento durante la salida; Énfasis en seguridad y confianza
- **safety_or_accessibility_notes:** Apta para principiantes; Instrucciones claras antes de salir; Se insiste en la seguridad

**Price estimate**

_Sin precio_

**FAQ**

- ¿Hace falta experiencia previa para ir en moto de agua? - No parece necesaria: hay explicaciones claras antes de salir y la actividad está planteada también para quien va por primera vez.
- ¿Se puede parar para bañarse o hacer fotos? - Sí, hay tiempo para hacer fotos, vídeo y también para bañarse un rato en el mar.
- ¿Encaja para una celebración o para ir en pareja? - Sí, funciona bien para parejas y para celebraciones en grupo pequeño, como un cumpleaños.
- ¿Qué conviene confirmar antes de reservar? - Conviene confirmar quién llevará la actividad, qué incluye exactamente la salida y si el mar puede estar movido ese día.

**Featured reviews**

- Destinee Witter - Principiantes - 5 / 5
- Kiem Ablett - Cumpleaños - 5 / 5
- adam conn - Ruta y seguridad - 5 / 5

### GOJET Alcudia JET SKI tours - boat-rental - Alcúdia

- **Slug:** `gojet-alcudia-jet-ski-tours`
- **Generated at:** 2026-06-10T10:49:03.454+00:00

**Editorial opinion**

Destaca por las rutas en moto de agua con guía cercana y un ritmo bien llevado, pensado para disfrutar de la costa de Alcúdia sin complicaciones. El trato personal, las fotos durante la salida y la sensación de seguridad marcan la experiencia, que encaja bien para quien busca una actividad activa y fácil de recordar.

**Highlights**

- Rutas en moto de agua con duración de 90 minutos o 1h30
- Guías muy presentes, amables y atentos durante la salida
- Paradas para fotos y puntos de costa como Coll Baix y cuevas
- Actividad dinámica y apta para ir solo en cada moto

**Review themes**

- Guía cercano (mood-smile)
- Fotos y recuerdos (sparkles)
- Rutas por la costa (map-pin)
- Sensación de seguridad (sailboat)
- Actividad divertida (sunset)

**Pros**

- Guías muy amables y cercanos
- Fotos y vídeos durante la ruta
- Recorridos divertidos por la costa

**Cons**

- _Sin datos_

**Services**

- Moto de agua (sailboat)
- Guía acompañante (mood-smile)
- Ruta de 90 minutos (map-route)
- Ruta al atardecer (sunset)
- Paradas para fotos (camera)
- Vídeos y fotos durante la excursión (photo)
- Salida por la costa de Alcúdia (map-pin)
- Moto individual (point)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** Quien busca una actividad activa en el mar; Quien quiere una ruta guiada con fotos; Quien prefiere ir en moto individual
- **group_fit:** Parejas; Padres e hijos; Amigos; Personas que prueban la moto de agua por primera vez
- **price_signal:** -
- **duration_notes:** Rutas de 90 minutos; Excursión de 1h30
- **route_or_stops:** Costa de Alcúdia; Coll Baix; cuevas; paradas para ver el paisaje y hacer fotos
- **experience_type:** jet_ski
- **included_extras:** Fotos durante la ruta; Vídeos
- **guided_or_skippered:** Guía acompañante durante la ruta; Atención cercana y personalizada
- **safety_or_accessibility_notes:** Sensación de seguridad durante la excursión; Moto individual para cada participante

**Price estimate**

_Sin precio_

**FAQ**

- ¿Se puede ir con guía durante la ruta? - Sí. Las reseñas mencionan guías acompañando la excursión y marcando el ritmo de la salida.
- ¿Hace falta experiencia previa en moto de agua? - No aparece como requisito. Hay una reseña de primera vez en moto de agua y la experiencia se describe como llevadera.
- ¿Para qué tipo de grupo encaja mejor? - Encaja bien para parejas, padres e hijos y grupos pequeños de amigos que quieran una actividad activa por la costa.
- ¿Qué conviene confirmar antes de reservar? - Conviene confirmar la duración exacta, la ruta concreta y si la salida incluye fotos o vídeos durante el recorrido.

**Featured reviews**

- Anthony Terry - Guía y fotos - 5 / 5
- Joe Pacholik - Ruta y grupo - 5 / 5
- Lopes Rafaela - Trato y fotos - 5 / 5

### Cuevas del Drach - activity - Porto Cristo

- **Slug:** `cuevas-del-drach`
- **Generated at:** 2026-06-10T10:49:15.562+00:00

**Editorial opinion**

Destaca por la magnitud de las salas, las formaciones de estalactitas y estalagmitas y el recorrido subterráneo hasta el lago Martel. El concierto clásico y el breve paseo en barca añaden un cierre muy singular, aunque el conjunto puede perder parte de su encanto cuando entra demasiada gente a la vez.

**Highlights**

- Salas amplias con formaciones geológicas muy marcadas
- Lago subterráneo de gran tamaño como punto central de la visita
- Concierto clásico en el interior de la cueva
- Paseo en barca breve sobre el lago tras el recital

**Review themes**

- Formaciones espectaculares (sparkles)
- Lago subterráneo (map-pin)
- Concierto en la cueva (music)
- Masificación (umbrella)
- Recorrido turístico organizado (tools-kitchen-2)

**Pros**

- Cuevas muy impresionantes
- Lago Martel y concierto en directo
- Paseo en barca sobre el lago

**Cons**

- Demasiada gente en temporada alta
- Grupos avanzan rápido y hay poco tiempo para parar
- El concierto y la barca pueden sentirse algo breves

**Services**

- Guía (user-star)
- Concierto en directo (music)
- Paseo en barca (sailboat)
- Aparcamiento gratuito (parking)
- Recorrido por salas subterráneas (map-pin)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** parejas; familias; viajeros que buscan una visita singular; grupos
- **access_notes:** recorrido a pie por el interior de la cueva
- **activity_type:** visita a cuevas; recorrido subterráneo
- **duration_notes:** el concierto dura unos 15 minutos; el paseo en barca es muy breve
- **main_highlights:** salas amplias con estalactitas y estalagmitas; lago Martel; concierto clásico en el interior; paseo en barca por el lago
- **guided_experience:** se presenta como visita guiada, aunque no siempre se percibe explicación detallada
- **crowd_timing_notes:** en verano puede haber mucha afluencia; con menos gente en temporada baja la visita resulta más tranquila
- **physical_difficulty:** paseo a pie sencillo por el interior
- **ticket_or_booking_notes:** -

**Price estimate**

_Sin precio_

**FAQ**

- ¿Para quién encaja mejor la visita? - Encaja bien para parejas, familias, grupos y viajeros que buscan una excursión singular bajo tierra.
- ¿Es una experiencia tranquila o muy activa? - Es una visita a pie y bastante sencilla, pero puede resultar menos tranquila cuando hay mucha afluencia.
- ¿Conviene ir con poca gente? - Sí. En verano puede haber mucha gente dentro y eso reduce bastante la sensación de calma.
- ¿Qué hay que tener en cuenta antes de ir? - La visita incluye salas amplias, un concierto breve y un paseo en barca muy corto; el ritmo es turístico y los grupos avanzan rápido.

**Featured reviews**

- Przemyslaw Kowalski - Lago y concierto - 5 / 5
- Luke Baldacchino - Masificación - 3 / 5
- Jan - Recital y barca - 4 / 5

### Castillo de Bellver - activity - Palma

- **Slug:** `castillo-de-bellver`
- **Generated at:** 2026-06-10T10:49:26.439+00:00

**Editorial opinion**

Destaca por su silueta circular, poco habitual en España, y por las vistas amplias sobre Palma, la bahía y la costa. La visita combina paseo por patios y torres con un museo interior que ayuda a situar la historia de Mallorca, en un entorno de colina arbolada que le da bastante presencia al conjunto.

**Highlights**

- Arquitectura circular medieval poco común en España
- Vistas panorámicas sobre Palma, la bahía y el litoral
- Museo interior con contexto histórico de Mallorca
- Paseo agradable por patios, torres y entorno boscoso

**Review themes**

- Vistas panorámicas (sunset)
- Arquitectura singular (sparkles)
- Museo e ისტორía (map-pin)
- Acceso a pie o en bus (parking)
- Entorno arbolado (umbrella)

**Pros**

- Vistas muy amplias desde lo alto
- Arquitectura circular poco común
- Museo con contexto histórico interesante

**Cons**

- Puede haber escaleras en el acceso a pie
- El interior resulta bastante vacío para quien busque muchas piezas

**Services**

- Museo (map-pin)
- Audioguía por QR (point)
- Acceso en bus (parking)
- Acceso a pie (point)
- Visita autoguiada (point)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** viajeros interesados en historia; parejas; familias; viajeros activos; quien busque buenas vistas
- **access_notes:** se puede llegar caminando desde el centro; hay escaleras en el acceso a pie; también se puede ir en bus; el bus turístico deja cerca de la entrada
- **activity_type:** visita cultural; castillo; museo
- **duration_notes:** -
- **main_highlights:** arquitectura circular medieval; vistas panorámicas sobre Palma y la bahía; museo de historia de Mallorca; patios y torres
- **guided_experience:** visita autoguiada; audioguía por QR
- **crowd_timing_notes:** -
- **physical_difficulty:** paseo moderado; acceso con escaleras si se va a pie
- **ticket_or_booking_notes:** entrada de 4 € mencionada en una reseña; entrada gratuita los domingos de 10:00 a 15:00

**Price estimate**

_Sin precio_

**FAQ**

- ¿Para quién encaja la visita? - Encaja bien para quienes buscan historia, arquitectura singular y buenas vistas, además de parejas, familias y viajeros que no les importe caminar un poco.
- ¿Es una experiencia tranquila o activa? - Es una visita tranquila, pero con algo de paseo y subida si se va a pie. El acceso puede incluir escaleras.
- ¿Conviene ir en transporte público o a pie? - Se puede llegar caminando desde el centro o en bus. También hay acceso por la carretera usada por coches y bus turístico.
- ¿Qué hay que tener en cuenta antes de ir? - El interior puede resultar bastante vacío si se esperan muchas piezas, y los domingos la entrada es gratuita de 10:00 a 15:00.

**Featured reviews**

- Fav Moh - Vistas - 5 / 5
- Kameliia Luiza Kudenchuk - Acceso - 4 / 5
- bertie malco - Valor - 5 / 5

### Cuevas de Artà - activity - Arta

- **Slug:** `cuevas-de-arta`
- **Generated at:** 2026-06-10T10:49:36.3+00:00

**Editorial opinion**

Destaca por una visita guiada muy bien llevada, con explicaciones claras y un recorrido que combina impacto visual y contenido geológico. El ambiente dentro de la cueva es solemne y espectacular, y la atención del guía añade un punto muy humano y cercano a la experiencia. Es una opción sólida para quien busca una actividad tranquila, educativa y memorable en Mallorca.

**Highlights**

- Recorrido guiado por salas amplias y formaciones de estalactitas y estalagmitas
- Explicaciones en varios idiomas con enfoque divulgativo
- Visita de alrededor de una hora, fácil de encajar en una excursión corta
- Acceso sencillo con aparcamiento y venta de entradas en taquilla

**Review themes**

- Guía muy didáctico (user-star)
- Formaciones espectaculares (sparkles)
- Visita tranquila (mood-smile)
- Multilingüe (map-pin)
- Organización práctica (parking)

**Pros**

- Guías apasionados y muy claros
- Cueva impresionante y muy fotogénica
- Recorrido agradable y bien organizado

**Cons**

- Puede haber espera hasta el siguiente tour
- Conviene llegar pronto para ir con margen

**Services**

- Guía multilingüe (user-star)
- Explicaciones geológicas (book-2)
- Venta de entradas en taquilla (ticket)
- Aparcamiento (parking)
- Fotos durante la visita (camera)
- Tours frecuentes (clock)
- Recorrido de una hora aprox. (hourglass)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** parejas; familias; viajeros curiosos; grupos pequeños; quien busca una actividad tranquila y educativa
- **access_notes:** hay aparcamiento disponible; desde el aparcamiento hay un paseo corto hasta la entrada
- **activity_type:** visita guiada; cueva turística; actividad cultural y natural
- **duration_notes:** la visita dura alrededor de una hora; también se describe como un plan de una o dos horas contando la espera
- **main_highlights:** salas amplias; estalactitas y estalagmitas; formaciones geológicas; iluminación y momentos de silencio dentro de la cueva
- **guided_experience:** guía muy informado y entusiasta; explicaciones en inglés, español y francés; trato cercano y amable; enfoque divulgativo sobre geología y procesos naturales
- **crowd_timing_notes:** puede haber unos veinte minutos de espera hasta el siguiente tour; llegar pronto ayuda a ir con más margen
- **physical_difficulty:** actividad tranquila; recorrido apto para la mayoría; sin exigencia física destacable
- **ticket_or_booking_notes:** las entradas se pueden comprar en la oficina cerca de la entrada; no parece imprescindible reservar online; los tours salen aproximadamente cada 30 minutos

**Price estimate**

_Sin precio_

**FAQ**

- ¿Para quién encaja mejor esta actividad? - Encaja bien para parejas, familias, grupos pequeños y viajeros que buscan una visita tranquila, con contenido divulgativo y sin exigencia física destacable.
- ¿Es una experiencia tranquila o activa? - Es una experiencia tranquila: el recorrido es guiado, dura alrededor de una hora y no aparece como una actividad físicamente exigente.
- ¿Conviene llegar con antelación? - Sí, porque puede haber espera hasta el siguiente tour y llegar pronto ayuda a entrar con más margen.
- ¿Hay que reservar con antelación? - No aparece como imprescindible; las entradas se pueden comprar en la oficina cerca de la entrada y los tours salen con bastante frecuencia.
- ¿Qué hay que tener en cuenta antes de ir? - Hay aparcamiento disponible y desde allí hay un paseo corto hasta la entrada. También conviene contar con que la visita se hace en grupo y con horarios de salida periódicos.

**Featured reviews**

- April Lofgren - Guía y espera - 5 / 5
- sina borzooei - Guía y cueva - 5 / 5
- David Brookes - Acceso y horarios - 5 / 5

### Catedral-Basílica de Santa María de Mallorca - activity - Palma

- **Slug:** `catedral-basilica-de-santa-maria-de-mallorca`
- **Generated at:** 2026-06-10T10:49:47.552+00:00

**Editorial opinion**

Destaca por la monumentalidad gótica, la luz que entra por los grandes vitrales y la sensación de calma que se impone al recorrerla. La combinación de altura, detalle arquitectónico y la presencia junto al mar la convierten en una visita muy sólida para quien quiera entender el peso histórico y visual de Palma sin prisas.

**Highlights**

- Arquitectura gótica de gran escala con nave imponente y trabajo de piedra muy detallado
- Vitrales y gran rosetón que llenan el interior de luz y color
- Ubicación junto al mar y a un paseo fácil desde el centro
- Presencia de intervenciones modernas discretas que conviven con el edificio histórico

**Review themes**

- Arquitectura gótica (sparkles)
- Luz y vitrales (sunset)
- Ambiente sereno (mood-smile)
- Ubicación junto al mar (map-pin)
- Gaudí e intervención moderna (tools-kitchen-2)

**Pros**

- Arquitectura imponente y muy cuidada
- Interior amplio, sereno y luminoso
- Visita fácil de combinar con un paseo por el centro

**Cons**

- Conviene reservar con antelación para evitar colas
- Hay que ir con vestimenta adecuada al tratarse de un templo

**Services**

- Entrada (ticket)
- Reserva anticipada (calendar)
- Visita a pie (walk)
- Acceso céntrico (map-pin)
- Interior monumental (building-monument)
- Vitrales y rosetón (sunset)

**Category attributes confidence:** high

**Category attributes data**

- **best_for:** parejas; familias; viajeros interesados en arquitectura; quienes buscan una visita tranquila; grupos de turismo cultural
- **access_notes:** se llega fácilmente a pie desde el centro; ubicación junto al mar
- **activity_type:** visita cultural; recorrido arquitectónico; visita religiosa
- **duration_notes:** -
- **main_highlights:** nave gótica de gran altura; gran rosetón; vitrales con entrada de luz; detalle escultórico y de cantería; influencia de Gaudí en una parte del interior
- **guided_experience:** -
- **crowd_timing_notes:** puede haber colas en momentos de mucha afluencia
- **physical_difficulty:** paseo fácil; sin dificultad física destacable
- **ticket_or_booking_notes:** se recomienda reservar con antelación para evitar colas; hay entrada general mencionada como la opción más básica

**Price estimate**

amount_min=10 | amount_max=10 | currency=EUR | unit=entry | label=entrada | source=reviews | confidence=medium | note=Una reseña menciona una entrada de unas 10 €; no hay más precios confirmados.

**FAQ**

- ¿Encaja para una visita tranquila o más bien rápida? - Encaja bien para una visita tranquila: el interior se describe como amplio, sereno y pensado para recorrerlo con calma.
- ¿Conviene reservar con antelación? - Sí, es recomendable reservar para evitar colas en momentos de más afluencia.
- ¿Hay que tener algo en cuenta antes de ir? - Sí: al ser un templo, conviene ir con vestimenta adecuada.
- ¿Para quién encaja mejor? - Para parejas, familias, viajeros interesados en arquitectura y grupos de turismo cultural.

**Featured reviews**

- Alexander Noack - Arquitectura - 5 / 5
- Nicolas - Ambiente - 5 / 5
- bertie malco - Entrada y ambiente - 5 / 5

### Parque Natural de Mondragó - beach - Mallorca

- **Slug:** `parque-natural-de-mondrago`
- **Generated at:** 2026-06-10T10:49:58.718+00:00

**Editorial opinion**

Destaca por un paisaje muy natural, con dos calas de agua cristalina, senderos entre pinos y un entorno de dunas y vegetación mediterránea que mantiene el ambiente tranquilo incluso cuando hay gente. Es una opción muy buena para combinar baño, paseo y fotos, con acceso sencillo a pie desde el aparcamiento y un carácter poco urbanizado que conserva bastante bien su encanto.

**Highlights**

- Dos calas pequeñas con arena clara y agua transparente
- Senderos entre pinos y miradores naturales para pasear
- Entorno protegido con dunas, vegetación autóctona y aves
- Ambiente calmado y poco urbanizado, sin tumbonas

**Review themes**

- Paisaje natural (map-pin)
- Agua cristalina (sparkles)
- Paseos y senderos (sailboat)
- Ambiente tranquilo (umbrella)
- Aparcamiento (parking)

**Pros**

- Calas bonitas y de agua muy clara
- Buen sitio para caminar por los senderos
- Ambiente tranquilo y natural

**Cons**

- El aparcamiento puede complicarse si se llega tarde
- Los baños públicos aparecen como un punto flojo

**Services**

- Parking de pago (parking)
- Aparcamiento en la calle cercano (parking)
- Senderos forestales (map-pin)
- Playa de arena (umbrella)
- Agua cristalina (sparkles)
- Sin tumbonas (point)
- Bar en la playa (glass-cocktail)
- Baños públicos (tools-kitchen-2)

**Category attributes confidence:** high

**Category attributes data**

- **terrain:** arena fina; senderos de bosque; caminos de paseo
- **crowding:** puede llenarse; más tranquilo a primera hora; ambiente calmado incluso con gente
- **facilities:** baños públicos; bar en la playa; sin tumbonas
- **nearby_food:** bar en la playa
- **landscape_tags:** calas; dunas; pinar; acantilados suaves; vegetación mediterránea; aves
- **best_time_notes:** temprano por la mañana; mejor para evitar la afluencia; luz bonita al amanecer
- **water_conditions:** agua cristalina; turquesa; apta para baño
- **rentals_or_prices:** -
- **access_and_parking:** acceso a pie desde el aparcamiento; parking de pago grande; posible aparcamiento gratuito en la calle cerca; conviene llegar pronto
- **family_accessibility:** apta para familias; paseo corto desde el parking; calas pequeñas y cómodas para baño

**Price estimate**

_Sin precio_

**FAQ**

- ¿Es una playa cómoda para ir en familia? - Sí, encaja bien para un plan familiar: hay calas pequeñas de arena, agua clara y un paseo corto desde el aparcamiento.
- ¿Cómo es el acceso a la playa? - El acceso es a pie desde el aparcamiento y el paseo hasta la arena puede llevar unos 10 minutos. Conviene llegar pronto porque el parking se llena.
- ¿Hay servicios cerca? - Sí, aparece un bar en la playa y también baños públicos, aunque estos últimos no están en buen estado.
- ¿Es buena para pasear? - Sí, hay senderos por el bosque y paseos alrededor de los cabos y las calas.

**Featured reviews**

- Cyntia Pethövá - Paisaje y acceso - 5 / 5
- Mahmoud Nouh - Senderos y naturaleza - 5 / 5
- Heather Monks - Arena y acceso - 5 / 5

### Playa Santa Ponsa - beach - Santa Ponça

- **Slug:** `playa-santa-ponsa`
- **Generated at:** 2026-06-10T10:50:09.938+00:00

**Editorial opinion**

Destaca por una playa amplia de arena fina, con agua tranquila y poco profunda, que resulta cómoda para pasar el día sin agobios. La combinación de pasarelas, servicios públicos y zonas accesibles la hace especialmente práctica para familias y para quien busca un baño fácil y relajado. También encaja bien si te interesa alquilar material náutico ligero o simplemente caminar por un arenal grande con ambiente animado pero no estridente.

**Highlights**

- Arenal amplio y llano, con arena fina
- Agua calma y poco profunda, cómoda para el baño
- Servicios públicos completos y accesibilidad cuidada
- Alquiler de tumbonas y material náutico ligero

**Review themes**

- Playa amplia y cómoda (umbrella)
- Agua tranquila (pool)
- Accesibilidad cuidada (tools-kitchen-2)
- Servicios completos (parking)
- Ambiente relajado (sparkles)

**Pros**

- Arena fina y mucho espacio
- Agua calma y limpia
- Buenas facilidades de acceso y servicios

**Cons**

- _Sin datos_

**Services**

- Tumbonas y sombrillas (umbrella)
- Pasarelas de acceso (map-pin)
- Aseo (point)
- Duchas (point)
- Primeros auxilios (tools-kitchen-2)
- Accesibilidad para sillas de ruedas (wheelchair)
- Alquiler de pedales (sailboat)
- Paddle surf (sailboat)

**Category attributes confidence:** high

**Category attributes data**

- **terrain:** arena
- **crowding:** espaciosa; con zonas libres y zonas con hamacas
- **facilities:** tumbonas; sombrillas; aseos; duchas; primeros auxilios; zona de sombra para sillas de ruedas; silla de ruedas de playa; grúa elevadora
- **nearby_food:** paseo con bares y restaurantes
- **landscape_tags:** playa amplia; arena fina; bahía; arenal llano
- **best_time_notes:** finales de mayo con buen ambiente; entre semana puede ser más tranquila
- **water_conditions:** agua calma; oleaje suave; mar poco profundo; agua limpia y clara
- **rentals_or_prices:** pedales; paddle surf
- **access_and_parking:** pasarelas de madera; acceso adaptado; cerca de parada de bus
- **family_accessibility:** muy cómoda para familias; agua poco profunda; acceso adaptado

**Price estimate**

_Sin precio_

**FAQ**

- ¿Es cómoda para ir en familia? - Sí, por su arena llana, el agua poco profunda y los servicios de accesibilidad y apoyo disponibles.
- ¿Cómo es el acceso? - Es sencillo y práctico, con pasarelas y buena accesibilidad, además de estar cerca de transporte y paseo.
- ¿Hay servicios cerca? - Sí, cuenta con tumbonas, sombrillas, aseos, duchas y primeros auxilios, además de bares y restaurantes en el paseo.
- ¿Se puede alquilar material para el agua? - Sí, aparecen alquileres de pedales y paddle surf, además de tumbonas y sombrillas.

**Featured reviews**

- Andrew Godber - Accesibilidad - 5 / 5
- Paul Butcher - Espacio y agua - 5 / 5
- Riccardo Padovan - Alquileres - 5 / 5

### Cala Agulla - beach - Cala Figuera

- **Slug:** `cala-agulla`
- **Generated at:** 2026-06-10T10:50:24.336+00:00

**Editorial opinion**

Destaca por su agua muy clara, el paisaje de pinos y roca, y una arena agradable para pasar el día entre baño y paseo. Tiene tramos más concurridos y otros más tranquilos, con buen encaje para snorkel, fotos y para quien busca un entorno natural con servicios básicos cerca.

**Highlights**

- Agua cristalina con buena visibilidad para ver peces
- Tramos de roca con buen punto para snorkel
- Arena fina y entorno natural con bosque cercano
- Servicios básicos como bar/cafetería, duchas y socorrista

**Review themes**

- Agua cristalina (pool)
- Paisaje natural (umbrella)
- Snorkel y vida marina (sailboat)
- Masificación variable (mood-smile)
- Servicios básicos cerca (tools-kitchen-2)
- Aparcamiento (parking)

**Pros**

- Agua muy clara y con peces visibles
- Paisaje bonito con bosque y vistas abiertas
- Buen sitio para snorkel en la zona de rocas

**Cons**

- Puede llenarse bastante, sobre todo en la parte inicial
- A veces aparece algo de algas en el agua
- La zona de aguas poco profundas es limitada en algunos tramos

**Services**

- Parking (parking)
- Snorkel (swimming)
- Socorrista (tools-kitchen-2)
- Bar o cafetería cerca (map-pin)
- Duchas (tools-kitchen-2)
- Zona de rocas (point)

**Category attributes confidence:** high

**Category attributes data**

- **terrain:** arena fina; rocas en un lateral
- **crowding:** muy concurrida en la parte inicial; más tranquila hacia el final; mejor llegar temprano
- **facilities:** socorrista; bar/cafetería cercana; duchas
- **nearby_food:** bar/cafetería cerca
- **landscape_tags:** playa de arena; entorno natural; bosque cercano; zona rocosa; vistas abiertas
- **best_time_notes:** mejor llegar temprano; la parte final suele ser más tranquila
- **water_conditions:** agua cristalina; buena visibilidad; mar turquesa; profundiza rápido en algunos tramos
- **rentals_or_prices:** -
- **access_and_parking:** hay aparcamiento; conviene llegar pronto para encontrar sitio
- **family_accessibility:** apta para baño y sol; menos cómoda para aguas poco profundas prolongadas

**Price estimate**

_Sin precio_

**FAQ**

- ¿Es buena para hacer snorkel? - Sí, hay una zona de rocas donde se menciona buen snorkel y vida marina visible.
- ¿Suele estar muy llena? - Sí, puede haber bastante gente, sobre todo en la parte inicial; la zona del final suele ser más tranquila.
- ¿Hay servicios cerca? - Sí, aparecen bar o cafetería, duchas y socorrista.
- ¿Conviene ir pronto? - Sí, llegar temprano ayuda a encontrar aparcamiento y mejor sitio en la playa.

**Featured reviews**

- Vesela Docheva - Vistas y calma - 5 / 5
- Marko Živanović - Acceso y afluencia - 4 / 5
- DAZ Ashton - Agua y servicios - 5 / 5

## Auto-check de calidad

- **Temas cualitativos sin numeros:** SI. Ningun review_theme trae mentions/count/percentage.
- **price_estimate.unit correcto por categoria:** SI en la muestra; null se considera correcto si no hay evidencia de precio.
- **Beach usa esquema de playa/cala:** SI. No se detectan senales obvias de negocio en themes/services/attributes.
- **Campos vacios en todas las muestras de una categoria:**
- activity: ninguno
- beach: ninguno
- beach-club: ninguno
- boat-rental: ninguno
- hotel: ninguno
- restaurant: ninguno
- **Validacion Zod:** 20 outputs guardados pasaron validacion.
- **JSON invalido tras endurecer:** 0 de 20 en la tanda medida.
- **Retries observados tras endurecer:** 0 de 20 en la tanda medida.
- **Contenido generico/inventado:** no se aprecia un problema operativo en el informe, pero sigue requiriendo revision editorial humana antes del masivo final si se quiere afinar tono por categoria.

## Coste aproximado

- Modelo actual en el script: `OPENAI_MODEL` o fallback `gpt-5.4-mini`.
- Precio oficial usado para estimar `gpt-5.4 mini`: $0.75 / 1M input tokens y $4.50 / 1M output tokens (OpenAI API pricing, consultado 2026-06-10).
- El script aun no guarda usage de tokens, asi que esto es una estimacion por formula, no facturacion real.
- Estimacion por negocio con ~3k-4k input tokens y ~0.9k-1.3k output tokens: ~$0.006-$0.009.
- Estimacion para ~496 negocios con 0 retries: ~$3-$5. Con 5% retries: ~$3.2-$5.3.

## Veredicto

**Luz verde tecnica para el masivo.** El problema critico de JSON invalido bajo de 40% en la muestra anterior a 0% en 20 negocios variados. Antes del masivo solo revisaria este informe por tono/contenido, no por fiabilidad tecnica.
