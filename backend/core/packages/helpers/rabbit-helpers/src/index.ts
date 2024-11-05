// project
import type { BaseModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";

export class RabbitHelpers {
  public static async getEntityByField<T extends BaseModel>(
    handler: Handler,
    requestQueue: string,
    EntityModelClass: { new (): T; createFromJsonData(jsonData: Record<string, unknown>, emptyObject: T): T },
    field: string,
    value: unknown,
  ): Promise<T | undefined> {
    if (field === undefined || value === undefined) return undefined;

    try {
      const entity: T | undefined = await handler.getRabbitBreeder().sendRequestAndAwaitResponse<T>(
        requestQueue,
        `${requestQueue}Response`,
        { [field]: value },
        (data: Record<string, unknown>) => {
          return EntityModelClass.createFromJsonData(data, new EntityModelClass());
        },
      );

      return entity;
    } catch (error: unknown) {
      handler.getLog().error((error as Error).message);
      return undefined;
    }
  }

  public static async getEntityById<T extends BaseModel>(
    handler: Handler,
    requestQueue: string,
    EntityModelClass: { new (): T; createFromJsonData(jsonData: Record<string, unknown>, emptyObject: T): T },
    id: number,
  ): Promise<T | undefined> {
    return await RabbitHelpers.getEntityByField(handler, requestQueue, EntityModelClass, "id", id);
  }

  public static async createEntity<T extends BaseModel>(
    handler: Handler,
    requestQueue: string,
    entity: T,
  ): Promise<void> {
    if (entity === undefined) return;

    try {
      await handler.getRabbitBreeder().sendRequest(requestQueue, entity.toJson());
    } catch (error: unknown) {
      handler.getLog().error((error as Error).message);
    }
    // TODO: dovrebbe essere verificato il salvataggio
  }

  public static async updateEntity<T extends BaseModel>(
    handler: Handler,
    requestQueue: string,
    entity: T,
  ): Promise<void> {
    if (entity === undefined) return;

    try {
      await handler.getRabbitBreeder().sendRequest(requestQueue, entity.toJson());
    } catch (error: unknown) {
      handler.getLog().error((error as Error).message);
    }
    // TODO: dovrebbe essere verificato il salvataggio
  }
}
