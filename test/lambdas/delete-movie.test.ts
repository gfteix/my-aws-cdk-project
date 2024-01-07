import { deleteMovie } from '../../src/lambdas/delete-movie'
import { mockedContext } from '../mocks/mock-context'
import { mockedEvent } from '../mocks/mock-event'
import { mockClient } from 'aws-sdk-client-mock'
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const context = mockedContext

describe('Delete movie test', () => {
  process.env.MOVIE_TABLE_URL = 'Movies-Local'
  const ddbMock = mockClient(DynamoDBDocumentClient)

  it('Should delete movie accordingly', async () => {
    ddbMock.on(DeleteCommand).resolves({})

    const body = undefined
    const pathParameters = { id: 'id' }

    const event = mockedEvent(body, pathParameters)
    const response = await deleteMovie(event, context)

    expect(response).toEqual({
      body: '{"message":"Movie with id id successfully deleted"}',
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 202
    })
  })

  it('Should return 500 internal server error if any errors happens while deleting a movie', async () => {
    ddbMock.on(DeleteCommand).rejects({})

    const body = undefined
    const pathParameters = { id: 'id' }

    const event = mockedEvent(body, pathParameters)
    const response = await deleteMovie(event, context)

    expect(response).toEqual({
      body: '{"message":"Internal Error - {}"}',
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 500
    })
  })
})
