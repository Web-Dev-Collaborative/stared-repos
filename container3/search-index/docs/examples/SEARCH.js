(async () => {
  const si = require('../../')
  const db = await si({ name: 'TMP-SEARCH' })

  await db.PUT([
    {
      _id: 1,
      bandName: 'The Beatles',
      description: 'The nice boys of pop'
    }, {
      _id: 'two',
      bandName: 'The Rolling Stones',
      description: 'The bad boys of rock'
    }, {
      _id: 3,
      bandName: 'The Who',
      description: 'Nearly as good as Led Zeppelin'
    }
  ])

  console.log('\nSEARCH-ing ->')
  await db.QUERY(
    {
      SEARCH: ['The']
    }
  ).then(console.log)

  console.log('\nSEARCH-ing ->')
  await db.QUERY(
    {
      SEARCH: ['The', 'Beatles']
    }
  ).then(console.log)

  console.log('\nSEARCH-ing with negation ->')
  await db.QUERY(
    {
      NOT: {
        INCLUDE: { SEARCH: ['The'] },
        EXCLUDE: { SEARCH: ['Beatles'] }
      }
    }
  ).then(console.log)
})()
