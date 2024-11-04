import { type BaseController, type Endpoint, EndpointType } from "@koru/base-service";
import type { EntityModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";

import {
  createEntityEndpoint,
  deleteEntityEndpoint,
  readDeletedEntitiesEndpoint,
  readEntitiesEndpoint,
  readEntityEndpoint,
  updateEntityEndpoint,
} from "./endpoints/index.ts";

export class CrudTemplate {
  public static getTemplate<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    baseUrl: string,
    basePermission: string,
    EntityModelClass: { new (): T; createFromRequest: (body: Record<string, unknown>, entity: T) => T },
    ControllerClass: new (handler: Handler) => U,
    endpointTypes: EndpointType[],
  ): Endpoint[] {
    const endpoints: Endpoint[] = [];

    if (endpointTypes.includes(EndpointType.Create)) {
      endpoints.push(CrudTemplate.createEntityEndpoint<T, U>(handler, baseUrl, [`${basePermission}.create`], EntityModelClass, ControllerClass));
    }
    if (endpointTypes.includes(EndpointType.ReadAll)) {
      endpoints.push(CrudTemplate.readEntitiesEndpoint<T, U>(handler, baseUrl, [`${basePermission}.read.all`], ControllerClass));
    }
    if (endpointTypes.includes(EndpointType.Read)) {
      endpoints.push(CrudTemplate.readEntityEndpoint<T, U>(handler, `${baseUrl}/:id`, [`${basePermission}.read.byId`], ControllerClass));
    }
    if (endpointTypes.includes(EndpointType.ReadDeleted)) {
      endpoints.push(CrudTemplate.readDeletedEntitiesEndpoint<T, U>(handler, `${baseUrl}/deleted`, [`${basePermission}.read.all`], ControllerClass));
    }
    if (endpointTypes.includes(EndpointType.Update)) {
      endpoints.push(CrudTemplate.updateEntityEndpoint<T, U>(handler, `${baseUrl}/:id`, [`${basePermission}.update`], ControllerClass));
    }
    if (endpointTypes.includes(EndpointType.Delete)) {
      endpoints.push(CrudTemplate.deleteEntityEndpoint<T, U>(handler, `${baseUrl}/:id`, [`${basePermission}.delete`], ControllerClass));
    }

    return endpoints;
  }

  public static createEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    EntityModelClass: { new (): T; createFromRequest: (body: Record<string, unknown>, entity: T) => T },
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return createEntityEndpoint<T, U>(handler, url, allowedPermissions, EntityModelClass, ControllerClass);
  }

  public static deleteEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return deleteEntityEndpoint<T, U>(handler, url, allowedPermissions, ControllerClass);
  }

  public static readDeletedEntitiesEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return readDeletedEntitiesEndpoint<T, U>(handler, url, allowedPermissions, ControllerClass);
  }

  public static readEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return readEntityEndpoint<T, U>(handler, url, allowedPermissions, ControllerClass);
  }

  public static readEntitiesEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return readEntitiesEndpoint<T, U>(handler, url, allowedPermissions, ControllerClass);
  }

  public static updateEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
    handler: Handler,
    url: string,
    allowedPermissions: string[],
    ControllerClass: new (handler: Handler) => U,
  ): Endpoint {
    return updateEntityEndpoint<T, U>(handler, url, allowedPermissions, ControllerClass);
  }
}
