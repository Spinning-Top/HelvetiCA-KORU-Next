// import axios, { type AxiosResponse } from "axios";

// import { DataHelpers } from "@koru/data-helpers";
import { Endpoint, type EndpointMethod } from "@koru/base-service";
// import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function createEndpoint(endpointData: Record<string, unknown>, baseUrl: string, serviceRoot: string): Endpoint | undefined {
  if (endpointData === undefined) return undefined;
  if (endpointData.url === undefined) return undefined;
  if (endpointData.method === undefined) return undefined;
  if (endpointData.authRequired === undefined) return undefined;
  if (endpointData.allowedPermissions === undefined) return undefined;

  const endpoint: Endpoint = new Endpoint(
    `${baseUrl}${endpointData.url}`,
    endpointData.method as EndpointMethod,
    endpointData.authRequired as boolean,
    endpointData.allowedPermissions as string[],
  );
  endpoint.setBaseUrl(baseUrl);
  endpoint.setServiceUrl(String(endpointData.url));
  endpoint.setServiceRoot(serviceRoot);

  /*
  endpoint.setHandler(async (req: Request, res: Response) => {
    try {
      let response: AxiosResponse;
      // Headers comuni con eventuale aggiunta di "X-Koru-User"
      const headers = "user" in req && req.user != undefined
        ? {
          ...req.headers,
          "X-Koru-User": JSON.stringify(req.user),
        }
        : req.headers;

      const data = headers["content-type"] === "application/x-www-form-urlencoded" ? qs.stringify(req.body) : "";

      const config: Record<string, unknown> = {
        headers,
        params: req.query,
      };

      const requestToServiceUrl: URL = new URL(
        endpoint.getServiceRoot()! + DataHelpers.removeFirstOccurrenceOfString(req.url, endpoint.getBaseUrl()!),
      );
      requestToServiceUrl.search = "";

      switch (endpoint.getMethod()) {
        case EndpointMethod.GET:
          response = await axios.get(requestToServiceUrl.toString(), config);
          break;
        case EndpointMethod.POST:
          response = await axios.post(requestToServiceUrl.toString(), data, config);
          break;
        case EndpointMethod.PUT:
          response = await axios.put(requestToServiceUrl.toString(), data, config);
          break;
        case EndpointMethod.DELETE:
          response = await axios.delete(requestToServiceUrl.toString(), config);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${endpoint.getMethod()}`);
      }

      // Inoltra la risposta al client
      res.status(response.status).send(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // In caso di errore da parte del sottoservizio, inoltra la risposta esatta
        return res.status(error.response.status).set(error.response.headers).send(error.response.data);
      } else {
        console.error(error);
        // In caso di altri errori, come problemi di rete, restituisci un 500
        return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    }
  });
  */
  return endpoint;
}
