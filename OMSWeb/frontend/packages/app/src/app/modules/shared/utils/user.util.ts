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

export function validateUserData(
  existUsers: { userId: string }[],
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
    return (
      validateUserId(existUsers, userId)
      && validateFirstName(firstName)
      && validateLastName(lastName)
      && validateEmail(email)
      && validatePassword(password)
      && validateRole(existRoles, role)
    )
  }
}

function validateRole(existRoles: IPermission[], role: string) {
  return role.length >= UserDataRestriction.Role.Minlength && role.length <= UserDataRestriction.Role.Maxlength && existRoles.some(existRole => existRole.name === role)
}

function validatePassword(password: string) {
  return password.length >= UserDataRestriction.Password.Minlength && password.length <= UserDataRestriction.Password.Maxlength
}

function validateEmail(email: string) {
  function validateEmailFormat(email: string) {
    const emailInput = document.createElement('input')
    emailInput.setAttribute('type', 'email')
    emailInput.value = email
    return emailInput.checkValidity()
  }

  return email.length >= UserDataRestriction.Email.Minlength && email.length <= UserDataRestriction.Email.Maxlength && validateEmailFormat(email)
}

function validateLastName(lastName: string) {
  return lastName.length >= UserDataRestriction.LastName.Minlength && lastName.length <= UserDataRestriction.LastName.Maxlength
}

export function validateUserId(existUsers: { userId: string }[], userId: string) {
  return userId.length >= UserDataRestriction.UserId.Minlength && userId.length <= UserDataRestriction.UserId.Maxlength && !existUsers.some(existUser => existUser.userId === userId)
}

function validateFirstName(firstName: string) {
  return firstName.length >= UserDataRestriction.FirstName.Minlength && firstName.length <= UserDataRestriction.FirstName.Maxlength
}
