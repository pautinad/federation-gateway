import {ApolloGateway, RemoteGraphQLDataSource} from "@apollo/gateway";
import {ApolloServer} from "apollo-server";
import {ApolloServerPluginSchemaReporting, ApolloServerPluginUsageReporting, ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";


const gateway = new ApolloGateway({
    serviceList: [
        {name: 'shows', url: 'http://localhost:4001/graphql'},
        {name: 'reviews', url: 'http://localhost:4002/graphql'},
        {name: 'samples', url: 'http://localhost:8080/graphql'},
        {name: 'teachers', url: 'http://localhost:8081/graphql'}
    ],
    buildService({name, url}) {
        return new RemoteGraphQLDataSource({
            url, willSendRequest(request, context) {
                if (context === undefined
                    || context.customHeaders === undefined
                    || context.customHeaders.headers === undefined) {
                    return;
                }
                const customHeaders = context.customHeaders.headers;

                Objects.keys(customHeaders).map(key => {
                    request.http && request.http.headers.set(key, customHeaders[key])
                });

            }
        });
    }
});

const server = new ApolloServer({
    gateway,
    subscriptions: false,
    apollo: {
        key: 'service:My-Graph-vfy4m6:',
        graphId: 'My-Graph-vfy4m6',
        graphVariant: 'current',
        schemaReporting: true
    },
    plugins: [
        ApolloServerPluginUsageReporting({
            sendHeaders: {all: true},
            sendVariableValues: {all: true},
        }),
        ApolloServerPluginLandingPageGraphQLPlayground({
            settings: {
              'some.setting': true,
              'general.betaUpdates': false,
              'editor.theme': 'dark',
              'editor.cursorShape': 'line',
              'editor.reuseHeaders': true,
              'tracing.hideTracingResponse': true,
              'queryPlan.hideQueryPlanResponse': true,
              'editor.fontSize': 14,
              'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
              'request.credentials': 'omit',
            },
          }),
    ],
    context: req => ({
        req,
        customHeaders: {
            headers: {
                ...req.headers,
            },
        },
    }),
    playground: false,
});

await server.listen().then(info => {
    console.log(`Server started at - ${info.url}`);
});
