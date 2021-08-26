import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import lambdaLogger from 'pino-lambda'
import { Book } from '../lib/entities'
import { Context } from 'aws-lambda'
import { AppSyncEvent, AppSyncResult, AppSyncError } from '../lib/appsync'

const { BOOKS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({})
const dynamoDocument = DynamoDBDocument.from(dynamoClient)
const logger = lambdaLogger()

export type DeleteBookInput = {
  id: string
}

export async function handler(event: AppSyncEvent<DeleteBookInput>, context: Context): Promise<AppSyncResult<Book>> {
  try {
    logger.withRequest(event, context)
    logger.info('Starting - Delete')

    const { id } = event.arguments.input
    const { Attributes: item } = await dynamoDocument.delete({
      TableName: BOOKS_TABLE_NAME,
      Key: { id: id },
      ReturnValues: 'ALL_OLD'
    })

    if (!item) {
      throw new AppSyncError('Book not found', 'NotFound', { bookId: id })
    }

    const book: Book = item as Book
    logger.info({ book }, 'Deleted')
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
