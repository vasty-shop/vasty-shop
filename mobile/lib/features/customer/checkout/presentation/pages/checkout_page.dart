import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../../../core/constants/api_constants.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../home/presentation/pages/customer_home_page.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../../shared/models/cart_item_model.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  int _currentStep = 0;
  bool _isProcessing = false;

  // Shipping Information
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _zipCodeController = TextEditingController();
  String _selectedCountry = 'US';
  String? _selectedState;
  bool _saveAddress = false;

  // Delivery & Payment
  String _deliveryMethod = 'standard';
  String _paymentMethod = 'cash_on_delivery';

  // Credit Card Form
  final _cardNumberController = TextEditingController();
  final _cardHolderController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();
  bool _saveCard = false;

  // Promo Code
  final _promoController = TextEditingController();
  String? _appliedPromoCode;
  double _discount = 0;
  bool _isApplyingPromo = false;

  // Terms
  bool _termsAccepted = false;

  // Delivery Methods from API
  List<Map<String, dynamic>> _deliveryMethods = [];
  bool _loadingDeliveryMethods = true;

  // Mobile order summary expanded state
  bool _isMobileOrderSummaryExpanded = false;

  // Countries list
  final List<Map<String, String>> _countries = [
    {'code': 'US', 'name': 'United States'},
    {'code': 'CA', 'name': 'Canada'},
    {'code': 'GB', 'name': 'United Kingdom'},
    {'code': 'AU', 'name': 'Australia'},
    {'code': 'DE', 'name': 'Germany'},
    {'code': 'FR', 'name': 'France'},
    {'code': 'JP', 'name': 'Japan'},
    {'code': 'IN', 'name': 'India'},
    {'code': 'BD', 'name': 'Bangladesh'},
    {'code': 'BR', 'name': 'Brazil'},
    {'code': 'MX', 'name': 'Mexico'},
    {'code': 'IT', 'name': 'Italy'},
    {'code': 'ES', 'name': 'Spain'},
    {'code': 'NL', 'name': 'Netherlands'},
    {'code': 'SE', 'name': 'Sweden'},
    {'code': 'NO', 'name': 'Norway'},
    {'code': 'DK', 'name': 'Denmark'},
    {'code': 'FI', 'name': 'Finland'},
    {'code': 'SG', 'name': 'Singapore'},
    {'code': 'AE', 'name': 'United Arab Emirates'},
  ];

  // States/Provinces by country
  final Map<String, List<Map<String, String>>> _statesByCountry = {
    'US': [
      {'code': 'AL', 'name': 'Alabama'}, {'code': 'AK', 'name': 'Alaska'}, {'code': 'AZ', 'name': 'Arizona'},
      {'code': 'AR', 'name': 'Arkansas'}, {'code': 'CA', 'name': 'California'}, {'code': 'CO', 'name': 'Colorado'},
      {'code': 'CT', 'name': 'Connecticut'}, {'code': 'DE', 'name': 'Delaware'}, {'code': 'FL', 'name': 'Florida'},
      {'code': 'GA', 'name': 'Georgia'}, {'code': 'HI', 'name': 'Hawaii'}, {'code': 'ID', 'name': 'Idaho'},
      {'code': 'IL', 'name': 'Illinois'}, {'code': 'IN', 'name': 'Indiana'}, {'code': 'IA', 'name': 'Iowa'},
      {'code': 'KS', 'name': 'Kansas'}, {'code': 'KY', 'name': 'Kentucky'}, {'code': 'LA', 'name': 'Louisiana'},
      {'code': 'ME', 'name': 'Maine'}, {'code': 'MD', 'name': 'Maryland'}, {'code': 'MA', 'name': 'Massachusetts'},
      {'code': 'MI', 'name': 'Michigan'}, {'code': 'MN', 'name': 'Minnesota'}, {'code': 'MS', 'name': 'Mississippi'},
      {'code': 'MO', 'name': 'Missouri'}, {'code': 'MT', 'name': 'Montana'}, {'code': 'NE', 'name': 'Nebraska'},
      {'code': 'NV', 'name': 'Nevada'}, {'code': 'NH', 'name': 'New Hampshire'}, {'code': 'NJ', 'name': 'New Jersey'},
      {'code': 'NM', 'name': 'New Mexico'}, {'code': 'NY', 'name': 'New York'}, {'code': 'NC', 'name': 'North Carolina'},
      {'code': 'ND', 'name': 'North Dakota'}, {'code': 'OH', 'name': 'Ohio'}, {'code': 'OK', 'name': 'Oklahoma'},
      {'code': 'OR', 'name': 'Oregon'}, {'code': 'PA', 'name': 'Pennsylvania'}, {'code': 'RI', 'name': 'Rhode Island'},
      {'code': 'SC', 'name': 'South Carolina'}, {'code': 'SD', 'name': 'South Dakota'}, {'code': 'TN', 'name': 'Tennessee'},
      {'code': 'TX', 'name': 'Texas'}, {'code': 'UT', 'name': 'Utah'}, {'code': 'VT', 'name': 'Vermont'},
      {'code': 'VA', 'name': 'Virginia'}, {'code': 'WA', 'name': 'Washington'}, {'code': 'WV', 'name': 'West Virginia'},
      {'code': 'WI', 'name': 'Wisconsin'}, {'code': 'WY', 'name': 'Wyoming'}, {'code': 'DC', 'name': 'Washington D.C.'},
    ],
    'CA': [
      {'code': 'AB', 'name': 'Alberta'}, {'code': 'BC', 'name': 'British Columbia'}, {'code': 'MB', 'name': 'Manitoba'},
      {'code': 'NB', 'name': 'New Brunswick'}, {'code': 'NL', 'name': 'Newfoundland and Labrador'},
      {'code': 'NS', 'name': 'Nova Scotia'}, {'code': 'NT', 'name': 'Northwest Territories'},
      {'code': 'NU', 'name': 'Nunavut'}, {'code': 'ON', 'name': 'Ontario'}, {'code': 'PE', 'name': 'Prince Edward Island'},
      {'code': 'QC', 'name': 'Quebec'}, {'code': 'SK', 'name': 'Saskatchewan'}, {'code': 'YT', 'name': 'Yukon'},
    ],
    'GB': [
      {'code': 'ENG', 'name': 'England'}, {'code': 'SCT', 'name': 'Scotland'}, {'code': 'WLS', 'name': 'Wales'},
      {'code': 'NIR', 'name': 'Northern Ireland'},
    ],
    'AU': [
      {'code': 'NSW', 'name': 'New South Wales'}, {'code': 'VIC', 'name': 'Victoria'}, {'code': 'QLD', 'name': 'Queensland'},
      {'code': 'WA', 'name': 'Western Australia'}, {'code': 'SA', 'name': 'South Australia'}, {'code': 'TAS', 'name': 'Tasmania'},
      {'code': 'ACT', 'name': 'Australian Capital Territory'}, {'code': 'NT', 'name': 'Northern Territory'},
    ],
    'DE': [
      {'code': 'BW', 'name': 'Baden-Württemberg'}, {'code': 'BY', 'name': 'Bavaria'}, {'code': 'BE', 'name': 'Berlin'},
      {'code': 'BB', 'name': 'Brandenburg'}, {'code': 'HB', 'name': 'Bremen'}, {'code': 'HH', 'name': 'Hamburg'},
      {'code': 'HE', 'name': 'Hesse'}, {'code': 'NI', 'name': 'Lower Saxony'}, {'code': 'MV', 'name': 'Mecklenburg-Vorpommern'},
      {'code': 'NW', 'name': 'North Rhine-Westphalia'}, {'code': 'RP', 'name': 'Rhineland-Palatinate'}, {'code': 'SL', 'name': 'Saarland'},
      {'code': 'SN', 'name': 'Saxony'}, {'code': 'ST', 'name': 'Saxony-Anhalt'}, {'code': 'SH', 'name': 'Schleswig-Holstein'}, {'code': 'TH', 'name': 'Thuringia'},
    ],
    'FR': [
      {'code': 'ARA', 'name': 'Auvergne-Rhône-Alpes'}, {'code': 'BFC', 'name': 'Bourgogne-Franche-Comté'},
      {'code': 'BRE', 'name': 'Brittany'}, {'code': 'CVL', 'name': 'Centre-Val de Loire'}, {'code': 'COR', 'name': 'Corsica'},
      {'code': 'GES', 'name': 'Grand Est'}, {'code': 'HDF', 'name': 'Hauts-de-France'}, {'code': 'IDF', 'name': 'Île-de-France'},
      {'code': 'NOR', 'name': 'Normandy'}, {'code': 'NAQ', 'name': 'Nouvelle-Aquitaine'}, {'code': 'OCC', 'name': 'Occitanie'},
      {'code': 'PDL', 'name': 'Pays de la Loire'}, {'code': 'PAC', 'name': "Provence-Alpes-Côte d'Azur"},
    ],
    'JP': [
      {'code': 'TK', 'name': 'Tokyo'}, {'code': 'OS', 'name': 'Osaka'}, {'code': 'KY', 'name': 'Kyoto'},
      {'code': 'HK', 'name': 'Hokkaido'}, {'code': 'AI', 'name': 'Aichi'}, {'code': 'FK', 'name': 'Fukuoka'},
      {'code': 'HG', 'name': 'Hyogo'}, {'code': 'KN', 'name': 'Kanagawa'}, {'code': 'ST', 'name': 'Saitama'},
      {'code': 'CB', 'name': 'Chiba'}, {'code': 'SZ', 'name': 'Shizuoka'}, {'code': 'HR', 'name': 'Hiroshima'},
    ],
    'IN': [
      {'code': 'AN', 'name': 'Andhra Pradesh'}, {'code': 'AR', 'name': 'Arunachal Pradesh'}, {'code': 'AS', 'name': 'Assam'},
      {'code': 'BR', 'name': 'Bihar'}, {'code': 'CG', 'name': 'Chhattisgarh'}, {'code': 'GA', 'name': 'Goa'},
      {'code': 'GJ', 'name': 'Gujarat'}, {'code': 'HR', 'name': 'Haryana'}, {'code': 'HP', 'name': 'Himachal Pradesh'},
      {'code': 'JK', 'name': 'Jammu and Kashmir'}, {'code': 'JH', 'name': 'Jharkhand'}, {'code': 'KA', 'name': 'Karnataka'},
      {'code': 'KL', 'name': 'Kerala'}, {'code': 'MP', 'name': 'Madhya Pradesh'}, {'code': 'MH', 'name': 'Maharashtra'},
      {'code': 'MN', 'name': 'Manipur'}, {'code': 'ML', 'name': 'Meghalaya'}, {'code': 'MZ', 'name': 'Mizoram'},
      {'code': 'NL', 'name': 'Nagaland'}, {'code': 'OD', 'name': 'Odisha'}, {'code': 'PB', 'name': 'Punjab'},
      {'code': 'RJ', 'name': 'Rajasthan'}, {'code': 'SK', 'name': 'Sikkim'}, {'code': 'TN', 'name': 'Tamil Nadu'},
      {'code': 'TS', 'name': 'Telangana'}, {'code': 'TR', 'name': 'Tripura'}, {'code': 'UP', 'name': 'Uttar Pradesh'},
      {'code': 'UK', 'name': 'Uttarakhand'}, {'code': 'WB', 'name': 'West Bengal'}, {'code': 'DL', 'name': 'Delhi'},
    ],
    'BD': [
      {'code': 'BAR', 'name': 'Barisal'}, {'code': 'CHI', 'name': 'Chittagong'}, {'code': 'DHA', 'name': 'Dhaka'},
      {'code': 'KHU', 'name': 'Khulna'}, {'code': 'MYM', 'name': 'Mymensingh'}, {'code': 'RAJ', 'name': 'Rajshahi'},
      {'code': 'RAN', 'name': 'Rangpur'}, {'code': 'SYL', 'name': 'Sylhet'},
    ],
    'BR': [
      {'code': 'AC', 'name': 'Acre'}, {'code': 'AL', 'name': 'Alagoas'}, {'code': 'AP', 'name': 'Amapá'},
      {'code': 'AM', 'name': 'Amazonas'}, {'code': 'BA', 'name': 'Bahia'}, {'code': 'CE', 'name': 'Ceará'},
      {'code': 'DF', 'name': 'Distrito Federal'}, {'code': 'ES', 'name': 'Espírito Santo'}, {'code': 'GO', 'name': 'Goiás'},
      {'code': 'MA', 'name': 'Maranhão'}, {'code': 'MT', 'name': 'Mato Grosso'}, {'code': 'MS', 'name': 'Mato Grosso do Sul'},
      {'code': 'MG', 'name': 'Minas Gerais'}, {'code': 'PA', 'name': 'Pará'}, {'code': 'PB', 'name': 'Paraíba'},
      {'code': 'PR', 'name': 'Paraná'}, {'code': 'PE', 'name': 'Pernambuco'}, {'code': 'PI', 'name': 'Piauí'},
      {'code': 'RJ', 'name': 'Rio de Janeiro'}, {'code': 'RN', 'name': 'Rio Grande do Norte'}, {'code': 'RS', 'name': 'Rio Grande do Sul'},
      {'code': 'RO', 'name': 'Rondônia'}, {'code': 'RR', 'name': 'Roraima'}, {'code': 'SC', 'name': 'Santa Catarina'},
      {'code': 'SP', 'name': 'São Paulo'}, {'code': 'SE', 'name': 'Sergipe'}, {'code': 'TO', 'name': 'Tocantins'},
    ],
    'MX': [
      {'code': 'AGU', 'name': 'Aguascalientes'}, {'code': 'BCN', 'name': 'Baja California'}, {'code': 'BCS', 'name': 'Baja California Sur'},
      {'code': 'CAM', 'name': 'Campeche'}, {'code': 'CHP', 'name': 'Chiapas'}, {'code': 'CHH', 'name': 'Chihuahua'},
      {'code': 'COA', 'name': 'Coahuila'}, {'code': 'COL', 'name': 'Colima'}, {'code': 'CMX', 'name': 'Mexico City'},
      {'code': 'DUR', 'name': 'Durango'}, {'code': 'GUA', 'name': 'Guanajuato'}, {'code': 'GRO', 'name': 'Guerrero'},
      {'code': 'HID', 'name': 'Hidalgo'}, {'code': 'JAL', 'name': 'Jalisco'}, {'code': 'MEX', 'name': 'Estado de México'},
      {'code': 'MIC', 'name': 'Michoacán'}, {'code': 'MOR', 'name': 'Morelos'}, {'code': 'NAY', 'name': 'Nayarit'},
      {'code': 'NLE', 'name': 'Nuevo León'}, {'code': 'OAX', 'name': 'Oaxaca'}, {'code': 'PUE', 'name': 'Puebla'},
      {'code': 'QUE', 'name': 'Querétaro'}, {'code': 'ROO', 'name': 'Quintana Roo'}, {'code': 'SLP', 'name': 'San Luis Potosí'},
      {'code': 'SIN', 'name': 'Sinaloa'}, {'code': 'SON', 'name': 'Sonora'}, {'code': 'TAB', 'name': 'Tabasco'},
      {'code': 'TAM', 'name': 'Tamaulipas'}, {'code': 'TLA', 'name': 'Tlaxcala'}, {'code': 'VER', 'name': 'Veracruz'},
      {'code': 'YUC', 'name': 'Yucatán'}, {'code': 'ZAC', 'name': 'Zacatecas'},
    ],
    'IT': [
      {'code': 'ABR', 'name': 'Abruzzo'}, {'code': 'BAS', 'name': 'Basilicata'}, {'code': 'CAL', 'name': 'Calabria'},
      {'code': 'CAM', 'name': 'Campania'}, {'code': 'EMR', 'name': 'Emilia-Romagna'}, {'code': 'FVG', 'name': 'Friuli-Venezia Giulia'},
      {'code': 'LAZ', 'name': 'Lazio'}, {'code': 'LIG', 'name': 'Liguria'}, {'code': 'LOM', 'name': 'Lombardy'},
      {'code': 'MAR', 'name': 'Marche'}, {'code': 'MOL', 'name': 'Molise'}, {'code': 'PMN', 'name': 'Piedmont'},
      {'code': 'PUG', 'name': 'Apulia'}, {'code': 'SAR', 'name': 'Sardinia'}, {'code': 'SIC', 'name': 'Sicily'},
      {'code': 'TOS', 'name': 'Tuscany'}, {'code': 'TAA', 'name': 'Trentino-Alto Adige'}, {'code': 'UMB', 'name': 'Umbria'},
      {'code': 'VDA', 'name': "Valle d'Aosta"}, {'code': 'VEN', 'name': 'Veneto'},
    ],
    'ES': [
      {'code': 'AN', 'name': 'Andalusia'}, {'code': 'AR', 'name': 'Aragon'}, {'code': 'AS', 'name': 'Asturias'},
      {'code': 'IB', 'name': 'Balearic Islands'}, {'code': 'PV', 'name': 'Basque Country'}, {'code': 'CN', 'name': 'Canary Islands'},
      {'code': 'CB', 'name': 'Cantabria'}, {'code': 'CM', 'name': 'Castile-La Mancha'}, {'code': 'CL', 'name': 'Castile and León'},
      {'code': 'CT', 'name': 'Catalonia'}, {'code': 'EX', 'name': 'Extremadura'}, {'code': 'GA', 'name': 'Galicia'},
      {'code': 'MD', 'name': 'Madrid'}, {'code': 'MC', 'name': 'Murcia'}, {'code': 'NC', 'name': 'Navarre'},
      {'code': 'RI', 'name': 'La Rioja'}, {'code': 'VC', 'name': 'Valencia'},
    ],
    'NL': [
      {'code': 'DR', 'name': 'Drenthe'}, {'code': 'FL', 'name': 'Flevoland'}, {'code': 'FR', 'name': 'Friesland'},
      {'code': 'GE', 'name': 'Gelderland'}, {'code': 'GR', 'name': 'Groningen'}, {'code': 'LI', 'name': 'Limburg'},
      {'code': 'NB', 'name': 'North Brabant'}, {'code': 'NH', 'name': 'North Holland'}, {'code': 'OV', 'name': 'Overijssel'},
      {'code': 'ZH', 'name': 'South Holland'}, {'code': 'UT', 'name': 'Utrecht'}, {'code': 'ZE', 'name': 'Zeeland'},
    ],
    'AE': [
      {'code': 'AZ', 'name': 'Abu Dhabi'}, {'code': 'AJ', 'name': 'Ajman'}, {'code': 'DU', 'name': 'Dubai'},
      {'code': 'FU', 'name': 'Fujairah'}, {'code': 'RK', 'name': 'Ras Al Khaimah'}, {'code': 'SH', 'name': 'Sharjah'},
      {'code': 'UQ', 'name': 'Umm Al Quwain'},
    ],
    'SG': [
      {'code': 'SG', 'name': 'Singapore'},
    ],
    'SE': [
      {'code': 'AB', 'name': 'Stockholm'}, {'code': 'C', 'name': 'Uppsala'}, {'code': 'D', 'name': 'Södermanland'},
      {'code': 'E', 'name': 'Östergötland'}, {'code': 'F', 'name': 'Jönköping'}, {'code': 'G', 'name': 'Kronoberg'},
      {'code': 'H', 'name': 'Kalmar'}, {'code': 'I', 'name': 'Gotland'}, {'code': 'K', 'name': 'Blekinge'},
      {'code': 'M', 'name': 'Skåne'}, {'code': 'N', 'name': 'Halland'}, {'code': 'O', 'name': 'Västra Götaland'},
      {'code': 'S', 'name': 'Värmland'}, {'code': 'T', 'name': 'Örebro'}, {'code': 'U', 'name': 'Västmanland'},
      {'code': 'W', 'name': 'Dalarna'}, {'code': 'X', 'name': 'Gävleborg'}, {'code': 'Y', 'name': 'Västernorrland'},
      {'code': 'Z', 'name': 'Jämtland'}, {'code': 'AC', 'name': 'Västerbotten'}, {'code': 'BD', 'name': 'Norrbotten'},
    ],
    'NO': [
      {'code': 'OS', 'name': 'Oslo'}, {'code': 'VK', 'name': 'Viken'}, {'code': 'IN', 'name': 'Innlandet'},
      {'code': 'VT', 'name': 'Vestfold og Telemark'}, {'code': 'AG', 'name': 'Agder'}, {'code': 'RO', 'name': 'Rogaland'},
      {'code': 'VL', 'name': 'Vestland'}, {'code': 'MR', 'name': 'Møre og Romsdal'}, {'code': 'TR', 'name': 'Trøndelag'},
      {'code': 'NO', 'name': 'Nordland'}, {'code': 'TF', 'name': 'Troms og Finnmark'},
    ],
    'DK': [
      {'code': 'CPH', 'name': 'Capital Region'}, {'code': 'ZEA', 'name': 'Region Zealand'},
      {'code': 'SDN', 'name': 'Region of Southern Denmark'}, {'code': 'MJL', 'name': 'Central Denmark Region'},
      {'code': 'NJL', 'name': 'North Denmark Region'},
    ],
    'FI': [
      {'code': 'UUS', 'name': 'Uusimaa'}, {'code': 'VSS', 'name': 'Southwest Finland'}, {'code': 'SAT', 'name': 'Satakunta'},
      {'code': 'HAM', 'name': 'Kanta-Häme'}, {'code': 'PIR', 'name': 'Pirkanmaa'}, {'code': 'PAH', 'name': 'Päijät-Häme'},
      {'code': 'KYM', 'name': 'Kymenlaakso'}, {'code': 'EKA', 'name': 'South Karelia'}, {'code': 'ESA', 'name': 'South Savo'},
      {'code': 'PSA', 'name': 'North Savo'}, {'code': 'PKA', 'name': 'North Karelia'}, {'code': 'KES', 'name': 'Central Finland'},
      {'code': 'EPO', 'name': 'South Ostrobothnia'}, {'code': 'POH', 'name': 'Ostrobothnia'}, {'code': 'KPO', 'name': 'Central Ostrobothnia'},
      {'code': 'PPO', 'name': 'North Ostrobothnia'}, {'code': 'KAI', 'name': 'Kainuu'}, {'code': 'LAP', 'name': 'Lapland'},
    ],
  };

  @override
  void initState() {
    super.initState();
    _loadDeliveryMethods();
  }

  Future<void> _loadDeliveryMethods() async {
    try {
      final dioClient = DioClient.instance;
      final response = await dioClient.get(ApiConstants.deliveryMethods);

      if (response.data != null) {
        List<dynamic> methods = [];
        if (response.data is Map && response.data['data'] != null) {
          methods = response.data['data'] as List;
        } else if (response.data is List) {
          methods = response.data as List;
        }

        setState(() {
          _deliveryMethods = methods
              .where((m) => m['isActive'] != false)
              .map<Map<String, dynamic>>((m) => {
                    'id': m['id'] ?? m['type'] ?? 'standard',
                    'name': m['name'] ?? 'Standard Shipping',
                    'description': m['description'] ?? '',
                    'price': (m['baseCost'] ?? m['rate'] ?? 0).toDouble(),
                    'estimatedDays': m['estimatedDays'] ?? 5,
                  })
              .toList();
          _loadingDeliveryMethods = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading delivery methods: $e');
      setState(() {
        _deliveryMethods = [
          {'id': 'standard', 'name': 'Standard Shipping', 'description': 'Free standard delivery', 'price': 0.0, 'estimatedDays': 7},
          {'id': 'express', 'name': 'Express Shipping', 'description': 'Faster delivery', 'price': 15.0, 'estimatedDays': 3},
          {'id': 'overnight', 'name': 'Overnight Shipping', 'description': 'Next day delivery', 'price': 35.0, 'estimatedDays': 1},
        ];
        _loadingDeliveryMethods = false;
      });
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _zipCodeController.dispose();
    _promoController.dispose();
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text('checkout.checkout'.tr()),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Row(
            children: [
              Icon(Icons.lock, size: 16, color: Colors.green.shade600),
              const SizedBox(width: 4),
              Text(
                'checkout.secure'.tr(),
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.green.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 16),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Step Indicator
          _buildStepIndicator(theme),

          // Main Content
          Expanded(
            child: MediaQuery.of(context).size.width > 800
                // Desktop Layout - Side by side
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Left - Form Steps
                      Expanded(
                        flex: 3,
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Step Title
                              Text(
                                _getStepTitle(),
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Step Content
                              _buildStepContent(theme),
                            ],
                          ),
                        ),
                      ),

                      // Right - Order Summary (Desktop)
                      SizedBox(
                        width: 350,
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(16),
                          child: _buildOrderSummary(theme, cartState),
                        ),
                      ),
                    ],
                  )
                // Mobile Layout - Single column with collapsible summary
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Collapsible Order Summary for Mobile
                        _buildMobileOrderSummary(theme, cartState),
                        const SizedBox(height: 16),

                        // Step Title
                        Text(
                          _getStepTitle(),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Step Content
                        _buildStepContent(theme),

                        // Add padding at bottom for navigation bar
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
          ),

          // Bottom Navigation
          _buildBottomNavigation(theme, cartState),
        ],
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case 0:
        return 'checkout.shippingAddress'.tr();
      case 1:
        return 'checkout.shippingMethod'.tr();
      case 2:
        return 'checkout.paymentDetails'.tr();
      case 3:
        return 'checkout.orderReview'.tr();
      default:
        return 'checkout.checkout'.tr();
    }
  }

  Widget _buildStepIndicator(ThemeData theme) {
    final steps = [
      {'label': 'checkout.shipping'.tr(), 'icon': Icons.local_shipping_outlined},
      {'label': 'checkout.delivery'.tr(), 'icon': Icons.delivery_dining_outlined},
      {'label': 'checkout.payment'.tr(), 'icon': Icons.payment_outlined},
      {'label': 'checkout.review'.tr(), 'icon': Icons.receipt_long_outlined},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      color: Colors.white,
      child: Row(
        children: List.generate(steps.length * 2 - 1, (index) {
          if (index.isOdd) {
            final stepIndex = index ~/ 2;
            return Expanded(
              child: Container(
                height: 3,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: _currentStep > stepIndex
                      ? theme.colorScheme.primary
                      : Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            );
          }
          final stepIndex = index ~/ 2;
          return _buildStepDot(
            stepIndex,
            steps[stepIndex]['label'] as String,
            steps[stepIndex]['icon'] as IconData,
            theme,
          );
        }),
      ),
    );
  }

  Widget _buildStepDot(int step, String label, IconData icon, ThemeData theme) {
    final isActive = step == _currentStep;
    final isCompleted = step < _currentStep;

    return GestureDetector(
      onTap: step < _currentStep ? () => setState(() => _currentStep = step) : null,
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isCompleted
                  ? theme.colorScheme.primary
                  : isActive
                      ? theme.colorScheme.primary.withValues(alpha: 0.1)
                      : Colors.grey.shade200,
              shape: BoxShape.circle,
              border: isActive
                  ? Border.all(color: theme.colorScheme.primary, width: 2)
                  : null,
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: theme.colorScheme.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                        spreadRadius: 0,
                      ),
                    ]
                  : null,
            ),
            child: Center(
              child: isCompleted
                  ? const Icon(Icons.check, color: Colors.white, size: 22)
                  : Icon(
                      icon,
                      color: isActive
                          ? theme.colorScheme.primary
                          : Colors.grey.shade500,
                      size: 22,
                    ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              color: isActive
                  ? theme.colorScheme.primary
                  : isCompleted
                      ? Colors.black87
                      : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(ThemeData theme) {
    switch (_currentStep) {
      case 0:
        return _buildShippingForm(theme);
      case 1:
        return _buildDeliveryOptions(theme);
      case 2:
        return _buildPaymentOptions(theme);
      case 3:
        return _buildOrderReview(theme);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildShippingForm(ThemeData theme) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Contact Information Section
              Text(
                'checkout.contactInfo'.tr(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              // Full Name
              _buildTextField(
                controller: _fullNameController,
                label: 'checkout.fullName'.tr(),
                icon: Icons.person_outline,
                required: true,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'validation.required'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Email and Phone Row
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _emailController,
                      label: 'checkout.email'.tr(),
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      required: true,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'validation.required'.tr();
                        }
                        if (!value.contains('@')) {
                          return 'validation.invalidEmail'.tr();
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _phoneController,
                      label: 'checkout.phone'.tr(),
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      required: true,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'validation.required'.tr();
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              // Shipping Address Section
              Text(
                'checkout.shippingAddress'.tr(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              // Country Dropdown
              _buildCountryDropdown(theme),
              const SizedBox(height: 16),

              // Address Line 1
              _buildTextField(
                controller: _addressLine1Controller,
                label: 'checkout.addressLine1'.tr(),
                icon: Icons.location_on_outlined,
                required: true,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'validation.required'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Address Line 2
              _buildTextField(
                controller: _addressLine2Controller,
                label: 'checkout.addressLine2'.tr(),
                icon: Icons.apartment_outlined,
                hint: 'common.optional'.tr(),
              ),
              const SizedBox(height: 16),

              // City, State, ZIP Row
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _cityController,
                      label: 'checkout.city'.tr(),
                      required: true,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'validation.required'.tr();
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStateDropdown(theme),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _zipCodeController,
                      label: 'checkout.postalCode'.tr(),
                      keyboardType: TextInputType.number,
                      required: true,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'validation.required'.tr();
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Save Address Checkbox
              Row(
                children: [
                  Checkbox(
                    value: _saveAddress,
                    onChanged: (value) => setState(() => _saveAddress = value ?? false),
                    activeColor: theme.colorScheme.primary,
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'checkout.saveAddress'.tr(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          'checkout.saveAddressDesc'.tr(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    IconData? icon,
    String? hint,
    TextInputType? keyboardType,
    bool required = false,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: required ? '$label *' : label,
        hintText: hint,
        prefixIcon: icon != null ? Icon(icon, size: 20) : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildCountryDropdown(ThemeData theme) {
    return DropdownButtonFormField<String>(
      initialValue: _selectedCountry,
      decoration: InputDecoration(
        labelText: '${'checkout.country'.tr()} *',
        prefixIcon: const Icon(Icons.public, size: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      items: _countries.map((country) {
        return DropdownMenuItem(
          value: country['code'],
          child: Text(country['name']!),
        );
      }).toList(),
      onChanged: (value) {
        setState(() {
          _selectedCountry = value ?? 'US';
          // Reset state when country changes
          _selectedState = null;
        });
      },
    );
  }

  Widget _buildStateDropdown(ThemeData theme) {
    final states = _statesByCountry[_selectedCountry] ?? [];

    // If no states defined for country, show text field instead
    if (states.isEmpty) {
      return TextFormField(
        decoration: InputDecoration(
          labelText: '${'checkout.state'.tr()} *',
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          filled: true,
          fillColor: Colors.grey.shade50,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'validation.required'.tr();
          }
          return null;
        },
        onChanged: (value) {
          setState(() => _selectedState = value);
        },
      );
    }

    return DropdownButtonFormField<String>(
      key: ValueKey('state_$_selectedCountry'), // Force rebuild when country changes
      initialValue: _selectedState,
      decoration: InputDecoration(
        labelText: '${'checkout.state'.tr()} *',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      isExpanded: true,
      hint: Text('checkout.selectState'.tr()),
      items: states.map((state) {
        return DropdownMenuItem(
          value: state['code'],
          child: Text(
            state['name']!,
            overflow: TextOverflow.ellipsis,
          ),
        );
      }).toList(),
      onChanged: (value) {
        setState(() => _selectedState = value);
      },
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'validation.required'.tr();
        }
        return null;
      },
    );
  }

  Widget _buildDeliveryOptions(ThemeData theme) {
    if (_loadingDeliveryMethods) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade200),
        ),
        child: const Padding(
          padding: EdgeInsets.all(40),
          child: Center(
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'checkout.chooseDeliveryMethod'.tr(),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'checkout.selectShippingSpeed'.tr(),
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 20),

            ..._deliveryMethods.map((method) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildDeliveryOption(
                  method['id'] as String,
                  method['name'] as String,
                  method['description'] as String,
                  method['price'] as double,
                  method['estimatedDays'] as int,
                  theme,
                ),
              );
            }),

            const SizedBox(height: 16),

            // Delivery Info Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: Colors.blue.shade500,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        'i',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'checkout.deliveryInformation'.tr(),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue.shade900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '• ${'checkout.deliveryInfo1'.tr()}\n• ${'checkout.deliveryInfo2'.tr()}\n• ${'checkout.deliveryInfo3'.tr()}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.blue.shade800,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryOption(
    String id,
    String name,
    String description,
    double price,
    int estimatedDays,
    ThemeData theme,
  ) {
    final isSelected = _deliveryMethod == id;
    final isFree = price == 0;
    final deliveryDate = _getDeliveryDate(estimatedDays);

    IconData icon;
    if (estimatedDays <= 1) {
      icon = Icons.flash_on;
    } else if (estimatedDays <= 3) {
      icon = Icons.schedule;
    } else {
      icon = Icons.local_shipping;
    }

    return InkWell(
      onTap: () => setState(() => _deliveryMethod = id),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected ? theme.colorScheme.primary.withValues(alpha: 0.05) : Colors.white,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    blurRadius: 8,
                    spreadRadius: 0,
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            // Radio Button
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? theme.colorScheme.primary : Colors.grey.shade400,
                  width: 2,
                ),
                color: isSelected ? theme.colorScheme.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(Icons.circle, size: 10, color: Colors.white),
                    )
                  : null,
            ),
            const SizedBox(width: 12),

            // Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected ? theme.colorScheme.primary : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : Colors.grey.shade600,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isFree ? 'checkout.freeShipping'.tr() : '\$${price.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isFree ? Colors.green : Colors.black,
                        ),
                      ),
                    ],
                  ),
                  if (description.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        description,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                  const SizedBox(height: 6),
                  // Estimated days
                  Text(
                    estimatedDays == 1
                        ? 'checkout.nextBusinessDay'.tr()
                        : '$estimatedDays ${'checkout.businessDays'.tr()}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Arrives by date
                  Text(
                    '${'checkout.arrivesBy'.tr()} $deliveryDate',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getDeliveryDate(int businessDays) {
    DateTime date = DateTime.now();
    int addedDays = 0;

    while (addedDays < businessDays) {
      date = date.add(const Duration(days: 1));
      if (date.weekday != DateTime.saturday && date.weekday != DateTime.sunday) {
        addedDays++;
      }
    }

    return DateFormat('EEE, MMM d').format(date);
  }

  Widget _buildPaymentOptions(ThemeData theme) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'checkout.paymentMethodTitle'.tr(),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'checkout.allTransactionsSecure'.tr(),
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 20),

            // Payment Method Selection - Only Cash on Delivery for now
            _buildPaymentMethodSelector(
              'cash_on_delivery',
              'checkout.cashOnDelivery'.tr(),
              Icons.money,
              theme,
              iconColor: Colors.green,
            ),

            const SizedBox(height: 24),

            // Payment Method Content
            _buildPaymentMethodContent(theme),

            const SizedBox(height: 20),

            // Security Badge
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.lock, color: Colors.grey.shade600, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'checkout.pciCompliant'.tr(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'checkout.pciCompliantDesc'.tr(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector(
    String value,
    String title,
    IconData icon,
    ThemeData theme, {
    String? subtitle,
    Color? iconColor,
  }) {
    final isSelected = _paymentMethod == value;

    return InkWell(
      onTap: () => setState(() => _paymentMethod = value),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected ? theme.colorScheme.primary.withValues(alpha: 0.05) : Colors.white,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isSelected
                    ? theme.colorScheme.primary
                    : (iconColor?.withValues(alpha: 0.1) ?? Colors.grey.shade100),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : (iconColor ?? Colors.grey.shade600),
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (subtitle != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? theme.colorScheme.primary : Colors.grey.shade400,
                  width: 2,
                ),
                color: isSelected ? theme.colorScheme.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(Icons.check, size: 14, color: Colors.white),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodContent(ThemeData theme) {
    switch (_paymentMethod) {
      case 'credit_card':
        return _buildCreditCardForm(theme);
      case 'paypal':
        return _buildPayPalContent(theme);
      case 'cash_on_delivery':
        return _buildCODContent(theme);
      case 'bank_transfer':
        return _buildBankTransferContent(theme);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildCreditCardForm(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Security Badge
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.lock, color: Colors.green.shade600, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'checkout.paymentSecure'.tr(),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.green.shade800,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Accepted Cards
          Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 6,
            children: [
              Text(
                'checkout.weAccept'.tr(),
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
              for (var card in ['VISA', 'MC', 'AMEX'])
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(4),
                    color: Colors.white,
                  ),
                  child: Text(
                    card,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Card Number
          TextFormField(
            controller: _cardNumberController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'checkout.cardNumber'.tr(),
              hintText: '1234 5678 9012 3456',
              prefixIcon: const Icon(Icons.credit_card, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
            onChanged: (value) {
              // Format card number with spaces
              final digits = value.replaceAll(' ', '');
              if (digits.length <= 16) {
                final formatted = digits.replaceAllMapped(
                  RegExp(r'.{4}'),
                  (match) => '${match.group(0)} ',
                ).trim();
                if (formatted != value) {
                  _cardNumberController.value = TextEditingValue(
                    text: formatted,
                    selection: TextSelection.collapsed(offset: formatted.length),
                  );
                }
              }
            },
          ),
          const SizedBox(height: 14),

          // Cardholder Name
          TextFormField(
            controller: _cardHolderController,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              labelText: 'checkout.cardholderName'.tr(),
              hintText: 'NAME ON CARD',
              prefixIcon: const Icon(Icons.person_outline, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
          ),
          const SizedBox(height: 14),

          // Expiry & CVV Row
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _expiryController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'checkout.expirationDate'.tr(),
                    hintText: 'MM/YY',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                  onChanged: (value) {
                    // Format expiry date
                    final digits = value.replaceAll('/', '');
                    if (digits.length >= 2 && !value.contains('/')) {
                      _expiryController.value = TextEditingValue(
                        text: '${digits.substring(0, 2)}/${digits.substring(2)}',
                        selection: TextSelection.collapsed(offset: digits.length + 1),
                      );
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _cvvController,
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  maxLength: 4,
                  decoration: InputDecoration(
                    labelText: 'CVV',
                    hintText: '123',
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    suffixIcon: Tooltip(
                      message: 'checkout.cvvTooltip'.tr(),
                      child: Icon(Icons.help_outline, size: 18, color: Colors.grey.shade500),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Save Card Checkbox
          Row(
            children: [
              Checkbox(
                value: _saveCard,
                onChanged: (value) => setState(() => _saveCard = value ?? false),
                visualDensity: VisualDensity.compact,
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _saveCard = !_saveCard),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'checkout.saveCardFuture'.tr(),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        'checkout.cardSecurelyEncrypted'.tr(),
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPayPalContent(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200, style: BorderStyle.solid),
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.blue.shade100,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                'P',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade700,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'checkout.payWithPaypal'.tr(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'checkout.paypalRedirect'.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue.shade400),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Pay',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade800,
                  ),
                ),
                Text(
                  'Pal',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCODContent(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade200),
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.payments_outlined,
              size: 32,
              color: Colors.green.shade700,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'checkout.codTitle'.tr(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'checkout.codDesc'.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Column(
              children: [
                _buildCODBenefit('checkout.codBenefit1'.tr()),
                const SizedBox(height: 10),
                _buildCODBenefit('checkout.codBenefit2'.tr()),
                const SizedBox(height: 10),
                _buildCODBenefit('checkout.codBenefit3'.tr()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCODBenefit(String text) {
    return Row(
      children: [
        Icon(Icons.check_circle, color: Colors.green.shade600, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBankTransferContent(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.blue.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.account_balance_outlined,
              size: 32,
              color: Colors.blue.shade700,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'checkout.bankTransferTitle'.tr(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'checkout.bankTransferDesc'.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'checkout.bankTransferInfo'.tr(),
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 12),
                _buildBankTransferBenefit('checkout.bankTransferBenefit1'.tr()),
                const SizedBox(height: 8),
                _buildBankTransferBenefit('checkout.bankTransferBenefit2'.tr()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBankTransferBenefit(String text) {
    return Row(
      children: [
        Icon(Icons.check_circle, color: Colors.blue.shade600, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrderReview(ThemeData theme) {
    final cartState = ref.watch(cartProvider);

    return Column(
      children: [
        // Review Details Card
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Shipping Address
                _buildReviewSection(
                  'checkout.shippingAddress'.tr(),
                  [
                    _fullNameController.text,
                    _addressLine1Controller.text,
                    if (_addressLine2Controller.text.isNotEmpty) _addressLine2Controller.text,
                    '${_cityController.text}, ${_getStateName()} ${_zipCodeController.text}',
                    _countries.firstWhere((c) => c['code'] == _selectedCountry)['name'] ?? '',
                    _phoneController.text,
                    _emailController.text,
                  ],
                  Icons.location_on_outlined,
                  () => setState(() => _currentStep = 0),
                  theme,
                ),

                const Divider(height: 32),

                // Delivery Method
                _buildReviewSection(
                  'checkout.shippingMethod'.tr(),
                  [_getDeliveryMethodDisplay()],
                  Icons.local_shipping_outlined,
                  () => setState(() => _currentStep = 1),
                  theme,
                ),

                const Divider(height: 32),

                // Payment Method
                _buildReviewSection(
                  'checkout.paymentMethod'.tr(),
                  [_getPaymentMethodName(_paymentMethod)],
                  Icons.payment_outlined,
                  () => setState(() => _currentStep = 2),
                  theme,
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Order Items Card
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'checkout.orderItems'.tr(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                ...cartState.items.map((item) => _buildOrderItem(item, theme)),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Terms and Conditions Card
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: _termsAccepted ? Colors.green.shade300 : Colors.grey.shade200,
            ),
          ),
          color: _termsAccepted ? Colors.green.shade50 : Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Checkbox(
                  value: _termsAccepted,
                  onChanged: (value) => setState(() => _termsAccepted = value ?? false),
                  activeColor: Colors.green,
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _termsAccepted = !_termsAccepted),
                    child: Text(
                      'checkout.acceptTerms'.tr(),
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewSection(
    String title,
    List<String> lines,
    IconData icon,
    VoidCallback onEdit,
    ThemeData theme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            TextButton.icon(
              onPressed: onEdit,
              icon: const Icon(Icons.edit, size: 16),
              label: Text('common.edit'.tr()),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...lines.where((l) => l.isNotEmpty).map((line) => Padding(
              padding: const EdgeInsets.only(left: 28, bottom: 4),
              child: Text(
                line,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildOrderItem(CartItemModel item, ThemeData theme) {
    final price = item.product.salePrice ?? item.product.price;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: item.product.images.isNotEmpty ? item.product.images.first : '',
              width: 60,
              height: 60,
              fit: BoxFit.cover,
              placeholder: (_, _) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.image, color: Colors.grey),
              ),
              errorWidget: (_, _, _) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.image, color: Colors.grey),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${'common.qty'.tr()}: ${item.quantity}',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '\$${(price * item.quantity).toStringAsFixed(2)}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileOrderSummary(ThemeData theme, CartState cartState) {
    final shippingCost = _getDeliveryCost();
    final tax = cartState.subtotal * 0.08;
    final total = cartState.subtotal - _discount + shippingCost + tax;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.colorScheme.primary.withValues(alpha: 0.3)),
      ),
      color: theme.colorScheme.primary.withValues(alpha: 0.05),
      child: Column(
        children: [
          // Header - Always visible
          InkWell(
            onTap: () {
              setState(() {
                _isMobileOrderSummaryExpanded = !_isMobileOrderSummaryExpanded;
              });
            },
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.shopping_bag_outlined,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'checkout.orderSummary'.tr(),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${cartState.items.length} ${'common.items'.tr()}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '\$${total.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  AnimatedRotation(
                    turns: _isMobileOrderSummaryExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      Icons.keyboard_arrow_down,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Expanded Content
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  const Divider(),
                  const SizedBox(height: 8),

                  // Cart Items
                  ...cartState.items.map((item) {
                    final price = item.product.salePrice ?? item.product.price;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CachedNetworkImage(
                              imageUrl: item.product.images.isNotEmpty ? item.product.images.first : '',
                              width: 45,
                              height: 45,
                              fit: BoxFit.cover,
                              placeholder: (_, _) => Container(color: Colors.grey.shade200),
                              errorWidget: (_, _, _) => Container(color: Colors.grey.shade200),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.product.name,
                                  style: const TextStyle(fontSize: 13),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'x${item.quantity}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '\$${(price * item.quantity).toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  const Divider(height: 16),

                  // Price breakdown
                  _buildPriceRow('checkout.subtotal'.tr(), '\$${cartState.subtotal.toStringAsFixed(2)}'),
                  if (_discount > 0)
                    _buildPriceRow(
                      'common.discount'.tr(),
                      '-\$${_discount.toStringAsFixed(2)}',
                      isDiscount: true,
                    ),
                  _buildPriceRow(
                    'checkout.shipping'.tr(),
                    shippingCost == 0 ? 'checkout.free'.tr() : '\$${shippingCost.toStringAsFixed(2)}',
                    isDiscount: shippingCost == 0,
                  ),
                  _buildPriceRow('checkout.tax'.tr(), '\$${tax.toStringAsFixed(2)}'),

                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'checkout.total'.tr(),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          '\$${total.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            crossFadeState: _isMobileOrderSummaryExpanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 300),
          ),
        ],
      ),
    );
  }


  Widget _buildOrderSummary(ThemeData theme, CartState cartState) {
    final shippingCost = _getDeliveryCost();
    final tax = cartState.subtotal * 0.08;
    final total = cartState.subtotal - _discount + shippingCost + tax;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'checkout.orderSummary'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Cart Items
            ...cartState.items.map((item) {
              final price = item.product.salePrice ?? item.product.price;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: item.product.images.isNotEmpty ? item.product.images.first : '',
                        width: 50,
                        height: 50,
                        fit: BoxFit.cover,
                        placeholder: (_, _) => Container(color: Colors.grey.shade200),
                        errorWidget: (_, _, _) => Container(color: Colors.grey.shade200),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.product.name,
                            style: const TextStyle(fontSize: 13),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'x${item.quantity}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${(price * item.quantity).toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              );
            }),

            const Divider(height: 24),

            // Promo Code Input
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _promoController,
                    decoration: InputDecoration(
                      hintText: 'checkout.enterPromoCode'.tr(),
                      prefixIcon: const Icon(Icons.local_offer_outlined, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      isDense: true,
                    ),
                    textCapitalization: TextCapitalization.characters,
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isApplyingPromo ? null : _applyPromoCode,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: _isApplyingPromo
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text('common.apply'.tr()),
                ),
              ],
            ),

            if (_appliedPromoCode != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.local_offer, size: 16, color: Colors.green.shade700),
                    const SizedBox(width: 8),
                    Text(
                      _appliedPromoCode!,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.green.shade800,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: _removePromoCode,
                      child: Text(
                        'common.remove'.tr(),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.green.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const Divider(height: 24),

            // Price Breakdown
            _buildPriceRow('checkout.subtotal'.tr(), '\$${cartState.subtotal.toStringAsFixed(2)}'),
            if (_discount > 0)
              _buildPriceRow('common.discount'.tr(), '-\$${_discount.toStringAsFixed(2)}', isDiscount: true),
            _buildPriceRow('common.shipping'.tr(), shippingCost == 0 ? 'checkout.free'.tr() : '\$${shippingCost.toStringAsFixed(2)}'),
            _buildPriceRow('common.tax'.tr(), '\$${tax.toStringAsFixed(2)}'),

            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'common.total'.tr(),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '\$${total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Trust Badges
            _buildTrustBadge(Icons.lock_outline, 'checkout.secureSSL'.tr()),
            _buildTrustBadge(Icons.local_shipping_outlined, 'checkout.freeShippingOver'.tr()),
            _buildTrustBadge(Icons.verified_user_outlined, 'checkout.satisfactionGuarantee'.tr()),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRow(String label, String value, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: isDiscount ? Colors.green : Colors.grey.shade600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: isDiscount ? Colors.green : Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustBadge(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.green.shade600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigation(ThemeData theme, CartState cartState) {
    final shippingCost = _getDeliveryCost();
    final tax = cartState.subtotal * 0.08;
    final total = cartState.subtotal - _discount + shippingCost + tax;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Total Price
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'common.total'.tr(),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  '\$${total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Buttons
            Row(
              children: [
                if (_currentStep > 0) ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() => _currentStep--),
                      icon: const Icon(Icons.arrow_back, size: 18),
                      label: Text('common.back'.tr()),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: _isProcessing ? null : _handleNextOrSubmit,
                    icon: _currentStep == 3
                        ? (_isProcessing
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Icon(Icons.check, size: 18))
                        : const Icon(Icons.arrow_forward, size: 18),
                    label: Text(
                      _currentStep == 3
                          ? (_isProcessing ? 'checkout.processing'.tr() : 'checkout.placeOrder'.tr())
                          : _getButtonText(),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getButtonText() {
    switch (_currentStep) {
      case 0:
        return 'checkout.continueToDelivery'.tr();
      case 1:
        return 'checkout.continueToPayment'.tr();
      case 2:
        return 'checkout.reviewOrder'.tr();
      default:
        return 'common.continue'.tr();
    }
  }

  void _handleNextOrSubmit() {
    if (_currentStep < 3) {
      // Validate current step
      if (_currentStep == 0) {
        if (_formKey.currentState?.validate() != true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('validation.fillAllRequired'.tr()),
              backgroundColor: Colors.red,
            ),
          );
          return;
        }
      }
      setState(() => _currentStep++);
    } else {
      _placeOrder();
    }
  }

  Future<void> _applyPromoCode() async {
    if (_promoController.text.trim().isEmpty) return;

    setState(() => _isApplyingPromo = true);

    try {
      final dioClient = DioClient.instance;
      final cartState = ref.read(cartProvider);

      final response = await dioClient.post(
        ApiConstants.validateCoupon,
        data: {
          'code': _promoController.text.trim().toUpperCase(),
          'cartTotal': cartState.subtotal,
        },
      );

      if (response.data != null) {
        setState(() {
          _appliedPromoCode = _promoController.text.trim().toUpperCase();
          _discount = (response.data['discount'] ?? 0).toDouble();
          _promoController.clear();
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('cart.promoApplied'.tr()),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('cart.invalidPromoCode'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isApplyingPromo = false);
    }
  }

  void _removePromoCode() {
    setState(() {
      _appliedPromoCode = null;
      _discount = 0;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('cart.promoRemoved'.tr()),
      ),
    );
  }

  Future<void> _placeOrder() async {
    if (!_termsAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('checkout.acceptTermsError'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final dioClient = DioClient.instance;

      // Get cart ID from backend
      final cartResponse = await dioClient.get(ApiConstants.cart);
      final cartId = cartResponse.data['id'];

      if (cartId == null) {
        throw Exception('Cart not found');
      }

      // Map payment method
      final paymentMethodMap = {
        'credit_card': 'credit_card',
        'paypal': 'paypal',
        'cash_on_delivery': 'cash_on_delivery',
        'bank_transfer': 'bank_transfer',
      };

      // Create order
      final orderData = {
        'cartId': cartId,
        'shippingAddress': {
          'fullName': _fullNameController.text.trim(),
          'phone': _phoneController.text.trim(),
          'addressLine1': _addressLine1Controller.text.trim(),
          'addressLine2': _addressLine2Controller.text.trim(),
          'city': _cityController.text.trim(),
          'state': _getStateName(),
          'postalCode': _zipCodeController.text.trim(),
          'country': _countries.firstWhere((c) => c['code'] == _selectedCountry)['name'] ?? _selectedCountry,
        },
        'paymentMethod': paymentMethodMap[_paymentMethod] ?? 'credit_card',
      };

      await dioClient.post(ApiConstants.orders, data: orderData);

      // Clear cart
      await ref.read(cartProvider.notifier).clearCart();

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('checkout.orderPlaced'.tr()),
            backgroundColor: Colors.green,
          ),
        );

        // Navigate to home
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const CustomerHomePage()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('checkout.orderFailed'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  String _getStateName() {
    if (_selectedState == null || _selectedState!.isEmpty) {
      return '';
    }
    final states = _statesByCountry[_selectedCountry] ?? [];
    final state = states.firstWhere(
      (s) => s['code'] == _selectedState,
      orElse: () => {'name': _selectedState!},
    );
    return state['name'] ?? _selectedState!;
  }

  String _getDeliveryMethodDisplay() {
    final method = _deliveryMethods.firstWhere(
      (m) => m['id'] == _deliveryMethod,
      orElse: () => {'name': 'Standard Shipping', 'price': 0.0, 'estimatedDays': 7},
    );

    final price = method['price'] as double;
    final days = method['estimatedDays'] as int;
    final deliveryDate = _getDeliveryDate(days);

    return '${method['name']} - ${price == 0 ? 'checkout.free'.tr() : '\$${price.toStringAsFixed(2)}'} (Arrives by $deliveryDate)';
  }

  String _getPaymentMethodName(String method) {
    switch (method) {
      case 'credit_card':
        return 'checkout.creditDebitCard'.tr();
      case 'paypal':
        return 'PayPal';
      case 'cash_on_delivery':
        return 'checkout.cashOnDelivery'.tr();
      case 'bank_transfer':
        return 'checkout.bankTransfer'.tr();
      default:
        return 'checkout.creditDebitCard'.tr();
    }
  }

  double _getDeliveryCost() {
    final method = _deliveryMethods.firstWhere(
      (m) => m['id'] == _deliveryMethod,
      orElse: () => {'price': 0.0},
    );
    return (method['price'] as double?) ?? 0.0;
  }
}
