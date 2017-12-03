const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
 } = require('graphql')
const fetch = require('node-fetch')
const util = require('util')
const parseXML = util.promisify(require('xml2js').parseString)

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: ',...,',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => {
        console.log('2111' + JSON.stringify(xml.GoodreadsResponse.book[0], null, 2))
        return xml.GoodreadsResponse.book[0].title[0]
      }
    },
    isbn: {
      type: GraphQLString,
      resolve: xml =>
        xml.GoodreadsResponse.book[0].isbn[0]
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '/.../',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: function (xml) {
        return xml.GoodreadsResponse.author[0].name[0]
      }
    },
    id: {
      type: GraphQLString,
      resolve: xml =>
        xml.GoodreadsResponse.author[0].id[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: xml => {
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._)
        return Promise.all(ids.map(id => {
          console.log('Fetching = ' + id)
          return fetch(`https://www.goodreads.com/book/show?id=${id}&format=xml&key=laidvSsM7LB8kSw5W9I0ew`)
            .then(response => {
              var resp = response.text()
              console.log('Responce = ' + resp)
              return resp
            })
            .then(xml => {
              var x = parseXML(xml)
              console.log('Then = ' + x)
              return x
            })
        }))
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: ' ... ',
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: {
            type: GraphQLInt
          }
        },
        resolve: (root, args) => fetch(
          `https://www.goodreads.com/author/list/${args.id}?format=xml&key=laidvSsM7LB8kSw5W9I0ew`
        )
        .then(response => response.text())
        .then(parseXML)
      }
    })
  })
})

var x = fetch(
  `https://www.goodreads.com/author/list/18541?format=xml&key=laidvSsM7LB8kSw5W9I0ew`
)
.then(response => response.text())
.then(parseXML)

x
