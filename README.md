# sample-p2p-tunnel

This is an example app that sends remote control commands via VDO.Ninja's Peer to Peer service, and then forwards them to OBS's websocket.

https://steveseguin.github.io/sample-p2p-tunnel/control - lets you issue start/stop commands, remotely, which are sent via VDO.Ninja (iframe api)

https://steveseguin.github.io/sample-p2p-tunnel/remote - listens for incoming messages (commands) and forward them to the local OBS websocket connection.

This setup allows for bypassing of NAT firewalls, without bridge, vpn, or your own server.  Because its peer to peer, data is sent securely, privately, and there are not really costs.
