import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { ulid } from 'ulid'
import { Book } from '../lib/entities'
import { AppSyncEvent, AppSyncResult } from '../lib/appsync'
import lambdaLogger from 'pino-lambda'
import { Context } from 'aws-lambda'

//const { BOOKS_TABLE_NAME } = process.env
//const dynamoClient = new DynamoDBClient({})
//const dynamoDocument = DynamoDBDocument.from(dynamoClient)
const logger = lambdaLogger()

export type CreateBookInput = {
  title: string
  description: string
}

export async function handler(event: AppSyncEvent<CreateBookInput>, contex: Context): Promise<AppSyncResult<Book>> {
  logger.withRequest(event, contex)
  logger.info('Starting')

  //const { title, description } = event.arguments.input
  //const now = new Date().toISOString()
  //
  //const book: Book = {
  //  id: ulid(),
  //  title: title,
  //  description: description,
  //  createdAt: now,
  //  updatedAt: now,
  //  createdBy: event.identity.sub,
  //  updatedBy: event.identity.sub
  //}

  logger.info('Saving book')

  /*await dynamoDocument.put({
    TableName: BOOKS_TABLE_NAME,
    Item: book
  })*/

  logger.info('Book saved')

  return {
    data: null,
    errorInfo: null,
    errorMessage: null,
    errorType: null
  }
}
