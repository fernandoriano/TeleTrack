import {
  apiRequest
} from "./api";


export async function getClients(
  includeInactive = false
) {
  return apiRequest(
    `/api/v1/clients?include_inactive=${includeInactive}`
  );
}


export async function getClient(
  clientId
) {
  return apiRequest(
    `/api/v1/clients/${clientId}`
  );
}


export async function createClient(
  clientData
) {
  return apiRequest(
    "/api/v1/clients",
    {
      method: "POST",
      body: JSON.stringify(
        clientData
      )
    }
  );
}


export async function updateClient(
  clientId,
  clientData
) {
  return apiRequest(
    `/api/v1/clients/${clientId}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        clientData
      )
    }
  );
}


export async function activateClient(
  clientId
) {
  return apiRequest(
    `/api/v1/clients/${clientId}/activate`,
    {
      method: "PATCH"
    }
  );
}


export async function deactivateClient(
  clientId
) {
  return apiRequest(
    `/api/v1/clients/${clientId}/deactivate`,
    {
      method: "PATCH"
    }
  );
}


export async function getClientUsers(
  clientId
) {
  return apiRequest(
    `/api/v1/clients/${clientId}/users`
  );
}


export async function getClientVehicles(
  clientId
) {
  return apiRequest(
    `/api/v1/clients/${clientId}/vehicles`
  );
}
