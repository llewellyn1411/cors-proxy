const express = require( 'express' );
const request = require( 'request' );
const bodyParser = require( 'body-parser' );
const app = express();

const myLimit = typeof(process.argv[ 2 ]) != 'undefined' ? process.argv[ 2 ] : '100kb';
console.log( 'Using limit: ', myLimit );

app.use( bodyParser.json( { limit: myLimit } ) );

app.all( '*', ( req, res, next ) => {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production
    // environment
    res.header( "Access-Control-Allow-Origin", "*" );
    res.header( "Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE" );
    res.header( "Access-Control-Allow-Headers", req.header( 'access-control-request-headers' ) );

    if ( req.method === 'OPTIONS' ) {
        // CORS Preflight
        res.send();
    } else {
        const targetURL = req.header( 'Target-URL' );
        if ( !targetURL ) {
            res.send( 500, { error: 'There is no Target-Endpoint header in the request' } );
            return;
        }
        const url = targetURL + req.url;
        console.log( 'Target URL', targetURL );
        console.log( 'URL', url );
        request( {
                url,
                method: req.method,
                body: req.body,
                headers: { 'Authorization': req.header( 'Authorization' ) }
            },
            ( error, response, body ) => {
                if ( error ) {
                    console.error( 'error: ' + response.statusCode )
                }
            } ).pipe( res );
    }
} );

app.set( 'port', process.env.PORT || 15000 );

app.listen( app.get( 'port' ), function () {
    console.log( 'Proxy server listening on port ' + app.get( 'port' ) );
} );