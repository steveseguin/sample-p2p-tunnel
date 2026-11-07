const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadPage(filename) {
  const html = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const listeners = {};
  const children = [];
  const sent = [];
  const frames = [];
  const sockets = [];
  const log = { innerHTML: '' };
  const window = {
    addEventListener(type, listener) { listeners[type] = listener; }
  };
  class WebSocket {
    constructor(url) {
      this.url = url;
      sockets.push(this);
    }
    send(message) { sent.push(JSON.parse(message)); }
  }
  const document = {
    body: { appendChild(element) { children.push(element); } },
    createElement() {
      const frame = {
        style: {},
        contentWindow: {
          postMessage(message) { frames.push(message); }
        }
      };
      return frame;
    },
    getElementById(id) {
      return id === 'log' ? log : children.find(element => element.id === id);
    }
  };
  const context = vm.createContext({ window, document, WebSocket, console });
  for (const [, source] of scripts) vm.runInContext(source, context);
  return { context, window, listeners, children, sent, frames, sockets };
}

test('opening the receiver does not start an OBS broadcast', () => {
  const page = loadPage('remote.html');
  page.window.onload();
  assert.equal(page.sockets.length, 1);
  page.sockets[0].onopen();
  assert.deepEqual(page.sent, []);
});

test('the receiver forwards explicit start and stop commands', () => {
  const page = loadPage('remote.html');
  page.window.onload();
  page.sockets[0].onopen();
  page.sent.length = 0;
  for (const command of ['StartStreaming', 'StopStreaming']) {
    page.listeners.message({ data: { dataReceived: command } });
  }
  assert.deepEqual(page.sent.map(message => message['request-type']),
    ['StartStreaming', 'StopStreaming']);
  for (const message of page.sent) {
    assert.equal(typeof message['message-id'], 'string');
    assert.ok(message['message-id'].length > 0);
  }
});

test('the controller sends the requested start and stop commands', () => {
  const page = loadPage('control.html');
  page.window.onload();
  page.context.startBroadcast();
  page.context.stopBroadcast();
  assert.deepEqual(page.frames.map(message => message.sendData),
    ['StartStreaming', 'StopStreaming']);
});
