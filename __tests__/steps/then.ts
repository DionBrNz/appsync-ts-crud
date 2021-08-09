import * as dotenv from 'dotenv'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { User } from '../../lib/entities'
dotenv.config()

export async function user_exists_in_users_table(id: string): Promise<User> {
  const dynamodbClient = new DynamoDBClient({})
  const dynamodb = DynamoDBDocument.from(dynamodbClient)
  console.log(`Looking for user [${id}] in table [${process.env.USERS_TABLE_NAME}]`)

  const { Item: item } = await dynamodb.get({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { id: id }
  })

  return item as User
}
