define(['./videoPlayer.js', './CDGPlayer.js'],
  function (VideoPlayer, CDGPlayer) {
    return class KaraokePlayer {
      constructor(initProps) {
        if (initProps == null) {
          Object.assign(this, {
            width: 600,
            height: 400,
            showControls: true
          });
        } else if (initProps instanceof Object) {
          Object.assign(this, initProps);
        } else {
          throw new Error("props is not an object");
        }

        var playerContainer = helper.createDOMObject('<div>', 'playerContainer',
          'playerContainer');
        playerContainer.width(this.width);
        playerContainer.height(this.height);

        this.playerContainer = playerContainer[0];
        var videoContainer = helper.createDOMObject('<div>', 'video-container',
          'videoContainer');
        playerContainer.append(videoContainer[0]);
        var cdgContainer = helper.createDOMObject('<div>', 'cdg-container',
          'cdgContainer');
        playerContainer.append(cdgContainer[0]);
        if (initProps.container) {
          $(initProps.container).prepend(this.playerContainer);
        } else {
          $(document.body).prepend(this.playerContainer);
        }

        cdgContainer.on('microphone_clicked', this.microphoneFn.bind(this));

        this.isFullScreen = false;

        var playerProps = {
          width: initProps.width ? initProps.width : 600,
          height: initProps.height ? initProps.height : 400,
          showControls: true,
          container: videoContainer[0]
        };

        this.videoPlayer = new VideoPlayer(playerProps);
        playerProps.container = cdgContainer[0];
        this.cdgPlayer = new CDGPlayer(playerProps);
        videoContainer.css('display', 'none');
        cdgContainer.css('display', 'none');

        playerContainer.on('dblclick', (event) => {
          if (!this.isFullScreen) {
            this.playerContainer.requestFullscreen().then(() => {
              this.setDimensions(window.outerWidth, window.outerHeight);
              this.cdgPlayer.setDimensions(window.outerWidth,
                window.outerHeight);
              this.videoPlayer.setDimensions(window.outerWidth,
                window.outerHeight);
              this.isFullScreen = true;
            });
          } else {
            document.exitFullscreen().then(this.exitedFullScreen.bind(this));
          }
        });

        playerContainer.on('fullscreenchange', (e) => {
          if (!document.fullscreenElement) {
            this.exitedFullScreen();
          }
        });
        this.meter = new Tone.Meter();
        this.mic = new Tone.UserMedia().connect(this.meter).toDestination();
        this.mic.open().then(() => {
          this.microphoneEnabled = true;
        }).catch(e => {
          console.error(e);
          // promise is rejected when the user doesn't have or allow mic access
          console.log("mic not open");
        });
        Tone.start();
      }

      microphoneFn(event) {
        if (!this.microphoneEnabled) {
          this.mic.mute = false;
          this.cdgPlayer.setMicrophoneStatus(true);
        } else {
          this.mic.mute = true;
          this.cdgPlayer.setMicrophoneStatus(false);
        }
        this.microphoneEnabled = !this.microphoneEnabled;
        event.stopPropagation();
      }

      fireEvent(event) {
        $(this.playerContainer).trigger(event,
          Array.prototype.slice.call(arguments, 1));
      }

      addListener(event, callback) {
        $(this.playerContainer).on(event, callback);
      }

      exitedFullScreen() {
        this.setDimensions(this.width, this.height);
        this.cdgPlayer.restoreDimensions();
        this.videoPlayer.restoreDimensions();
        this.isFullScreen = false;
      }

      showVideoPlayer() {
        var playerContainer = $(this.playerContainer);
        playerContainer.children('#cdg-container').css('display', 'none');
        playerContainer.children('#video-container').css('display', 'block');
      }

      showCDGPlayer() {
        var playerContainer = $(this.playerContainer);
        playerContainer.children('#cdg-container').css('display', 'block');
        playerContainer.children('#video-container').css('display', 'none');
      }

      hidePlayers() {
        var playerContainer = $(this.playerContainer);
        playerContainer.children('#cdg-container').css('display', 'none');
        playerContainer.children('#video-container').css('display', 'none');
      }

      setDimensions(width, height) {
        var playerContainer = $(this.playerContainer);
        playerContainer.width(width);
        playerContainer.height(height);
        this.cdgPlayer.setDimensions(width, height);
        this.videoPlayer.setDimensions(width, height);
      }

      restoreDimensions() {
        var playerContainer = $(this.playerContainer);
        playerContainer.width(this.width);
        playerContainer.height(this.height);
        this.cdgPlayer.setDimensions(width, height);
        this.videoPlayer.setDimensions(width, height);
      }

      playTrack(queueItem) {
        if (queueItem.type === 'MP4') {
          this.showVideoPlayer();
          this.videoPlayer.play(queueItem.id);
          this.playing = {video: true, cdg: false};
        } else if (queueItem.type === 'CDG') {
          this.showCDGPlayer();
          this.cdgPlayer.play(queueItem.id);
          this.playing = {video: false, cdg: true};
        }
      }

      stop() {
        if (this.playing.video) {
          this.videoPlayer.stop();
        } else {
          this.cdgPlayer.stop();
        }
      }

      setVolume(volume) {
        if (this.playing.video) {
          return this.videoPlayer.setVolume(volume);
        } else if (this.playing.cdg) {
          return this.cdgPlayer.setVolume(volume);
        }
      }

      getVolume() {
        if (this.playing.video) {
          return this.videoPlayer.getVolume();
        } else if (this.playing.cdg) {
          return this.cdgPlayer.getVolume();
        }
      }

    }
  })
;
