import { User } from "@koru/core-models";
import type { RabbitBreeder } from "@koru/rabbit-breeder";

export class RabbitHelpers {
  public static async getUserByField(field: string, value: unknown, rabbitBreeder: RabbitBreeder): Promise<User | undefined> {
    if (field === undefined || value === undefined) return undefined;

    const user: User | undefined = await rabbitBreeder.sendRequestAndAwaitResponse<User>(
      "userRead",
      "userReadResponse",
      { [field]: value },
      (data: Record<string, unknown>) => {
        return User.createFromJsonData(data, new User());
      },
    );

    return user;
  }
}
