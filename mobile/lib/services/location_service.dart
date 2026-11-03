import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<void> ensureLocationReady() async {
    final serviceEnabled =
        await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      throw Exception(
        'El GPS del dispositivo está desactivado.',
      );
    }

    LocationPermission permission =
        await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission =
          await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied) {
      throw Exception(
        'El permiso de ubicación fue rechazado.',
      );
    }

    if (permission ==
        LocationPermission.deniedForever) {
      throw Exception(
        'El permiso de ubicación fue bloqueado permanentemente. '
        'Habilítalo desde los ajustes del dispositivo.',
      );
    }
  }

  Future<Position> getCurrentPosition() async {
    await ensureLocationReady();

    return Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 0,
      ),
    );
  }
}