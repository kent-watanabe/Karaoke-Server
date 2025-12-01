define(['lib/karaokeLibrary'],function (helper) {
    return class VideoPlayer {
      constructor(props) {
        if (props == null) {
          Object.assign(this, {
            width: 600,
            height: 540
          });
        } else if (props instanceof Object) {
          Object.assign(this, props);
        } else {
          throw new Error("props is not an object");
        }

        if (!this.container) {
          throw new Error("Video container is not defined");
        }

        var container = $(this.container);
        var containerID = container.attr('id');
        this.containerID = containerID;

        var video = $('<video autoplay id="'+ containerID +'" class="videoContainer">');
        video.attr("width", this.width)
          .attr("height", this.height);
        video.attr('controls', '');
        this.video = video;
        this.mediaControls = new MediaControls({
          width: this.width,
          height: 54,
          controlConfig: {
            showNextButton: true,
            showMicrophone: true,
            showVolume: true,
            showFullScreen: true,
            showProgressBar: true,
            showPlayPause: true,
            showPitchControl: false
          }
        });
        container.append(video);
        container.append(this.mediaControls.container);

        this.mediaControls.getControl('#next-button').on('click', (event) => {
          video.pause();
          this.mediaControls.initTime();
          this.fireEvent('nextTrack');
        });

        this.mediaControls.container.on('volume_changed', (e, volume)=>{video.volume.value = volume;});
        this.mediaControls.container.on('play_clicked', (event, state)=>this.handlePlayPause(state));
        this.mediaControls.container.on('mute_clicked', (event, state)=>this.handleMute(state));
        container.on('full_screen_clicked', (event, state) => this.handleFullScreen(state));
        container.on('fullscreenchange', (e) => this.handleFullScreenChange(e));
        container.on('dblclick', (e) => this.handleDoubleClick(e));

      }

      handlePlayPause(state) {
        if(state === 'play') {
          this.getVideo(true).play();
        }
        else {
          this.getVideo(true).pause();
        }
      }

      fireEvent(event) {
        $('#'+this.containerID).trigger(event, Array.prototype.slice.call(arguments, 1));
      }

      addListener(event, callback) {
        this.getVideo().on(event, callback);
      }

      removeListeners() {
        if (getEventListeners === undefined) {
          throw new Error("getEventListeners is not defined");
        }
        this.getVideo().off();
      }

      getVideo(returnEl)
      {
       if(!returnEl) {
          return this.video.find('video');
        }
        else {
          return this.video.find('video')[0];
        }
      }

      play(id) {
        this.getVideo().attr('src',"/api/assets/id/" + id + ".mpg");
        this.getVideo(true).play().then(() => {
          this.fireEvent('TrackStarted', id);
        });
      }

      pause() {
        this.getVideo(true).pause();
      }

      stop() {
        this.getVideo(true).pause();
        this.getVideo(true).currentTime = 0;
      }

      setPlaybackRate(rate) {
        this.getVideo(true).playbackRate = rate;
      }

      getPlaybackRate() {
        this.getVideo(true).playbackRate;
      }

      setVolume(volume) {
        this.getVideo(true).volume = volume;
      }

      getVolume() {
        return this.getVideo(true).volume;
      }

      setDimensions(width, height) {

      }

      restoreDimensions() {

      }
    }
  }
);
