import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiService {
  final http.Client _client;

  ApiService({
    http.Client? client,
  }) : _client = client ?? http.Client();

  Future<String> activateDevice({
    required String vehicleCode,
    required String activationSecret,
  }) async {
    final uri = Uri.parse(
      '${AppConfig.apiBaseUrl}/api/v1/telemetry/activate',
    );

    final response = await _client
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'vehicle_code': vehicleCode.trim(),
            'activation_secret': activationSecret.trim(),
            'device_name': 'TeleTrack Android',
          }),
        )
        .timeout(AppConfig.requestTimeout);

    final data = _decodeResponse(response);

    final token = data['device_token'];

    if (token == null || token.toString().isEmpty) {
      throw Exception(
        'El servidor no devolvió un token de dispositivo.',
      );
    }

    return token.toString();
  }

  Future<void> sendLocation({
    required String deviceToken,
    required Position position,
  }) async {
    final uri = Uri.parse(
      '${AppConfig.apiBaseUrl}/api/v1/telemetry/locations',
    );

    final response = await _client
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Token': deviceToken,
          },
          body: jsonEncode({
            'timestamp': DateTime.now()
                .toUtc()
                .toIso8601String(),
            'latitude': position.latitude,
            'longitude': position.longitude,
            'altitude': position.altitude,
            'speed': position.speed < 0
                ? 0
                : position.speed * 3.6,
            'accuracy': position.accuracy,
            'heading': position.heading < 0
                ? 0
                : position.heading,
          }),
        )
        .timeout(AppConfig.requestTimeout);

    _decodeResponse(response);
  }

  Map<String, dynamic> _decodeResponse(
    http.Response response,
  ) {
    Map<String, dynamic> data = {};

    if (response.body.isNotEmpty) {
      try {
        final decoded = jsonDecode(response.body);

        if (decoded is Map<String, dynamic>) {
          data = decoded;
        }
      } catch (_) {
        data = {};
      }
    }

    if (response.statusCode < 200 ||
        response.statusCode >= 300) {
      final detail = data['detail'];

      throw Exception(
        detail?.toString() ??
            'Error HTTP ${response.statusCode}.',
      );
    }

    return data;
  }

  void dispose() {
    _client.close();
  }
}
