import React, { Component } from 'react';
import './App.css';

const TITLE = 'React GraphQL GitHub Client';

const fetchGitHubGraphQL = new Request('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`
  }
});

const GET_ISSUES_OF_REPOSITORY = `
   query ($organization: String!, $repository: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        name
        url
        issues(first: 5, after: $cursor, states: [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');
  return fetch(fetchGitHubGraphQL, {
    body: JSON.stringify({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: { organization, repository, cursor }
    })
  }).then(res => res.json());
};

const Organization = ({ organization, onFetchMoreIssues, errors }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong: </strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }
  return (
    <React.Fragment>
      <p>
        <strong>Issues from Organization: </strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
      <Repository
        repository={organization.repository}
        onFetchMoreIssues={onFetchMoreIssues}
      />
    </React.Fragment>
  );
};

const Repository = ({ repository, onFetchMoreIssues }) => (
  <React.Fragment>
    <p>
      <strong>In Repository: </strong>
      <a href={repository.url}>{repository.name}</a>
    </p>
    <strong>Last 5 Issues: </strong>
    <ul>
      {repository.issues.edges.map(issue => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
          <ul>
            {issue.node.reactions.edges.map(reaction => (
              <li key={reaction.node.id}>{reaction.node.content}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    <br />
    {repository.issues.pageInfo.hasNextPage && (
      <button onClick={onFetchMoreIssues}>More</button>
    )}
  </React.Fragment>
);

const resolveIssuesQuery = (queryResult, cursor) => prevState => {
  const { data, errors } = queryResult;
  if (!cursor) {
    return {
      organization: data.organization,
      errors
    };
  }

  const { edges: oldIssues } = prevState.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues
        }
      }
    },
    errors
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: 'the-road-to-learn-react/the-road-to-learn-react',
      organization: null,
      errors: null
    };
  }

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = e => {
    this.setState({ path: e.target.value });
  };

  onSubmit = e => {
    this.onFetchFromGitHub(this.state.path);
    e.preventDefault();
  };

  onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor)
      .then((queryResult, cursor) =>
        this.setState(resolveIssuesQuery(queryResult, cursor))
      )
      .catch(error => console.log(error));
  };

  onFetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGitHub(this.state.path, endCursor);
  };

  render() {
    const { path, organization, errors } = this.state;
    return (
      <React.Fragment>
        <h1>{TITLE}</h1>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com/</label>
          <input
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>
        <br />
        {organization ? (
          <Organization
            organization={organization}
            onFetchMoreIssues={this.onFetchMoreIssues}
            errors={errors}
          />
        ) : (
          <p>No information yet ...</p>
        )}
      </React.Fragment>
    );
  }
}

export default App;
