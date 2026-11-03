import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../config/app_config.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/secure_storage_service.dart';

class TrackingScreen extends StatefulWidget {
  final VoidCallback onDeactivated;

  const TrackingScreen({
    super.key,
    required this.onDeactivated,
  });

  @override
  State<TrackingScreen> createState() =>
      _TrackingScreenState();
}

class _TrackingScreenState
    extends State<TrackingScreen> {
  final ApiService _apiService =
      ApiService();

  final LocationService _locationService =
      LocationService();

  final SecureStorageService _storage =
      SecureStorageService();

  Timer? _timer;

  String _vehicleCode = '-';

  bool _tracking = false;
  bool _sending = false;

  String _status =
      'Listo para iniciar';

  Position? _lastPosition;

  DateTime? _lastTransmission;

  String? _error;

  @override
  void initState() {
    super.initState();

    _loadDevice();
  }

  Future<void> _loadDevice() async {
    final vehicleCode =
        await _storage.getVehicleCode();

    if (!mounted) {
      return;
    }

    setState(() {
      _vehicleCode =
          vehicleCode ?? '-';
    });
  }

  Future<void> _startTracking() async {
    setState(() {
      _error = null;
      _status =
          'Validando GPS...';
    });

    try {
      await _locationService
          .ensureLocationReady();

      if (!mounted) {
        return;
      }

      setState(() {
        _tracking = true;
        _status =
            'Telemetría activa';
      });

      await _sendCurrentPosition();

      _timer?.cancel();

      _timer = Timer.periodic(
        AppConfig.transmissionInterval,
        (_) {
          _sendCurrentPosition();
        },
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _tracking = false;
        _status = 'GPS detenido';
        _error = error
            .toString()
            .replaceFirst(
              'Exception: ',
              '',
            );
      });
    }
  }

  void _stopTracking() {
    _timer?.cancel();
    _timer = null;

    setState(() {
      _tracking = false;
      _sending = false;
      _status =
          'Transmisión detenida';
    });
  }

  Future<void>
      _sendCurrentPosition() async {
    if (_sending) {
      return;
    }

    _sending = true;

    try {
      final token =
          await _storage
              .getDeviceToken();

      if (token == null ||
          token.isEmpty) {
        throw Exception(
          'No existe un token de dispositivo.',
        );
      }

      final position =
          await _locationService
              .getCurrentPosition();

      await _apiService.sendLocation(
        deviceToken: token,
        position: position,
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _lastPosition = position;

        _lastTransmission =
            DateTime.now();

        _status =
            'Telemetría enviada';

        _error = null;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _status =
            'Error de transmisión';

        _error = error
            .toString()
            .replaceFirst(
              'Exception: ',
              '',
            );
      });
    } finally {
      _sending = false;
    }
  }

  Future<void>
      _deactivateDevice() async {
    _stopTracking();

    await _storage.clearDevice();

    if (!mounted) {
      return;
    }

    widget.onDeactivated();
  }

  Widget _metricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding:
          const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
            BorderRadius.circular(16),
        border: Border(
          top: BorderSide(
            color: color,
            width: 4,
          ),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(
              0x10000000,
            ),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: color,
          ),
          const SizedBox(
            height: 12,
          ),
          Text(
            title,
            style:
                const TextStyle(
              color:
                  Color(0xFF64748B),
            ),
          ),
          const SizedBox(
            height: 6,
          ),
          Text(
            value,
            style:
                const TextStyle(
              fontSize: 20,
              fontWeight:
                  FontWeight.bold,
              color:
                  Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _apiService.dispose();

    super.dispose();
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    final speed =
        _lastPosition == null
            ? '-'
            : '${(_lastPosition!.speed * 3.6).clamp(0, double.infinity).toStringAsFixed(1)} km/h';

    final altitude =
        _lastPosition == null
            ? '-'
            : '${_lastPosition!.altitude.toStringAsFixed(1)} m';

    final accuracy =
        _lastPosition == null
            ? '-'
            : '${_lastPosition!.accuracy.toStringAsFixed(1)} m';

    final heading =
        _lastPosition == null
            ? '-'
            : '${_lastPosition!.heading.toStringAsFixed(0)}°';

    return Scaffold(
      backgroundColor:
          const Color(0xFFF3F6FA),
      appBar: AppBar(
        backgroundColor:
            const Color(0xFF0F172A),
        foregroundColor:
            Colors.white,
        title:
            const Text('TeleTrack Mobile'),
        actions: [
          IconButton(
            tooltip:
                'Desactivar dispositivo',
            onPressed:
                _deactivateDevice,
            icon: const Icon(
              Icons.logout,
            ),
          ),
        ],
      ),
      body:
          SingleChildScrollView(
        padding:
            const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment
                  .stretch,
          children: [
            Container(
              padding:
                  const EdgeInsets
                      .all(22),
              decoration:
                  BoxDecoration(
                gradient:
                    const LinearGradient(
                  colors: [
                    Color(
                      0xFF1D4ED8,
                    ),
                    Color(
                      0xFF0891B2,
                    ),
                  ],
                ),
                borderRadius:
                    BorderRadius
                        .circular(
                  18,
                ),
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment
                        .start,
                children: [
                  const Text(
                    'Vehículo',
                    style: TextStyle(
                      color:
                          Colors.white70,
                    ),
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  Text(
                    _vehicleCode,
                    style:
                        const TextStyle(
                      color:
                          Colors.white,
                      fontSize: 30,
                      fontWeight:
                          FontWeight
                              .bold,
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Icon(
                        _tracking
                            ? Icons
                                .gps_fixed
                            : Icons
                                .gps_off,
                        color: _tracking
                            ? const Color(
                                0xFF86EFAC,
                              )
                            : const Color(
                                0xFFFCA5A5,
                              ),
                      ),
                      const SizedBox(
                        width: 8,
                      ),
                      Expanded(
                        child: Text(
                          _status,
                          style:
                              const TextStyle(
                            color:
                                Colors.white,
                            fontWeight:
                                FontWeight
                                    .bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (_error !=
                null) ...[
              const SizedBox(
                height: 16,
              ),
              Container(
                padding:
                    const EdgeInsets
                        .all(14),
                decoration:
                    BoxDecoration(
                  color:
                      const Color(
                    0xFFFEE2E2,
                  ),
                  borderRadius:
                      BorderRadius
                          .circular(
                    12,
                  ),
                ),
                child: Text(
                  _error!,
                  style:
                      const TextStyle(
                    color:
                        Color(
                      0xFFB91C1C,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(
              height: 20,
            ),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics:
                  const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 1.25,
              children: [
                _metricCard(
                  title:
                      'Velocidad',
                  value: speed,
                  icon:
                      Icons.speed,
                  color:
                      const Color(
                    0xFF2563EB,
                  ),
                ),
                _metricCard(
                  title:
                      'Altitud',
                  value: altitude,
                  icon:
                      Icons.terrain,
                  color:
                      const Color(
                    0xFF16A34A,
                  ),
                ),
                _metricCard(
                  title:
                      'Precisión',
                  value: accuracy,
                  icon:
                      Icons.gps_fixed,
                  color:
                      const Color(
                    0xFF7C3AED,
                  ),
                ),
                _metricCard(
                  title: 'Rumbo',
                  value: heading,
                  icon:
                      Icons.navigation,
                  color:
                      const Color(
                    0xFFEA580C,
                  ),
                ),
              ],
            ),
            const SizedBox(
              height: 20,
            ),
            Container(
              padding:
                  const EdgeInsets
                      .all(18),
              decoration:
                  BoxDecoration(
                color: Colors.white,
                borderRadius:
                    BorderRadius
                        .circular(
                  16,
                ),
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment
                        .start,
                children: [
                  const Text(
                    'Última transmisión',
                    style:
                        TextStyle(
                      color:
                          Color(
                        0xFF64748B,
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 7,
                  ),
                  Text(
                    _lastTransmission ==
                            null
                        ? 'Sin transmisiones'
                        : _lastTransmission!
                            .toLocal()
                            .toString(),
                    style:
                        const TextStyle(
                      fontWeight:
                          FontWeight.bold,
                      fontSize: 17,
                    ),
                  ),
                  if (_lastPosition !=
                      null) ...[
                    const SizedBox(
                      height: 12,
                    ),
                    Text(
                      'Lat: ${_lastPosition!.latitude.toStringAsFixed(6)}',
                    ),
                    Text(
                      'Lon: ${_lastPosition!.longitude.toStringAsFixed(6)}',
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(
              height: 24,
            ),
            SizedBox(
              height: 56,
              child: _tracking
                  ? FilledButton.icon(
                      style:
                          FilledButton
                              .styleFrom(
                        backgroundColor:
                            const Color(
                          0xFFDC2626,
                        ),
                      ),
                      onPressed:
                          _stopTracking,
                      icon:
                          const Icon(
                        Icons.stop,
                      ),
                      label:
                          const Text(
                        'DETENER TRANSMISIÓN',
                      ),
                    )
                  : FilledButton.icon(
                      style:
                          FilledButton
                              .styleFrom(
                        backgroundColor:
                            const Color(
                          0xFF16A34A,
                        ),
                      ),
                      onPressed:
                          _startTracking,
                      icon:
                          const Icon(
                        Icons.play_arrow,
                      ),
                      label:
                          const Text(
                        'INICIAR TRANSMISIÓN',
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}