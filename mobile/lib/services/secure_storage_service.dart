import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const String _deviceTokenKey = 'teletrack_device_token';
  static const String _vehicleCodeKey = 'teletrack_vehicle_code';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveDevice({
    required String deviceToken,
    required String vehicleCode,
  }) async {
    await _storage.write(
      key: _deviceTokenKey,
      value: deviceToken,
    );

    await _storage.write(
      key: _vehicleCodeKey,
      value: vehicleCode,
    );
  }

  Future<String?> getDeviceToken() async {
    return _storage.read(
      key: _deviceTokenKey,
    );
  }

  Future<String?> getVehicleCode() async {
    return _storage.read(
      key: _vehicleCodeKey,
    );
  }

  Future<bool> isActivated() async {
    final token = await getDeviceToken();

    return token != null && token.isNotEmpty;
  }

  Future<void> clearDevice() async {
    await _storage.delete(
      key: _deviceTokenKey,
    );

    await _storage.delete(
      key: _vehicleCodeKey,
    );
  }
}
