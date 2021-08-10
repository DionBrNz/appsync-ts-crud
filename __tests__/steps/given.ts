import { Chance } from 'chance'
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
import pino from 'pino'

const chance = new Chance()
const cognito = new CognitoIdentityProvider({})
const logger = pino()

const { WEB_USER_POOL_CLIENT_ID, COGNITO_USER_POOL_ID } = process.env

export interface IUser {
  email: string
  password: string
}

export interface IAuthenticatedUser {
  id: string
  email: string
  idToken: string
  accessToken: string
}

export function a_random_user(): IUser {
  const firstName = chance.first({ nationality: 'en' })
  const lastName = chance.first({ nationality: 'en' })
  const suffix = chance.string({ length: 4, pool: 'abcdefghijklmnopqrstuvwxyz' })
  const password = chance.string({ length: 8 })
  const email = `dion.net+${firstName}-${lastName}-${suffix}@gmail.com`

  return {
    email: email,
    password: password
  }
}

export async function an_authenticated_user(): Promise<IAuthenticatedUser> {
  const { email, password } = a_random_user()

  const { UserSub: id } = await cognito.signUp({
    Username: email,
    Password: password,
    ClientId: WEB_USER_POOL_CLIENT_ID
  })

  logger.info({ email, id }, 'User signed up')

  await cognito.adminConfirmSignUp({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: email
  })

  logger.info({ email, id }, 'User confirmed up')

  const auth = await cognito.initiateAuth({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: WEB_USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  })

  logger.info({ email, id }, 'Signed in')

  const user: IAuthenticatedUser = {
    id: id!,
    email: email,
    accessToken: auth.AuthenticationResult!.AccessToken!,
    idToken: auth.AuthenticationResult!.AccessToken!
  }

  return user
}
