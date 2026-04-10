export type CheckoutStep = 1 | 2 | 3 | 4;

// Delivery and payment methods are now dynamic strings to support vendor customization
export type DeliveryMethod = string;

export type PaymentMethod = string;

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveForFuture: boolean;
}

export interface BillingAddress {
  sameAsShipping: boolean;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface CardDetails {
  cardNumber: string;
  cardholderName: string;
  expirationDate: string;
  cvv: string;
  saveCard: boolean;
}

export interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  price: number;
  duration: string;
  estimatedDate: string;
  description?: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  shippingInfo: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  cardInfo: CardDetails;
  billingAddress: BillingAddress;
  termsAccepted: boolean;
  orderPlaced: boolean;
  promoCode?: string;
  discount?: number;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryOption;
  paymentMethod: PaymentMethod;
  summary: OrderSummary;
  estimatedDelivery: Date;
}

// Validation Errors
export interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  cardNumber?: string;
  cardholderName?: string;
  expirationDate?: string;
  cvv?: string;
}

// Countries for dropdown (sorted alphabetically)
export const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'CA', label: 'Canada' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'EG', label: 'Egypt' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'GR', label: 'Greece' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KR', label: 'South Korea' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MA', label: 'Morocco' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NO', label: 'Norway' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'VN', label: 'Vietnam' },
];

// States/Provinces by country
export const COUNTRY_STATES: Record<string, { value: string; label: string }[]> = {
  // United States
  US: [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ],
  // Canada
  CA: [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' },
  ],
  // United Kingdom
  GB: [
    { value: 'ENG', label: 'England' },
    { value: 'SCT', label: 'Scotland' },
    { value: 'WLS', label: 'Wales' },
    { value: 'NIR', label: 'Northern Ireland' },
  ],
  // Australia
  AU: [
    { value: 'ACT', label: 'Australian Capital Territory' },
    { value: 'NSW', label: 'New South Wales' },
    { value: 'NT', label: 'Northern Territory' },
    { value: 'QLD', label: 'Queensland' },
    { value: 'SA', label: 'South Australia' },
    { value: 'TAS', label: 'Tasmania' },
    { value: 'VIC', label: 'Victoria' },
    { value: 'WA', label: 'Western Australia' },
  ],
  // India
  IN: [
    { value: 'AP', label: 'Andhra Pradesh' },
    { value: 'AR', label: 'Arunachal Pradesh' },
    { value: 'AS', label: 'Assam' },
    { value: 'BR', label: 'Bihar' },
    { value: 'CT', label: 'Chhattisgarh' },
    { value: 'GA', label: 'Goa' },
    { value: 'GJ', label: 'Gujarat' },
    { value: 'HR', label: 'Haryana' },
    { value: 'HP', label: 'Himachal Pradesh' },
    { value: 'JH', label: 'Jharkhand' },
    { value: 'KA', label: 'Karnataka' },
    { value: 'KL', label: 'Kerala' },
    { value: 'MP', label: 'Madhya Pradesh' },
    { value: 'MH', label: 'Maharashtra' },
    { value: 'MN', label: 'Manipur' },
    { value: 'ML', label: 'Meghalaya' },
    { value: 'MZ', label: 'Mizoram' },
    { value: 'NL', label: 'Nagaland' },
    { value: 'OR', label: 'Odisha' },
    { value: 'PB', label: 'Punjab' },
    { value: 'RJ', label: 'Rajasthan' },
    { value: 'SK', label: 'Sikkim' },
    { value: 'TN', label: 'Tamil Nadu' },
    { value: 'TG', label: 'Telangana' },
    { value: 'TR', label: 'Tripura' },
    { value: 'UP', label: 'Uttar Pradesh' },
    { value: 'UK', label: 'Uttarakhand' },
    { value: 'WB', label: 'West Bengal' },
    { value: 'DL', label: 'Delhi' },
  ],
  // Bangladesh
  BD: [
    { value: 'BAR', label: 'Barisal' },
    { value: 'CHI', label: 'Chittagong' },
    { value: 'DHA', label: 'Dhaka' },
    { value: 'KHU', label: 'Khulna' },
    { value: 'MYM', label: 'Mymensingh' },
    { value: 'RAJ', label: 'Rajshahi' },
    { value: 'RAN', label: 'Rangpur' },
    { value: 'SYL', label: 'Sylhet' },
  ],
  // Pakistan
  PK: [
    { value: 'PB', label: 'Punjab' },
    { value: 'SD', label: 'Sindh' },
    { value: 'KP', label: 'Khyber Pakhtunkhwa' },
    { value: 'BA', label: 'Balochistan' },
    { value: 'IS', label: 'Islamabad Capital Territory' },
    { value: 'GB', label: 'Gilgit-Baltistan' },
    { value: 'AK', label: 'Azad Kashmir' },
  ],
  // Germany
  DE: [
    { value: 'BW', label: 'Baden-Wurttemberg' },
    { value: 'BY', label: 'Bavaria' },
    { value: 'BE', label: 'Berlin' },
    { value: 'BB', label: 'Brandenburg' },
    { value: 'HB', label: 'Bremen' },
    { value: 'HH', label: 'Hamburg' },
    { value: 'HE', label: 'Hesse' },
    { value: 'NI', label: 'Lower Saxony' },
    { value: 'MV', label: 'Mecklenburg-Vorpommern' },
    { value: 'NW', label: 'North Rhine-Westphalia' },
    { value: 'RP', label: 'Rhineland-Palatinate' },
    { value: 'SL', label: 'Saarland' },
    { value: 'SN', label: 'Saxony' },
    { value: 'ST', label: 'Saxony-Anhalt' },
    { value: 'SH', label: 'Schleswig-Holstein' },
    { value: 'TH', label: 'Thuringia' },
  ],
  // France
  FR: [
    { value: 'IDF', label: 'Ile-de-France' },
    { value: 'PAC', label: 'Provence-Alpes-Cote d\'Azur' },
    { value: 'ARA', label: 'Auvergne-Rhone-Alpes' },
    { value: 'OCC', label: 'Occitanie' },
    { value: 'NAQ', label: 'Nouvelle-Aquitaine' },
    { value: 'HDF', label: 'Hauts-de-France' },
    { value: 'GES', label: 'Grand Est' },
    { value: 'PDL', label: 'Pays de la Loire' },
    { value: 'BRE', label: 'Brittany' },
    { value: 'NOR', label: 'Normandy' },
    { value: 'BFC', label: 'Bourgogne-Franche-Comte' },
    { value: 'CVL', label: 'Centre-Val de Loire' },
    { value: 'COR', label: 'Corsica' },
  ],
  // Japan
  JP: [
    { value: 'TK', label: 'Tokyo' },
    { value: 'OS', label: 'Osaka' },
    { value: 'KY', label: 'Kyoto' },
    { value: 'AI', label: 'Aichi' },
    { value: 'HK', label: 'Hokkaido' },
    { value: 'FK', label: 'Fukuoka' },
    { value: 'HG', label: 'Hyogo' },
    { value: 'KN', label: 'Kanagawa' },
    { value: 'ST', label: 'Saitama' },
    { value: 'CB', label: 'Chiba' },
    { value: 'SZ', label: 'Shizuoka' },
    { value: 'HR', label: 'Hiroshima' },
  ],
  // China
  CN: [
    { value: 'BJ', label: 'Beijing' },
    { value: 'SH', label: 'Shanghai' },
    { value: 'GD', label: 'Guangdong' },
    { value: 'JS', label: 'Jiangsu' },
    { value: 'ZJ', label: 'Zhejiang' },
    { value: 'SD', label: 'Shandong' },
    { value: 'HN', label: 'Henan' },
    { value: 'SC', label: 'Sichuan' },
    { value: 'HB', label: 'Hubei' },
    { value: 'FJ', label: 'Fujian' },
    { value: 'TJ', label: 'Tianjin' },
    { value: 'CQ', label: 'Chongqing' },
  ],
  // Brazil
  BR: [
    { value: 'SP', label: 'Sao Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'BA', label: 'Bahia' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'PR', label: 'Parana' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'CE', label: 'Ceara' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'GO', label: 'Goias' },
    { value: 'DF', label: 'Distrito Federal' },
  ],
  // UAE
  AE: [
    { value: 'AZ', label: 'Abu Dhabi' },
    { value: 'DU', label: 'Dubai' },
    { value: 'SH', label: 'Sharjah' },
    { value: 'AJ', label: 'Ajman' },
    { value: 'FU', label: 'Fujairah' },
    { value: 'RK', label: 'Ras Al Khaimah' },
    { value: 'UQ', label: 'Umm Al Quwain' },
  ],
  // Saudi Arabia
  SA: [
    { value: 'RY', label: 'Riyadh' },
    { value: 'MK', label: 'Makkah' },
    { value: 'MD', label: 'Madinah' },
    { value: 'EP', label: 'Eastern Province' },
    { value: 'AS', label: 'Asir' },
    { value: 'QS', label: 'Qassim' },
    { value: 'TB', label: 'Tabuk' },
    { value: 'HA', label: 'Hail' },
    { value: 'JZ', label: 'Jazan' },
  ],
  // Malaysia
  MY: [
    { value: 'JHR', label: 'Johor' },
    { value: 'KDH', label: 'Kedah' },
    { value: 'KTN', label: 'Kelantan' },
    { value: 'MLK', label: 'Melaka' },
    { value: 'NSN', label: 'Negeri Sembilan' },
    { value: 'PHG', label: 'Pahang' },
    { value: 'PRK', label: 'Perak' },
    { value: 'PLS', label: 'Perlis' },
    { value: 'PNG', label: 'Penang' },
    { value: 'SBH', label: 'Sabah' },
    { value: 'SWK', label: 'Sarawak' },
    { value: 'SGR', label: 'Selangor' },
    { value: 'TRG', label: 'Terengganu' },
    { value: 'KUL', label: 'Kuala Lumpur' },
  ],
  // Singapore (single city-state)
  SG: [
    { value: 'SG', label: 'Singapore' },
  ],
  // Thailand
  TH: [
    { value: 'BKK', label: 'Bangkok' },
    { value: 'CNX', label: 'Chiang Mai' },
    { value: 'PKT', label: 'Phuket' },
    { value: 'CBI', label: 'Chonburi' },
    { value: 'KKN', label: 'Khon Kaen' },
    { value: 'NST', label: 'Nakhon Ratchasima' },
    { value: 'SKA', label: 'Songkhla' },
  ],
  // Indonesia
  ID: [
    { value: 'JK', label: 'Jakarta' },
    { value: 'JB', label: 'West Java' },
    { value: 'JT', label: 'Central Java' },
    { value: 'JI', label: 'East Java' },
    { value: 'BA', label: 'Bali' },
    { value: 'SU', label: 'North Sumatra' },
    { value: 'SS', label: 'South Sumatra' },
    { value: 'KS', label: 'South Kalimantan' },
    { value: 'SN', label: 'South Sulawesi' },
  ],
  // Philippines
  PH: [
    { value: 'NCR', label: 'Metro Manila' },
    { value: 'CEB', label: 'Cebu' },
    { value: 'DAV', label: 'Davao' },
    { value: 'CAL', label: 'Calabarzon' },
    { value: 'CLR', label: 'Central Luzon' },
    { value: 'WV', label: 'Western Visayas' },
    { value: 'ILO', label: 'Ilocos Region' },
  ],
  // Vietnam
  VN: [
    { value: 'HN', label: 'Hanoi' },
    { value: 'SG', label: 'Ho Chi Minh City' },
    { value: 'DN', label: 'Da Nang' },
    { value: 'HP', label: 'Hai Phong' },
    { value: 'CT', label: 'Can Tho' },
  ],
  // South Korea
  KR: [
    { value: 'SEL', label: 'Seoul' },
    { value: 'BSN', label: 'Busan' },
    { value: 'ICN', label: 'Incheon' },
    { value: 'DGU', label: 'Daegu' },
    { value: 'DJN', label: 'Daejeon' },
    { value: 'GWJ', label: 'Gwangju' },
    { value: 'GGI', label: 'Gyeonggi' },
  ],
  // Mexico
  MX: [
    { value: 'CMX', label: 'Mexico City' },
    { value: 'JAL', label: 'Jalisco' },
    { value: 'NLE', label: 'Nuevo Leon' },
    { value: 'VER', label: 'Veracruz' },
    { value: 'PUE', label: 'Puebla' },
    { value: 'GUA', label: 'Guanajuato' },
    { value: 'CHH', label: 'Chihuahua' },
    { value: 'TAM', label: 'Tamaulipas' },
    { value: 'MIC', label: 'Michoacan' },
    { value: 'OAX', label: 'Oaxaca' },
    { value: 'BCN', label: 'Baja California' },
    { value: 'QRO', label: 'Queretaro' },
  ],
  // Italy
  IT: [
    { value: 'LOM', label: 'Lombardy' },
    { value: 'LAZ', label: 'Lazio' },
    { value: 'CAM', label: 'Campania' },
    { value: 'VEN', label: 'Veneto' },
    { value: 'EMR', label: 'Emilia-Romagna' },
    { value: 'PIE', label: 'Piedmont' },
    { value: 'SIC', label: 'Sicily' },
    { value: 'TOS', label: 'Tuscany' },
    { value: 'PUG', label: 'Apulia' },
    { value: 'LIG', label: 'Liguria' },
  ],
  // Spain
  ES: [
    { value: 'MD', label: 'Madrid' },
    { value: 'CT', label: 'Catalonia' },
    { value: 'AN', label: 'Andalusia' },
    { value: 'VC', label: 'Valencia' },
    { value: 'GA', label: 'Galicia' },
    { value: 'CL', label: 'Castile and Leon' },
    { value: 'PV', label: 'Basque Country' },
    { value: 'CN', label: 'Canary Islands' },
    { value: 'AR', label: 'Aragon' },
    { value: 'CM', label: 'Castilla-La Mancha' },
  ],
  // Netherlands
  NL: [
    { value: 'NH', label: 'North Holland' },
    { value: 'ZH', label: 'South Holland' },
    { value: 'NB', label: 'North Brabant' },
    { value: 'GE', label: 'Gelderland' },
    { value: 'UT', label: 'Utrecht' },
    { value: 'LI', label: 'Limburg' },
    { value: 'OV', label: 'Overijssel' },
    { value: 'FL', label: 'Flevoland' },
    { value: 'GR', label: 'Groningen' },
    { value: 'FR', label: 'Friesland' },
    { value: 'DR', label: 'Drenthe' },
    { value: 'ZE', label: 'Zeeland' },
  ],
  // Turkey
  TR: [
    { value: 'IST', label: 'Istanbul' },
    { value: 'ANK', label: 'Ankara' },
    { value: 'IZM', label: 'Izmir' },
    { value: 'BUR', label: 'Bursa' },
    { value: 'ANT', label: 'Antalya' },
    { value: 'ADA', label: 'Adana' },
    { value: 'KON', label: 'Konya' },
    { value: 'GAZ', label: 'Gaziantep' },
  ],
  // Russia
  RU: [
    { value: 'MOW', label: 'Moscow' },
    { value: 'SPE', label: 'Saint Petersburg' },
    { value: 'KDA', label: 'Krasnodar' },
    { value: 'SVE', label: 'Sverdlovsk' },
    { value: 'ROS', label: 'Rostov' },
    { value: 'TAT', label: 'Tatarstan' },
    { value: 'BA', label: 'Bashkortostan' },
    { value: 'CHE', label: 'Chelyabinsk' },
    { value: 'SAM', label: 'Samara' },
    { value: 'NVS', label: 'Novosibirsk' },
  ],
  // South Africa
  ZA: [
    { value: 'GP', label: 'Gauteng' },
    { value: 'KZN', label: 'KwaZulu-Natal' },
    { value: 'WC', label: 'Western Cape' },
    { value: 'EC', label: 'Eastern Cape' },
    { value: 'FS', label: 'Free State' },
    { value: 'MP', label: 'Mpumalanga' },
    { value: 'NW', label: 'North West' },
    { value: 'LP', label: 'Limpopo' },
    { value: 'NC', label: 'Northern Cape' },
  ],
  // Nigeria
  NG: [
    { value: 'LA', label: 'Lagos' },
    { value: 'KN', label: 'Kano' },
    { value: 'RI', label: 'Rivers' },
    { value: 'FC', label: 'Abuja FCT' },
    { value: 'OY', label: 'Oyo' },
    { value: 'KD', label: 'Kaduna' },
    { value: 'AN', label: 'Anambra' },
    { value: 'EN', label: 'Enugu' },
    { value: 'DE', label: 'Delta' },
  ],
  // Egypt
  EG: [
    { value: 'C', label: 'Cairo' },
    { value: 'ALX', label: 'Alexandria' },
    { value: 'GZ', label: 'Giza' },
    { value: 'SHR', label: 'Sharqia' },
    { value: 'DK', label: 'Dakahlia' },
    { value: 'ASN', label: 'Aswan' },
    { value: 'LX', label: 'Luxor' },
  ],
  // Nepal
  NP: [
    { value: 'P1', label: 'Province 1' },
    { value: 'P2', label: 'Madhesh' },
    { value: 'P3', label: 'Bagmati' },
    { value: 'P4', label: 'Gandaki' },
    { value: 'P5', label: 'Lumbini' },
    { value: 'P6', label: 'Karnali' },
    { value: 'P7', label: 'Sudurpashchim' },
  ],
  // Sri Lanka
  LK: [
    { value: 'WP', label: 'Western Province' },
    { value: 'CP', label: 'Central Province' },
    { value: 'SP', label: 'Southern Province' },
    { value: 'NP', label: 'Northern Province' },
    { value: 'EP', label: 'Eastern Province' },
    { value: 'NW', label: 'North Western Province' },
    { value: 'NC', label: 'North Central Province' },
    { value: 'UVA', label: 'Uva Province' },
    { value: 'SAB', label: 'Sabaragamuwa Province' },
  ],
};

// Helper function to get states for a country
export const getStatesForCountry = (countryCode: string): { value: string; label: string }[] => {
  return COUNTRY_STATES[countryCode] || [];
};

// Legacy export for backwards compatibility
export const US_STATES = COUNTRY_STATES.US;
