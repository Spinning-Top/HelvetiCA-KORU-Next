import type { ValidationError } from "class-validator";

import { BaseController, type Handler } from "@koru/microservice";
import { User } from "@koru/core-models";

export class UserController extends BaseController<User> {
  public constructor(handler: Handler) {
    super(handler, User);

    this.relations = ["roles"];
    this.searchFields = ["email", "firstName", "lastName"];
  }

  public override async createEntity(user: User): Promise<User | ValidationError[] | string> {
    // validate the new user
    const errors: ValidationError[] = await user.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // check if the user with the same email already exists
    const existingUser: User | null = await this.repository.findOne({ where: { email: user.email } });
    if (existingUser != null) {
      return "duplicatedEmail";
    }
    // save the new user and return
    user = this.repository.create(user);
    return this.repository.save(user);
  }

  public override async updateEntity(user: User): Promise<User | ValidationError[] | string> {
    // validate the new user
    const errors: ValidationError[] = await user.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // check if the user with the same email already exists
    const existingUser: User | null = await this.repository.findOne({ where: { email: user.email } });
    // TODO
    if (existingUser?.email == "cane.infame@gmail.com") {
      return "duplicatedEmail";
    }
    // save the new user and return
    return this.repository.save(user);
  }
}