const express = require( 'express' );
const request = require( 'request' );
const bodyParser = require( 'body-parser' );
const app = express();

app.use( bodyParser.text( { type: 'text/*' } ) );
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
            res.status( 500 ).send( { error: 'There is no Target-Endpoint header in the request' } );
            return;
        }
        request(
            {
                url: targetURL,
                method: req.method,
                body: req.body,
                headers: { 'Authorization': req.header( 'Authorization' ) }
            },
            ( error, response, body ) => {
                if ( error ) {
                    console.error( 'error: ' + response.statusCode )
                }
            }
        ).pipe( res );
    }
} );

app.set( 'port', process.env.PORT || 15000 );

app.listen( app.get( 'port' ), () => {
    console.log( 'Proxy server listening on port ' + app.get( 'port' ) );
} );