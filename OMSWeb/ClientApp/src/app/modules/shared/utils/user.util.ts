import { IPermission } from "@oms/root/models/user.model"

export const UserDataRestriction = {
  UserId: {
    Minlength: 1,
    Maxlength: 64,
  },
  FirstName: {
    Minlength: 1,
    Maxlength: 32,
  },
  LastName: {
    Minlength: 1,
    Maxlength: 32,
  },
  Email: {
    Minlength: 5,
    Maxlength: 64,
  },
  Password: {
    Minlength: 4,
    Maxlength: 64
  },
  Role: {
    Minlength: 1,
    Maxlength: 64
  }
}

function validateEmail(email: string) {
  const emailInput = document.createElement('input')
  emailInput.setAttribute('type', 'email')
  emailInput.value = email
  return emailInput.checkValidity()
}

export function validateUserData(
  existRoles: IPermission[],
  userId?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  password?: string,
  role?: string,
) {
  if ([userId, firstName, lastName, email, password, role].every(value => typeof (value) === "string") === false)
    return false
  else {
    const isValidUserId = userId.length >= UserDataRestriction.UserId.Minlength && userId.length <= UserDataRestriction.UserId.Maxlength
    const isValidFirstName = firstName.length >= UserDataRestriction.FirstName.Minlength && firstName.length <= UserDataRestriction.FirstName.Maxlength
    const isValidLastName = lastName.length >= UserDataRestriction.LastName.Minlength && lastName.length <= UserDataRestriction.LastName.Maxlength
    const isValidEmail = email.length >= UserDataRestriction.Email.Minlength && email.length <= UserDataRestriction.Email.Maxlength && validateEmail(email)
    const isValidPassword = password.length >= UserDataRestriction.Password.Minlength && password.length <= UserDataRestriction.Password.Maxlength
    const isValidRole = role.length >= UserDataRestriction.Role.Minlength && role.length <= UserDataRestriction.Role.Maxlength && existRoles.some(existRole => existRole.name === role)

    return (
      isValidUserId
      && isValidFirstName
      && isValidLastName
      && isValidEmail
      && isValidPassword
      && isValidRole
    )
  }
}
