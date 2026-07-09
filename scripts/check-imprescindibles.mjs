import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
function loadEnv() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i+1).trim().replace(/^["']|["']$/g,'')
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnv()
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const businesses = [
  // restaurants
  { name: 'Fera Palma', id: 'google-ChIJCQBi5FqSlxIRrpLnDTADHoM', cat: 'restaurants' },
  { name: 'Marc Fosh', id: 'google-ChIJp8jNHVGSlxIRcQ5-_4bPYBg', cat: 'restaurants' },
  { name: 'Vandal Palma', id: 'google-ChIJxcDlNmaSlxIRRw6ZIWrcZg8', cat: 'restaurants' },
  { name: 'Restaurante Emilio Innobar', id: 'google-ChIJc90SsFuSlxIRrdEd9oQaP3g', cat: 'restaurants' },
  { name: 'Restaurante SUMAQ', id: 'google-ChIJ_b0vqGiSlxIRHUHtSfPo52w', cat: 'restaurants' },
  { name: 'QUADRAT Restaurant & Garden', id: 'google-ChIJq91MFE6SlxIRiT0oTBAEoZk', cat: 'restaurants' },
  { name: 'Toque de Queda', id: 'google-ChIJZQR3W1qSlxIRj_emwVMZFmE', cat: 'restaurants' },
  { name: 'El Camino', id: 'google-ChIJK3PlkMmTlxIRi534SQWzYm0', cat: 'restaurants' },
  { name: "Celler Pagès", id: 'google-ChIJm47y0ESSlxIRaBa-KVfwbQc', cat: 'restaurants' },
  { name: 'La Despensa del Barón', id: 'google-ChIJcSEE_1GSlxIR2JalhuGl0dw', cat: 'restaurants' },
  { name: 'Restaurant El Pilón', id: 'google-ChIJy0sW2VqSlxIRVYiQOc_wKYg', cat: 'restaurants' },
  { name: 'La Malvasia', id: 'google-ChIJFQ4EVxGTlxIRJ0ytoyRWyJI', cat: 'restaurants' },
  { name: 'Restaurante Casa Maruka', id: 'google-ChIJmTMWK1SSlxIRlSplGrkFWpM', cat: 'restaurants' },
  { name: "Ca'n Toni", id: 'google-ChIJX1DZqVySlxIRkLpMEKiw6rE', cat: 'restaurants' },
  { name: 'Es Celler de Petra', id: 'google-ChIJzYJh1Fg1lhIR1Zt7oa8JUiw', cat: 'restaurants' },
  { name: 'Balm Restaurant', id: 'google-ChIJWSkAXjPvlxIRwmkqVKqpkcU', cat: 'restaurants' },
  { name: 'Sebastian', id: 'google-ChIJAY_y0ESSlxIRbN_qd2kSMy0', cat: 'restaurants' },
  { name: 'Groenk Bistro & Grill Deià', id: 'google-ChIJeQTmlB3vlxIRtgG29575F6Y', cat: 'restaurants' },
  { name: 'El Baúl Restaurant', id: 'google-ChIJY0MoQ61RlhIRj3D9qlKDde4', cat: 'restaurants' },
  { name: 'Bocoi Portocolom', id: 'google-ChIJGzjU1W9blhIREwOxU-LglP8', cat: 'restaurants' },
  { name: 'Bar Blau Portocolom', id: 'google-ChIJcxe8lF9blhIR6Bl-Gz0WJTo', cat: 'restaurants' },
  { name: 'Restaurante Ses Portadores', id: 'google-ChIJrfX61J1alhIRrlv0d_yM-rw', cat: 'restaurants' },
  { name: 'MAKAO', id: 'google-ChIJyauRTBxRlhIRVQ8g4VxZc1s', cat: 'restaurants' },
  { name: 'The Pearlfishers Lobster Shack', id: 'google-ChIJd6TYS_dRlhIRRxOhIdQSI2k', cat: 'restaurants' },
  { name: 'Restaurante Kai (Rooftop)', id: 'google-ChIJhcZ6IgCJlxIR_r1IBYn6yP0', cat: 'restaurants' },
  { name: 'Le Gourmand', id: 'google-ChIJw2toJKKJlxIRKDNYbPUyo9Y', cat: 'restaurants' },
  { name: 'Las Olas', id: 'google-ChIJdf9HhcGJlxIRHL9-pr9ZPvE', cat: 'restaurants' },
  { name: 'Mestiza Great Burger & Steak', id: 'google-ChIJMbYK2KuJlxIR0M0RXXeRnKU', cat: 'restaurants' },
  { name: 'Tapas y Más', id: 'google-ChIJ6bDs9leJlxIRNUN4p2KyARM', cat: 'restaurants' },
  { name: 'Celler de sa Premsa', id: 'google-ChIJYZvSR1eSlxIRlwx_iQzetOE', cat: 'restaurants' },
  // hotels
  { name: 'Can Bordoy Grand House & Garden', id: 'google-ChIJJ9iDt0SSlxIRjTMWcgBy7ic', cat: 'hotels' },
  { name: 'Concepció by Nobis', id: 'google-ChIJ1fTcYyqTlxIRa4SNeVWTLuI', cat: 'hotels' },
  { name: 'El Llorenç Parc de la Mar', id: 'google-ChIJ_doTdWqTlxIRSS_jRqdFYXw', cat: 'hotels' },
  { name: 'Hotel Can Cera', id: 'google-ChIJmaYgNk6SlxIRtXb27Crk9h4', cat: 'hotels' },
  { name: 'Palacio Ca Sa Galesa', id: 'google-ChIJQTDCDE-SlxIRL1nCPY35RQE', cat: 'hotels' },
  { name: 'Can Alomar Urban Luxury Retreat', id: 'google-ChIJoegB1USSlxIRY4l-EKhDs9c', cat: 'hotels' },
  { name: 'Palma Riad', id: 'google-ChIJ88GG7VqSlxIRlCe0yFKua8g', cat: 'hotels' },
  { name: 'Hotel Can Quetglas', id: 'google-ChIJ-xHd9nOSlxIRBY8zm7-8G9o', cat: 'hotels' },
  { name: 'Jumeirah Mallorca', id: 'google-ChIJzZSyCuHllxIR7lvcapvidNk', cat: 'hotels' },
  { name: 'La Residencia, A Belmond Hotel', id: 'google-ChIJ9birlq3vlxIR_a16RBx3yOQ', cat: 'hotels' },
  { name: 'Son Bunyola Hotel & Villas', id: 'google-ChIJcSxusPfzlxIRLVwcpesqGnY', cat: 'hotels' },
  { name: 'Valldemossa Hotel', id: 'google-ChIJ4eZJvgPulxIRwbG8ws1L_34', cat: 'hotels' },
  { name: 'St Regis Mardavall Resort', id: 'google-ChIJCzytnZ-OlxIR6a7hRZcIr94', cat: 'hotels' },
  { name: 'Castell Son Claret', id: 'google-ChIJqeTzXHuKlxIRFaaSn6SS9v4', cat: 'hotels' },
  { name: 'Hospes Maricel', id: 'google-ChIJ030lTNyNlxIRkoTe_M1QLsU', cat: 'hotels' },
  { name: 'Finca Serena', id: 'google-ChIJg5xGzQq3lxIRpuZmuuWdeSM', cat: 'hotels' },
  { name: 'Finca Son Roig Agroturismo', id: 'google-ChIJCcxOSWKzlxIRFnYcp9eXNkA', cat: 'hotels' },
  { name: 'Finca Hotel Amapola', id: 'google-ChIJ5Xu2cQivlxIR0d3AB_AVNIU', cat: 'hotels' },
  { name: 'Agroturismo Can Cantó de Marina', id: 'google-ChIJqS45os6vlxIR3YqND26sLJ8', cat: 'hotels' },
  { name: 'Sa Bassa Rotja', id: 'google-ChIJ6580H8CzlxIRSqpsrSlPNE8', cat: 'hotels' },
  { name: 'Finca Sa Bastida Luxury Retreat & Spa', id: 'google-ChIJ02q5SFa1lxIRgfgARldO5RM', cat: 'hotels' },
  // beach-clubs
  { name: 'Mhares Sea Club', id: 'google-ChIJaSkV3yuYlxIRzxcaBNLaSvA', cat: 'beach-clubs' },
  { name: 'UM Beach House Portals', id: 'google-ChIJc6oSDXCPlxIREXwt4mtnSvQ', cat: 'beach-clubs' },
  { name: 'Beso Beach Mallorca', id: 'google-ChIJr3aNh2OJlxIRa7sJtYIZZy4', cat: 'beach-clubs' },
  { name: 'Purobeach Palma', id: 'google-ChIJ4a3aTKaWlxIRswFN7GZDDhk', cat: 'beach-clubs' },
  { name: 'Purobeach Illetas', id: 'google-ChIJm9XtCHeOlxIR39ClURQJubQ', cat: 'beach-clubs' },
  { name: 'Balneario Illetas Beach Club', id: 'google-ChIJBQj0SHeOlxIRCDE2oiizWik', cat: 'beach-clubs' },
  { name: 'Beach Club Gran Folies', id: 'google-ChIJNZ_PjqUmmBIRUcbKeHIy20c', cat: 'beach-clubs' },
  { name: 'Ponderosa Beach', id: 'google-ChIJH_mAoXgylhIRllRWrtelaWQ', cat: 'beach-clubs' },
  { name: 'NU Mallorca', id: 'google-ChIJ3bweLcctlhIRLuhBCVF9vAc', cat: 'beach-clubs' },
  { name: 'Nikki Beach Mallorca', id: 'google-ChIJDy2pKCmJlxIRXe1vTFRdqnM', cat: 'beach-clubs' },
  // bars
  { name: 'Agabar Cocktail Bar', id: 'google-ChIJSYLNPkGTlxIRNczO4qM6WeQ', cat: 'bars' },
  { name: 'After Landing Cocktail Art', id: 'google-ChIJ0evFSIqTlxIRb_NaQRStTHU', cat: 'bars' },
  { name: 'Brassclub', id: 'google-ChIJkX4K01qSlxIRWzstQRmE5o8', cat: 'bars' },
  { name: 'The Library STFU', id: 'google-ChIJqeYOA8KTlxIRFT3PH5I6PwQ', cat: 'bars' },
  { name: 'Turpial Cocktail Bar', id: 'google-ChIJpQmUp22TlxIRa9tEFWIR_TQ', cat: 'bars' },
  { name: 'Bishop Wine Studio', id: 'google-ChIJIXziG8uTlxIRCk8tMWhRdyE', cat: 'bars' },
  { name: 'LAB Cocktail Bar & Academy', id: 'google-ChIJSw1O_meSlxIRFIjOMAKPjlw', cat: 'bars' },
  { name: 'Why Not? Cocktail Bar', id: 'google-ChIJddE7v0SSlxIRMiX21bi-0_s', cat: 'bars' },
  { name: 'Arlequin Restaurant & Cocktail Bar', id: 'google-ChIJ9euOltmTlxIR0aKTKaGZSEA', cat: 'bars' },
  { name: 'Bar Abaco', id: 'google-ChIJm-bKyUSSlxIRAc3vwHrCeb0', cat: 'bars' },
  { name: 'FRÍA SOPHIA', id: 'google-ChIJfaoOUAeTlxIR7dSmV-BWDqY', cat: 'bars' },
  { name: 'La Isolina', id: 'google-ChIJiYtWiX6TlxIRKM7Vje0-Rig', cat: 'bars' },
  { name: 'The Wine Side', id: 'google-ChIJfbe7KBSTlxIRyD_jfnT-TEI', cat: 'bars' },
  { name: 'La Vinya de Santa Clara', id: 'google-ChIJXd-bT1uSlxIRPTWkO2ej5WY', cat: 'bars' },
  // cafes
  { name: 'Nala Brunch & Coffee', id: 'google-ChIJo2ASRMSTlxIRCgj7YFjRiJ0', cat: 'cafes' },
  { name: 'Noti Specialty Coffee Roasters', id: 'google-ChIJd1qsfNCTlxIR3LvjCQDziv4', cat: 'cafes' },
  { name: 'Surry Hills Coffee & Brunch', id: 'google-ChIJbShWvx2TlxIRhELvwp8KNwA', cat: 'cafes' },
  { name: 'CAFÈSPHÈRE Specialty Coffee', id: 'google-ChIJNRBPRoWTlxIRAL5CYfDB1A8', cat: 'cafes' },
  { name: 'BACAN Specialty Coffee & Brunch', id: 'google-ChIJHxK5C5iTlxIRpvSK9tywnGQ', cat: 'cafes' },
  { name: 'HOTTO Coffee & Brunch', id: 'google-ChIJ3_X3v0-TlxIRptcg8mi5kGY', cat: 'cafes' },
  { name: 'Batx', id: 'google-ChIJa4zx8s-TlxIRXPi1hcJf0Do', cat: 'cafes' },
  { name: 'Nano Coffee Lab', id: 'google-ChIJ2RLSW_yTlxIRktlQYKuA0Nk', cat: 'cafes' },
  { name: 'Mistral Coffee House', id: 'google-ChIJaVSN6VWTlxIRqEpO4XCIcdg', cat: 'cafes' },
  { name: 'El Grano de Café', id: 'google-ChIJacwkTc6TlxIRTJK5NDP-zDg', cat: 'cafes' },
  { name: "Ca'n Joan de s'Aigo", id: "google-ChIJ_Wydbk6SlxIRc5wKl1c1hcY", cat: 'cafes' },
  // bakeries
  { name: 'Fika Farina Coffee & Bakery', id: 'google-ChIJEUGWH06TlxIRWMOerVXhUb4', cat: 'bakeries' },
  { name: 'Fornet de la Soca', id: 'google-ChIJTU1qblqSlxIRgqyBztCvFs4', cat: 'bakeries' },
  { name: 'La Petite Boulangerie', id: 'google-ChIJWY_V1hSTlxIRY4PPSPE-9Zw', cat: 'bakeries' },
  { name: "Panadería S'Estació", id: 'google-ChIJRRtwTlKSlxIRGhwzV7CmhAA', cat: 'bakeries' },
  { name: 'Forn de San Agustín', id: 'google-ChIJCyAeI92NlxIR7izZSliccps', cat: 'bakeries' },
  { name: 'Pastisseria Real', id: 'google-ChIJR8eOD6aTlxIRGFYqVgsL0W0', cat: 'bakeries' },
  { name: 'Ensaïmades Àngel', id: 'google-ChIJe5eBAIqSlxIRUrbxVMbhhTI', cat: 'bakeries' },
  { name: "Can Joan de s'Aigo (Sindicat)", id: 'google-ChIJs2r9gVuSlxIRiuG8823VKcY', cat: 'bakeries' },
  // nightlife
  { name: 'Shamrock Palma', id: 'google-ChIJV06jNm-SlxIRo2AZzPtzmtc', cat: 'nightlife' },
  { name: 'The Jazz Lounge by Florencio Cruz', id: 'google-ChIJVdyTIo-TlxIR8AEkvvmRKF0', cat: 'nightlife' },
  { name: 'La Movida', id: 'google-ChIJ010fGYCSlxIRAOAEsS1RG_g', cat: 'nightlife' },
  { name: 'Maraca Club', id: 'google-ChIJ7XSpCvmSlxIRhyxMWUEzu90', cat: 'nightlife' },
  { name: 'Zar Society', id: 'google-ChIJmSc8EHKSlxIRrza9gS5ISXY', cat: 'nightlife' },
  { name: 'Amok Nightclub', id: 'google-ChIJZc2aUqmVlxIRjZj3I4xG6IY', cat: 'nightlife' },
  { name: 'Bierkönig', id: 'google-ChIJYa3ykviSlxIRmSdPs4lzgWs', cat: 'nightlife' },
  // activities
  { name: 'Vela Mayorca Boat Tours', id: 'google-ChIJR9dj-LCTlxIRLFAUzLJGCxE', cat: 'activities' },
  { name: 'Coral Boats Mallorca', id: 'google-ChIJ4UUv98QtlhIRow36fE3H-hU', cat: 'activities' },
  { name: 'My Sea Experience', id: 'google-ChIJlS-Ajo0slhIRekuwVyGv1LU', cat: 'activities' },
  { name: 'Nature Boat Portocolom', id: 'google-ChIJlVIDxOtblhIRN9meSQISLYY', cat: 'activities' },
  { name: 'La Cala Boat Tours', id: 'google-ChIJkwXsMILrlxIRcIjJk6ZCHUM', cat: 'activities' },
  { name: 'Bladerunner Mallorca', id: 'google-ChIJ8YRNzS2JlxIRfHW3GjV6SpM', cat: 'activities' },
  { name: 'Scuba Mallorca', id: 'google-ChIJZ-pQziPVlxIRleNX77FWdZ8', cat: 'activities' },
  { name: 'Big Blue Diving', id: 'google-ChIJr9dYIc2OlxIRqSAxf-bQUwA', cat: 'activities' },
  { name: 'Norway Dive Mallorca', id: 'google-ChIJEz5LpjKJlxIRkA_7S8n5aRU', cat: 'activities' },
  { name: "Karting Ca'n Picafort", id: 'google-ChIJNSlIUkcylhIR2rOahqrfmW8', cat: 'activities' },
  { name: 'Bodegues José L. Ferrer', id: 'google-ChIJ3zfkzkbBlxIRUtIaI6AwmQ4', cat: 'activities' },
  { name: 'Celler Tianna Negre', id: 'google-ChIJS5eCYKzGlxIRTyPE2VvBC7M', cat: 'activities' },
  { name: 'Sa Cabana (vino)', id: 'google-ChIJbR784l7BlxIRC6Nuuij8Vlk', cat: 'activities' },
  // boats
  { name: 'Boat Rental Palma On Charter', id: 'google-ChIJuX-P-bqTlxIR75sJk0djKGo', cat: 'boats' },
  { name: 'Palma Boats', id: 'google-ChIJQSqvLwmSlxIRi19_EiaRKK0', cat: 'boats' },
  { name: 'Mallorca Global Charter', id: 'google-ChIJL993IGA8fowRh6WcIXi1u6Q', cat: 'boats' },
  { name: 'Ja Nedam Boat Experience', id: 'google-ChIJlwy9YTqTlxIRxUR63TS8-sU', cat: 'boats' },
  { name: 'ECC Yacht Charter Mallorca', id: 'google-ChIJC-3kpkOSlxIRqE8vwHyaaPk', cat: 'boats' },
  { name: 'Ancorats Charter', id: 'google-ChIJz1l3OFaTlxIRCeBRPw8btBk', cat: 'boats' },
  { name: 'Pura Vida Sailing Mallorca', id: 'google-ChIJW6wY0mInmBIR4AYtF1Dylos', cat: 'boats' },
  { name: 'Smart Boats Mallorca', id: 'google-ChIJP6ekLK0mmBIRos-h53FQLcA', cat: 'boats' },
  { name: 'The Charter Yard', id: 'google-ChIJt_-UWAkhmBIRqAJwGBmHzFw', cat: 'boats' },
  { name: 'Vayu Charters', id: 'google-ChIJXz2eW7YhmBIRQy2Tsxiatko', cat: 'boats' },
  { name: 'Llauts Andratx Boats Charter', id: 'google-ChIJSbNfoasmmBIRlpS062hX9jk', cat: 'boats' },
  { name: "Alejandra's Charter", id: 'google-ChIJoQK154sslhIRAlNWmRZLAeU', cat: 'boats' },
  { name: 'Boats Rental Mallorca', id: 'google-ChIJyaD684sslhIRcx27xSR8ewY', cat: 'boats' },
  { name: 'Real Yacht Charter', id: 'google-ChIJewfkt-iNlxIRBw9SxMK9Ydc', cat: 'boats' },
  // rent-a-car
  { name: 'VIMA Rent a Car', id: 'google-ChIJoZZACY6VlxIRf4OGmRjYGhw', cat: 'rent-a-car' },
  { name: 'SIXT', id: 'google-ChIJU1x01i-UlxIRIHnfv2WMW5o', cat: 'rent-a-car' },
  { name: 'Enterprise', id: 'google-ChIJbYYE1i-UlxIRBCu7Iep_grI', cat: 'rent-a-car' },
  { name: 'Wiber Rent a Car', id: 'google-ChIJSbOnkJGTlxIRAcdEhk6qYI4', cat: 'rent-a-car' },
  // car-dealers
  { name: 'Premium Car', id: 'google-ChIJvVdAPZeSlxIRm8DrYA3vCfU', cat: 'car-dealers' },
  { name: '500 Millas Automóviles', id: 'google-ChIJm9ksD62TlxIRqI_6QaMBhG8', cat: 'car-dealers' },
  { name: 'Original Cars', id: 'google-ChIJcTHhTGuTlxIRKT5bIcsOvRg', cat: 'car-dealers' },
  { name: 'Professional Cars Mallorca', id: 'google-ChIJyRnTuwyTlxIRj8k9fUE-54U', cat: 'car-dealers' },
  { name: 'Calvià Cars', id: 'google-ChIJuZd9yXaJlxIRAr0p5OAx1HQ', cat: 'car-dealers' },
  { name: 'Quality Used Cars Mallorca', id: 'google-ChIJnYIasWaJlxIRqElW4PLwjT8', cat: 'car-dealers' },
  { name: 'BMW Proa Premium', id: 'google-ChIJAa63siSTlxIRcJc1Vs08bec', cat: 'car-dealers' },
  // spas
  { name: 'Spa Maison CODAGE (Kimpton Aysla)', id: 'google-ChIJv9BfgD2JlxIRg5qW1wq1Oow', cat: 'spas' },
  { name: 'Hammam Al Ándalus', id: 'google-ChIJMX-nYFOSlxIRMKRzTuMuW9w', cat: 'spas' },
  { name: 'Anaya Massage & Spa', id: 'google-ChIJZ83K5DCTlxIRwWXCwdOvsyE', cat: 'spas' },
  { name: 'Massage Deluxe by Luk', id: 'google-ChIJM9tz-OyTlxIRWT9NRRxozZw', cat: 'spas' },
  { name: 'Mallorca Wellness SPA (Playa de Palma)', id: 'google-ChIJ2YzBUJaXlxIR793Lx5lB9Zg', cat: 'spas' },
  { name: 'Mallorca Wellness SPA (Punta Rotja)', id: 'google-ChIJ-ZP4lAM_lhIR8S_NijfXW2c', cat: 'spas' },
  { name: 'Best SPA Mallorca - Ocean SPA', id: 'google-ChIJSxxGMWvVlxIRjdrn6oGbMQI', cat: 'spas' },
  { name: 'Arabella Spa', id: 'google-ChIJDXcoTrqOlxIRfv6th4-9CW4', cat: 'spas' },
  { name: 'Shine Spa (Sheraton)', id: 'google-ChIJjfEmrQyNlxIRp0eKjbwOJx0', cat: 'spas' },
  // gyms
  { name: 'Premier Gym', id: 'google-ChIJ6Q9XmI-TlxIRpyT2nXZhT9c', cat: 'gyms' },
  { name: 'VivaGym Santa Catalina', id: 'google-ChIJwfvyBWeSlxIRcTiK82Okw1I', cat: 'gyms' },
  // casinos
  { name: 'Casino Mallorca Luckia', id: 'google-ChIJL7I-QgiSlxIRPr2LiiazNUc', cat: 'casinos' },
  // vets
  { name: 'Cl. Veterinària Foners', id: 'google-ChIJAb4LfbKTlxIRKOXbgxMTwnE', cat: 'vets' },
  { name: 'Blanquerna Centre Clínic Veterinari', id: 'google-ChIJN5F6gviSlxIR8VDfe8dnkSk', cat: 'vets' },
  { name: 'Centro Veterinario Friendly Vets', id: 'google-ChIJuVulK3GTlxIRj5ThtteP5A8', cat: 'vets' },
  { name: 'Cl. Veterinària Metropolitan', id: 'google-ChIJwVxCa6-TlxIRYRZU0VNgsP8', cat: 'vets' },
  { name: 'Veterinary Hospital Canis (24h)', id: 'google-ChIJtf70HOSSlxIRNHiU4QL2NA8', cat: 'vets' },
  { name: 'AniCura Aragó Hospital (24h)', id: 'google-ChIJVVRbQhnFlxIRCTIcW1IyW98', cat: 'vets' },
  { name: 'Balmes Veterinary Hospital', id: 'google-ChIJ1y1_jP-SlxIRoGZQH7dkAAI', cat: 'vets' },
  // healthcare
  { name: 'Juaneda Clínica', id: 'google-ChIJYSDnyXySlxIR1p7X-OqhVFM', cat: 'healthcare' },
  { name: 'Palma Clinic', id: 'google-ChIJvX4J0uuSlxIRYLbeF7e9i-k', cat: 'healthcare' },
  { name: 'Juaneda Hospital Miramar', id: 'google-ChIJIanBjIiSlxIR-52HHQNhq7Y', cat: 'healthcare' },
  { name: 'Hospital Verge de la Salut', id: 'google-ChIJSe0Z2HKTlxIRwLEp5uJROZA', cat: 'healthcare' },
  // real-estate
  { name: "Spain Sotheby's International Realty", id: 'google-ChIJK4wOtlIhmBIR3e35hvq_8Aw', cat: 'real-estate' },
  { name: 'Sandberg Estates', id: 'google-ChIJFZdyjiqMlxIRj4AoQsZDAZ4', cat: 'real-estate' },
  { name: 'Mallorca Agent - Luxury Real Estate', id: 'google-ChIJeUxUqDUnmBIR5FQZlJGjqXo', cat: 'real-estate' },
  { name: 'The Agency Mallorca', id: 'google-ChIJ0xeLnAQPlxIRmmzeU-j_13Y', cat: 'real-estate' },
  { name: 'Private Property Mallorca', id: 'google-ChIJk3B3f4eOlxIRBnkgMh677_4', cat: 'real-estate' },
  { name: "Luxury Estates Mallorca (Christie's)", id: 'google-ChIJ_xaU56wmmBIRiOuueiGc7To', cat: 'real-estate' },
  { name: 'RH Real Estate Mallorca', id: 'google-ChIJ2WP6xuDyQQkR0hGqQOXUbOI', cat: 'real-estate' },
  { name: 'Luxury on Mallorca', id: 'google-ChIJ4fJj6_uTlxIRBuguiLGS7cE', cat: 'real-estate' },
]

const ids = businesses.map(b => b.id)
const { data: found } = await sb.from('businesses').select('id, status, category').in('id', ids)
const foundIds = new Set((found ?? []).map(r => r.id))
const foundMap = Object.fromEntries((found ?? []).map(r => [r.id, r]))

const missing = businesses.filter(b => !foundIds.has(b.id))
const inDB = businesses.filter(b => foundIds.has(b.id))

// Group missing by category
const missingByCat = {}
for (const b of missing) {
  if (!missingByCat[b.cat]) missingByCat[b.cat] = []
  missingByCat[b.cat].push(b)
}

console.log(`\n✅ EN DB: ${inDB.length}/${businesses.length}`)
console.log(`❌ FALTAN: ${missing.length}\n`)

if (missing.length > 0) {
  for (const [cat, items] of Object.entries(missingByCat)) {
    console.log(`\n── ${cat} (${items.length} faltantes)`)
    for (const b of items) {
      console.log(`   ❌ ${b.name}`)
      console.log(`      place_id: ${b.id.replace('google-', '')}`)
    }
  }
}

// Also show any in DB with hidden/wrong status
const wrongStatus = inDB.filter(b => {
  const row = foundMap[b.id]
  return row.status === 'hidden' || row.category !== b.cat.replace('-', '_').replace('-', '_')
})
if (wrongStatus.length > 0) {
  console.log(`\n⚠️  EN DB pero con status/categoría a revisar:`)
  for (const b of wrongStatus) {
    const row = foundMap[b.id]
    console.log(`   ${b.name} → status: ${row.status}, category: ${row.category} (esperado: ${b.cat})`)
  }
}
