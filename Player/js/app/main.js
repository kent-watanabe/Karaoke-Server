var karaokePlayer = null;
var helper = null;
var queue = null;
var myWorker = null;
var correlationMap = {};

const AudioContext = window.AudioContext || window.webkitAudioContext;
const globalAudioContext = new AudioContext();

function postMessageToWorker(msg, fn) {
  if (fn) {
    msg.correlationId = new Date().getTime();
    correlationMap[msg.correlationId] = fn;
  }
  myWorker.postMessage(msg);
}

function processCorrelation(correlationId) {
  if (correlationId && correlationMap[correlationId]) {
    correlationMap[correlationId]();
    delete correlationMap[correlationId];
  }
}

define(['js/app/karaokePlayer.js', 'karaokeLibrary', 'js/app/Queue.js'],
  function (KaraokePlayer, h, Queue) {
    $(document).ready(function () {
      helper = h;
      karaokePlayer = new KaraokePlayer({
        width: 600,
        height: 486,
        showControls: true
      });
      karaokePlayer.getMedia({audio: true, video: false}).then((stream) => {
        queue = new Queue();
        myWorker = new Worker("js/karaokews.js");

        postMessageToWorker(
          {
            messageType: 'queueId',
            queueId: localStorage.getItem('queueId')
          });

        postMessageToWorker(
          {
            messageType: 'QUEUE_REFRESH',
            dataMimeType: 'application/json',
            queueId: localStorage.getItem('queueId')
          });
        queue.addListener('playTrack',
          (event, track) => karaokePlayer.playTrack(track));
        queue.addListener('stop', (event) => karaokePlayer.stop());
        karaokePlayer.addListener('nextTrack',
          (event) => queue.playNextTrack());

        myWorker.addEventListener("message",
          function handleMessageFromWorker(msg) {
            var message = msg.data;
            if (message.messageType === "QUEUE_REFRESH") {
              var queueItems = JSON.parse(message.data).queueItems;
              queue.setData(queueItems);
            } else if (message.messageType === "TRACK_ADDED") {
              queue.addItemToQueue(JSON.parse(message.data));
            } else if (["TRACK_REMOVED", "TRACK_PLAYED"].includes(
              message.messageType)) {
              var track = JSON.parse(message.data);
              queue.removeItemFromQueue(track);
            } else if (message.messageType === "PLAY_TRACK") {
              queue.fireEvent('playTrack', JSON.parse(message.data));
            }
          });
      });
    });
  });
