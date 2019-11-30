const config = require('config');
const { GraphQLClient } = require('graphql-request');
// Document https://www.npmjs.com/package/graphql-request

const client = new GraphQLClient(config.get('githubGraphQLEndpoint'), {
  headers: {
    Authorization: `bearer ${config.get('githubPersonToken')}`,
  },
});

const getRepoInfo = (username) => {
  const query = `{
    user(login: "${username}") {
      repositories(orderBy: {field: CREATED_AT, direction: ASC}, first: 5) {
        nodes {
          createdAt
          id
          name
          owner {
            login
          }
          url
        }
      }
    }
  }`;
  return client.request(query);
};

module.exports = getRepoInfo;
