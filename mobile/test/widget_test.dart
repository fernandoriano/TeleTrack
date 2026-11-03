import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets(
    'TeleTrack Mobile application is available',
    (WidgetTester tester) async {
      const app = TeleTrackApp();

      expect(
        app,
        isA<TeleTrackApp>(),
      );
    },
  );
}