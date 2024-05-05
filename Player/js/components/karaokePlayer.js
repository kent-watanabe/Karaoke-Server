define(['components/videoPlayer', 'components/CDGPlayer','lib/karaokeLibrary'],
  function (VideoPlayer, CDGPlayer, helper) {
    return class KaraokePlayer {
      constructor(initProps) {
        if (initProps == null) {
          Object.assign(this, {
            width: 600,
            height: 540,
            showControls: true
          });
        } else if (initProps instanceof Object) {
          Object.assign(this, initProps);
        } else {
          throw new Error("props is not an object");
        }

        var playerContainer= $('#playerContainer');
        playerContainer.width(this.width);
        playerContainer.height(this.height);

        this.playerContainer = playerContainer;
        var videoContainer = $('<div id="video-container" class="videoContainer">');
        playerContainer.append(videoContainer);
        var cdgContainer = $('<div id="cdg-container" class="cdgContainer">');
        playerContainer.append(cdgContainer);
        cdgContainer.on('microphone_clicked', (event, state) =>this.microphoneFn(state));

        var playerProps = {
          width: this.width,
          height: this.height,
          showControls: true,
          container: videoContainer
        };

        this.videoPlayer = new VideoPlayer(playerProps);
        playerProps.container = cdgContainer;
        this.cdgPlayer = new CDGPlayer(playerProps);
        videoContainer.css('display', 'none');

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

      microphoneFn(state) {
        this.mic.mute = !state;
      }

      fireEvent(event) {
        $(this.playerContainer).trigger(event,
          Array.prototype.slice.call(arguments, 1));
      }

      addListener(event, callback) {
        $(this.playerContainer).on(event, callback);
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
        playerContainer.attr('width', width);
        playerContainer.attr('height',height);
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
