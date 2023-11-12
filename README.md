# sample-p2p-tunnel

This is an example app that sends remote control commands via VDO.Ninja's Peer to Peer service, and then forwards them to OBS's websocket.

https://steveseguin.github.io/sample-p2p-tunnel/control - lets you issue start/stop commands, remotely, which are sent via VDO.Ninja (iframe api)

https://steveseguin.github.io/sample-p2p-tunnel/remote - listens for incoming messages (commands) and forward them to the local OBS websocket connection.

This setup allows for bypassing of NAT firewalls, without bridge, vpn, or your own server.  Because its peer to peer, data is sent securely, privately, and there are not really costs.

### minimal conceptual code example

push-side (send messages)
```
var iframe = document.createElement("iframe");
iframe.src = "https://vdo.ninja/?datamode&push=" + connectionID;
document.body.appendChild(iframe);

// ... some time later
iframe.contentWindow.postMessage({"sendData": "DataHere"}, '*');
```

view-side (listen to messages)
```
  window.addEventListener("message", function (e) {
    if ("dataReceived" in e.data) {
      console.log( e.data.dataReceived);
    }
  });
  window.onload = function() {
    var iframe = document.createElement("iframe");
    iframe.src = "https://vdo.ninja/?datamode&view=" + connectionID;
    document.body.appendChild(iframe);
  };
```

A viewer can also respond/send messages, but in this case, it's setup to be one directional
