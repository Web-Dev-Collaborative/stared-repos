const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'
const indexName = sandbox + 'indexing-test'

const data = [
  {
    _id: 'a',
    title: 'quite a cool document',
    body: {
      text: 'this document is really cool cool cool',
      metadata: 'coolness documentness'
    },
    importantNumber: 5000
  },
  {
    _id: 'b',
    title: 'quite a cool document',
    body: {
      text: 'this document is really cool bananas',
      metadata: 'coolness documentness'
    },
    importantNumber: 500
  },
  {
    _id: 'c',
    title: 'something different',
    body: {
      text: 'something totally different',
      metadata: 'coolness documentness'
    },
    importantNumber: 200
  }
]

test('create a search index', t => {
  t.plan(1)
  si({ name: indexName }).then(db => {
    global[indexName] = db
    t.pass('ok')
  })
})

test('can add some data', t => {
  t.plan(1)
  global[indexName].PUT(data).then(() => {
    t.pass('ok')
  })
})

// should be able to get non-tokenised (readable) version of object out of index
test('can search', t => {
  t.plan(1)
  global[indexName]._SEARCH(
    'body.text:cool',
    'body.text:really',
    'body.text:bananas'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'b',
        _match: [
          'body.text:cool#1.00',
          'body.text:really#1.00',
          'body.text:bananas#1.00'
        ],
        _score: 4.16
      }
    ])
  })
})

// should be able to get non-tokenised (readable) version of object out of index
test('can search with QUERY', t => {
  t.plan(1)
  global[indexName].QUERY({
    SEARCH: [
      'body.text:cool',
      'body.text:really',
      'body.text:bananas'
    ]
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        {
          _id: 'b',
          _match: [
            'body.text:cool#1.00',
            'body.text:really#1.00',
            'body.text:bananas#1.00'
          ],
          _score: 4.16
        }
      ],
      RESULT_LENGTH: 1
    })
  })
})

test('can search in any field', t => {
  t.plan(1)
  global[indexName]._SEARCH(
    'cool',
    'really',
    'bananas'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'b',
        _match: [
          'body.text:cool#1.00',
          'title:cool#1.00',
          'body.text:really#1.00',
          'body.text:bananas#1.00'],
        _score: 5.55
      }
    ])
  })
})

test('can do 0-hit', t => {
  t.plan(1)
  global[indexName]._SEARCH(
    'cool',
    'really',
    'sdasdadsasd',
    'bananas'
  ).then(res => {
    t.deepEqual(res, [])
  })
})

test('can do a mixture of fielded search and any-field search', t => {
  t.plan(1)
  global[indexName]._SEARCH(
    'title:cool',
    'documentness'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: ['title:cool#1.00', 'body.metadata:documentness#1.00'],
        _score: 1.39
      },
      {
        _id: 'b',
        _match: ['title:cool#1.00', 'body.metadata:documentness#1.00'],
        _score: 1.39
      }
    ])
  })
})

// test('can _SEARCH by numeric value (and return DOCUMENT)', t => {
//   t.plan(1)
//   global[indexName]._SEARCH(
//     '500'
//   ).then(global[indexName].DOCUMENTS)
//     .then(res => {
//       t.deepEqual(res, [
//         { _id: 'b', _match: ['importantnumber:500#1.00'], _score: 1.39, _doc: { _id: 'b', title: 'quite a cool document', body: { text: 'this document is really cool bananas', metadata: 'coolness documentness' }, importantNumber: 500 } }
//       ])
//     })
// })

test('can _OR by numeric value and _SORT by numeric value', t => {
  t.plan(1)
  global[indexName]._OR(
    '500',
    '200'
  ).then(
    resultSet => global[indexName]._SORT(resultSet, {
      FIELD: '_match.importantnumber',
      TYPE: 'NUMERIC',
      DIRECTION: 'ASCENDING'
    })
  ).then(res => {
    t.deepEqual(res, [
      { _id: 'c', _match: ['importantnumber:200#1.00'] },
      { _id: 'b', _match: ['importantnumber:500#1.00'] }
    ])
  })
})

// _OR-ing
test('can search by numeric value and _OR with one term on any field', t => {
  t.plan(1)
  global[indexName]._OR(
    '200',
    'importantnumber:5000'
  ).then(res => t.deepEqual(res, [
    {
      _id: 'c',
      _match: ['importantnumber:200#1.00']
    },
    {
      _id: 'a',
      _match: ['importantnumber:5000#1.00']
    }
  ]))
})

test('can _GET', t => {
  t.plan(1)
  global[indexName]._GET(
    'body.text:cool'
  ).then(res => t.deepEqual(res, [
    {
      _id: 'a', _match: ['body.text:cool#1.00']
    },
    {
      _id: 'b', _match: ['body.text:cool#1.00']
    }
  ]))
})

test('can _GET with no field specified', t => {
  t.plan(1)
  global[indexName]._GET(
    'cool'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: [
          'body.text:cool#1.00',
          'title:cool#1.00'
        ]
      },
      {
        _id: 'b',
        _match: [
          'body.text:cool#1.00',
          'title:cool#1.00'
        ]
      }
    ])
  })
})

test('can _AND', t => {
  t.plan(1)
  global[indexName]._AND(
    'body.text:really',
    'body.metadata:coolness'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: [
          'body.text:really#0.33',
          'body.metadata:coolness#1.00'
        ]
      },
      {
        _id: 'b',
        _match: [
          'body.text:really#1.00',
          'body.metadata:coolness#1.00'
        ]
      }
    ])
  })
})

test('can _AND with embedded _OR', t => {
  t.plan(1)
  global[indexName]._AND(
    global[indexName]._OR('title:quite', 'body.text:different'),
    'body.metadata:coolness'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: [
          'title:quite#1.00',
          'body.metadata:coolness#1.00'
        ]
      },
      {
        _id: 'b',
        _match: [
          'title:quite#1.00',
          'body.metadata:coolness#1.00'
        ]
      },
      {
        _id: 'c',
        _match: [
          'body.text:different#1.00',
          'body.metadata:coolness#1.00'
        ]
      }
    ])
  })
})

test('can _AND with embedded _OR and embedded _AND', t => {
  t.plan(1)
  global[indexName]._AND(
    global[indexName]._OR(
      'title:quite',
      global[indexName]._AND(
        'body.text:totally',
        'body.text:different'
      )
    ),
    'body.metadata:coolness'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: ['title:quite#1.00', 'body.metadata:coolness#1.00']
      },
      {
        _id: 'b',
        _match: ['title:quite#1.00', 'body.metadata:coolness#1.00']
      },
      {
        _id: 'c',
        _match: [
          'body.text:totally#1.00',
          'body.text:different#1.00',
          'body.metadata:coolness#1.00']
      }
    ])
  })
})

test('can _NOT', t => {
  t.plan(1)
  global[indexName]._NOT(
    'cool',
    'bananas'
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'a',
        _match: [
          'body.text:cool#1.00',
          'title:cool#1.00'
        ]
      }
    ])
  })
})

test('can _OR', t => {
  t.plan(1)
  global[indexName]._OR('body.text:bananas', 'body.text:different')
    .then(res => {
      t.deepEqual(res, [
        {
          _id: 'b',
          _match: [
            'body.text:bananas#1.00'
          ]
        }, {
          _id: 'c',
          _match: [
            'body.text:different#1.00'
          ]
        }
      ])
    })
})

test('_AND with embedded _OR', t => {
  t.plan(1)
  global[indexName]._AND(
    'bananas',
    global[indexName]._OR('body.text:cool', 'body.text:coolness')
  ).then(res => {
    t.deepEqual(res, [
      { _id: 'b', _match: ['body.text:bananas#1.00', 'body.text:cool#1.00'] }
    ])
  })
})

test('AND with embedded OR (JSON API)', t => {
  t.plan(1)
  global[indexName].QUERY({
    AND: ['bananas']
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        { _id: 'b', _match: ['body.text:bananas#1.00'] }
      ],
      RESULT_LENGTH: 1
    })
  })
})

test('AND with embedded OR (JSON API)', t => {
  t.plan(1)
  global[indexName].QUERY({
    AND: ['bananas', { OR: ['body.text:cool', 'body.text:coolness'] }]
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        { _id: 'b', _match: ['body.text:bananas#1.00', 'body.text:cool#1.00'] }
      ],
      RESULT_LENGTH: 1
    })
  })
})

test('DOCUMENT (JSON API)', t => {
  t.plan(1)
  global[indexName].QUERY({
    DOCUMENTS: ['b', 'a']
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        {
          _id: 'b',
          title: 'quite a cool document',
          body: {
            text: 'this document is really cool bananas',
            metadata: 'coolness documentness'
          },
          importantNumber: 500
        }, {
          _id: 'a',
          title: 'quite a cool document',
          body: {
            text: 'this document is really cool cool cool',
            metadata: 'coolness documentness'
          },
          importantNumber: 5000
        }
      ],
      RESULT_LENGTH: 2
    })
  })
})

// TODO: I think DOCUMENT should behave differently here
// this should be a SEARCH should it not?
test('QUERY with a string and then connect documents', t => {
  t.plan(1)
  global[indexName].QUERY('bananas', { DOCUMENTS: true }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        {
          _id: 'b',
          _match: ['body.text:bananas#1.00'],
          _doc: {
            _id: 'b',
            title: 'quite a cool document',
            body: {
              text: 'this document is really cool bananas',
              metadata: 'coolness documentness'
            },
            importantNumber: 500
          }
        }
      ],
      RESULT_LENGTH: 1
    })
  })
})

test('_AND with embedded _OR', t => {
  t.plan(1)
  global[indexName]._AND(
    global[indexName]._OR('bananas', 'different'),
    global[indexName]._OR('cool', 'coolness')
  ).then(res => {
    t.deepEqual(res, [
      {
        _id: 'b',
        _match: [
          'body.text:bananas#1.00',
          'body.text:cool#1.00',
          'title:cool#1.00',
          'body.metadata:coolness#1.00']
      },
      {
        _id: 'c',
        _match: [
          'body.text:different#1.00',
          'title:different#1.00',
          'body.metadata:coolness#1.00']
      }
    ])
  })
})

test('can _GET range with one value', t => {
  t.plan(1)
  global[indexName]._GET({
    VALUE: {
      GTE: 'cool',
      LTE: 'cool'
    }
  }).then(res => t.deepEqual(res, [
    {
      _id: 'a', _match: ['body.text:cool#1.00', 'title:cool#1.00']
    },
    {
      _id: 'b', _match: ['body.text:cool#1.00', 'title:cool#1.00']
    }
  ]))
})

test('can _GET range with a range of values', t => {
  t.plan(1)
  global[indexName]._GET({
    VALUE: {
      GTE: 'cool',
      LTE: 'coolness'
    }
  }).then(res => t.deepEqual(res, [
    {
      _id: 'a',
      _match: ['body.metadata:coolness#1.00',
        'body.text:cool#1.00', 'title:cool#1.00']
    },
    {
      _id: 'b',
      _match: ['body.metadata:coolness#1.00',
        'body.text:cool#1.00', 'title:cool#1.00']
    },
    { _id: 'c', _match: ['body.metadata:coolness#1.00'] }
  ]))
})

// TODO: FIX. This test seems to be giving inconsistent results between browser and node
test('_SEARCH with embedded _OR', t => {
  t.plan(1)
  global[indexName]._SEARCH(
    global[indexName]._OR('bananas', 'different'),
    'coolness'
  ).then(res => {
    t.deepEqual(res, [
      { _id: 'c', _match: ['body.text:different#1.00', 'title:different#1.00', 'body.metadata:coolness#1.00'], _score: 2.08 },
      { _id: 'b', _match: ['body.text:bananas#1.00', 'body.metadata:coolness#1.00'], _score: 1.39 }
    ])
  })
})

test('DICTIONARY with specified field', t => {
  t.plan(1)
  global[indexName].DICTIONARY('body.text').then(res => {
    global[indexName].DICTIONARY({ FIELD: ['body.text'] }).then(res => {
      t.deepEqual(res, [
        'bananas',
        'cool',
        'different',
        'document',
        'is',
        'really',
        'something',
        'this',
        'totally'
      ])
    })
  })
})

test('DICTIONARY with specified field (JSON API)', t => {
  t.plan(1)
  global[indexName].DICTIONARY({ FIELD: ['body.text'] }).then(res => {
    t.deepEqual(res, [
      'bananas',
      'cool',
      'different',
      'document',
      'is',
      'really',
      'something',
      'this',
      'totally'
    ])
  })
})

test('DICTIONARY with gte lte', t => {
  t.plan(1)
  global[indexName].DICTIONARY({
    FIELD: ['body.text'],
    VALUE: {
      GTE: 'd',
      LTE: 'r'
    }
  }).then(res => {
    t.deepEqual(res, [
      'different',
      'document',
      'is',
      'really'
    ])
  })
})

test('DICTIONARY without specified field', t => {
  t.plan(1)
  global[indexName].DICTIONARY().then(res => {
    t.deepEqual(res, [
      '200',
      '500',
      '5000',
      'a',
      'bananas',
      'cool',
      'coolness',
      'different',
      'document',
      'documentness',
      'is',
      'quite',
      'really',
      'something',
      'this',
      'totally'
    ])
  })
})

test('DICTIONARY without specified field', t => {
  t.plan(1)
  const { DICTIONARY } = global[indexName]
  DICTIONARY().then(res => {
    t.deepEqual(res, [
      '200',
      '500',
      '5000',
      'a',
      'bananas',
      'cool',
      'coolness',
      'different',
      'document',
      'documentness',
      'is',
      'quite',
      'really',
      'something',
      'this',
      'totally'
    ])
  })
})

test('DOCUMENT_COUNT is 3', t => {
  t.plan(1)
  const { DOCUMENT_COUNT } = global[indexName]
  DOCUMENT_COUNT().then(res => {
    t.equal(res, 3)
  })
})
