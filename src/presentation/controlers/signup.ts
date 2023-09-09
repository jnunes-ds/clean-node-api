import { type AddAccount } from "../../domain/usecases/add-account";
import {
  MissingParamError,
  InvalidParamError
} from "../errors";
import { badRequest, serverError } from '../helpers/http-helper'

import {
  type Controller,
  type EmailValidator,
  type HttpRequest,
  type HttpResponse
} from "../protocols";

export class SignUpController implements Controller {
  constructor (
    private readonly emailValidator: EmailValidator,
    private readonly addAccount: AddAccount
  ) {}

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

      // eslint-disable-next-line
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { body: { name, email, password, passwordConfirmation } } = httpRequest;

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValid = this.emailValidator.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }
      this.addAccount.add({
        name,
        email,
        password
      });
    } catch (error) {
      return serverError()
    }
  }
}
