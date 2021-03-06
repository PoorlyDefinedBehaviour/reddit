import makeSignUpValidator, {
  isEmailValid,
  isUsernameLongEnough,
  isUsernameNotTooLong,
  isEmailInuse,
  isPasswordLongEnough,
  isPasswordNotTooLong,
} from "./SignUpUseCaseValidator"

describe("SignUpUseCaseValidator test suite", () => {
  test("isEmailValid@ rejects invalid email", async () => {
    const result = await isEmailValid({
      username: "johndoe",
      email: "invalid_email",
      password: "123456",
    })

    expect(result.value[0].field).toBe("email")
    expect(result.value[0].constraint).toBe("email")
    expect(result.value[0].message).toBe("Email must be valid")
  })

  test("isEmailValid@ accepts valid email", async () => {
    const user = {
      username: "johndoe",
      email: "valid_email@email.com",
      password: "123456",
    }

    const result = await isEmailValid(user)

    expect(result.value).toEqual(user)
  })

  test("isUsernameLongEnough@ rejects usernames with less than 5 characters", async () => {
    const result = await isUsernameLongEnough({
      username: "abc",
      email: "valid_email@email.com",
      password: "123456",
    })

    expect(result.value[0]).toEqual({
      message: "Username must have at least 5 characters",
      constraint: "min",
      field: "username",
    })
  })

  test("isUsernameLongEnough@ accepts usernames with more than 5 characters", async () => {
    const user = {
      username: "abcde",
      email: "valid_email@email.com",
      password: "123456",
    }

    const result = await isUsernameLongEnough(user)

    expect(result.value).toEqual(user)
  })

  test("isUsernameNotTooLong@ rejects usernames with more than 255 characters", async () => {
    const user = {
      username: "abcde".repeat(255),
      email: "valid_email@email.com",
      password: "123456",
    }

    const result = await isUsernameNotTooLong(user)

    expect(result.value[0]).toEqual({
      message: "Username can't be longer than 255 characters",
      constraint: "max",
      field: "username",
    })
  })

  test("isUsernameNotTooLong@ accepts usernames with less than 255 characters", async () => {
    const user = {
      username: "abcde3r3r323r3r23r32rr3",
      email: "valid_email@email.com",
      password: "123456",
    }

    const result = await isUsernameNotTooLong(user)

    expect(result.value).toEqual(user)
  })

  test("isEmailInuse@ returns failure if user with this email exists", async () => {
    const UserRepository = {
      findOne: () => Promise.resolve(true),
    }

    const result = await isEmailInuse({
      UserRepository,
      user: {
        username: "abcde",
        email: "valid_email@email.com",
        password: "123456",
      },
    })

    expect(result.value[0]).toEqual({
      message: "Email already in use",
      constraint: "unique",
      field: "email",
    })
  })

  test("isEmailInuse@ returns Success(user) if email is not in use", async () => {
    const UserRepository = {
      findOne: () => Promise.resolve(false),
    }

    const user = {
      username: "abcde",
      email: "valid_email@email.com",
      password: "123456",
    }

    const result = await isEmailInuse({
      UserRepository,
      user,
    })

    expect(result.value).toEqual(user)
  })

  test("isPasswordLongEnough@ returns Success(user) if password is longer than 5 characters", async () => {
    const user = {
      username: "dwqdqwwqdwqdqwdwq",
      email: "valid_email@email.com",
      password: "long_enough_password_password",
    }

    const result = await isPasswordLongEnough(user)

    expect(result.value).toEqual(user)
  })

  test("isPasswordLongEnough@ returns Failure(...) if password is longer than 5 characters", async () => {
    const user = {
      username: "dwqdqwwqdwqdqwdwq",
      email: "valid_email@email.com",
      password: "a",
    }

    const result = await isPasswordLongEnough(user)

    expect(result.value[0]).toEqual({
      message: "Password must be at least 5 characters long",
      constraint: "min",
      field: "password",
    })
  })

  test("isPasswordNotTooLong@ returns Failure(...) if password is longer than 255 characters", async () => {
    const user = {
      username: "dwqdqwwqdwqdqwdwq",
      email: "valid_email@email.com",
      password: "a".repeat(256),
    }

    const result = await isPasswordNotTooLong(user)

    expect(result.value[0]).toEqual({
      message: "Password must be less 255 characters long",
      constraint: "max",
      field: "password",
    })
  })

  test("isPasswordNotTooLong@ returns Success(user) if password is less than 255 characters long", async () => {
    const user = {
      username: "dwqdqwwqdwqdqwdwq",
      email: "valid_email@email.com",
      password: "valid_password_123",
    }

    const result = await isPasswordNotTooLong(user)

    expect(result.value).toEqual(user)
  })

  test("rejects invalid emails", async () => {
    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate({
      email: "invalid_email",
      username: "john_doe",
      password: "123456",
    })

    expect(result.value[0].field).toBe("email")
    expect(result.value[0].constraint).toBe("email")
    expect(result.value[0].message).toBe("Email must be valid")
  })

  test("accepts valid emails", async () => {
    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const user = {
      email: "valid_email@email.com",
      username: "john_doe",
      password: "123456",
    }

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })

  test("rejects emails that are in use", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "john_doe",
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(user) },
    })

    const result = await validator.validate(user)

    expect(result.value[0]).toEqual({
      message: "Email already in use",
      constraint: "unique",
      field: "email",
    })
  })

  test("accepts emails that are not in use", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "john_doe",
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })

  test("rejects usernames that have less than 5 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "a",
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value[0]).toEqual({
      message: "Username must have at least 5 characters",
      constraint: "min",
      field: "username",
    })
  })

  test("accepts usernames that have at least 5 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_enough_username",
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })

  test("rejects usernames that have more than 255 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "huge_username".repeat(255),
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value[0]).toEqual({
      message: "Username can't be longer than 255 characters",
      constraint: "max",
      field: "username",
    })
  })

  test("accepts usernames that have less than 255 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_but_valid_username_123_abc",
      password: "123456",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })

  test("rejects password that are less than 5 characters long", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_but_valid_username_123_abc",
      password: "a",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value[0]).toEqual({
      message: "Password must be at least 5 characters long",
      constraint: "min",
      field: "password",
    })
  })

  test("accepts passwords that are longer than 5 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_but_valid_username_123_abc",
      password: "valid_password",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })

  test("rejects passwords that are longer than 255 characters", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_but_valid_username_123_abc",
      password: "invalid_password".repeat(255),
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value[0]).toEqual({
      message: "Password must be less 255 characters long",
      constraint: "max",
      field: "password",
    })
  })

  test("accepts passwords that less than 255 characters long", async () => {
    const user = {
      email: "valid_email@email.com",
      username: "long_but_valid_username_123_abc",
      password: "valid_password",
    }

    const validator = makeSignUpValidator({
      UserRepository: { findOne: _ => Promise.resolve(null) },
    })

    const result = await validator.validate(user)

    expect(result.value).toEqual(user)
  })
})
