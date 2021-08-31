# chain-swarm

An express server to put up a swarm of tool-chain instances running on a single shared Hypoerbee.

The server simply uses two endpoints;

`/api/post`
Accepts a JSON body containing a toolChain entry. This must be valid toolChain entry, with all fields passing its validation.

`/api/get?key=[key]`
Returns `null` if the value is not found.
