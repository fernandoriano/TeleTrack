import 'package:flutter/material.dart';

import 'screens/activation_screen.dart';
import 'screens/tracking_screen.dart';
import 'services/secure_storage_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    const TeleTrackApp(),
  );
}

class TeleTrackApp
    extends StatefulWidget {
  const TeleTrackApp({
    super.key,
  });

  @override
  State<TeleTrackApp> createState() =>
      _TeleTrackAppState();
}

class _TeleTrackAppState
    extends State<TeleTrackApp> {
  final SecureStorageService _storage =
      SecureStorageService();

  late Future<bool>
      _activationFuture;

  @override
  void initState() {
    super.initState();

    _refreshActivation();
  }

  void _refreshActivation() {
    _activationFuture =
        _storage.isActivated();
  }

  void _deviceStateChanged() {
    setState(() {
      _refreshActivation();
    });
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    return MaterialApp(
      debugShowCheckedModeBanner:
          false,
      title: 'TeleTrack Mobile',
      theme: ThemeData(
        colorScheme:
            ColorScheme.fromSeed(
          seedColor:
              const Color(
            0xFF2563EB,
          ),
        ),
        useMaterial3: true,
        inputDecorationTheme:
            InputDecorationTheme(
          filled: true,
          fillColor:
              const Color(
            0xFFF8FAFC,
          ),
          border:
              OutlineInputBorder(
            borderRadius:
                BorderRadius.circular(
              12,
            ),
          ),
        ),
      ),
      home: FutureBuilder<bool>(
        future: _activationFuture,
        builder:
            (context, snapshot) {
          if (snapshot.connectionState !=
              ConnectionState.done) {
            return const Scaffold(
              body: Center(
                child:
                    CircularProgressIndicator(),
              ),
            );
          }

          final activated =
              snapshot.data ?? false;

          if (activated) {
            return TrackingScreen(
              onDeactivated:
                  _deviceStateChanged,
            );
          }

          return ActivationScreen(
            onActivated:
                _deviceStateChanged,
          );
        },
      ),
    );
  }
}