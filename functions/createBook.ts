import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { ulid } from 'ulid'
import { Book } from '../lib/entities'
import { AppSyncEvent, AppSyncResult } from '../lib/appsync'

const { BOOKS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({})
const dynamoDocument = DynamoDBDocument.from(dynamoClient)

export type CreateBookInput = {
  title: string
  description: string
}

export async function handler(event: AppSyncEvent<CreateBookInput>, contex: any): Promise<AppSyncResult<Book>> {
  const { title, description } = event.arguments.input
  const now = new Date().toISOString()

  const book: Book = {
    id: ulid(),
    title: title,
    description: description,
    createdAt: now
  }

  await dynamoDocument.put({
    TableName: BOOKS_TABLE_NAME,
    Item: book
  })

  return {
    data: book,
    errorInfo: null,
    errorMessage: null,
    errorType: null
  }
}
