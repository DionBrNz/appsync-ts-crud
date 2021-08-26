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

export type UpdateBookInput = {
  id: string
  title: string
  description: string
}

export async function handler(event: AppSyncEvent<UpdateBookInput>, context: Context): Promise<AppSyncResult<Book>> {
  try {
    logger.withRequest(event, context)

    const { id, title, description } = event.arguments.input
    const userId = event.identity.sub
    try {
      const { Attributes: item } = await dynamoDocument.update({
        TableName: BOOKS_TABLE_NAME,
        Key: { id: id },
        UpdateExpression: 'set #title = :title, #description = :description, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
        ConditionExpression: 'attribute_exists(id)',
        ExpressionAttributeValues: {
          ':title': title,
          ':description': description,
          ':updatedAt': new Date().toISOString(),
          ':updatedBy': userId
        },
        ExpressionAttributeNames: {
          '#title': 'title',
          '#description': 'description',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy'
        },
        ReturnValues: 'ALL_NEW'
      })

      const book: Book = item as Book
      logger.info({ book }, 'Book updated')
      return {
        data: book,
        errorInfo: null,
        errorMessage: null,
        errorType: null
      }
    } catch (error) {
      if (error.name == 'ConditionalCheckFailedException') {
        throw new AppSyncError('Book not found', 'NotFound', { bookId: id })
      }
      throw error
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
