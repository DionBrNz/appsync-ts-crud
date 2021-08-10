import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
import { IAuthenticatedUser } from './given'
import { CreateBookInput, handler as createBook } from '../../functions/createBook'
import { Book } from '../../lib/entities'
import { AppSyncEvent, AppSyncResult } from '../../lib/appsync'
import * as dotenv from 'dotenv'
import { Context } from 'aws-lambda'
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

export async function we_invoke_create_book(
  user: IAuthenticatedUser,
  title: string,
  description: string
): Promise<AppSyncResult<Book>> {
  const event: AppSyncEvent<CreateBookInput> = {
    arguments: {
      input: {
        title: title,
        description: description
      }
    },
    identity: {
      sub: user.id,
      email: user.email
    }
  }

  const context: Context = {
    functionName: 'test',
    callbackWaitsForEmptyEventLoop: false,
    functionVersion: '1',
    invokedFunctionArn: 'arn',
    memoryLimitInMB: '128MB',
    awsRequestId: '123',
    logGroupName: 'logGroup',
    logStreamName: 'streamName',
    identity: undefined,
    clientContext: undefined,
    getRemainingTimeInMillis: function () {
      return 100
    },
    done: function (error?: Error, result?: any) {},
    fail: function (error: Error | string) {},
    succeed: function (messageOrObject: any) {}
  }
  return await createBook(event, context)
}
