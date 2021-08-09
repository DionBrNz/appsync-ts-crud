import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
import * as dotenv from 'dotenv'
dotenv.config()

const { AWS_REGION, WEB_USER_POOL_CLIENT_ID, COGNITO_USER_POOL_ID } = process.env
const cognito = new CognitoIdentityProvider({})

export interface ICognitoUser {
  id: string
  email: string
}
export async function a_user_signs_up(email: string, password: string): Promise<ICognitoUser> {
  const { UserSub: id } = await cognito.signUp({
    Username: email,
    Password: password,
    ClientId: WEB_USER_POOL_CLIENT_ID
  })

  expect(id).toBeTruthy()

  console.log({ email, id }, 'User has signed up')

  await cognito.adminConfirmSignUp({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: email
  })

  console.log({ email, id }, 'Confirmed sign up')

  return { id: id!, email: email }
}
