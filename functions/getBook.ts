import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { ulid } from 'ulid'
import { Book } from '../lib/entities'
import { AppSyncError, AppSyncEvent, AppSyncResult } from '../lib/appsync'
import lambdaLogger from 'pino-lambda'
import { Context } from 'aws-lambda'

const { BOOKS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({})
const dynamoDocument = DynamoDBDocument.from(dynamoClient)
const logger = lambdaLogger()

export type GetBookInput = {
  id: string
}

export async function handler(event: AppSyncEvent<GetBookInput>, contex: Context): Promise<AppSyncResult<Book>> {
  try {
    logger.withRequest(event, contex)
    logger.info('Starting - Getting book')

    const { id } = event.arguments.input
    const userId = event.identity.sub

    logger.info({ id, userId }, 'Getting Book')

    const { Item: item } = await dynamoDocument.get({
      TableName: BOOKS_TABLE_NAME,
      Key: { id: id }
    })

    if (!item) {
      throw new AppSyncError('Book not found', 'NotFound', { bookId: id })
    }

    const book: Book = item as Book
    logger.info({ book }, 'Book found')

    return {
      data: book,
      errorInfo: null,
      errorMessage: null,
      errorType: null
    }
  } catch (error) {
    logger.error({ error }, error.name)
    if (error instanceof AppSyncError) {
      return {
        data: null,
        errorInfo: error.info,
        errorMessage: error.message,
        errorType: error.type
      }
    }
    throw error
  }
}
