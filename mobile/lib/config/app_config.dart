class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'TELETRACK_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  static const Duration transmissionInterval = Duration(
    seconds: 15,
  );

  static const Duration requestTimeout = Duration(
    seconds: 15,
  );
}