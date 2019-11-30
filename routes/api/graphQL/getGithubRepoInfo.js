const config = require('config');
const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient(config.get('githubGraphQLEndpoint'), {
  headers: {
    Authorization: `bearer ${config.get('githubPersonToken')}`,
  },
});

const getRepoInfo = (username, endCursor) => {
  const query = `
  query ($username: String!, $orderfield: RepositoryOrderField!, $direction: OrderDirection!, $pagination: Int, $endCursor: String) {
    user(login: $username) {
      repositories(orderBy: {field: $orderfield, direction: $direction}, first: $pagination, after: $endCursor) {
        nodes {
          id
          createdAt
          id
          name
          owner {
            login
          }
          url
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }`;

  const variables = {
    username,
    orderfield: 'CREATED_AT',
    direction: 'ASC',
    pagination: 5,
    endCursor,
  };
  return client.request(query, variables);
};

module.exports = getRepoInfo;
