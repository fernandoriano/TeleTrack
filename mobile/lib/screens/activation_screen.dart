import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/secure_storage_service.dart';

class ActivationScreen extends StatefulWidget {
  final VoidCallback onActivated;

  const ActivationScreen({
    super.key,
    required this.onActivated,
  });

  @override
  State<ActivationScreen> createState() =>
      _ActivationScreenState();
}

class _ActivationScreenState
    extends State<ActivationScreen> {
  final _formKey = GlobalKey<FormState>();

  final _vehicleController =
      TextEditingController();

  final _secretController =
      TextEditingController();

  final ApiService _apiService =
      ApiService();

  final SecureStorageService _storage =
      SecureStorageService();

  bool _loading = false;
  bool _hideSecret = true;

  String? _error;

  Future<void> _activate() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final vehicleCode =
          _vehicleController.text.trim();

      final token =
          await _apiService.activateDevice(
        vehicleCode: vehicleCode,
        activationSecret:
            _secretController.text.trim(),
      );

      await _storage.saveDevice(
        deviceToken: token,
        vehicleCode: vehicleCode,
      );

      if (!mounted) {
        return;
      }

      widget.onActivated();
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _error = error
            .toString()
            .replaceFirst(
              'Exception: ',
              '',
            );
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _vehicleController.dispose();
    _secretController.dispose();
    _apiService.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
          const Color(0xFFF3F6FA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.all(24),
            child: Container(
              constraints:
                  const BoxConstraints(
                maxWidth: 460,
              ),
              padding:
                  const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius:
                    BorderRadius.circular(22),
                boxShadow: const [
                  BoxShadow(
                    color: Color(
                      0x18000000,
                    ),
                    blurRadius: 30,
                    offset: Offset(0, 12),
                  ),
                ],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment
                          .stretch,
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration:
                          const BoxDecoration(
                        color:
                            Color(0xFF2563EB),
                        shape:
                            BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons
                            .location_on_rounded,
                        size: 38,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(
                      height: 22,
                    ),
                    const Text(
                      'TeleTrack',
                      style: TextStyle(
                        fontSize: 34,
                        fontWeight:
                            FontWeight.bold,
                        color:
                            Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    const Text(
                      'Activación del dispositivo GPS',
                      style: TextStyle(
                        fontSize: 17,
                        color:
                            Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(
                      height: 30,
                    ),
                    TextFormField(
                      controller:
                          _vehicleController,
                      textCapitalization:
                          TextCapitalization
                              .characters,
                      decoration:
                          const InputDecoration(
                        labelText:
                            'Código del vehículo',
                        hintText: 'VH01',
                        prefixIcon: Icon(
                          Icons
                              .directions_car,
                        ),
                        border:
                            OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null ||
                            value
                                .trim()
                                .isEmpty) {
                          return 'Ingresa el código del vehículo.';
                        }

                        return null;
                      },
                    ),
                    const SizedBox(
                      height: 18,
                    ),
                    TextFormField(
                      controller:
                          _secretController,
                      obscureText:
                          _hideSecret,
                      decoration:
                          InputDecoration(
                        labelText:
                            'Secreto de activación',
                        prefixIcon:
                            const Icon(
                          Icons.key,
                        ),
                        border:
                            const OutlineInputBorder(),
                        suffixIcon:
                            IconButton(
                          onPressed: () {
                            setState(() {
                              _hideSecret =
                                  !_hideSecret;
                            });
                          },
                          icon: Icon(
                            _hideSecret
                                ? Icons
                                    .visibility
                                : Icons
                                    .visibility_off,
                          ),
                        ),
                      ),
                      validator: (value) {
                        if (value == null ||
                            value
                                .trim()
                                .isEmpty) {
                          return 'Ingresa el secreto de activación.';
                        }

                        return null;
                      },
                    ),
                    if (_error != null) ...[
                      const SizedBox(
                        height: 18,
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
                            10,
                          ),
                        ),
                        child: Text(
                          _error!,
                          style:
                              const TextStyle(
                            color: Color(
                              0xFFB91C1C,
                            ),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(
                      height: 24,
                    ),
                    SizedBox(
                      height: 54,
                      child:
                          FilledButton.icon(
                        onPressed:
                            _loading
                                ? null
                                : _activate,
                        icon: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(
                                  strokeWidth:
                                      2,
                                ),
                              )
                            : const Icon(
                                Icons
                                    .link,
                              ),
                        label: Text(
                          _loading
                              ? 'Activando...'
                              : 'Activar dispositivo',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}