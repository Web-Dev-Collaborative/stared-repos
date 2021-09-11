const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'

const docs = [
  { _id: 'qwertyu', idx: 'q' },
  { _id: 'asdfgh', idx: 'a' }
]

test('set up as per issue #535', async function (t) {
  t.plan(7)

  const { PUT, QUERY, FLUSH } = await si({
    name: sandbox + '535'
  })
  t.ok(PUT)

  t.deepEquals(await PUT(docs), [
    { _id: 'qwertyu', status: 'CREATED', operation: 'PUT' },
    { _id: 'asdfgh', status: 'CREATED', operation: 'PUT' }
  ])

  t.deepEquals(await QUERY({
    SEARCH: ['q']
  }), {
    RESULT: [
      { _id: 'qwertyu', _match: ['idx:q#1.00'], _score: 1.1 }
    ],
    RESULT_LENGTH: 1
  })

  t.ok(await FLUSH())

  t.deepEquals(await QUERY({
    SEARCH: ['q']
  }), {
    RESULT: [],
    RESULT_LENGTH: 0
  })

  t.deepEquals(await PUT(docs), [
    { _id: 'qwertyu', status: 'CREATED', operation: 'PUT' },
    { _id: 'asdfgh', status: 'CREATED', operation: 'PUT' }
  ])

  t.deepEquals(await QUERY({
    SEARCH: ['q']
  }), {
    RESULT: [
      { _id: 'qwertyu', _match: ['idx:q#1.00'], _score: 1.1 }
    ],
    RESULT_LENGTH: 1
  })
})
