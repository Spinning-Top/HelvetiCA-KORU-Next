// third party
import { Expose } from "class-transformer";

// local
import type { User } from "./user.ts";

export class LinkedUser {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  public constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}
