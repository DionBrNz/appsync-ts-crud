import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
import { IAuthenticatedUser } from './given'
import { CreateBookInput, handler as createBook } from '../../functions/createBook'
import { UpdateBookInput, handler as updateBook } from '../../functions/updateBook'
import { DeleteBookInput, handler as deleteBook } from '../../functions/deleteBook'
import { GetBookInput, handler as getBook } from '../../functions/getBook'
import { Book } from '../../lib/entities'
import { AppSyncEvent, AppSyncResult } from '../../lib/appsync'
import * as dotenv from 'dotenv'
import { Context } from 'aws-lambda'
import { gql, GraphQLClient } from 'graphql-request'
dotenv.config()

const { AWS_REGION, WEB_USER_POOL_CLIENT_ID, COGNITO_USER_POOL_ID, API_URL } = process.env
const cognito = new CognitoIdentityProvider({})
const graphQLClient = new GraphQLClient(API_URL)

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
    identity: getIdentity(user)
  }

  const context = getTestContext()
  return await createBook(event, context)
}

export async function we_invoke_update_book(
  user: IAuthenticatedUser,
  bookId: string,
  title: string,
  description: string
): Promise<AppSyncResult<Book>> {
  const event: AppSyncEvent<UpdateBookInput> = {
    arguments: {
      input: {
        id: bookId,
        title: title,
        description: description
      }
    },
    identity: getIdentity(user)
  }

  const context = getTestContext()
  return await updateBook(event, context)
}

export async function we_invoke_delete_book(user: IAuthenticatedUser, bookId: string): Promise<AppSyncResult<Book>> {
  const event: AppSyncEvent<DeleteBookInput> = {
    arguments: {
      input: {
        id: bookId
      }
    },
    identity: getIdentity(user)
  }

  const context = getTestContext()
  return await deleteBook(event, context)
}

export async function we_invokde_get_book(user: IAuthenticatedUser, bookId: string): Promise<AppSyncResult<Book>> {
  const event: AppSyncEvent<GetBookInput> = {
    arguments: {
      input: {
        id: bookId
      }
    },
    identity: getIdentity(user)
  }

  const context = getTestContext()
  return await getBook(event, context)
}

export async function a_user_calls_create_book(user: IAuthenticatedUser, title: string, description: string): Promise<Book> {
  const mutation = gql`
    mutation CreateBook($title: String!, $description: String!) {
      createBook(input: { title: $title, description: $description }) {
        id
        title
        description
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `

  const variables: CreateBookInput = {
    title: title,
    description: description
  }

  const headers = {
    authorization: user.idToken
  }

  const data = await graphQLClient.request(mutation, variables, headers)
  return data.createBook
}

export async function a_user_calls_update_book(
  user: IAuthenticatedUser,
  bookId: string,
  title: string,
  description: string
): Promise<Book> {
  const mutation = gql`
    mutation UpdateBook($id: ID!, $title: String!, $description: String!) {
      updateBook(input: { id: $id, title: $title, description: $description }) {
        id
        title
        description
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `

  const variables: UpdateBookInput = {
    id: bookId,
    title: title,
    description: description
  }

  const headers = {
    authorization: user.idToken
  }

  const data = await graphQLClient.request(mutation, variables, headers)
  return data.updateBook
}

export async function a_user_calls_delete_book(user: IAuthenticatedUser, bookId: string): Promise<Book> {
  const mutation = gql`
    mutation DeleteBook($id: ID!) {
      deleteBook(input: { id: $id }) {
        id
        title
        description
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `

  const variables: DeleteBookInput = {
    id: bookId
  }

  const headers = {
    authorization: user.idToken
  }

  const data = await graphQLClient.request(mutation, variables, headers)
  return data.deleteBook
}

function getTestContext(): Context {
  return {
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
}

function getIdentity(user: IAuthenticatedUser) {
  return {
    sub: user.id,
    email: user.email
  }
}
