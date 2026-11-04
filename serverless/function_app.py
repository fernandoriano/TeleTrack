import azure.functions as func
import logging
import os
import time
import urllib.error
import urllib.request


app = func.FunctionApp()

TELETRACK_HEALTH_URL = os.getenv(
    "TELETRACK_HEALTH_URL",
    "https://teletrack.135-232-245-103.sslip.io/health",
)


@app.timer_trigger(
    schedule="0 */5 * * * *",
    arg_name="myTimer",
    run_on_startup=False,
    use_monitor=False,
)
def TeleTrackHealthMonitor(myTimer: func.TimerRequest) -> None:
    """
    Serverless health monitor for TeleTrack.

    Runs every five minutes and verifies that the public
    TeleTrack platform is available through HTTPS.
    """

    if myTimer.past_due:
        logging.warning("TeleTrack Health Monitor execution is past due.")

    start_time = time.perf_counter()

    try:
        request = urllib.request.Request(
            TELETRACK_HEALTH_URL,
            headers={"User-Agent": "TeleTrack-Serverless-Monitor/1.0"},
            method="GET",
        )

        with urllib.request.urlopen(request, timeout=15) as response:
            status_code = response.getcode()
            body = response.read(200).decode("utf-8", errors="replace")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        if 200 <= status_code < 300:
            logging.info(
                "TELETRACK_STATUS=UP url=%s http_status=%s response_time_ms=%s response=%s",
                TELETRACK_HEALTH_URL,
                status_code,
                elapsed_ms,
                body.strip(),
            )
        else:
            logging.warning(
                "TELETRACK_STATUS=DEGRADED url=%s http_status=%s response_time_ms=%s",
                TELETRACK_HEALTH_URL,
                status_code,
                elapsed_ms,
            )

    except urllib.error.HTTPError as error:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logging.error(
            "TELETRACK_STATUS=DOWN url=%s http_status=%s response_time_ms=%s error=%s",
            TELETRACK_HEALTH_URL,
            error.code,
            elapsed_ms,
            error.reason,
        )

    except Exception as error:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logging.exception(
            "TELETRACK_STATUS=DOWN url=%s response_time_ms=%s error=%s",
            TELETRACK_HEALTH_URL,
            elapsed_ms,
            str(error),
        )