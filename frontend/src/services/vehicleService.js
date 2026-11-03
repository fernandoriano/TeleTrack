import {
  apiRequest
} from "./api";


export async function getVehicles() {
  return apiRequest(
    "/api/v1/vehicles"
  );
}


export async function getVehicle(
  vehicleId
) {
  return apiRequest(
    `/api/v1/vehicles/${vehicleId}`
  );
}


export async function createVehicle(
  vehicleData
) {
  return apiRequest(
    "/api/v1/vehicles",
    {
      method: "POST",
      body: JSON.stringify(
        vehicleData
      )
    }
  );
}


export async function updateVehicle(
  vehicleId,
  vehicleData
) {
  return apiRequest(
    `/api/v1/vehicles/${vehicleId}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        vehicleData
      )
    }
  );
}


export async function regenerateActivationSecret(
  vehicleId
) {
  return apiRequest(
    `/api/v1/vehicles/${vehicleId}/regenerate-activation-secret`,
    {
      method: "POST"
    }
  );
}