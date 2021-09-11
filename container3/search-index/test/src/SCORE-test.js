const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'
const indexName = sandbox + '_SCORE'

test('create a search index', t => {
  t.plan(1)
  si({ name: indexName }).then(db => {
    global[indexName] = db
    t.pass('ok')
  })
})

test('can add data', t => {
  const data = [
    {
      _id: 0,
      make: 'Tesla',
      manufacturer: 'Volvo',
      brand: 'Volvo',
      price: 3000
    },
    {
      _id: 1,
      make: 'BMW',
      manufacturer: 'Volvo',
      brand: 'Volvo',
      price: 12000
    },
    {
      _id: 2,
      make: 'Tesla',
      manufacturer: 'Tesla',
      brand: 'Volvo',
      price: 14000
    },
    {
      _id: 3,
      make: 'Tesla',
      manufacturer: 'Volvo',
      brand: 'BMW',
      price: 140000
    },
    {
      _id: 4,
      make: 'Volvo',
      manufacturer: 'Volvo',
      brand: 'Volvo',
      price: 1000
    },
    {
      _id: 5,
      make: 'Volvo',
      manufacturer: 'Tesla',
      brand: 'Volvo',
      price: 2000
    },
    {
      _id: 6,
      make: 'Tesla',
      manufacturer: 'Tesla',
      brand: 'BMW',
      price: 500
    },
    {
      _id: 7,
      make: 'BMW',
      manufacturer: 'Tesla',
      brand: 'Tesla',
      price: 5000
    },
    {
      _id: 8,
      make: 'Volvo',
      manufacturer: 'BMW',
      brand: 'Tesla',
      price: 100
    },
    {
      _id: 9,
      make: 'BMW',
      manufacturer: 'Tesla',
      brand: 'Volvo',
      price: 1000
    }
  ]

  t.plan(1)
  global[indexName].PUT(data).then(t.pass)
})

test('_SCORE TFIDF', t => {
  t.plan(1)
  global[indexName]._SEARCH('tesla').then(
    docs => global[indexName]._SCORE(docs, 'TFIDF')
  ).then(res => {
    t.deepEqual(res, [
      { _id: '2', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
      { _id: '6', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
      { _id: '7', _match: ['brand:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
      { _id: '0', _match: ['make:tesla#1.00'], _score: 0.32 },
      { _id: '3', _match: ['make:tesla#1.00'], _score: 0.32 },
      { _id: '5', _match: ['manufacturer:tesla#1.00'], _score: 0.32 },
      { _id: '8', _match: ['brand:tesla#1.00'], _score: 0.32 },
      { _id: '9', _match: ['manufacturer:tesla#1.00'], _score: 0.32 }
    ])
  })
})

test('SCORE TFIDF JSON', t => {
  t.plan(1)
  global[indexName].QUERY({
    SEARCH: ['tesla']
  }, {
    SCORE: 'TFIDF'
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        { _id: '2', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
        { _id: '6', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
        { _id: '7', _match: ['brand:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 0.64 },
        { _id: '0', _match: ['make:tesla#1.00'], _score: 0.32 },
        { _id: '3', _match: ['make:tesla#1.00'], _score: 0.32 },
        { _id: '5', _match: ['manufacturer:tesla#1.00'], _score: 0.32 },
        { _id: '8', _match: ['brand:tesla#1.00'], _score: 0.32 },
        { _id: '9', _match: ['manufacturer:tesla#1.00'], _score: 0.32 }
      ],
      RESULT_LENGTH: 8
    })
  })
})

test('SCORE SUM JSON', t => {
  t.plan(1)
  global[indexName].QUERY({
    SEARCH: ['tesla']
  }, {
    SCORE: 'SUM'
  }).then(({ RESULT }) => {
    t.deepEqual(RESULT, [
      { _id: '2', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 2 },
      { _id: '6', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 2 },
      { _id: '7', _match: ['brand:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 2 },
      { _id: '0', _match: ['make:tesla#1.00'], _score: 1 },
      { _id: '3', _match: ['make:tesla#1.00'], _score: 1 },
      { _id: '5', _match: ['manufacturer:tesla#1.00'], _score: 1 },
      { _id: '8', _match: ['brand:tesla#1.00'], _score: 1 },
      { _id: '9', _match: ['manufacturer:tesla#1.00'], _score: 1 }
    ])
  })
})

test('SCORE PRODUCT JSON', t => {
  t.plan(1)
  global[indexName].QUERY({
    SEARCH: ['tesla']
  }, {
    SCORE: 'PRODUCT'
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        { _id: '2', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 1 },
        { _id: '6', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 1 },
        { _id: '7', _match: ['brand:tesla#1.00', 'manufacturer:tesla#1.00'], _score: 1 },
        { _id: '0', _match: ['make:tesla#1.00'], _score: 1 },
        { _id: '3', _match: ['make:tesla#1.00'], _score: 1 },
        { _id: '5', _match: ['manufacturer:tesla#1.00'], _score: 1 },
        { _id: '8', _match: ['brand:tesla#1.00'], _score: 1 },
        { _id: '9', _match: ['manufacturer:tesla#1.00'], _score: 1 }
      ],
      RESULT_LENGTH: 8
    })
  })
})

test('SCORE CONCAT JSON', t => {
  t.plan(1)
  global[indexName].QUERY({
    AND: ['tesla']
  }, {
    SCORE: 'CONCAT'
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        { _id: '0', _match: ['make:tesla#1.00'], _score: '1.00' },
        { _id: '2', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: '1.001.00' },
        { _id: '3', _match: ['make:tesla#1.00'], _score: '1.00' },
        { _id: '5', _match: ['manufacturer:tesla#1.00'], _score: '1.00' },
        { _id: '6', _match: ['make:tesla#1.00', 'manufacturer:tesla#1.00'], _score: '1.001.00' },
        { _id: '7', _match: ['brand:tesla#1.00', 'manufacturer:tesla#1.00'], _score: '1.001.00' },
        { _id: '8', _match: ['brand:tesla#1.00'], _score: '1.00' },
        { _id: '9', _match: ['manufacturer:tesla#1.00'], _score: '1.00' }
      ],
      RESULT_LENGTH: 8
    })
  })
})
