import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Book } from '../lib/entities'
import { AppSyncError, AppSyncEvent, AppSyncResult } from '../lib/appsync'
import lambdaLogger from 'pino-lambda'
import { Context } from 'aws-lambda'

const { BOOKS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({})
const dynamoDocument = DynamoDBDocument.from(dynamoClient)
const logger = lambdaLogger()

export type ListBooksInput = {
  limit?: number | null
  nextToken?: string | null
}

export type ListBooksResult = {
  books: Book[]
  nextToken: string | null
}

export async function handler(event: AppSyncEvent<ListBooksInput>, context: Context): Promise<AppSyncResult<ListBooksResult>> {
  try {
    logger.withRequest(event, context)

    let { nextToken } = event.arguments.input
    const userId = event.identity.sub

    let startToken: JSON | undefined = undefined

    if (nextToken) {
      startToken = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'))
    }

    const { Items: items, LastEvaluatedKey: lastEvaluatedKey } = await dynamoDocument.query({
      TableName: BOOKS_TABLE_NAME,
      Limit: event.arguments.input.limit ?? 10,
      ScanIndexForward: false,
      ConsistentRead: false,
      Select: 'ALL_ATTRIBUTES',
      ExclusiveStartKey: startToken
    })

    const books: Book[] = items as Book[]
    logger.info(`Found ${books.length} books`)

    let _nextToken: string | null = null
    if (lastEvaluatedKey) {
      _nextToken = Buffer.from(JSON.stringify(lastEvaluatedKey), 'utf8').toString('base64')
    }

    const result: ListBooksResult = {
      books: books,
      nextToken: _nextToken
    }

    return {
      data: result,
      errorInfo: null,
      errorMessage: null,
      errorType: null
    }
  } catch (error) {
    logger.error({ error }, error.name)
    throw error
  }
}
