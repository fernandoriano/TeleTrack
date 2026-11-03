import {
  apiRequest
} from "./api";


export async function getLatestLocation(
  vehicleId
) {
  return apiRequest(
    `/api/v1/telemetry/vehicles/${vehicleId}/latest`
  );
}


export async function getVehicleHistory(
  vehicleId,
  startDate,
  endDate
) {
  const params =
    new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });

  return apiRequest(
    `/api/v1/telemetry/vehicles/${vehicleId}/history?${params.toString()}`
  );
}


export async function getVehicleStats(
  vehicleId
) {
  return apiRequest(
    `/api/v1/stats/vehicles/${vehicleId}`
  );
}


export async function getAllStats() {
  return apiRequest(
    "/api/v1/stats"
  );
}
