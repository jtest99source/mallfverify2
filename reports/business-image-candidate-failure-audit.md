# Business Image Candidate Failure Audit

Generated: 2026-06-08T18:14:46.597Z

## Summary

Sample size: 50

## Distribution Of Causes

| Cause | Count |
|---|---:|
| blocks_or_restricts_bots | 25 |
| needs_html_image_heuristic | 11 |
| only_favicon_found | 10 |
| fetch_error | 1 |
| would_be_found_by_current_extractor | 1 |
| timeout | 1 |
| http_error | 1 |

## Potential Coverage

| Segment | Count |
|---|---:|
| Found by current extractor | 1 |
| Add JSON-LD image support | 0 |
| Add homepage image heuristic | 11 |
| Total possible from sample | 12 |
| Estimated possible coverage over 334 official websites | 80 |

## Recommendations

- Add JSON-LD image extraction to images:find-business-candidates; several official sites expose image in structured data rather than meta tags.
- Add a conservative homepage image heuristic for large <img>, srcset, and CSS background images, but keep it as candidate-only, never auto-assign without review unless the URL is clearly from the official domain/CDN.
- Record fetch diagnostics in future crawler runs: HTTP status, final URL, content type, timeout, and extractor reason. This makes low coverage explainable.
- Normalize long tracking-heavy hotel URLs before fetching, and optionally retry the canonical origin homepage when the deep URL has no image metadata.
- Keep favicon as diagnostic only. Do not use favicons as business images.

## Per Business

| # | Name | Website | HTTP | Redirect | OG | Twitter | image_src | Favicon | JSON-LD image | Large images | Bot block | Timeout/Error | Cause |
|---:|---|---|---:|---|---|---|---|---|---|---:|---|---|---|
| 1 | Catedral-Basílica de Santa María de Mallorca | https://www.catedraldemallorca.org/es/ | 200 | yes | no | no | no | yes | no | 9 | no | - | needs_html_image_heuristic |
| 2 | Castillo de Bellver | https://castelldebellver.palma.es/ | 200 | no | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 3 | Iberostar Waves Playa de Muro | https://www.iberostar.com/en/hotels/majorca/iberostar-waves-playa-de-muro/?utm_source=gmb&utm_medium=organic&utm_campaign=IBSVOL_EMEA_SEOLOC_GMB_NA_EN_ESP_BAL_PMI_MUR_PULL_NA_NA_NA_NA_NA | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 4 | Cuevas de Artà | http://www.cuevasdearta.com/ | 200 | yes | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 5 | Parque Natural de Mondragó | http://ca.balearsnatura.com/parque_natural/parque-natural-de-mondrago/ | - | no | no | no | no | no | no | 0 | no | fetch failed | fetch_error |
| 6 | Iberostar Selection Playa de Muro Village | https://www.iberostar.com/en/hotels/majorca/iberostar-selection-playa-de-muro-village/?utm_source=gmb&utm_medium=organic&utm_campaign=IBSVOL_EMEA_SEOLOC_GMB_NA_EN_ESP_BAL_PMI_PMV_PULL_NA_NA_NA_NA_NA | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 7 | Puerto de Alcúdia | https://www.portsdebalears.com/ca/alcudia | 200 | no | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 8 | Restaurant Celler Ca'n Costa Alcúdia | http://www.cancostaalcudia.com/ | 200 | yes | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 9 | JETSKI VICE MALLORCA🌴 RENTAL & TOURS CALA D‘OR | http://www.jetskivice.com/ | 200 | yes | no | no | no | no | no | 10 | no | - | needs_html_image_heuristic |
| 10 | Bombay Beach Indian Restaurant | https://www.bombaybeachindianrestaurant.com/ | 200 | no | no | no | no | yes | no | 5 | yes | - | blocks_or_restricts_bots |
| 11 | NOU CALA BLAVA\|Mallorca restaurant | http://noucalablava.com/ | 200 | yes | no | no | no | no | no | 10 | no | - | needs_html_image_heuristic |
| 12 | Alua Boccaccio | https://www.hyattinclusivecollection.com/en/resorts-hotels/alua-hotels/mallorca/boccaccio/?utm_source=google&utm_medium=organic&utm_campaign=GoogleMyBusiness&partner=5152&utm_content=boccaccio&tc_alt=105928 | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 13 | Celler La Parra | https://www.cellerlaparra.com/ | 200 | yes | yes | no | no | yes | no | 10 | no | - | would_be_found_by_current_extractor |
| 14 | La Malvasia | https://lamalvasiamallorca.com/ | 200 | no | no | no | no | yes | no | 2 | no | - | needs_html_image_heuristic |
| 15 | FERVOR Palma | https://grupocardon.com/restaurantes/fervor/ | 200 | no | no | no | no | yes | no | 0 | yes | - | blocks_or_restricts_bots |
| 16 | Los Patos Restaurant | http://www.lospatosrestaurant.com/ | 200 | yes | no | no | no | yes | no | 7 | yes | - | blocks_or_restricts_bots |
| 17 | CityXperience | http://www.cityxperience.com/ | 200 | yes | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 18 | Restaurante del Sol | http://delsol-mallorca.com/ | 200 | yes | no | no | no | yes | no | 10 | no | - | needs_html_image_heuristic |
| 19 | Iberostar Waves Ciudad Blanca | https://www.iberostar.com/en/hotels/majorca/iberostar-waves-ciudad-blanca/?utm_source=gmb&utm_medium=organic&utm_campaign=IBSVOL_EMEA_SEOLOC_GMB_NA_EN_ESP_BAL_PMI_BLA_PULL_NA_NA_NA_NA_NA | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 20 | Al Faro Beach | https://www.alfarobeach.com/ | 200 | no | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 21 | Cala Agulla | http://www.illesbalears.travel/wwwib/index.html | 500 | yes | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 22 | Coves de Campanet | http://www.covesdecampanet.com/ | 200 | yes | no | no | no | yes | no | 8 | no | - | needs_html_image_heuristic |
| 23 | Caramelo Palma Beach | https://www.caramelohotels.com/en/hotels/caramelo-palma-beach-in-palma/?utm_source=google&utm_medium=organic&utm_campaign=GoogleMyBusiness&partner=12986 | 200 | no | no | no | no | yes | no | 10 | no | - | needs_html_image_heuristic |
| 24 | Alua Gran Camp de Mar | https://www.hyattinclusivecollection.com/en/resorts-hotels/alua-hotels/mallorca/gran-camp-de-mar/?utm_source=google&utm_medium=organic&utm_campaign=GoogleMyBusiness&partner=5152&utm_content=grancampdemar&tc_alt=105978 | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 25 | AluaSoul Mallorca Resort (Adults Only) | https://www.hyattinclusivecollection.com/en/resorts-hotels/alua-hotels/majorca/mallorca-resort-adults-only/?utm_source=google&utm_medium=organic&utm_campaign=GoogleMyBusiness&partner=5152&utm_content=aluasoulmallorca&tc_alt=105990 | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 26 | Kalypsotuttifrutti | http://kalypsotuttifrutti.com/ | 200 | yes | no | no | no | yes | no | 1 | no | - | needs_html_image_heuristic |
| 27 | Hotel Vibra Beverly Playa | https://www.vibrahotels.com/mallorca/paguera-calvia/hotel-vibra-beverly-playa?utm_source=google&utm_medium=gmb&utm_campaign=listing&utm_content=HPGR | 200 | no | no | no | no | yes | yes | 0 | yes | - | blocks_or_restricts_bots |
| 28 | Andana-Restaurante Palma | http://www.andanapalma.es/?utm_source=google-my-business | - | no | no | no | no | no | no | 0 | no | timeout | timeout |
| 29 | El Camino | http://www.elcaminopalma.es/ | 200 | yes | no | no | no | yes | no | 1 | no | - | needs_html_image_heuristic |
| 30 | Seaclub Alcudia | https://www.seaclub.com/en?origin=gmb&affiliate=gmb&utm_source=google&utm_medium=organic&utm_campaign=GoogleMyBusiness | 200 | no | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 31 | Meliá Palma Marina | https://www.melia.com/en/hotels/spain/majorca/melia-palma-marina?utm_campaign=google&utm_content=0738&utm_medium=organic&utm_source=directories | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 32 | Elba Sunset Mallorca Thalasso Spa | https://www.hoteleselba.com/es/hotel/elba-sunset-mallorca?utm_source=GHF&utm_medium=homeG&utm_campaign=SUNSET_GHF | 200 | yes | no | no | no | yes | yes | 0 | yes | - | blocks_or_restricts_bots |
| 33 | Mhares Sea Club | http://www.mharesseaclub.com/ | 200 | yes | no | no | no | yes | no | 10 | yes | - | blocks_or_restricts_bots |
| 34 | Parque Natural de la Albufera de Mallorca | https://salbufera.com/ | 200 | yes | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 35 | Alcudia | http://platja-dalcudia.business.site/ | 404 | no | no | no | no | no | no | 0 | no | - | http_error |
| 36 | Adrian Quetglas Restaurant | http://www.adrianquetglas.es/ | 200 | yes | no | no | no | yes | no | 1 | yes | - | blocks_or_restricts_bots |
| 37 | DINS Santi Taura | http://www.dinssantitaura.com/ | 200 | yes | no | no | no | yes | no | 2 | yes | - | blocks_or_restricts_bots |
| 38 | Balneario Illetas-Beach Club | http://www.balnearioilletas.com/ | 200 | yes | no | no | no | yes | no | 10 | yes | - | blocks_or_restricts_bots |
| 39 | Restaurant MANACOR | https://restaurantmanacor.com/ | 200 | no | no | no | no | yes | no | 10 | no | - | needs_html_image_heuristic |
| 40 | BG Hotel Caballero | https://www.bghotels.com/bg-caballero.html?utm_medium=organic&utm_source=google&utm_campaign=google-my-business&utm_term=google-local&utm_id=bg-caballero | 200 | no | no | no | no | yes | no | 4 | yes | - | blocks_or_restricts_bots |
| 41 | La Tapera | https://www.covermanager.com/reservation/module_restaurant/restaurante-la-tapera/spanish?source=INSTAGRAM | 200 | no | no | no | no | yes | no | 0 | yes | - | blocks_or_restricts_bots |
| 42 | Salines des Trenc | http://www.salinasdestrenc.com/ | 200 | yes | no | no | no | yes | no | 0 | yes | - | blocks_or_restricts_bots |
| 43 | Restaurante Bodega Ca'n Pantina | http://canpantina.com/ | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 44 | Marina Beach Mallorca | https://marinabeachmallorca.com/ | 200 | no | no | no | no | yes | no | 0 | no | - | only_favicon_found |
| 45 | Osteria El Patio | http://www.osteriaelpatio.com/ | 200 | no | no | no | no | yes | no | 1 | yes | - | blocks_or_restricts_bots |
| 46 | Vandal Palma | http://www.vandalpalma.com/?utm_source=google&utm_medium=organic&utm_campaign=gmb | 200 | yes | no | no | no | yes | yes | 5 | yes | - | blocks_or_restricts_bots |
| 47 | Como en Casa | http://restaurantcomoencasa.com/ | 200 | yes | no | no | no | yes | no | 8 | no | - | needs_html_image_heuristic |
| 48 | Meliá Palma Bay | https://www.melia.com/en/hotels/spain/majorca/melia-palma-bay?utm_campaign=google&utm_content=0783&utm_medium=organic&utm_source=directories | 403 | no | no | no | no | no | no | 0 | yes | - | blocks_or_restricts_bots |
| 49 | Captain Boleor | https://boleor.com/ | 200 | no | yes | no | no | yes | no | 0 | yes | - | blocks_or_restricts_bots |
| 50 | Lume&Co Restaurante en Mallorca | https://lumerestaurante.com/ | 200 | no | yes | no | no | yes | no | 10 | yes | - | blocks_or_restricts_bots |
